import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  Cpu, 
  Clock, 
  Bell, 
  Settings, 
  Radio,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Header({ 
  metadata, 
  isOfflineMode, 
  onToggleOfflineSimulation 
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUtcTime = (date) => {
    return date.toISOString().substring(11, 19);
  };

  return (
    <header className="h-[72px] px-6 flex items-center justify-between bg-aeris-panel border-b border-aeris-border select-none shrink-0 z-20">
      {/* Left: Minimal Aerospace Logo & Subtitle */}
      <div className="flex items-center space-x-3.5 min-w-[340px]">
        {/* Minimal Hexagonal Aero Shield Icon */}
        <div className="w-10 h-10 rounded-xl bg-aeris-surface border border-white/10 flex items-center justify-center shadow-inner">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V13C3 18.5 6.8 23.2 12 24.5C17.2 23.2 21 18.5 21 13V7L12 2Z" stroke="#3B8EDB" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(59, 142, 219, 0.1)"/>
            <path d="M8 12L11 15L16 9" stroke="#62C370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-medium tracking-[0.14em] text-aeris-textPrimary">
              AERIS
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30">
              UAV-01
            </span>
          </div>
          <p className="text-[9px] tracking-[0.09em] uppercase text-aeris-textSecondary font-medium leading-none mt-0.5">
            Autonomous Edge Rescue & Intelligence System
          </p>
        </div>
      </div>

      {/* Center: Mission Name & Sector Details */}
      <div className="hidden md:flex items-center space-x-4 px-5 py-2 rounded-card bg-aeris-surface border border-aeris-border">
        <div>
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-aeris-textMuted block leading-none">
            MISSION
          </span>
          <span className="text-xs font-medium text-aeris-textPrimary tracking-wide mt-0.5 block">
            {metadata.missionName}
          </span>
        </div>

        <div className="h-6 w-[1px] bg-aeris-border"></div>

        <div className="text-right">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-aeris-textMuted block leading-none">
            LOCATION
          </span>
          <span className="text-xs font-mono text-aeris-textSecondary mt-0.5 block">
            {metadata.location} • <span className="text-aeris-cyan">{metadata.missionId}</span>
          </span>
        </div>
      </div>

      {/* Right: Connection, AI State, Real-time Clock, Actions */}
      <div className="flex items-center space-x-3.5">
        {/* Offline Mode Interactive Demo Trigger */}
        <button
          onClick={onToggleOfflineSimulation}
          className={`px-3 py-1.5 rounded-pill text-xs font-mono border transition-all flex items-center space-x-1.5 ${
            isOfflineMode
              ? 'bg-aeris-amber/20 text-aeris-amber border-aeris-amber font-bold shadow-glow-amber animate-pulse'
              : 'bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textSecondary border-aeris-border'
          }`}
          title="Click to simulate Signal Loss and Autonomous Backtracking"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isOfflineMode ? 'SIMULATING OFFLINE' : 'SIMULATE OFFLINE'}</span>
        </button>

        {/* Connection Indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-aeris-surface border border-aeris-border rounded-pill text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${
            isOfflineMode ? 'bg-aeris-amber animate-pulse' : 'bg-aeris-green shadow-glow-green'
          }`}></span>
          <span className="text-aeris-textSecondary">
            {isOfflineMode ? 'OFFLINE' : 'CONNECTED'}
          </span>
        </div>

        {/* Edge AI State */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-aeris-surface border border-aeris-border rounded-pill text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-aeris-cyan" />
          <span className="text-aeris-cyan font-medium">
            EDGE AI ACTIVE
          </span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-aeris-surface border border-aeris-border rounded-pill text-xs font-mono text-aeris-textPrimary">
          <Clock className="w-3.5 h-3.5 text-aeris-textSecondary" />
          <span>{formatUtcTime(time)} UTC</span>
        </div>

        {/* Notifications & Settings */}
        <div className="flex items-center space-x-1.5 pl-1 border-l border-aeris-border">
          <button className="w-8 h-8 rounded-full bg-aeris-surface border border-aeris-border flex items-center justify-center text-aeris-textSecondary hover:text-aeris-textPrimary transition-colors">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 rounded-full bg-aeris-surface border border-aeris-border flex items-center justify-center text-aeris-textSecondary hover:text-aeris-textPrimary transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
