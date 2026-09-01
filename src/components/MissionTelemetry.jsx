import React from 'react';
import { 
  Activity, 
  BatteryMedium, 
  MapPin, 
  Layers, 
  Gauge, 
  Flag, 
  Compass, 
  Radio, 
  Cpu, 
  HardDrive, 
  RotateCcw, 
  Wifi
} from 'lucide-react';

export default function MissionTelemetry({ missionState, isOffline, isBacktracking }) {
  return (
    <div className="w-full h-full aeris-panel-container p-3 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Header & Drone Unit */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1.5 mb-2">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Mission & Telemetry
            </h2>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30 font-medium">
            {missionState.droneId}
          </span>
        </div>

        {/* Mission Status Header Strip */}
        <div className="flex items-center justify-between text-[10px] font-mono text-aeris-textSecondary mb-2 px-1">
          <span>MISSION: <strong className="text-aeris-textPrimary">{missionState.missionName.split(' ')[0]}</strong></span>
          <span className="text-aeris-green font-bold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-aeris-green mr-1 shadow-glow-green"></span>
            ACTIVE
          </span>
        </div>

        {/* 2. Battery Status */}
        <div className="aeris-surface-card p-2.5 mb-2 font-mono">
          <div className="flex items-center justify-between text-[9.5px] text-aeris-textSecondary mb-0.5">
            <span>BATTERY CAPACITY</span>
            <BatteryMedium className="w-3.5 h-3.5 text-aeris-green" />
          </div>

          <div className="flex items-baseline space-x-1.5 mb-1">
            <span className="text-2xl font-light text-aeris-green tracking-tight">
              {missionState.battery}%
            </span>
            <span className="text-[9px] text-aeris-textMuted font-sans">
              21.8 V • 31.4°C
            </span>
          </div>

          {/* Green Progress Bar */}
          <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-aeris-green h-full rounded-full transition-all duration-500 shadow-glow-green" 
              style={{ width: `${missionState.battery}%` }}
            />
          </div>
        </div>

        {/* 3. Altitude & Ground Speed */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 font-mono">
          <div className="aeris-surface-card p-2">
            <span className="text-[9px] text-aeris-textMuted block">ALTITUDE</span>
            <div className="text-lg font-light text-aeris-textPrimary mt-0.5">
              {missionState.altitude} <span className="text-[10px] text-aeris-textSecondary">m</span>
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block">AGL CARRIER</span>
          </div>

          <div className="aeris-surface-card p-2">
            <span className="text-[9px] text-aeris-textMuted block">SPEED</span>
            <div className="text-lg font-light text-aeris-textPrimary mt-0.5">
              {missionState.speed} <span className="text-[10px] text-aeris-textSecondary">m/s</span>
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block">{(missionState.speed * 3.6).toFixed(1)} km/h</span>
          </div>
        </div>

        {/* 4. Navigation & Mission Progress */}
        <div className="aeris-surface-card p-2 font-mono mb-2">
          <div className="flex justify-between items-center text-[9.5px] mb-1">
            <span className="text-aeris-textSecondary">GPS: <strong className="text-aeris-green">RTK FIXED (18 Sats)</strong></span>
            <span className="text-aeris-cyan font-bold">{missionState.missionProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0B0E0F] h-1 rounded-full overflow-hidden mb-1.5">
            <div 
              className="bg-aeris-cyan h-full rounded-full transition-all duration-500 shadow-glow-blue" 
              style={{ width: `${missionState.missionProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-aeris-textMuted pt-0.5 border-t border-white/5">
            <span>CUR: <strong className="text-aeris-textPrimary">{missionState.checkpoint}</strong></span>
            <span>NEXT: <strong className="text-aeris-blue">{missionState.nextCheckpoint}</strong> ({missionState.nextDistanceKm} km)</span>
          </div>
        </div>
      </div>

      {/* 5. OFFLINE & AUTONOMOUS BACKTRACKING PANEL (Dynamic Operational State) */}
      <div className={`p-2.5 rounded-card border font-mono transition-all ${
        isOffline || isBacktracking
          ? 'bg-aeris-amber/15 border-aeris-amber/50 shadow-glow-amber animate-pulse'
          : 'bg-aeris-surface border-aeris-border'
      }`}>
        <div className="flex items-center justify-between text-[9.5px] mb-1.5">
          <span className={`font-bold uppercase flex items-center ${isOffline || isBacktracking ? 'text-aeris-amber' : 'text-aeris-textSecondary'}`}>
            <Radio className={`w-3 h-3 mr-1 ${isOffline || isBacktracking ? 'text-aeris-amber animate-spin' : 'text-aeris-textMuted'}`} />
            {isBacktracking ? 'AUTONOMOUS BACKTRACKING' : isOffline ? 'OFFLINE MODE ACTIVE' : 'FAILOVER LOGIC ARMED'}
          </span>
          <span className={`text-[8.5px] font-bold px-1 rounded ${isOffline || isBacktracking ? 'bg-aeris-amber text-black' : 'text-aeris-textMuted'}`}>
            {isOffline || isBacktracking ? 'AUTONOMOUS' : 'STANDBY'}
          </span>
        </div>

        {/* Telemetry Parameters when Offline */}
        <div className="space-y-1 text-[9px] text-aeris-textSecondary pt-1 border-t border-white/10">
          <div className="flex justify-between">
            <span>Local AI Inference:</span>
            <strong className="text-aeris-cyan font-bold">ACTIVE (Jetson Orin)</strong>
          </div>
          <div className="flex justify-between">
            <span>Data Buffer:</span>
            <strong className={isOffline || isBacktracking ? 'text-aeris-amber font-bold' : 'text-aeris-textPrimary'}>
              {isOffline || isBacktracking ? `${missionState.bufferedEventsCount} Events` : '0 Events (Synced)'}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Last Connected:</span>
            <strong className="text-aeris-green font-bold">{missionState.lastConnectedCheckpoint}</strong>
          </div>
          {(isOffline || isBacktracking) && (
            <div className="flex justify-between text-aeris-amber font-bold pt-0.5">
              <span>Signal Lost:</span>
              <span>{missionState.signalLostTime}</span>
            </div>
          )}
        </div>

        {/* Backtracking Progress Bar when active */}
        {isBacktracking && (
          <div className="mt-2 pt-1.5 border-t border-aeris-amber/30">
            <div className="flex justify-between text-[8.5px] text-aeris-amber font-bold mb-0.5">
              <span>RETURNING TO {missionState.lastConnectedCheckpoint}</span>
              <span>{missionState.backtrackingProgress}%</span>
            </div>
            <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-aeris-amber h-full rounded-full transition-all duration-300"
                style={{ width: `${missionState.backtrackingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
