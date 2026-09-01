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
  Wifi,
  Navigation
} from 'lucide-react';

export default function MissionTelemetry({ 
  missionState = {}, 
  deviceLocation = null,
  locationStatus = 'ACQUIRING',
  isOffline, 
  isBacktracking 
}) {
  const speedNum = parseFloat(missionState.speed) || 8.5;
  const altitudeNum = parseFloat(missionState.altitude) || 42.5;

  const hasCoords = deviceLocation && deviceLocation.latitude && deviceLocation.longitude;
  const latStr = hasCoords ? deviceLocation.latitude.toFixed(6) : '--.------';
  const lngStr = hasCoords ? deviceLocation.longitude.toFixed(6) : '--.------';
  const accStr = hasCoords && deviceLocation.accuracy ? `±${Math.round(deviceLocation.accuracy)} m` : '-- m';

  return (
    <div className="w-full h-full aeris-panel-container p-3 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Header & Drone Unit */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1.5 mb-2">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Telemetry & Location
            </h2>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30 font-medium">
            {missionState.droneId || 'AERIS-01'}
          </span>
        </div>

        {/* Real Device Location Card */}
        <div className="aeris-surface-card p-2.5 mb-2 font-mono border-l-2 border-l-aeris-cyan">
          <div className="flex items-center justify-between text-[9.5px] text-aeris-textSecondary mb-1">
            <span className="flex items-center text-aeris-cyan font-bold">
              <MapPin className="w-3 h-3 mr-1" />
              LOCATION
            </span>
            <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${
              locationStatus === 'ACTIVE'
                ? 'bg-aeris-green/20 text-aeris-green border border-aeris-green/30'
                : locationStatus === 'DENIED'
                ? 'bg-aeris-red/20 text-aeris-red border border-aeris-red/30'
                : 'bg-aeris-amber/20 text-aeris-amber border border-aeris-amber/30 animate-pulse'
            }`}>
              ● {locationStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] my-1">
            <div>
              <span className="text-[8px] text-aeris-textMuted block">LATITUDE</span>
              <strong className="text-[#F2F4F3]">{latStr}</strong>
            </div>
            <div>
              <span className="text-[8px] text-aeris-textMuted block">LONGITUDE</span>
              <strong className="text-[#F2F4F3]">{lngStr}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8.5px] text-aeris-textMuted pt-1 border-t border-white/5">
            <span>Accuracy: <strong className="text-aeris-cyan font-bold">{accStr}</strong></span>
            <span className="text-aeris-green font-bold">DEVICE LOCATION</span>
          </div>
        </div>

        {/* 2. Battery Status */}
        <div className="aeris-surface-card p-2.5 mb-2 font-mono">
          <div className="flex items-center justify-between text-[9.5px] text-aeris-textSecondary mb-0.5">
            <span>BATTERY CAPACITY</span>
            <BatteryMedium className="w-3.5 h-3.5 text-aeris-green" />
          </div>

          <div className="flex items-baseline space-x-1.5 mb-1">
            <span className="text-2xl font-light text-aeris-green tracking-tight">
              {missionState.battery || 82}%
            </span>
            <span className="text-[9px] text-aeris-textMuted font-sans">
              21.8 V • 31.4°C
            </span>
          </div>

          {/* Green Progress Bar */}
          <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-aeris-green h-full rounded-full transition-all duration-500 shadow-glow-green" 
              style={{ width: `${missionState.battery || 82}%` }}
            />
          </div>
        </div>

        {/* 3. Altitude & Ground Speed */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 font-mono">
          <div className="aeris-surface-card p-2">
            <span className="text-[9px] text-aeris-textMuted block">ALTITUDE</span>
            <div className="text-lg font-light text-aeris-textPrimary mt-0.5">
              {altitudeNum} <span className="text-[10px] text-aeris-textSecondary">m</span>
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block">AGL CARRIER</span>
          </div>

          <div className="aeris-surface-card p-2">
            <span className="text-[9px] text-aeris-textMuted block">SPEED</span>
            <div className="text-lg font-light text-aeris-textPrimary mt-0.5">
              {speedNum} <span className="text-[10px] text-aeris-textSecondary">m/s</span>
            </div>
            <span className="text-[8.5px] text-aeris-textMuted block">{(speedNum * 3.6).toFixed(1)} km/h</span>
          </div>
        </div>
      </div>

      {/* 4. OFFLINE & AUTONOMOUS BACKTRACKING PANEL */}
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

        <div className="space-y-1 text-[9px] text-aeris-textSecondary pt-1 border-t border-white/10">
          <div className="flex justify-between">
            <span>Local AI Inference:</span>
            <strong className="text-aeris-cyan font-bold">ACTIVE (Jetson Orin)</strong>
          </div>
          <div className="flex justify-between">
            <span>Data Buffer:</span>
            <strong className={isOffline || isBacktracking ? 'text-aeris-amber font-bold' : 'text-aeris-textPrimary'}>
              {isOffline || isBacktracking ? `${missionState.bufferedEventsCount || 18} Events` : '0 Events (Synced)'}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Last Connected:</span>
            <strong className="text-aeris-green font-bold">{missionState.lastConnectedCheckpoint || 'CP-03'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
