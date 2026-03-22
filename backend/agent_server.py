import asyncio
import logging
from configs import GetConfigs
from livekit.agents import WorkerOptions, AgentServer as LKAgentServer
from livekit import agents
from livekit.plugins import silero
logger = logging.getLogger("agent_runner")

class VADPrewarmer:
    def __init__(self):
        pass
    def __call__(self, proc: agents.JobProcess):
        logger.info("+++++++++++++ Prewarming VAD ++++++++++++++")
        vad = silero.VAD.load()
        proc.userdata["vad"] = vad

class AgentRunner:
    def __init__(self, entrypoint):
        self.configurations = GetConfigs()
        self.agent_name = self.configurations.get_agent_name()
        self.entrypoint = entrypoint
        self._server = None
        self._runner_task = None

    def build_server(self):
        opts = WorkerOptions(
            entrypoint_fnc=self.entrypoint,
            ws_url=self.configurations.get_livekit_url(),
            agent_name=self.agent_name,
            api_key=self.configurations.get_livekit_api_key(),
            api_secret=self.configurations.get_livekit_api_secret(),
            port=0,
            num_idle_processes=1,
            shutdown_process_timeout=60,
        )
        server = LKAgentServer.from_server_options(opts)
        prewarmer = VADPrewarmer()
        server.setup_fnc = prewarmer
        return server

    async def start(self, devmode: bool = True) -> bool:
        """
        Start the AgentServer in a background task.
        """
        if self._runner_task and not self._runner_task.done():
            logger.warning(f"[{self.agent_name}] Server already running")
            return False

        self._server = self.build_server()

        async def _runner():
            try:
                logger.info(f"[{self.agent_name}] Starting server.run(devmode={devmode})")
                await self._server.run(devmode=devmode)
            except asyncio.CancelledError:
                logger.info(f"[{self.agent_name}] Runner task cancelled")
                if self._server:
                    await self._server.aclose()
            except Exception:
                logger.exception(f"[{self.agent_name}] Unexpected exception in runner")
            finally:
                self._server = None
                self._runner_task = None

        self._runner_task = asyncio.create_task(_runner(), name=f"agent-server:{self.agent_name}")
        logger.info(f"[{self.agent_name}] Server task started")
        return True

    async def stop(self, timeout: float = 30.0) -> bool:
        """
        Gracefully stop the server.
        """
        if not self._runner_task and not self._server:
            logger.info(f"[{self.agent_name}] Not running")
            return True

        if self._server:
            try:
                logger.info(f"[{self.agent_name}] Attempting server.aclose()")
                await self._server.aclose()
            except Exception:
                logger.exception(f"[{self.agent_name}] Error during server.aclose()")

        if self._runner_task and not self._runner_task.done():
            logger.info(f"[{self.agent_name}] Cancelling runner task")
            self._runner_task.cancel()
            try:
                await asyncio.wait_for(self._runner_task, timeout=timeout)
            except (asyncio.TimeoutError, asyncio.CancelledError):
                pass

        self._runner_task = None
        self._server = None
        logger.info(f"[{self.agent_name}] Stopped and cleaned up")
        return True