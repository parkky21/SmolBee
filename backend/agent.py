import asyncio
import logging
import os
from dotenv import load_dotenv
from livekit.agents.metrics import LLMMetrics, STTMetrics, TTSMetrics, EOUMetrics
from livekit.agents import Agent, AgentSession, AutoSubscribe, JobContext, JobProcess, WorkerOptions, cli, llm
from livekit.plugins import openai, silero
from plugins.llm_plugin import LocalLlamaLLM
from plugins.stt_plugin import LocalWhisperSTT
from plugins.tts_plugin import LocalKokoroTTS

load_dotenv()
logger = logging.getLogger("agent")

class Assistant(Agent):
    def __init__(self) -> None:
        agent_stt = LocalWhisperSTT(model_size="distil-small.en", language="en")
        agent_llm = LocalLlamaLLM(model_path="models/gemma-3-1b-it-UD-Q8_K_XL.gguf")
        agent_tts = LocalKokoroTTS(voice="af_heart")

        super().__init__(
            instructions="""
            Your name ie Emily.
            Your an personal assistant for Parth Kale 
            Parth Kale : He is an Ai engineer who have built you using his skills and knowledge.
            You are a helpful and friendly offline AI assistant. Always keep your responses short, friendly, and natural.
            """,
            vad=silero.VAD.load(),
            stt=agent_stt,
            llm=agent_llm,
            tts=agent_tts,
        )

        self._latest_eou_delay: float = 0.0
        self._latest_transcription_delay: float = 0.0
        self._latest_ttft: float = 0.0

        def llm_metrics_wrapper(metrics: LLMMetrics):
            asyncio.create_task(self.on_llm_metrics_collected(metrics))
        agent_llm.on("metrics_collected", llm_metrics_wrapper)

        def stt_metrics_wrapper(metrics: STTMetrics):
            asyncio.create_task(self.on_stt_metrics_collected(metrics))
        agent_stt.on("metrics_collected", stt_metrics_wrapper)

        def eou_metrics_wrapper(metrics: EOUMetrics):
            asyncio.create_task(self.on_eou_metrics_collected(metrics))
        agent_stt.on("eou_metrics_collected", eou_metrics_wrapper)

        def tts_metrics_wrapper(metrics: TTSMetrics):
            asyncio.create_task(self.on_tts_metrics_collected(metrics))
        agent_tts.on("metrics_collected", tts_metrics_wrapper)

    async def on_llm_metrics_collected(self, metrics: LLMMetrics) -> None:
        self._latest_ttft = metrics.ttft
        print("\n--- LLM Metrics ---")
        print(f"Prompt Tokens: {metrics.prompt_tokens}")
        print(f"Completion Tokens: {metrics.completion_tokens}")
        print(f"Tokens per second: {metrics.tokens_per_second:.4f}")
        print(f"TTFT: {metrics.ttft:.4f}s")
        print("------------------\n")

    async def on_stt_metrics_collected(self, metrics: STTMetrics) -> None:
        print("\n--- STT Metrics ---")
        print(f"Duration: {metrics.duration:.4f}s")
        print(f"Audio Duration: {metrics.audio_duration:.4f}s")
        print(f"Streamed: {'Yes' if metrics.streamed else 'No'}")
        print("------------------\n")

    async def on_eou_metrics_collected(self, metrics: EOUMetrics) -> None:
        self._latest_eou_delay = metrics.end_of_utterance_delay
        self._latest_transcription_delay = metrics.transcription_delay
        print("\n--- End of Utterance Metrics ---")
        print(f"End of Utterance Delay: {metrics.end_of_utterance_delay:.4f}s")
        print(f"Transcription Delay: {metrics.transcription_delay:.4f}s")
        print("--------------------------------\n")

    async def on_tts_metrics_collected(self, metrics: TTSMetrics) -> None:
        print("\n--- TTS Metrics ---")
        print(f"TTFB: {metrics.ttfb:.4f}s")
        print(f"Duration: {metrics.duration:.4f}s")
        print(f"Audio Duration: {metrics.audio_duration:.4f}s")
        print(f"Streamed: {'Yes' if metrics.streamed else 'No'}")
        print("------------------\n")

        overall_latency = (
            self._latest_eou_delay + 
            self._latest_transcription_delay + 
            self._latest_ttft + 
            metrics.ttfb
        )
        print(f"🚀 *** OVERALL PIPELINE LATENCY: {overall_latency:.4f}s ***\n")


    async def on_enter(self):
        self.session.generate_reply(
            instructions="Greet the user and tell him about yourself. Keep it short and sweet.", allow_interruptions=True
        )


def prewarm(proc: JobProcess):
    logger.info("Initializing offline agent dependencies...")

async def entrypoint(ctx: JobContext):
    # This determines connection initialization
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    logger.info(f"Room name: {ctx.room.name}")
    
    # Wait for the first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    session = AgentSession(
        vad=silero.VAD.load(),
        min_endpointing_delay=0.5,
        max_endpointing_delay=5.0,
    )
    
    await session.start(
        room=ctx.room,
        agent=Assistant(),
    )


if __name__ == "__main__":
    # Start the worker process
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
