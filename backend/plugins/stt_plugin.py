import asyncio
import numpy as np
from typing import AsyncIterable
from faster_whisper import WhisperModel
from livekit.agents import stt, utils, types
from livekit import rtc

class LocalWhisperSTT(stt.STT):
    def __init__(self, model_size="base.en", language="en"):
        super().__init__(
            capabilities=stt.STTCapabilities(
                streaming=False,
                interim_results=False
            )
        )
        # Using CPU by default, change to "cuda" if Nvidia GPU or "mps" for Mac
        self._whisper_model = WhisperModel(model_size, device="cpu", compute_type="int8")
        self.language = language

    async def _recognize_impl(
        self,
        buffer: utils.AudioBuffer,
        *,
        language: str | None = None,
        conn_options: types.APIConnectOptions | None = None,
    ) -> stt.SpeechEvent:
        frames = buffer if isinstance(buffer, list) else [buffer]
        audio_data = bytearray()
        for frame in frames:
            audio_data.extend(frame.data)

        if not audio_data:
            return stt.SpeechEvent(type=stt.SpeechEventType.FINAL_TRANSCRIPT, alternatives=[])

        # convert to float32 numpy array
        audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        
        # run faster-whisper (this is synchronous, but running in async context; could be offloaded to threadpool)
        segments, _ = self._whisper_model.transcribe(audio_np, beam_size=5, language=self.language or "en")
        text = "".join([segment.text for segment in segments]).strip()
        
        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[stt.SpeechData(language=self.language, text=text, start_time=0.0, end_time=0.0)]
        )

    def stream(self) -> stt.SpeechStream:
        return WhisperSpeechStream(self._whisper_model, language=self.language)

class WhisperSpeechStream(stt.SpeechStream):
    def __init__(self, whisper_model: WhisperModel, language: str = "en"):
        super().__init__()
        self._whisper_model = whisper_model
        self.language = language
        self.audio_data = bytearray()
        self._event_queue = asyncio.Queue()

    def push_frame(self, frame: rtc.AudioFrame) -> None:
        # Accumulate PCM 16-bit audio
        self.audio_data.extend(frame.data)

    def flush(self) -> None:
        if len(self.audio_data) == 0:
            return

        # convert to float32 numpy array
        audio_np = np.frombuffer(self.audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        
        # run faster-whisper
        segments, _ = self._whisper_model.transcribe(audio_np, beam_size=5, language=self.language)
        text = "".join([segment.text for segment in segments]).strip()
        
        if text:
            # create the Event object
            event = stt.SpeechEvent(
                type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                alternatives=[stt.SpeechData(language=self.language, text=text, start_time=0.0, end_time=0.0)]
            )
            self._event_queue.put_nowait(event)

        # clear buffer
        self.audio_data = bytearray()

    def end_input(self) -> None:
        self.flush()
        self._event_queue.put_nowait(None)

    async def __anext__(self) -> stt.SpeechEvent:
        event = await self._event_queue.get()
        if event is None:
            raise StopAsyncIteration
        return event
