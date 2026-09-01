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
  Pause,
  Columns,
  Maximize2,
  Video,
  Map as MapIcon
} from 'lucide-react';

export default function Header({ 
  missionState, 
  simulationMode, 
  onSetSimulationMode,
  isPlayingAutoDemo,
  onToggleAutoDemo,
  layoutMode = 'DUAL_SPLIT',
  onSetLayoutMode = () => {}
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
          text: 'TARGET ACQUIRED ●',
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
    <header className="h-14 px-3.5 bg-[#0B0E0F] border-b border-aeris-border flex items-center justify-between select-none shrink-0 z-20 font-sans">
      {/* 1. Left: Brand & Aerospace Logo */}
      <div className="flex items-center space-x-2.5 min-w-[240px]">
        <div className="w-8 h-8 rounded-lg bg-aeris-surface border border-white/10 flex items-center justify-center shadow-inner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V13C3 18.5 6.8 23.2 12 24.5C17.2 23.2 21 18.5 21 13V7L12 2Z" stroke="#3B8EDB" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(59, 142, 219, 0.1)"/>
            <path d="M8 12L11 15L16 9" stroke="#62C370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-semibold tracking-[0.12em] text-aeris-textPrimary">
              AERIS COMMAND CENTER
            </h1>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30 font-medium">
              AERIS-01
            </span>
          </div>
          <p className="text-[8px] tracking-[0.08em] uppercase text-aeris-textSecondary font-medium leading-none mt-0.5">
            Autonomous Disaster Search & Rescue
          </p>
        </div>
      </div>

      {/* 2. Center-Left: Dual Screen Layout Switcher */}
      <div className="flex items-center space-x-1 bg-aeris-surface p-0.5 rounded-card border border-aeris-border text-[9px] font-mono">
        {[
          { id: 'DUAL_SPLIT', label: '50/50 DUAL VIEW', icon: Columns },
          { id: 'CAM_FOCUS', label: 'CAM FOCUS', icon: Video },
          { id: 'MAP_FOCUS', label: 'MAP FOCUS', icon: MapIcon },
          { id: '3_PANE', label: '3-PANE', icon: Layers }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = layoutMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetLayoutMode(item.id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-all font-semibold ${
                isActive
                  ? 'bg-aeris-cyan/20 text-aeris-cyan border border-aeris-cyan/40 shadow-sm'
                  : 'text-aeris-textSecondary hover:text-white border border-transparent'
              }`}
              title={`Switch dashboard layout to ${item.label}`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Center-Right: Automated Recovery Demo Engine */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleAutoDemo}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-card border text-[10px] font-mono font-bold transition-all ${
            isPlayingAutoDemo
              ? 'bg-aeris-amber/20 border-aeris-amber text-aeris-amber shadow-[0_0_12px_rgba(245,166,35,0.4)] animate-pulse'
              : 'bg-aeris-surface border-white/10 text-aeris-textSecondary hover:text-aeris-textPrimary'
          }`}
        >
          {isPlayingAutoDemo ? (
            <>
              <Pause className="w-3 h-3 text-aeris-amber" />
              <span>DEMO PLAYING...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-aeris-cyan fill-aeris-cyan" />
              <span>FAILOVER DEMO</span>
            </>
          )}
        </button>

        {/* Manual Simulation State Trigger Buttons */}
        <div className="flex items-center space-x-0.5 bg-aeris-surface p-0.5 rounded-card border border-aeris-border text-[9px] font-mono">
          {[
            { id: 'NORMAL', label: 'NORMAL' },
            { id: 'SIGNAL_LOSS', label: 'SIGNAL LOSS' },
            { id: 'BACKTRACKING', label: 'BACKTRACK' },
            { id: 'RECONNECTED', label: 'RECONNECT' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSetSimulationMode(mode.id)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                simulationMode === mode.id
                  ? 'bg-aeris-surfaceHover text-aeris-textPrimary font-bold border border-white/10'
                  : 'text-aeris-textMuted hover:text-aeris-textSecondary'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Right: Telemetry Health & UTC Clock */}
      <div className="flex items-center space-x-3">
        {/* System Health Badge */}
        <div className={`px-2.5 py-1 rounded-card border text-[9.5px] font-mono font-bold tracking-wider ${statusBadge.bg}`}>
          {statusBadge.text}
        </div>

        {/* Live UTC Clock */}
        <div className="flex items-center space-x-1.5 text-aeris-textPrimary font-mono text-xs bg-aeris-surface px-2.5 py-1 rounded-card border border-aeris-border">
          <Clock className="w-3.5 h-3.5 text-aeris-textSecondary" />
          <span className="font-semibold">{formatTime(time)}</span>
        </div>
      </div>
    </header>
  );
}
