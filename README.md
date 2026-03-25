# 🐝 OpenBee

**OpenBee** is an offline AI Voice Assistant application that runs fully locally for security and privacy. Powered by LiveKit Agents, modern inference plugins (Kokoro TTS, Whisper STT, Gemma LLM), and a beautiful React dashboard.

---

## 🏗 Architecture

The project is structured as a monorepo containing:

1. **[`backend/`](./backend)**: 
   - Python-based backend using `livekit.agents`.
   - Local models management and inference plugins.
2. **[`frontend/`](./frontend)**:
   - React + Vite interface built with `@livekit/components-react`.
   - Live streaming metrics and audio state controls.

---

## 🚀 Getting Started

To get the full system up and running, you need to start **both** the backend and the frontend.

### 1. Backend Setup
Follow instructions in [**`backend/README.md`**](./backend/README.md) to:
- Install dependencies with `uv`.
- Configure environment variables for LiveKit connection.
- Download offline model files.
- Start the LiveKit agent.

### 2. Frontend Setup
Follow instructions in [**`frontend/README.md`**](./frontend/README.md) to:
- Install packages with `npm install`.
- Boot up the Vite preview server (`npm run dev`).

---

## 🛠 Stack
- **Dashboard UI**: React, Tailwind CSS, Vite
- **Agent Server**: LiveKit, FastRTC, Custom Python inference pipelines
- **Models**: Gemma3 1B (LLM), Whisper Small (STT), Kokoro (TTS)
