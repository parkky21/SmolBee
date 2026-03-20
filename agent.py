import asyncio
import logging
import os
from dotenv import load_dotenv
from livekit.agents import Agent, AgentSession, AutoSubscribe, JobContext, JobProcess, WorkerOptions, cli, llm
from livekit.plugins import openai, silero
from llm_plugin import LocalLlamaLLM
from stt_plugin import LocalWhisperSTT
from tts_plugin import LocalKokoroTTS

load_dotenv()
logger = logging.getLogger("agent")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
            Your name ie Emily.
            Your an personal assistant for Parth Kale 
            Parth Kale : He is an Ai engineer who have built you using his skills and knowledge.
            You are a helpful and friendly offline AI assistant. Always keep your responses short, friendly, and natural.
            """,
            vad=silero.VAD.load(),
            stt=LocalWhisperSTT(model_size="distil-small.en",language="en"),
            llm=LocalLlamaLLM(
                model_path="gemma-3-1b-it-UD-Q8_k_XL.gguf",
            ),
            tts=LocalKokoroTTS(voice="af_heart"),
        )

    async def on_enter(self):
        # Initial greeting when connecting to a user
        self.session.generate_reply(
            instructions="Say: Hello, I'm ready. I am running entirely offline.", allow_interruptions=True
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
