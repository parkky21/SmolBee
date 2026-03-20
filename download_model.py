import logging
from faster_whisper import download_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    model_size = "distil-small.en"
    logger.info(f"Downloading Whisper model '{model_size}'...")
    # This downloads the model to the local huggingface cache
    model_path = download_model(model_size)
    logger.info(f"Download complete! Model saved to: {model_path}")
    logger.info("You can now safely run: uv run agent.py dev")
