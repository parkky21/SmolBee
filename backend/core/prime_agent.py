import logging
from pathlib import Path
from livekit.agents import Agent, RunContext, function_tool

logger = logging.getLogger(__name__)

# Load system prompt from markdown file
_PROMPT_PATH = Path(__file__).parent / "system_prompt.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8").strip()


# @function_tool()
# async def get_weather(
#     context: RunContext,
#     city: str,
# ) -> dict:
#     """Get the weather for a specific city."""
#     logger.info(f"Getting weather for {city}")

#     return {"city": city, "temperature": "25°C", "condition": "Sunny"}


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=_SYSTEM_PROMPT,
            # tools=[get_weather],
        )

    async def on_enter(self):
        self.session.generate_reply(
            instructions="Greet the user and introduce yourself. Keep it short and sweet.", allow_interruptions=True
        )
