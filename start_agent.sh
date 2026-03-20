#!/bin/bash

echo "Downloading Whisper model (this may take a few minutes depending on your connection)..."
uv run python download_model.py

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo "Model downloaded successfully! Starting LiveKit..."
    echo "=========================================="
    uv run agent.py dev
else
    echo "Model download failed. Please check your internet connection and try again."
    exit 1
fi
