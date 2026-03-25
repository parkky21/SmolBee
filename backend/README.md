# 🐝 OpenBee Backend

**OpenBee** is an offline AI Voice Assistant backend powered by LiveKit Agents, local inference plugins, and modern GPU/CPU acceleration.

## 🚀 Setup Instructions

### 1. Prerequisites
- [uv](https://docs.astral.sh/uv/) installed.
- Python 3.12+

### 2. Install Dependencies
```bash
uv sync
```

### 3. Setup Environment
Create a `.env` file in the `backend/` directory (copy from `.env.example`) and add your LiveKit credentials:
```env
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

---

## 📥 Download Models
Before running the agent for the first time, you must download the local model files for Whisper (STT), Gemma (LLM), and Kokoro (TTS).

Run the provided script:
```bash
uv run python utils/download_all_models.py
```
This will place the weights into the `models/` directory.

### 💡 Changing the Local LLM
If you want to use a different quantized version of Gemma 3 (e.g., a smaller 4-bit version for speed), follow these steps:

1.  **Browse Models**: Go to [unsloth/gemma-3-1b-it-GGUF](https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/tree/main).
2.  **Update Download Script**: In `utils/download_all_models.py`, change the `filename` in the `hf_hub_download` call to your desired `.gguf` file.
3.  **Update Agent Config**: In `core/agent.py`, update the `model_path` in the `LocalLlamaLLM` initialization to match the new filename:
    ```python
    llm=LocalLlamaLLM(model_path="models/your-new-model.gguf")
    ```

---

## 🏃‍♂️ Running the System

### Start the API Server
The API server handles connection details for the frontend:
```bash
uv run server.py
```

---

## 📂 Project Structure
- **`core/`**: Core agent logic, server definitions, and configurations.
- **`plugins/`**: Custom STT, TTS, and LLM implementations for local inference.
- **`utils/`**: Helper scripts for token generation and model management.
- **`models/`**: Local storage for model weights and binaries.
