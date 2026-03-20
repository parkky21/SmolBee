# LocalBee Backend

Offline AI Voice Assistant backend powered by LiveKit Agents, FastRTC, and Local Inference.

## 🚀 Setup Instructions

### 1. Prerequisites
- [uv](https://docs.astral.sh/uv/) installed.
- Python 3.12+

### 2. Install Dependencies
```bash
uv sync
```

### 3. Setup Environment
Create a `.env` file in the root directory (copy from `.env.example` if available) and add your LiveKit credentials:
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
uv run download_all_models.py
```
This will place the weights into the `models/` directory used by the plugins.

---

## 🏃‍♂️ Running the Agent

Start the LiveKit agent:
```bash
uv run agent.py dev
```

---

## 📂 Project Structure
- **`plugins/`**: Custom STT, TTS, and LLM implementations for local inference.
- **`models/`**: Weights and models storage.
- **`agent.py`**: Main agent entry point with metrics dashboard instrumentation.
