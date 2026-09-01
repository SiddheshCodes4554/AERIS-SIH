import React from 'react';
import { 
  Compass, 
  Gauge, 
  Layers, 
  Navigation, 
  MapPin, 
  BatteryMedium, 
  Zap, 
  Radio, 
  Crosshair,
  Flag,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function MissionStatus({ missionData, droneTelemetry }) {
  const getBatteryColor = (percentage) => {
    if (percentage > 50) return 'text-aeris-success';
    if (percentage > 20) return 'text-aeris-warning';
    return 'text-aeris-danger';
  };

  return (
    <div className="bg-aeris-panel border border-aeris-border rounded-md flex flex-col h-full overflow-hidden">
      {/* Panel Title Bar */}
      <div className="px-3.5 py-2.5 bg-aeris-panelHeader border-b border-aeris-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-aeris-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Mission Status & Telemetry
          </h2>
        </div>
        <span className="text-[10px] font-mono text-aeris-cyan bg-aeris-cyan/10 px-2 py-0.5 rounded border border-aeris-cyan/30">
          {droneTelemetry.droneId}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
        {/* 1. Current Mission & Checkpoint */}
        <div className="bg-aeris-surface rounded p-2.5 border border-aeris-border space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-aeris-textSecondary">Active Mission</span>
            <span className="text-aeris-cyan font-bold truncate max-w-[140px]">{missionData.missionName}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-aeris-panel rounded-full h-1.5 overflow-hidden border border-aeris-border">
            <div 
              className="bg-aeris-cyan h-full transition-all duration-500 rounded-full" 
              style={{ width: `${missionData.progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
            <div>
              <span className="text-aeris-textMuted block text-[10px]">CURRENT CHECKPOINT:</span>
              <span className="text-aeris-textPrimary font-semibold flex items-center mt-0.5">
                <Flag className="w-3 h-3 text-aeris-cyan mr-1 shrink-0" />
                <span className="truncate">CP-{missionData.checkpoints.current} / {missionData.checkpoints.total}</span>
              </span>
            </div>
            <div>
              <span className="text-aeris-textMuted block text-[10px]">FLIGHT MODE:</span>
              <span className="text-aeris-cyan font-bold block mt-0.5 truncate">
                {droneTelemetry.flightMode}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Grid: Battery, GPS, Altitude, Speed */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          {/* Battery Status */}
          <div className="bg-aeris-surface rounded p-2.5 border border-aeris-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-aeris-textSecondary mb-1">
              <span>BATTERY</span>
              <BatteryMedium className={`w-4 h-4 ${getBatteryColor(droneTelemetry.battery.percentage)}`} />
            </div>
            <div className={`text-xl font-bold ${getBatteryColor(droneTelemetry.battery.percentage)}`}>
              {droneTelemetry.battery.percentage}%
            </div>
            <div className="text-[10px] text-aeris-textMuted flex justify-between mt-1 pt-1 border-t border-aeris-border/60">
              <span>{droneTelemetry.battery.voltage} V</span>
              <span>{droneTelemetry.battery.temperature}°C</span>
            </div>
          </div>

          {/* GPS Status */}
          <div className="bg-aeris-surface rounded p-2.5 border border-aeris-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-aeris-textSecondary mb-1">
              <span>GPS FIX</span>
              <MapPin className="w-4 h-4 text-aeris-cyan" />
            </div>
            <div className="text-sm font-bold text-aeris-textPrimary truncate">
              {droneTelemetry.subsystems.gpsFix}
            </div>
            <div className="text-[10px] text-aeris-textMuted flex justify-between mt-1 pt-1 border-t border-aeris-border/60">
              <span>{droneTelemetry.subsystems.satellitesLocked} Sats</span>
              <span className="text-aeris-cyan">RTK Lock</span>
            </div>
          </div>

          {/* Altitude */}
          <div className="bg-aeris-surface rounded p-2.5 border border-aeris-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-aeris-textSecondary mb-1">
              <span>ALTITUDE</span>
              <Layers className="w-4 h-4 text-aeris-cyan" />
            </div>
            <div className="text-xl font-bold text-aeris-cyan">
              {droneTelemetry.position.altitudeAgl} <span className="text-xs text-aeris-textSecondary">m AGL</span>
            </div>
            <div className="text-[10px] text-aeris-textMuted mt-1 pt-1 border-t border-aeris-border/60">
              MSL: {droneTelemetry.position.altitudeMsl} m
            </div>
          </div>

          {/* Speed */}
          <div className="bg-aeris-surface rounded p-2.5 border border-aeris-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-aeris-textSecondary mb-1">
              <span>GROUND SPEED</span>
              <Gauge className="w-4 h-4 text-aeris-cyan" />
            </div>
            <div className="text-xl font-bold text-aeris-textPrimary">
              {droneTelemetry.position.groundSpeed} <span className="text-xs text-aeris-textSecondary">m/s</span>
            </div>
            <div className="text-[10px] text-aeris-textMuted mt-1 pt-1 border-t border-aeris-border/60">
              V-SPD: {droneTelemetry.position.verticalSpeed > 0 ? '+' : ''}{droneTelemetry.position.verticalSpeed} m/s
            </div>
          </div>
        </div>

        {/* 3. Subsystem Health / Geofence Summary */}
        <div className="bg-aeris-surface rounded p-2.5 border border-aeris-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-aeris-textMuted">Geofence Status:</span>
            <span className="text-aeris-success font-semibold flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {missionData.geofenceStatus}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-aeris-textMuted">Est. Flight Remaining:</span>
            <span className="text-aeris-warning font-semibold">
              {missionData.estimatedFlightTimeRemaining}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-aeris-textMuted">Coordinates:</span>
            <span className="text-aeris-textSecondary">
              {droneTelemetry.position.lat.toFixed(4)}°N, {droneTelemetry.position.lng.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
