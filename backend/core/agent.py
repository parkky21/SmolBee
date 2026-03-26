import asyncio
import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents.metrics import LLMMetrics, STTMetrics, TTSMetrics, EOUMetrics
from livekit.agents import AgentServer, Agent, AgentSession, AutoSubscribe, JobContext, JobProcess, WorkerOptions, cli, llm, room_io
from livekit.plugins import openai, silero ,noise_cancellation
from plugins.llm_plugin import LocalLlamaLLM
from plugins.stt_plugin import LocalWhisperSTT
from plugins.tts_plugin import LocalKokoroTTS
from rich.console import Console
from rich.table import Table
from rich import box
from datetime import datetime
from core.metrix_collector import (
    on_llm_metrics_collected, 
    on_stt_metrics_collected, 
    on_tts_metrics_collected, 
    on_eou_metrics_collected
)

load_dotenv()
logger = logging.getLogger("Agent")

# Load system prompt from markdown file
_PROMPT_PATH = Path(__file__).parent / "system_prompt.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8").strip()

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=_SYSTEM_PROMPT
        )

    async def on_enter(self):
        def sync_wrapper(metrics: LLMMetrics):
            asyncio.create_task(on_llm_metrics_collected(metrics))

        def stt_wrapper(metrics: STTMetrics):
            asyncio.create_task(on_stt_metrics_collected(metrics))

        def eou_wrapper(metrics: EOUMetrics):
            asyncio.create_task(self.on_eou_metrics_collected(metrics))
        
        def tts_wrapper(metrics: TTSMetrics):
            asyncio.create_task(on_tts_metrics_collected(metrics))

        self.session.stt.on("metrics_collected", stt_wrapper)
        self.session.stt.on("eou_metrics_collected", eou_wrapper)
        self.session.llm.on("metrics_collected", sync_wrapper)
        self.session.tts.on("metrics_collected", tts_wrapper)

        self.session.generate_reply(
            instructions="Greet the user and tell him about yourself. Keep it short and sweet.", allow_interruptions=True
        )
        

async def entrypoint(ctx: JobContext):
    # This determines connection initialization
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    logger.info(f"Room name: {ctx.room.name}")
    
    # Wait for the first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    session = AgentSession(
        llm=LocalLlamaLLM(model_path="models/gemma-3-1b-it-Q8_0.gguf"),
        stt=LocalWhisperSTT(model_size="distil-small.en", language="en"),
        tts=LocalKokoroTTS(voice="af_heart"),
        vad=ctx.proc.userdata["vad"],
        # min_endpointing_delay=0.5,
        # max_endpointing_delay=5.0,
    )
    
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )
