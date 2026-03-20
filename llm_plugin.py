import asyncio
import logging
from typing import Any

from livekit.agents import llm
from livekit.agents.llm.chat_context import ChatRole, Instructions
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, NOT_GIVEN, APIConnectOptions, NotGivenOr
from livekit.agents.llm.tool_context import Tool, ToolChoice
from llama_cpp import Llama

logger = logging.getLogger("llm_plugin")


class LocalLlamaLLMStream(llm.LLMStream):
    def __init__(
        self,
        llama_inst: Llama,
        llm_inst: llm.LLM,
        chat_ctx: llm.ChatContext,
        tools: list[Tool],
        conn_options: APIConnectOptions,
        **kwargs,
    ):
        super().__init__(
            llm=llm_inst,
            chat_ctx=chat_ctx,
            tools=tools,
            conn_options=conn_options,
        )
        self._llama = llama_inst
        self._kwargs = kwargs

    def _build_gemma_messages(self) -> list[dict[str, str]]:
        """Build messages that satisfy Gemma's strict chat template.

        Gemma's Jinja template:
          1. Optionally strips the first message if role == 'system'
          2. Remaining messages MUST alternate: user(0), assistant(1), user(2), ...
             Validated by: (role == 'user') != (index % 2 == 0) → raise error
          3. Generation prompt is added at the end (expects model/assistant turn next)

        So post-system messages must be: user, assistant, user, assistant, ..., user
        (ending with user so the model generates the assistant reply).
        """
        ROLE_MAP = {"developer": "system"}

        # Step 1: Extract all messages, mapping roles
        system_parts: list[str] = []
        user_assistant_msgs: list[dict[str, str]] = []

        for msg in self._chat_ctx.messages():
            role: str = ROLE_MAP.get(msg.role, msg.role)

            # Extract text content only
            text_parts: list[str] = []
            for chunk in msg.content:
                if isinstance(chunk, str):
                    text_parts.append(chunk)

            content = "\n".join(text_parts).strip()
            if not content:
                continue

            if role == "system":
                system_parts.append(content)
            else:
                user_assistant_msgs.append({"role": role, "content": content})

        # Step 2: Merge consecutive same-role messages
        merged: list[dict[str, str]] = []
        for m in user_assistant_msgs:
            if merged and merged[-1]["role"] == m["role"]:
                merged[-1]["content"] += "\n" + m["content"]
            else:
                merged.append({"role": m["role"], "content": m["content"]})

        # Step 3: Force strict alternation starting with 'user'
        # The template requires index 0 = user, index 1 = assistant, etc.
        alternated: list[dict[str, str]] = []
        for m in merged:
            expected_role = "user" if len(alternated) % 2 == 0 else "assistant"
            if m["role"] == expected_role:
                alternated.append(m)
            else:
                # Insert a filler message for the expected role, then add current
                filler = "." if expected_role == "assistant" else "Continue."
                alternated.append({"role": expected_role, "content": filler})
                alternated.append(m)

        # Step 4: Ensure the list starts with 'user' and ends with 'user'
        if not alternated or alternated[0]["role"] != "user":
            alternated.insert(0, {"role": "user", "content": "Hello."})
        if alternated[-1]["role"] != "user":
            alternated.append({"role": "user", "content": "Continue."})

        # Step 5: Build final message list
        oai_messages: list[dict[str, str]] = []
        if system_parts:
            oai_messages.append({"role": "system", "content": "\n".join(system_parts)})
        oai_messages.extend(alternated)

        return oai_messages

    async def _run(self) -> None:
        loop = asyncio.get_running_loop()

        oai_messages = self._build_gemma_messages()

        logger.debug(
            f"Sending {len(oai_messages)} messages to llama_cpp: "
            f"roles={[m['role'] for m in oai_messages]}"
        )

        try:
            # Run the blocking llama_cpp inference in a thread executor
            def _generate():
                generate_kwargs = self._kwargs.copy()
                if "max_tokens" not in generate_kwargs:
                    generate_kwargs["max_tokens"] = 512
                    
                return self._llama.create_chat_completion(
                    messages=oai_messages,
                    stream=True,
                    **generate_kwargs,
                )

            iterator = await loop.run_in_executor(None, _generate)

            def _get_next():
                try:
                    return next(iterator)
                except StopIteration:
                    return None

            while True:
                chunk = await loop.run_in_executor(None, _get_next)
                if chunk is None:
                    break

                chunk_id = chunk.get("id", "local-msg")
                choices = chunk.get("choices", [])

                for choice in choices:
                    delta = choice.get("delta", {})
                    content = delta.get("content")
                    role = delta.get("role")

                    if content is not None or role is not None:
                        chat_chunk = llm.ChatChunk(
                            id=chunk_id,
                            delta=llm.ChoiceDelta(
                                role=role or "assistant",
                                content=content if content is not None else "",
                            ),
                        )
                        self._event_ch.send_nowait(chat_chunk)

        except Exception as e:
            logger.error(f"Error in local LLM generation: {e}")
            raise


class LocalLlamaLLM(llm.LLM):
    def __init__(
        self,
        model_path: str,
        n_ctx: int = 2048,
        n_gpu_layers: int = -1,
        **kwargs,
    ):
        super().__init__()
        self._model_path = model_path
        self._llama = Llama(
            model_path=model_path,
            n_ctx=n_ctx,
            n_gpu_layers=n_gpu_layers,
            verbose=False,
        )
        self._kwargs = kwargs

    @property
    def model(self) -> str:
        return self._model_path

    @property
    def provider(self) -> str:
        return "llama_cpp"

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        tools: list[Tool] | None = None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        parallel_tool_calls: NotGivenOr[bool] = NOT_GIVEN,
        tool_choice: NotGivenOr[ToolChoice] = NOT_GIVEN,
        extra_kwargs: NotGivenOr[dict[str, Any]] = NOT_GIVEN,
    ) -> LocalLlamaLLMStream:
        return LocalLlamaLLMStream(
            llama_inst=self._llama,
            llm_inst=self,
            chat_ctx=chat_ctx,
            tools=tools or [],
            conn_options=conn_options,
            **self._kwargs,
        )
