from livekit.api import (
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
  VideoGrants,
)
from uuid import uuid4
from core.configs import GetConfigs

configurations = GetConfigs()

room_name = configurations.get_room_name()
agent_name = configurations.get_agent_name()
identity = hex(uuid4().int)

def create_token_with_agent_dispatch() -> str:
    token = (
        AccessToken()
        .with_identity(identity)
        .with_grants(VideoGrants(room_join=True, room=room_name))
        .with_room_config(
            RoomConfiguration(
                agents=[
                    RoomAgentDispatch(agent_name=agent_name)
                ],
            ),
        )
        .to_jwt()
    )
    return token