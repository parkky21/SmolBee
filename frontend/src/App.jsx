import React, { useState } from 'react';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  console.log("App component executing!");
  const [inCall, setInCall] = useState(false);
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [models, setModels] = useState({
    llm: 'gpt-oss:120b-cloud',
    stt: 'whisper-base',
    tts: 'kokoro-v0.19'
  });

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Hardcoded backend URL for local demo
      const res = await fetch('http://localhost:8000/api/connection-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: 'User',
          room_name: 'offline_agent_demo'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get token! Ensure backend server is running.');
      }

      const data = await res.json();
      setToken(data.token);
      setServerUrl(data.serverUrl);
      setInCall(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-12 relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="z-10 w-full max-w-4xl">
        {!inCall ? (
          <div className="glass-panel p-8 md:p-12 flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                Offline Voice Agent
              </h1>
              <p className="text-white/60 text-lg">
                Lightning fast, completely private AI voice interaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* LLM Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Language Model (LLM)</label>
                <select 
                  className="glass-input cursor-pointer appearance-none"
                  value={models.llm}
                  onChange={e => setModels({...models, llm: e.target.value})}
                >
                  <option className="bg-dark-bg text-white" value="qwen2.5:1.5b">Qwen 2.5 (1.5B)</option>
                  <option className="bg-dark-bg text-white" value="gemma:2b">Gemma (2B)</option>
                </select>
              </div>

              {/* STT Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Speech to Text (STT)</label>
                <select 
                  className="glass-input cursor-pointer appearance-none"
                  value={models.stt}
                  onChange={e => setModels({...models, stt: e.target.value})}
                >
                  <option className="bg-dark-bg text-white" value="whisper-base">Faster Whisper (Base)</option>
                  <option className="bg-dark-bg text-white" value="whisper-tiny">Faster Whisper (Tiny)</option>
                </select>
              </div>

              {/* TTS Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Text to Speech (TTS)</label>
                <select 
                  className="glass-input cursor-pointer appearance-none"
                  value={models.tts}
                  onChange={e => setModels({...models, tts: e.target.value})}
                >
                  <option className="bg-dark-bg text-white" value="kokoro-v0.19">Kokoro V0.19</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                'Start Conversation'
              )}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-[600px]">
            <VoiceAssistant 
              serverUrl={serverUrl}
              token={token}
              onDisconnect={() => {
                setInCall(false);
                setToken('');
                setServerUrl('');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
