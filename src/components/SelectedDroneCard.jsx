import React from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Layers, 
  Gauge, 
  Thermometer, 
  Compass, 
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  HardDrive
} from 'lucide-react';
import DroneLineIllustration from './DroneLineIllustration.jsx';

export default function SelectedDroneCard({ drone }) {
  if (!drone) return null;

  const isOffline = drone.status === "OFFLINE";
  const isReturning = drone.status === "RETURNING";

  return (
    <div className="aeris-glass-panel rounded-panel p-5 select-none shadow-aeris-card transition-all w-full max-w-[760px]">
      {/* Top Header: ID, Mission ID, and Status Pill */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium font-mono text-aeris-textPrimary">
              {drone.id}
            </span>
            <span className="text-xs text-aeris-textMuted font-mono">
              / {drone.callsign}
            </span>
          </div>
          <span className="text-[10px] font-mono text-aeris-textMuted px-2 py-0.5 rounded bg-white/5 border border-white/5">
            MISSION ID: {drone.missionId}
          </span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-0.5 rounded-pill text-xs font-mono font-medium border ${
            isOffline 
              ? 'bg-aeris-amber/15 text-aeris-amber border-aeris-amber/30'
              : isReturning
              ? 'bg-aeris-blue/15 text-aeris-blue border-aeris-blue/30'
              : 'bg-aeris-green/15 text-aeris-green border-aeris-green/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              isOffline ? 'bg-aeris-amber animate-pulse' : isReturning ? 'bg-aeris-blue' : 'bg-aeris-green shadow-[0_0_6px_#65C466]'
            }`}></span>
            {drone.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Illustration & Right Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 items-center">
        {/* Left (5 cols): Drone Technical Illustration with Overlay Badge */}
        <div className="md:col-span-5 bg-aeris-surface1/80 rounded-2xl p-3 border border-white/5 relative flex flex-col items-center justify-center">
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-pill bg-aeris-surface3/90 border border-white/10 text-[9px] font-mono text-aeris-textSecondary">
            {drone.model}
          </div>

          <DroneLineIllustration className="w-full h-24 my-1" status={drone.status} selected={true} />

          {/* Connectivity Pill Row */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/5 text-aeris-textSecondary">
            <div className="flex items-center space-x-1">
              <span className="text-aeris-textMuted">GPS</span>
              <span className={drone.connectivity.gps === 'CONNECTED' ? 'text-aeris-green font-medium' : 'text-aeris-amber font-medium'}>
                ● {drone.connectivity.gps}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-aeris-textMuted">LTE</span>
              <span className={drone.connectivity.lte === 'CONNECTED' ? 'text-aeris-green font-medium' : 'text-aeris-red font-medium'}>
                {drone.connectivity.lte === 'CONNECTED' ? '● CONNECTED' : '○ LOST'}
              </span>
            </div>
          </div>
        </div>

        {/* Right (7 cols): Instrumentation Metrics Display (Altitude, Speed, Battery, Temp) */}
        <div className="md:col-span-7 grid grid-cols-4 gap-2 font-mono">
          {/* Altitude */}
          <div className="aeris-glass-card rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[9.5px] text-aeris-textMuted tracking-wider uppercase">Altitude</span>
            <div className="my-1">
              <span className="text-xl font-light text-aeris-textPrimary">{drone.altitude}</span>
              <span className="text-[10px] text-aeris-textSecondary ml-0.5">m</span>
            </div>
            <span className="text-[9px] text-aeris-textMuted font-light">AGL</span>
          </div>

          {/* Speed */}
          <div className="aeris-glass-card rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[9.5px] text-aeris-textMuted tracking-wider uppercase">Speed</span>
            <div className="my-1">
              <span className="text-xl font-light text-aeris-textPrimary">{drone.speed}</span>
              <span className="text-[10px] text-aeris-textSecondary ml-0.5">m/s</span>
            </div>
            <span className="text-[9px] text-aeris-textMuted font-light">{(drone.speed * 3.6).toFixed(0)} km/h</span>
          </div>

          {/* Battery */}
          <div className="aeris-glass-card rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[9.5px] text-aeris-textMuted tracking-wider uppercase">Battery</span>
            <div className="my-1">
              <span className={`text-xl font-light ${
                drone.battery > 50 ? 'text-aeris-green' : drone.battery > 25 ? 'text-aeris-amber' : 'text-aeris-red'
              }`}>
                {drone.battery}
              </span>
              <span className="text-[10px] text-aeris-textSecondary ml-0.5">%</span>
            </div>
            <span className="text-[9px] text-aeris-textMuted font-light">{drone.voltage}V</span>
          </div>

          {/* Temperature */}
          <div className="aeris-glass-card rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[9.5px] text-aeris-textMuted tracking-wider uppercase">Core Temp</span>
            <div className="my-1">
              <span className="text-xl font-light text-aeris-textPrimary">{drone.temperature}</span>
              <span className="text-[10px] text-aeris-textSecondary ml-0.5">°C</span>
            </div>
            <span className="text-[9px] text-aeris-green font-light">NOMINAL</span>
          </div>
        </div>
      </div>

      {/* OFFLINE AUTONOMOUS MODE TIMELINE (Displayed if drone is offline) */}
      {isOffline && (
        <div className="my-2 p-3 rounded-2xl bg-aeris-amber/10 border border-aeris-amber/30 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-aeris-amber font-semibold text-[11px]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>OFFLINE AUTONOMOUS MODE — BACKTRACK INITIATED</span>
            </div>
            <span className="text-[10px] text-aeris-textSecondary">
              TARGET: LCC-03 ({drone.lastConnectedCheckpoint?.lat.toFixed(4)}, {drone.lastConnectedCheckpoint?.lng.toFixed(4)})
            </span>
          </div>

          {/* Horizontal Status Timeline */}
          <div className="flex items-center justify-between text-[10px] relative pt-1">
            <div className="flex items-center space-x-1 text-aeris-amber font-medium">
              <span className="w-2 h-2 rounded-full bg-aeris-amber"></span>
              <span>Signal Lost</span>
            </div>
            <span className="text-aeris-amber">─────</span>
            <div className="flex items-center space-x-1 text-aeris-amber font-medium">
              <span className="w-2 h-2 rounded-full bg-aeris-amber"></span>
              <span>Local AI</span>
            </div>
            <span className="text-aeris-amber">─────</span>
            <div className="flex items-center space-x-1 text-aeris-amber font-medium">
              <span className="w-2 h-2 rounded-full bg-aeris-amber"></span>
              <span>Store Data</span>
            </div>
            <span className="text-aeris-amber">─────</span>
            <div className="flex items-center space-x-1 text-aeris-textPrimary font-bold bg-aeris-amber/30 px-2 py-0.5 rounded border border-aeris-amber shadow-[0_0_8px_#D99A4A]">
              <span className="w-2 h-2 rounded-full bg-aeris-amber animate-ping"></span>
              <span>Backtrack (Active)</span>
            </div>
            <span className="text-aeris-textMuted">─────</span>
            <div className="flex items-center space-x-1 text-aeris-textMuted">
              <span className="w-2 h-2 rounded-full bg-aeris-surface3 border border-white/20"></span>
              <span>Reconnect</span>
            </div>
          </div>
        </div>
      )}

      {/* Flight Timeline Progress (Bottom) */}
      <div className="pt-2 border-t border-white/5 font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-aeris-textMuted mb-1.5">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-aeris-textSecondary" />
            <span>LAUNCH {drone.timeline.startTime}</span>
          </span>
          <span className="text-aeris-textSecondary">
            MISSION PROGRESS: <span className="text-aeris-green font-bold">{drone.missionProgress}%</span>
          </span>
          <span>EST. RETURN {drone.timeline.estimatedReturn}</span>
        </div>

        {/* Timeline Visual Track */}
        <div className="relative py-2">
          <div className="w-full h-0.5 bg-aeris-surface3 rounded-full relative">
            <div 
              className="h-full bg-gradient-to-r from-aeris-green via-aeris-blue to-aeris-cyan rounded-full" 
              style={{ width: `${drone.missionProgress}%` }}
            />
          </div>

          {/* Waypoint Ticks */}
          <div className="flex justify-between items-center -mt-1.5 text-[9.5px]">
            {drone.timeline.stages.map((st, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className={`w-2.5 h-2.5 rounded-full border ${
                  st.completed 
                    ? 'bg-aeris-green border-aeris-green shadow-[0_0_6px_#65C466]' 
                    : st.active 
                    ? 'bg-aeris-cyan border-aeris-cyan animate-pulse shadow-[0_0_8px_#00E5FF]' 
                    : 'bg-aeris-surface2 border-white/20'
                }`} />
                <span className={`text-[8.5px] mt-1 font-sans truncate max-w-[80px] ${
                  st.active ? 'text-aeris-cyan font-medium' : st.completed ? 'text-aeris-textSecondary' : 'text-aeris-textMuted'
                }`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
