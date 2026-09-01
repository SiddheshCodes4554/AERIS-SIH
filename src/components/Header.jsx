import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  Activity, 
  Clock, 
  Radio, 
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function Header({ missionData, droneTelemetry, commStatus }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUtcTime = (date) => {
    return date.toISOString().substring(11, 19) + ' UTC';
  };

  const formatLocalTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <header className="h-16 bg-aeris-panel border-b border-aeris-border flex items-center justify-between px-4 z-20 shrink-0 select-none">
      {/* Left: Brand Identity & Subtitle */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-aeris-surface border border-aeris-cyan/40 shadow-inner">
          <ShieldAlert className="w-6 h-6 text-aeris-cyan animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-wider font-mono text-aeris-textPrimary">
              AERIS <span className="text-aeris-cyan font-normal text-xs px-2 py-0.5 bg-aeris-cyan/10 border border-aeris-cyan/30 rounded">COMMAND CENTER</span>
            </h1>
          </div>
          <p className="text-xs text-aeris-textSecondary font-medium tracking-tight">
            Autonomous Emergency Response Intelligence System
          </p>
        </div>
      </div>

      {/* Center / Right: Connection & Mission Status Indicators */}
      <div className="flex items-center space-x-3">
        {/* Connection Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-aeris-surface rounded border border-aeris-border">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aeris-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aeris-success"></span>
            </span>
            <Wifi className="w-3.5 h-3.5 text-aeris-success" />
          </div>
          <div className="font-mono text-xs">
            <span className="text-aeris-textMuted text-[10px] block leading-none">CONNECTION</span>
            <span className="text-aeris-success font-semibold tracking-wide">
              {commStatus.primaryLink.status} ({commStatus.primaryLink.signalStrength}%)
            </span>
          </div>
        </div>

        {/* Mission Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-aeris-surface rounded border border-aeris-border">
          <Activity className="w-4 h-4 text-aeris-cyan" />
          <div className="font-mono text-xs">
            <span className="text-aeris-textMuted text-[10px] block leading-none">MISSION STATUS</span>
            <span className="text-aeris-cyan font-semibold tracking-wide">
              {missionData.status} • {missionData.sector.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Real-time Clock */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-aeris-panelHeader rounded border border-aeris-border text-right font-mono">
          <Clock className="w-3.5 h-3.5 text-aeris-cyan" />
          <div>
            <div className="text-xs font-bold text-aeris-textPrimary">
              {formatUtcTime(time)}
            </div>
            <div className="text-[10px] text-aeris-textMuted leading-none">
              LOC {formatLocalTime(time)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
