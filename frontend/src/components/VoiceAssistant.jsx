import React, { useState, useEffect, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  useRoomContext
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { Activity, Mic, Loader2, X, Zap, Brain, Volume2, Clock } from 'lucide-react';
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
      className="flex items-center justify-center p-4 lg:p-8 w-full h-full relative"
    >
      <div className="flex flex-row items-stretch gap-5 w-full max-w-5xl relative z-10">

        {/* ─── Main Panel ─── */}
        <div className="glass-panel p-8 md:p-10 flex-1 flex flex-col items-center text-center gap-6 relative overflow-hidden border border-bee-amber/10 rounded-[2.5rem]"
          style={{ boxShadow: '0 20px 60px -15px rgba(245, 166, 35, 0.1), 0 4px 20px rgba(0,0,0,0.04)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-bee-honey/5 to-bee-gold/3 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-bee-gold/20 to-transparent" />

          {/* End Button */}
          <button
            onClick={onDisconnect}
            className="absolute top-5 right-6 p-2.5 rounded-full bg-black/5 hover:bg-red-50 border border-black/8 hover:border-red-300 text-bee-muted hover:text-red-500 transition-all z-20 group cursor-pointer"
            title="End Session"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="bee-badge">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-bee-black tracking-widest uppercase">Live</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gradient drop-shadow-sm">
              OpenBee 🐝
            </h2>
          </div>

          <Visualizer />

          <div className="z-10 w-full flex justify-center relative">
            <VoiceAssistantControlBar />
          </div>

          <RoomAudioRenderer />
        </div>

        {/* ─── Metrics Side Panel ─── */}
        <MetricsPanel />

      </div>
    </LiveKitRoom>
  );
}

// ─── Metrics Side Panel ───
function MetricsPanel() {
  const room = useRoomContext();
  const [metrics, setMetrics] = useState({
    eou_delay: null,
    llm_ttft: null,
    tts_ttfb: null,
  });

  const handleDataReceived = useCallback((payload, participant, kind, topic) => {
    if (topic !== 'lk.agent.metrics') return;
    try {
      const data = JSON.parse(new TextDecoder().decode(payload));
      setMetrics(prev => ({
        eou_delay: data.eou_delay ?? prev.eou_delay,
        llm_ttft: data.llm_ttft ?? prev.llm_ttft,
        tts_ttfb: data.tts_ttfb ?? prev.tts_ttfb,
      }));
    } catch (e) {
      console.warn('Failed to parse metrics data:', e);
    }
  }, []);

  useEffect(() => {
    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, handleDataReceived]);

  const hasAny = metrics.eou_delay !== null || metrics.llm_ttft !== null || metrics.tts_ttfb !== null;
  const totalLatency = (metrics.eou_delay || 0) + (metrics.llm_ttft || 0) + (metrics.tts_ttfb || 0);

  const formatMs = (val) => {
    if (val === null || val === undefined) return '—';
    return `${(val * 1000).toFixed(0)}`;
  };

  const items = [
    { label: 'EOU Delay',     value: metrics.eou_delay,           icon: Clock,   accent: '#3b82f6', accentLight: 'rgba(59,130,246,0.08)' },
    { label: 'LLM TTFT',      value: metrics.llm_ttft,            icon: Brain,   accent: '#8b5cf6', accentLight: 'rgba(139,92,246,0.08)' },
    { label: 'TTS TTFB',      value: metrics.tts_ttfb,            icon: Volume2, accent: '#f59e0b', accentLight: 'rgba(245,158,11,0.08)' },
    { label: 'Total Latency',  value: hasAny ? totalLatency : null, icon: Zap,     accent: '#10b981', accentLight: 'rgba(16,185,129,0.08)' },
  ];

  return (
    <div className="w-48 flex flex-col gap-3 relative z-10">

      {/* Header */}
      <div className="px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-black/5"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
      >
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-bee-muted">Diagnostics</span>
      </div>

      {/* Metric Cards */}
      {items.map(({ label, value, icon: Icon, accent, accentLight }) => (
        <div
          key={label}
          className="group relative px-4 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-black/5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
        >
          {/* Left accent bar */}
          <div
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover:top-2 group-hover:bottom-2"
            style={{ backgroundColor: accent, opacity: value !== null ? 1 : 0.2 }}
          />

          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: accentLight }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-bee-muted">{label}</span>
          </div>

          <div className="flex items-baseline gap-0.5 pl-0.5">
            <span
              className="text-xl font-black tabular-nums transition-all duration-300"
              style={{ color: value !== null ? accent : '#c0b8a8' }}
            >
              {formatMs(value)}
            </span>
            {value !== null && (
              <span className="text-[10px] font-bold text-bee-muted/60">ms</span>
            )}
          </div>
        </div>
      ))}

    </div>
  );
}

