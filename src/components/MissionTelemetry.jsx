import React from 'react';
import { 
  Activity, 
  BatteryMedium, 
  MapPin, 
  Layers, 
  Gauge, 
  Flag, 
  Compass, 
  CheckCircle2, 
  Cpu, 
  Radio
} from 'lucide-react';

export default function MissionTelemetry({ telemetry, isOfflineMode }) {
  const { battery, gps, position, checkpoints, flightMode, missionProgress, droneId } = telemetry;

  return (
    <div className="w-full h-full aeris-panel-container p-3 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Panel Title Bar & Selected Drone */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-2 mb-2">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Mission Telemetry
            </h2>
          </div>
          <span className="text-[9.5px] font-mono px-2 py-0.2 rounded bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30 font-medium">
            {droneId}
          </span>
        </div>

        {/* 2. Battery & Power Card */}
        <div className="aeris-surface-card p-2.5 mb-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-aeris-textSecondary mb-0.5">
            <span>BATTERY</span>
            <BatteryMedium className="w-3.5 h-3.5 text-aeris-green" />
          </div>

          <div className="flex items-baseline space-x-1.5 mb-1.5">
            <span className="text-2xl font-light text-aeris-green font-mono tracking-tight">
              {battery.percentage}%
            </span>
            <span className="text-[9.5px] text-aeris-textMuted font-mono">
              OPTIMAL HEALTH
            </span>
          </div>

          {/* Thin Green Progress Line */}
          <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden mb-1.5">
            <div 
              className="bg-aeris-green h-full rounded-full transition-all duration-500 shadow-glow-green" 
              style={{ width: `${battery.percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[9.5px] font-mono text-aeris-textMuted border-t border-white/5 pt-1">
            <span>VOLT: <strong className="text-aeris-textSecondary">{battery.voltage} V</strong></span>
            <span>TEMP: <strong className="text-aeris-textSecondary">{battery.temperature}°C</strong></span>
          </div>
        </div>

        {/* 3. GPS Status & Flight Mode Dual Strip */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 font-mono">
          {/* GPS Status */}
          <div className="aeris-surface-card p-2">
            <div className="flex items-center justify-between text-[9px] text-aeris-textMuted mb-0.5">
              <span>GPS STATUS</span>
              <MapPin className="w-2.5 h-2.5 text-aeris-green" />
            </div>
            <div className="text-[11px] font-semibold text-aeris-green flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-aeris-green mr-1 shadow-glow-green"></span>
              {gps.status}
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block mt-0.5">
              {gps.fixType} ({gps.satellitesLocked} Sats)
            </span>
          </div>

          {/* Flight Mode */}
          <div className="aeris-surface-card p-2">
            <div className="flex items-center justify-between text-[9px] text-aeris-textMuted mb-0.5">
              <span>FLIGHT MODE</span>
              <Compass className="w-2.5 h-2.5 text-aeris-cyan" />
            </div>
            <div className="text-[11px] font-semibold text-aeris-cyan">
              {flightMode}
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block mt-0.5">
              WAYPOINT NAV
            </span>
          </div>
        </div>

        {/* 4. Altitude & Speed Dual Card */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 font-mono">
          {/* Altitude */}
          <div className="aeris-surface-card p-2">
            <div className="flex items-center justify-between text-[9px] text-aeris-textMuted mb-0.5">
              <span>ALTITUDE</span>
              <Layers className="w-2.5 h-2.5 text-aeris-cyan" />
            </div>
            <div className="text-lg font-light text-aeris-textPrimary">
              {position.altitudeAgl} <span className="text-[10px] text-aeris-textSecondary">m</span>
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block mt-0.5">
              MSL: {position.altitudeMsl} m
            </span>
          </div>

          {/* Speed */}
          <div className="aeris-surface-card p-2">
            <div className="flex items-center justify-between text-[9px] text-aeris-textMuted mb-0.5">
              <span>SPEED</span>
              <Gauge className="w-2.5 h-2.5 text-aeris-cyan" />
            </div>
            <div className="text-lg font-light text-aeris-textPrimary">
              {position.groundSpeed} <span className="text-[10px] text-aeris-textSecondary">m/s</span>
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block mt-0.5">
              {(position.groundSpeed * 3.6).toFixed(1)} km/h
            </span>
          </div>
        </div>

        {/* 5. Mission Progress */}
        <div className="aeris-surface-card p-2 font-mono mb-2">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="text-aeris-textSecondary">MISSION PROGRESS</span>
            <span className="text-aeris-blue font-bold">{missionProgress}%</span>
          </div>

          {/* Thin Blue Progress Line */}
          <div className="w-full bg-[#0B0E0F] h-1 rounded-full overflow-hidden mb-1">
            <div 
              className="bg-aeris-blue h-full rounded-full transition-all duration-500 shadow-glow-blue" 
              style={{ width: `${missionProgress}%` }}
            />
          </div>

          <div className="flex justify-between text-[8.5px] text-aeris-textMuted">
            <span>SECTOR: 4B NORTH</span>
            <span>TARGET: SEARCH</span>
          </div>
        </div>
      </div>

      {/* 6. Checkpoint Tracker (Bottom Section) */}
      <div className="aeris-surface-card p-2 font-mono">
        <div className="text-[9px] font-semibold text-aeris-textMuted uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>CHECKPOINT ROUTE</span>
          <span className="text-aeris-green">CP-3 / 4</span>
        </div>

        <div className="space-y-1">
          {/* Current Checkpoint */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-aeris-green shadow-glow-green"></span>
              <span className="text-aeris-textMuted text-[9px]">CUR:</span>
              <span className="text-aeris-textPrimary font-bold">{checkpoints.currentId}</span>
            </div>
            <span className="text-[9px] text-aeris-textSecondary truncate max-w-[100px]">
              {checkpoints.currentName}
            </span>
          </div>

          {/* Next Checkpoint */}
          <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-1">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-aeris-blue"></span>
              <span className="text-aeris-textMuted text-[9px]">NXT:</span>
              <span className="text-aeris-blue font-bold">{checkpoints.nextId}</span>
            </div>
            <span className="text-[9px] text-aeris-textSecondary">
              {checkpoints.nextDistanceKm} km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
