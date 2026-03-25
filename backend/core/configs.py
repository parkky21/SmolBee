import os
from dotenv import load_dotenv

load_dotenv()

class GetConfigs:
    def __init__(self):
        self.LIVEKIT_URL = os.getenv("LIVEKIT_URL")
        self.LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
        self.LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
        self.room_name= "offline_agent"
        self.agent_name="SmolBee"

    def get_livekit_url(self):
        return self.LIVEKIT_URL
    def get_livekit_api_key(self):
        return self.LIVEKIT_API_KEY
    def get_livekit_api_secret(self):
        return self.LIVEKIT_API_SECRET
    def get_room_name(self):
        return self.room_name
    def get_agent_name(self):
        return self.agent_name