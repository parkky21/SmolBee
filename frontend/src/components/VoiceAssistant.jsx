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
      <div className="glass-panel p-8 md:p-12 w-full max-w-3xl flex flex-col items-center text-center gap-10 relative overflow-hidden border border-bee-amber/10 rounded-[3rem]"
        style={{ boxShadow: '0 20px 60px -15px rgba(245, 166, 35, 0.1), 0 4px 20px rgba(0,0,0,0.04)' }}
      >
        
        {/* Warm glow behind the panel */}
        <div className="absolute inset-0 bg-gradient-to-br from-bee-honey/5 to-bee-gold/3 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-bee-gold/20 to-transparent" />

        {/* End Button - Top Right */}
        <button 
          onClick={onDisconnect}
          className="absolute top-6 right-8 p-2.5 rounded-full bg-black/5 hover:bg-red-50 border border-black/8 hover:border-red-300 text-bee-muted hover:text-red-500 transition-all z-20 group cursor-pointer"
          title="End Session"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="bee-badge">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-bee-black tracking-widest uppercase">Live Connection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gradient drop-shadow-sm">
            LocalBee 🐝
          </h2>
        </div>
        
        <Visualizer />
        
        {/* Chat / Status context */}
        <div className="w-full max-w-md p-4 rounded-2xl bg-bee-light/60 border border-bee-amber/10 backdrop-blur-sm relative z-10 flex justify-center items-center gap-3 mt-4">
          <Bot className="w-5 h-5 text-bee-gold" />
          <p className="text-bee-charcoal font-medium tracking-wide">I'm listening and ready to assist you.</p>
        </div>

        <div className="mt-4 z-10 w-full flex justify-center relative">
          <VoiceAssistantControlBar />
        </div>
        
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}

// Custom visualizer orb — bee-themed with golden accents
function Visualizer() {
  const { state } = useVoiceAssistant();
  
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting' || state === 'initializing';
  const isIdle = state === 'idle' || state === 'disconnected' || state === 'unknown';
  
  return (
    <div className="relative w-72 h-72 flex items-center justify-center my-10 z-10">
      {/* Background glow layers */}
      <div className={`absolute inset-0 bg-bee-gold/15 rounded-full blur-[60px] transition-all duration-1000 ${isSpeaking ? 'opacity-100 scale-125' : isListening ? 'opacity-60 scale-110' : 'opacity-20 scale-100'}`} />
      
      {/* Speaking Ripple Effects */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-bee-gold/30" />
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-bee-amber/20" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-bee-honey/15" style={{ animationDelay: '0.8s' }} />
        </>
      )}

      {/* Listening — soft breathing glow ring */}
      {isListening && (
        <>
          <div className="absolute inset-[-8%] rounded-full border-2 border-bee-gold/20 animate-[pulse_3s_ease-in-out_infinite]" />
          <div className="absolute inset-[-15%] rounded-full border border-bee-amber/10 animate-[pulse_3s_ease-in-out_infinite_0.6s]" />
          <div className="absolute inset-[-20%] rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(245,166,35,0.15)_360deg)] blur-2xl opacity-40 pointer-events-none" />
        </>
      )}
      
      {/* Core Orb */}
      <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-700 ${
        isListening 
          ? 'bg-gradient-to-br from-bee-gold to-bee-amber shadow-[0_0_50px_rgba(245,166,35,0.4)] scale-110' 
          : isSpeaking 
            ? 'bg-gradient-to-br from-bee-amber to-bee-honey shadow-[0_0_60px_rgba(255,193,7,0.5)] scale-105' 
            : 'bg-white border-2 border-black/8 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
      } z-10 overflow-hidden group`}>
        
        {/* Core Orb inner reflection */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/30 opacity-60" />
        
        {/* Content based on state */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {isConnecting && (
             <div className="flex flex-col items-center gap-3 text-bee-charcoal">
               <Loader2 className="w-8 h-8 animate-spin" />
               <span className="text-sm font-bold tracking-widest uppercase">Waking up</span>
             </div>
          )}
          
          {isListening && (
            <div className="flex flex-col items-center gap-1 text-white">
              <Mic className="w-10 h-10 text-white animate-[pulse_2s_ease-in-out_infinite] drop-shadow-lg" />
              <span className="text-xs font-bold tracking-widest uppercase opacity-80 mt-1">Listening</span>
            </div>
          )}
          
          {isSpeaking && (
             <div className="flex flex-col items-center gap-2 w-full px-4">
               <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                 {[...Array(7)].map((_, i) => (
                   <div 
                    key={i} 
                    className="w-2.5 bg-bee-black rounded-full animate-[wave_1.2s_ease-in-out_infinite]" 
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
            <div className="flex flex-col items-center gap-3 text-bee-muted">
              <Activity className="w-8 h-8 opacity-50" />
              <span className="text-sm font-bold tracking-widest uppercase">Idle</span>
            </div>
          )}
        </div>
      </div>
      
      {/* State Label Below Orb */}
      <div className={`absolute -bottom-16 px-6 py-2 rounded-full border backdrop-blur-md transition-all duration-500 ${
        isSpeaking 
          ? 'bg-bee-honey/20 text-bee-charcoal border-bee-amber/30 shadow-[0_4px_15px_rgba(245,166,35,0.15)]' 
          : isListening 
            ? 'bg-bee-gold/15 text-bee-black border-bee-gold/30 shadow-[0_4px_15px_rgba(245,166,35,0.1)]' 
            : 'bg-white text-bee-muted border-black/8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
      }`}>
        <span className="font-bold tracking-[0.2em] uppercase text-sm">
          {state}
        </span>
      </div>
    </div>
  );
}