// ─── Visualizer Orb ───
function Visualizer() {
  const { state } = useVoiceAssistant();

  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting' || state === 'initializing';
  const isIdle = state === 'idle' || state === 'disconnected' || state === 'unknown';

  return (
    <div className="relative w-56 h-56 flex items-center justify-center my-6 z-10">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-bee-gold/15 rounded-full blur-[50px] transition-all duration-1000 ${isSpeaking ? 'opacity-100 scale-125' : isListening ? 'opacity-60 scale-110' : 'opacity-20 scale-100'}`} />

      {/* Speaking Ripples */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-bee-gold/30" />
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-bee-amber/20" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-bee-honey/15" style={{ animationDelay: '0.8s' }} />
        </>
      )}

      {/* Listening rings */}
      {isListening && (
        <>
          <div className="absolute inset-[-8%] rounded-full border-2 border-bee-gold/20 animate-[pulse_3s_ease-in-out_infinite]" />
          <div className="absolute inset-[-15%] rounded-full border border-bee-amber/10 animate-[pulse_3s_ease-in-out_infinite_0.6s]" />
          <div className="absolute inset-[-20%] rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(245,166,35,0.15)_360deg)] blur-2xl opacity-40 pointer-events-none" />
        </>
      )}

      {/* Core Orb */}
      <div className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-700 ${isListening
        ? 'bg-gradient-to-br from-bee-gold to-bee-amber shadow-[0_0_50px_rgba(245,166,35,0.4)] scale-110'
        : isSpeaking
          ? 'bg-gradient-to-br from-bee-amber to-bee-honey shadow-[0_0_60px_rgba(255,193,7,0.5)] scale-105'
          : 'bg-white border-2 border-black/8 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
        } z-10 overflow-hidden group`}>

        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/30 opacity-60" />

        <div className="relative z-10 flex flex-col items-center gap-1.5">
          {isConnecting && (
            <div className="flex flex-col items-center gap-2 text-bee-charcoal">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Waking up</span>
            </div>
          )}

          {isListening && (
            <div className="flex flex-col items-center gap-1 text-white">
              <Mic className="w-8 h-8 text-white animate-[pulse_2s_ease-in-out_infinite] drop-shadow-lg" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Listening</span>
            </div>
          )}

          {isSpeaking && (
            <div className="flex flex-col items-center gap-2 w-full px-3">
              <div className="flex items-center justify-center gap-1 h-12 w-full">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-bee-black rounded-full animate-[wave_1.2s_ease-in-out_infinite]"
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
            <div className="flex flex-col items-center gap-2 text-bee-muted">
              <Activity className="w-7 h-7 opacity-50" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Idle</span>
            </div>
          )}
        </div>
      </div>

      {/* State label */}
      <div className={`absolute -bottom-12 px-5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 ${isSpeaking
        ? 'bg-bee-honey/20 text-bee-charcoal border-bee-amber/30 shadow-[0_4px_15px_rgba(245,166,35,0.15)]'
        : isListening
          ? 'bg-bee-gold/15 text-bee-black border-bee-gold/30 shadow-[0_4px_15px_rgba(245,166,35,0.1)]'
          : 'bg-white text-bee-muted border-black/8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
        }`}>
        <span className="font-bold tracking-[0.2em] uppercase text-xs">
          {state}
        </span>
      </div>
    </div>
  );
}
