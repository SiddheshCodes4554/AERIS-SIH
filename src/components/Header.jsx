import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  Cpu, 
  Clock, 
  Radio, 
  RotateCcw, 
  Sparkles,
  Layers,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

export default function Header({ 
  missionState, 
  simulationMode, 
  onSetSimulationMode,
  isPlayingAutoDemo,
  onToggleAutoDemo
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toISOString().substring(11, 19) + ' UTC';
  };

  const getStatusBadge = () => {
    switch (simulationMode) {
      case 'SIGNAL_LOSS':
        return {
          text: 'SIGNAL LOST ● OFFLINE AI ACTIVE',
          bg: 'bg-[#FF4D3D]/20 text-[#FF4D3D] border-[#FF4D3D]/40 animate-pulse shadow-[0_0_10px_rgba(255,77,61,0.3)]'
        };
      case 'BACKTRACKING':
        return {
          text: 'AUTONOMOUS BACKTRACKING ●',
          bg: 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 animate-pulse shadow-[0_0_10px_rgba(245,166,35,0.4)]'
        };
      case 'RECONNECTED':
        return {
          text: 'SYNCING BUFFERED DATA ●',
          bg: 'bg-[#3B9EFF]/20 text-[#3B9EFF] border-[#3B9EFF]/40 shadow-[0_0_10px_rgba(59,158,255,0.3)]'
        };
      case 'DETECTION':
        return {
          text: 'SURVIVOR CONFIRMED (96%) ●',
          bg: 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 shadow-[0_0_10px_rgba(245,166,35,0.3)]'
        };
      case 'NORMAL':
      default:
        return {
          text: 'SYSTEM ONLINE ● NOMINAL',
          bg: 'bg-[#63C174]/20 text-[#63C174] border-[#63C174]/40 shadow-[0_0_10px_rgba(99,193,116,0.3)]'
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="h-14 px-4 bg-[#0B0E0F] border-b border-aeris-border flex items-center justify-between select-none shrink-0 z-20 font-sans">
      {/* 1. Left: Brand & Aerospace Logo */}
      <div className="flex items-center space-x-3 min-w-[280px]">
        <div className="w-8 h-8 rounded-lg bg-aeris-surface border border-white/10 flex items-center justify-center shadow-inner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V13C3 18.5 6.8 23.2 12 24.5C17.2 23.2 21 18.5 21 13V7L12 2Z" stroke="#3B8EDB" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(59, 142, 219, 0.1)"/>
            <path d="M8 12L11 15L16 9" stroke="#62C370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-semibold tracking-[0.14em] text-aeris-textPrimary">
              AERIS COMMAND CENTER
            </h1>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30 font-medium">
              UAV-01
            </span>
          </div>
          <p className="text-[8.5px] tracking-[0.08em] uppercase text-aeris-textSecondary font-medium leading-none mt-0.5">
            Autonomous Disaster Response Operations
          </p>
        </div>
      </div>

      {/* 2. Center: Mission Information */}
      <div className="hidden lg:flex items-center space-x-3 px-3.5 py-1 rounded-card bg-aeris-surface border border-aeris-border text-xs font-mono">
        <div>
          <span className="text-[8.5px] text-aeris-textMuted uppercase block leading-none">MISSION</span>
          <span className="text-aeris-textPrimary font-semibold">{missionState.missionName}</span>
        </div>
        <div className="h-4 w-[1px] bg-aeris-border"></div>
        <div>
          <span className="text-[8.5px] text-aeris-textMuted uppercase block leading-none">TARGET CHECKPOINT</span>
          <span className="text-aeris-cyan font-bold">{missionState.checkpoint}</span>
        </div>
      </div>

      {/* 3. Right: Demo Simulation State Switcher & System Status */}
      <div className="flex items-center space-x-2">
        {/* Automated Backtracking Recovery Demo Button */}
        <button
          onClick={onToggleAutoDemo}
          className={`px-3 py-1 rounded-pill font-mono text-[10px] font-bold flex items-center space-x-1.5 transition-all shadow-md ${
            isPlayingAutoDemo
              ? 'bg-[#F5A623] text-black animate-pulse shadow-[0_0_12px_rgba(245,166,35,0.5)]'
              : 'bg-[#1C2125] hover:bg-[#181D1E] text-[#F5A623] border border-[#F5A623]/40'
          }`}
          title="Click to play fully automated signal loss and backtracking recovery sequence"
        >
          {isPlayingAutoDemo ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlayingAutoDemo ? 'RECOVERY DEMO ACTIVE...' : '▶ AUTO BACKTRACK DEMO'}</span>
        </button>

        {/* Interactive Scenario States */}
        <div className="hidden md:flex items-center space-x-1 bg-aeris-surface p-0.5 rounded-pill border border-aeris-border text-[9.5px] font-mono">
          {[
            { id: 'NORMAL', label: 'NORMAL' },
            { id: 'DETECTION', label: 'AI DETECT' },
            { id: 'SIGNAL_LOSS', label: 'SIGNAL LOSS' },
            { id: 'BACKTRACKING', label: 'BACKTRACK' },
            { id: 'RECONNECTED', label: 'RECONNECT' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => onSetSimulationMode(st.id)}
              className={`px-2 py-0.5 rounded-pill transition-all font-semibold ${
                simulationMode === st.id
                  ? 'bg-aeris-surfaceHover text-aeris-cyan border border-aeris-cyan/40 shadow-sm'
                  : 'text-aeris-textSecondary hover:text-aeris-textPrimary'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Live System State Badge */}
        <div className={`px-2.5 py-1 rounded-pill text-[10.5px] font-mono font-bold border transition-all ${statusBadge.bg}`}>
          {statusBadge.text}
        </div>

        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-aeris-surface border border-aeris-border rounded-pill text-[10.5px] font-mono text-aeris-textPrimary">
          <Clock className="w-3 h-3 text-aeris-textSecondary" />
          <span>{formatTime(time)}</span>
        </div>
      </div>
    </header>
  );
}
