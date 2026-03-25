import React from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  VoiceAssistantControlBar, 
  useVoiceAssistant
} from '@livekit/components-react';
import { Activity, Mic, Loader2, Bot, X } from 'lucide-react';
import '@livekit/components-styles';

export default function VoiceAssistant({ serverUrl, token, onDisconnect }) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onDisconnect}
      className="flex flex-col items-center justify-center p-4 lg:p-8 w-full h-full relative"
    >
      <div className="glass-panel p-8 md:p-12 w-full max-w-3xl flex flex-col items-center text-center gap-10 relative overflow-hidden border border-honey-500/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-dark-bg/60 backdrop-blur-3xl rounded-[3rem]">
        
        {/* Glow behind the panel */}
        <div className="absolute inset-0 bg-gradient-to-br from-honey-500/5 to-accent-500/3 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-honey-400/20 to-transparent" />

        {/* End Button - Top Right */}
        <button 
          onClick={onDisconnect}
          className="absolute top-6 right-8 p-2.5 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all z-20 group"
          title="End Session"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-honey-500/10 border border-honey-500/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-honey-300 tracking-widest uppercase">Live Connection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-honey-300 via-honey-400 to-white drop-shadow-sm">
            OpenBee 🐝
          </h2>
        </div>
        
        <Visualizer />
        
        {/* Chat / Status context */}
        <div className="w-full max-w-md p-4 rounded-2xl bg-white/5 border border-honey-500/10 backdrop-blur-sm relative z-10 flex justify-center items-center gap-3 mt-4">
          <Bot className="w-5 h-5 text-honey-400" />
          <p className="text-slate-300 font-medium tracking-wide">I'm listening and ready to assist you.</p>
        </div>

        <div className="mt-4 z-10 w-full flex justify-center relative">
          <VoiceAssistantControlBar />
        </div>
        
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}

// Custom visualizer orb — uses smooth CSS animations only
function Visualizer() {
  const { state } = useVoiceAssistant();
  
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting' || state === 'initializing';
  const isIdle = state === 'idle' || state === 'disconnected' || state === 'unknown';
  
  return (
    <div className="relative w-72 h-72 flex items-center justify-center my-10 z-10">
      {/* Background glow layers */}
      <div className={`absolute inset-0 bg-honey-500/20 rounded-full blur-[60px] transition-all duration-1000 ${isSpeaking ? 'opacity-100 scale-125' : isListening ? 'opacity-60 scale-110' : 'opacity-20 scale-100'}`} />
      
      {/* Speaking Ripple Effects */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-honey-400/30" />
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-accent-400/20" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-honey-300/10" style={{ animationDelay: '0.8s' }} />
        </>
      )}

      {/* Listening — soft breathing glow ring */}
      {isListening && (
        <>
          <div className="absolute inset-[-8%] rounded-full border-2 border-honey-400/20 animate-[pulse_3s_ease-in-out_infinite]" />
          <div className="absolute inset-[-15%] rounded-full border border-honey-500/10 animate-[pulse_3s_ease-in-out_infinite_0.6s]" />
          <div className="absolute inset-[-20%] rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(251,191,36,0.2)_360deg)] blur-2xl opacity-40 pointer-events-none" />
        </>
      )}
      
      {/* Core Orb */}
      <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-700 ${isListening ? 'bg-gradient-to-br from-honey-600 to-honey-700 shadow-[0_0_50px_rgba(251,191,36,0.5)] scale-110' : isSpeaking ? 'bg-gradient-to-br from-accent-500 to-honey-500 shadow-[0_0_60px_rgba(249,115,22,0.6)] scale-105' : 'bg-dark-surface border border-white/10 shadow-2xl'} z-10 overflow-hidden group`}>
        
        {/* Core Orb inner reflection */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20 opacity-50" />
        
        {/* Content based on state */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {isConnecting && (
             <div className="flex flex-col items-center gap-3 text-white/80">
               <Loader2 className="w-8 h-8 animate-spin" />
               <span className="text-sm font-bold tracking-widest uppercase">Waking up</span>
             </div>
          )}
          
          {isListening && (
            <div className="flex flex-col items-center gap-1 text-white">
              <Mic className="w-10 h-10 text-white animate-[pulse_2s_ease-in-out_infinite]" />
              <span className="text-xs font-bold tracking-widest uppercase opacity-70 mt-1">Listening</span>
            </div>
          )}
          
          {isSpeaking && (
             <div className="flex flex-col items-center gap-2 w-full px-4">
               <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                 {[...Array(7)].map((_, i) => (
                   <div 
                    key={i} 
                    className="w-2.5 bg-white rounded-full animate-[wave_1.2s_ease-in-out_infinite]" 
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      height: '20%'
                    }} 
                   />
                 ))}
               </div>
             </div>
          )}
          
          {isIdle && (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <Activity className="w-8 h-8 opacity-50" />
              <span className="text-sm font-bold tracking-widest uppercase">Idle</span>
            </div>
          )}
        </div>
      </div>
      
      {/* State Label Below Orb */}
      <div className={`absolute -bottom-16 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all duration-500 shadow-xl ${isSpeaking ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : isListening ? 'bg-honey-500/20 text-honey-300 border-honey-500/30' : 'bg-white/5 text-slate-400'}`}>
        <span className="font-bold tracking-[0.2em] uppercase text-sm">
          {state}
        </span>
      </div>
    </div>
  );
}
