import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenRequest(BaseModel):
    participant_name: str
    room_name: str

@app.post("/getToken")
async def get_token(request: TokenRequest):
    if not os.getenv("LIVEKIT_API_KEY") or not os.getenv("LIVEKIT_API_SECRET"):
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured on backend")
        
    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET"))
    token.with_identity(request.participant_name)\
         .with_name(request.participant_name)\
         .with_grants(api.VideoGrants(
             room_join=True,
             room=request.room_name,
         ))
    return {"token": token.to_jwt()}
