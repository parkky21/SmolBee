import asyncio
import time
import numpy as np
import soundfile as sf
from livekit.agents import tts, types, utils
from livekit import rtc
from kokoro_onnx import Kokoro
import io

class KokoroTTSOptions:
    def __init__(self, voice="af_heart"):
        self.voice = voice

class LocalKokoroTTS(tts.TTS):
    def __init__(self, voice="af_heart"):
        super().__init__(
            capabilities=tts.TTSCapabilities(
                streaming=False, # We'll do chunked synthesis rather than true chunked streaming for simplicity first
            ),
            sample_rate=24000,
            num_channels=1
        )
        self.options = KokoroTTSOptions(voice=voice)
        # Load kokoro models - downloads if not present
        self.kokoro = Kokoro("models/kokoro-v1.0.onnx", "models/voices.bin")
        
    def synthesize(
        self, text: str, *, conn_options: types.APIConnectOptions | None = None
    ) -> tts.ChunkedStream:
        return self._synthesize_with_stream(text, conn_options=conn_options)

    class Stream(tts.SynthesizeStream):
        def __init__(self, tts: "LocalKokoroTTS", conn_options: types.APIConnectOptions | None = None):
            super().__init__(tts=tts, conn_options=conn_options)
            self.kokoro = tts.kokoro
            self.options = tts.options
        
        async def _run(self, output_emitter: tts.AudioEmitter) -> None:
            request_id = utils.shortuuid()
            output_emitter.initialize(
                request_id=request_id,
                sample_rate=self._tts.sample_rate,
                num_channels=self._tts.num_channels,
                mime_type="audio/pcm",
                stream=True,
            )
            try:
                text = ""
                async for msg in self._input_ch:
                    if isinstance(msg, self._FlushSentinel):
                        if text.strip():
                            output_emitter.start_segment(segment_id=utils.shortuuid())
                            stream = self.kokoro.create_stream(text, voice=self.options.voice, speed=1.0)
                            async for samples, sample_rate in stream:
                                if len(samples) > 0:
                                    audio_data = (samples * 32767.0).astype(np.int16).tobytes()
                                    output_emitter.push(audio_data)
                            output_emitter.end_segment()
                        text = ""
                    else:
                        text += msg
                        
                if text.strip():
                    output_emitter.start_segment(segment_id=utils.shortuuid())
                    stream = self.kokoro.create_stream(text, voice=self.options.voice, speed=1.0)
                    async for samples, sample_rate in stream:
                        if len(samples) > 0:
                            audio_data = (samples * 32767.0).astype(np.int16).tobytes()
                            output_emitter.push(audio_data)
                    output_emitter.end_segment()
            except Exception as e:
                print(f"Kokoro TTS error: {e}")

    def stream(
        self, *, conn_options: types.APIConnectOptions | None = None
    ) -> tts.SynthesizeStream:
        return self.Stream(self, conn_options=conn_options)

