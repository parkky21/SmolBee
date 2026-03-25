import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants
from dotenv import load_dotenv
from core.configs import GetConfigs
from core.agent_server import AgentRunner
from core.agent import entrypoint
from contextlib import asynccontextmanager
from utils.token_service import create_token_with_agent_dispatch

logging.basicConfig(level=logging.INFO)
worker = AgentRunner(entrypoint)

configurations = GetConfigs()

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await worker.start()
    yield
    # Shutdown
    await worker.stop()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionRequest(BaseModel):
    participant_name: str
    room_name: str

LIVEKIT_URL = configurations.get_livekit_url()
LIVEKIT_API_KEY = configurations.get_livekit_api_key()
LIVEKIT_API_SECRET = configurations.get_livekit_api_secret()

@app.post("/api/connection-details")
async def get_connection_details(request: ConnectionRequest):
    if not LIVEKIT_URL or not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured in backend .env")

    # Generate token
    token = create_token_with_agent_dispatch()
    
    return {
        "token": token,
        "serverUrl": LIVEKIT_URL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
