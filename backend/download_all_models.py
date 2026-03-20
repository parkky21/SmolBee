import os
import shutil
from huggingface_hub import hf_hub_download
from faster_whisper import download_model

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

print("1. Downloading Whisper model (distil-small.en)...")
# Downloads into faster-whisper internal cache
download_model("distil-small.en") 

print("\n2. Downloading Gemma 3 1B GGUF...")
hf_hub_download(
    repo_id="unsloth/gemma-3-1b-it-GGUF",
    filename="gemma-3-1b-it-UD-Q8_K_XL.gguf",
    local_dir=MODELS_DIR
)

print("\n3. Downloading Kokoro ONNX and Voices...")
hf_hub_download(
    repo_id="fastrtc/kokoro-onnx",
    filename="kokoro-v1.0.onnx",
    local_dir=MODELS_DIR
)
voices_bin = hf_hub_download(
    repo_id="fastrtc/kokoro-onnx",
    filename="voices-v1.0.bin",
    local_dir=MODELS_DIR
)

# Rename to voices.bin to match plugins/tts_plugin.py expectation
voices_target = os.path.join(MODELS_DIR, "voices.bin")
if not os.path.exists(voices_target):
    shutil.copy(voices_bin, voices_target)
    print(f"Created voices.bin from voices-v1.0.bin")

print("\nAll models downloaded successfully and placed in 'models/' directory.")
