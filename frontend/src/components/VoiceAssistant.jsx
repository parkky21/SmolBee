import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar, useVoiceAssistant } from '@livekit/components-react';
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
      className="flex flex-col items-center justify-center p-8 w-full h-full"
    >
      <div className="glass-panel p-8 w-full max-w-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-blue-400">
          Live Agent
        </h2>
        
        <Visualizer />
        
        <div className="mt-8 z-10 w-full flex justify-center">
          <VoiceAssistantControlBar />
        </div>
        
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}

// Simple custom visualizer
function Visualizer() {
  const { state } = useVoiceAssistant();
  
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  
  return (
    <div className="relative w-48 h-48 flex items-center justify-center my-8 z-10">
      <div className={`absolute inset-0 bg-primary-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${isSpeaking ? 'opacity-100' : 'opacity-30'}`} />
      
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full animate-pulse-ring" />
      )}
      
      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-primary-600 scale-105' : 'bg-white/10 glass-panel'} shadow-lg border border-white/20 z-10`}>
        {state === 'connecting' && <span className="text-white/70 animate-pulse">Connecting...</span>}
        {state === 'initializing' && <span className="text-white/70">Waking up...</span>}
        {state === 'listening' && (
          <div className="flex gap-1 items-center justify-center h-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 bg-white rounded-full animate-pulse" style={{ height: `${Math.max(10, Math.random() * 24)}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        {state === 'speaking' && (
           <div className="flex gap-2 items-center justify-center h-12">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="w-2 bg-white rounded-full animate-[bounce_1s_infinite]" style={{ height: `${20 + Math.random() * 28}px`, animationDelay: `${i * 0.1}s` }} />
             ))}
           </div>
        )}
        {state === 'idle' && <span className="text-white/50">Idle</span>}
      </div>
      
      <div className="absolute -bottom-10 text-primary-500/80 font-medium uppercase tracking-widest text-sm">
        {state}
      </div>
    </div>
  );
}
