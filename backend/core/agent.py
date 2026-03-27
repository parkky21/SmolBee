import asyncio
import json
import logging
from livekit import agents, rtc
from livekit.agents import metrics, MetricsCollectedEvent
from livekit.agents import AgentSession, AutoSubscribe, JobContext, room_io
from livekit.agents.metrics import LLMMetrics, STTMetrics, TTSMetrics, EOUMetrics
from livekit.plugins import silero, noise_cancellation
from plugins.llm_plugin import LocalLlamaLLM
from plugins.stt_plugin import LocalWhisperSTT
from plugins.tts_plugin import LocalKokoroTTS
from core.prime_agent import Assistant

logger = logging.getLogger("Agent")

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    logger.info(f"Room name: {ctx.room.name}")

    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    session = AgentSession(
        llm=LocalLlamaLLM(model_path="models/gemma-3-1b-it-Q8_0.gguf"),
        stt=LocalWhisperSTT(model_size="distil-small.en", language="en"),
        tts=LocalKokoroTTS(voice="af_heart"),
        vad=ctx.proc.userdata["vad"],
    )

    # --- Metrics handler: log + publish to frontend ---
    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        # Log to terminal using built-in logger
        metrics.log_metrics(ev.metrics)

        # Build a JSON payload for the frontend
        m = ev.metrics
        payload = {}
        if isinstance(m, EOUMetrics):
            payload["eou_delay"] = round(m.end_of_utterance_delay, 4)
            payload["transcription_delay"] = round(m.transcription_delay, 4)
        elif isinstance(m, LLMMetrics):
            payload["llm_ttft"] = round(m.ttft, 4)
            payload["tokens_per_second"] = round(m.tokens_per_second, 2)
        elif isinstance(m, TTSMetrics):
            payload["tts_ttfb"] = round(m.ttfb, 4)
            payload["tts_chars"] = m.characters_count
        elif isinstance(m, STTMetrics):
            payload["stt_duration"] = round(m.duration, 4)

        if payload:
            asyncio.create_task(
                ctx.room.local_participant.publish_data(
                    json.dumps(payload),
                    topic="lk.agent.metrics",
                )
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

