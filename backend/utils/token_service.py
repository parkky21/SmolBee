from livekit.api import (
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
  VideoGrants,
)
from configs import GetConfigs

configurations = GetConfigs()

room_name = configurations.get_room_name()
agent_name = configurations.get_agent_name()

def create_token_with_agent_dispatch() -> str:
    token = (
        AccessToken()
        .with_identity("my_participant")
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