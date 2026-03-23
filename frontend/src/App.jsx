import React, { useState } from 'react';
import VoiceAssistant from './components/VoiceAssistant';
import { Sparkles, Brain, Mic, Volume2, AudioWaveform, ArrowRight, AlertCircle } from 'lucide-react';

function App() {
  console.log("App component executing!");
  const [inCall, setInCall] = useState(false);
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [models, setModels] = useState({
    llm: 'gemma-3-1b-it-Q8_0',
    stt: 'whisper-distill-small.en',
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-dark-bg text-slate-100 font-sans">
      {/* Animated background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-600/15 rounded-full blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-accent-500/10 rounded-full blur-[120px] animate-blob-slow pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />

      <main className="z-10 w-full max-w-6xl flex-1 flex flex-col items-center justify-center">
        {!inCall ? (
          <div className="glass-panel p-8 md:p-12 w-full flex flex-col lg:flex-row gap-12 animate-in fade-in zoom-in-95 duration-700">
            
            {/* Left Column: Hero Text */}
            <div className="flex-1 flex flex-col justify-center space-y-8 relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md shadow-lg shadow-black/20">
                <Sparkles className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-bold shimmer-text tracking-wide uppercase">Next-Gen Voice AI</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                  Meet your new <br/>
                  <span className="text-gradient">Local Assistant</span>
                </h1>
                
                <p className="text-xl text-slate-400 leading-relaxed max-w-lg font-medium">
                  Lightning fast, completely private, and running entirely on your machine. Experience the future of offline voice interaction.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3 animate-in slide-in-from-left-4 max-w-lg backdrop-blur-md">
                  <div className="p-1.5 rounded-full bg-red-500/20 mt-0.5 shadow-inner">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="font-medium leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column: Configuration & Start */}
            <div className="flex-[0.8] w-full max-w-md mx-auto flex flex-col gap-6 bg-dark-bg/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-2xl relative shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
              {/* Inner shiny glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none border border-white/5" />
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <AudioWaveform className="w-5 h-5 text-primary-400" />
                  Configuration
                </h3>
              </div>

              <div className="space-y-5">
                {/* LLM Selection */}
                <div className="flex flex-col gap-2 relative z-10">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2 tracking-wide uppercase">
                    <Brain className="w-4 h-4 text-accent-400" /> Language Model
                  </label>
                  <div className="relative group">
                    <select 
                      className="glass-input w-full appearance-none pr-12 cursor-pointer hover:border-accent-400/50 focus:border-accent-400/50 text-base"
                      value={models.llm}
                      onChange={e => setModels({...models, llm: e.target.value})}
                    >
                      <option className="bg-slate-900 text-white" value="qwen2.5:1.5b">Gemma3 (1B)</option>
                      <option className="bg-slate-900 text-white" value="gemma:2b">Qwen2.5 (1.5B)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-accent-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* STT Selection */}
                <div className="flex flex-col gap-2 relative z-10">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2 tracking-wide uppercase">
                    <Mic className="w-4 h-4 text-primary-400" /> Speech to Text
                  </label>
                  <div className="relative group">
                    <select 
                      className="glass-input w-full appearance-none pr-12 cursor-pointer hover:border-primary-400/50 focus:border-primary-400/50 text-base"
                      value={models.stt}
                      onChange={e => setModels({...models, stt: e.target.value})}
                    >
                      <option className="bg-slate-900 text-white" value="whisper-base">Faster Whisper (Small)</option>
                      <option className="bg-slate-900 text-white" value="whisper-tiny">Faster Whisper (Base)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-primary-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* TTS Selection */}
                <div className="flex flex-col gap-2 relative z-10">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2 tracking-wide uppercase">
                    <Volume2 className="w-4 h-4 text-purple-400" /> Text to Speech
                  </label>
                  <div className="relative group">
                    <select 
                      className="glass-input w-full appearance-none pr-12 cursor-pointer hover:border-purple-400/50 focus:border-purple-400/50 text-base"
                      value={models.tts}
                      onChange={e => setModels({...models, tts: e.target.value})}
                    >
                      <option className="bg-slate-900 text-white" value="kokoro-v0.19">Kokoro V0.19</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-purple-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 hover:from-primary-500 hover:to-accent-400 text-white font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden z-10 flex items-center justify-center border border-white/10"
                >
                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 tracking-wide">
                      Initialize Assistant
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
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
