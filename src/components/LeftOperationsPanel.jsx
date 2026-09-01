import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Battery, 
  Wifi, 
  MapPin, 
  ArrowUpRight,
  Radio
} from 'lucide-react';
import DroneLineIllustration from './DroneLineIllustration.jsx';

export default function LeftOperationsPanel({ 
  fleetSummary, 
  efficiencyData, 
  drones = [], 
  selectedDroneId, 
  onSelectDrone 
}) {
  return (
    <div className="w-[380px] h-full flex flex-col aeris-glass-panel rounded-panel p-5 overflow-hidden select-none">
      {/* Top Header: Title & Subtitle */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-normal tracking-tight text-aeris-textPrimary">
            Live Operations
          </h2>
          <span className="text-[10px] font-mono text-aeris-textMuted px-2 py-0.5 rounded bg-white/5 border border-white/5">
            SECTOR A-14
          </span>
        </div>
        <p className="text-xs text-aeris-textSecondary mt-0.5 font-light">
          Real-time autonomous emergency response monitoring
        </p>
      </div>

      {/* Scrollable Operations Container */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* 1. Fleet Summary Segmented Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-aeris-surface1/90 rounded-pill border border-aeris-border text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-pill bg-aeris-surface3 text-aeris-textPrimary font-medium border border-white/5">
            {fleetSummary.totalDrones} DRONES
          </span>
          <span className="px-2 py-1 text-aeris-green font-medium">
            0{fleetSummary.active} ACTIVE
          </span>
          <span className="px-2 py-1 text-aeris-textSecondary">
            0{fleetSummary.standby} STBY
          </span>
          <span className="px-2 py-1 text-aeris-amber">
            0{fleetSummary.offline} OFFLINE
          </span>
        </div>

        {/* 2. Operations Status: Two Large Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Card */}
          <div className="aeris-glass-card rounded-card p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-aeris-textSecondary">
              <span className="font-medium text-[11px] tracking-wider uppercase">Active</span>
              <span className="w-2 h-2 rounded-full bg-aeris-green shadow-[0_0_8px_#65C466]"></span>
            </div>
            <div className="my-1.5">
              <div className="text-3xl font-light text-aeris-textPrimary tracking-tight">
                {fleetSummary.autonomousMissionsCount < 10 ? `0${fleetSummary.autonomousMissionsCount}` : fleetSummary.autonomousMissionsCount}
              </div>
              <p className="text-[10px] text-aeris-textMuted font-light">
                Autonomous Missions
              </p>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="aeris-glass-card rounded-card p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-aeris-textSecondary">
              <span className="font-medium text-[11px] tracking-wider uppercase">Alerts</span>
              <span className="w-2 h-2 rounded-full bg-aeris-red shadow-[0_0_8px_#FF3B30] animate-pulse"></span>
            </div>
            <div className="my-1.5">
              <div className="text-3xl font-light text-aeris-red tracking-tight">
                0{fleetSummary.activeAlertsCount}
              </div>
              <p className="text-[10px] text-aeris-textMuted font-light">
                Require Attention
              </p>
            </div>
          </div>
        </div>

        {/* 3. Operational Efficiency Instrumentation Card */}
        <div className="aeris-glass-card rounded-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-normal text-aeris-textSecondary tracking-wide">
              Mission Efficiency
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-aeris-textMuted" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-light tracking-tight text-aeris-textPrimary font-mono">
              {fleetSummary.operationalEfficiency}%
            </span>
            <span className="text-[11px] text-aeris-textMuted font-light">
              System Performance
            </span>
          </div>

          {/* Aviation-Style Line Chart */}
          <div className="mt-3 relative pt-2">
            {/* Target Dotted Line */}
            <div className="flex items-center justify-between text-[9px] font-mono text-aeris-textMuted mb-1 border-b border-dashed border-white/10 pb-0.5">
              <span>TARGET &gt;80%</span>
              <span className="text-aeris-green">+7.4% NOMINAL</span>
            </div>

            {/* SVG Sparkline */}
            <div className="h-14 w-full relative">
              <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                {/* Background Grid Lines */}
                <line x1="0" y1="15" x2="300" y2="15" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />
                <line x1="0" y1="35" x2="300" y2="35" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />
                <line x1="0" y1="55" x2="300" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />

                {/* Shaded Area Under Line */}
                <defs>
                  <linearGradient id="efficiencyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <polygon 
                  points="0,55 0,42 60,32 120,18 180,28 240,12 300,22 300,55" 
                  fill="url(#efficiencyGrad)" 
                />

                {/* Primary Chart Line */}
                <polyline
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,42 60,32 120,18 180,28 240,12 300,22"
                />

                {/* Reference Key Points */}
                <circle cx="60" cy="32" r="2.5" fill="#E2E8F0" />
                <circle cx="120" cy="18" r="3" fill="#65C466" stroke="#080A0C" strokeWidth="1" />
                <circle cx="180" cy="28" r="2.5" fill="#E2E8F0" />
                <circle cx="240" cy="12" r="3" fill="#65C466" stroke="#080A0C" strokeWidth="1" />
                <circle cx="300" cy="22" r="3" fill="#3B8EDB" stroke="#080A0C" strokeWidth="1" />
              </svg>
            </div>

            {/* Time labels axis */}
            <div className="flex justify-between text-[9px] font-mono text-aeris-textMuted mt-1">
              <span>06:00</span>
              <span>09:00</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
              <span>21:00</span>
            </div>
          </div>
        </div>

        {/* 4. Drone Cards Header */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs font-normal text-aeris-textSecondary tracking-wide">
            Assigned UAV Units
          </span>
          <span className="text-[10px] font-mono text-aeris-textMuted">
            {drones.length} ACTIVE DEPLOYMENTS
          </span>
        </div>

        {/* Drone Cards Grid */}
        <div className="space-y-2.5">
          {drones.map((drone) => {
            const isSelected = selectedDroneId === drone.id;
            const isOffline = drone.status === "OFFLINE";
            const isReturning = drone.status === "RETURNING";

            return (
              <div
                key={drone.id}
                onClick={() => onSelectDrone && onSelectDrone(drone.id)}
                className={`aeris-glass-card rounded-card p-3.5 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-aeris-blue/60 bg-aeris-surface2/90 shadow-aeris-glow-blue' 
                    : 'hover:border-white/15'
                }`}
              >
                {/* Drone Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-aeris-textPrimary font-mono">
                      {drone.id}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.2 rounded-pill ${
                      isOffline 
                        ? 'bg-aeris-amber/15 text-aeris-amber border border-aeris-amber/30' 
                        : isReturning 
                        ? 'bg-aeris-blue/15 text-aeris-blue border border-aeris-blue/30'
                        : 'bg-aeris-green/15 text-aeris-green border border-aeris-green/30'
                    }`}>
                      {drone.status}
                    </span>
                  </div>
                  <ArrowUpRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-aeris-blue translate-x-0.5 -translate-y-0.5' : 'text-aeris-textMuted'}`} />
                </div>

                {/* Mission Name */}
                <p className="text-[11px] text-aeris-textSecondary font-light mb-2 truncate">
                  Mission: <span className="text-aeris-textPrimary font-normal">{drone.mission}</span>
                </p>

                {/* Minimal Drone Line Art Illustration */}
                <div className="bg-aeris-surface1/60 rounded-xl p-1 mb-2 border border-white/5">
                  <DroneLineIllustration className="w-full h-14" status={drone.status} selected={isSelected} />
                </div>

                {/* Mini Telemetry Bar: Status tags, Connectivity & Battery */}
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/5">
                  <div className="flex items-center space-x-2 text-aeris-textMuted">
                    <span className={drone.connectivity.gps === 'CONNECTED' ? 'text-aeris-textSecondary' : 'text-aeris-amber'}>
                      GPS {drone.connectivity.gps === 'CONNECTED' ? '●' : '○'}
                    </span>
                    <span className={drone.connectivity.lte === 'CONNECTED' ? 'text-aeris-textSecondary' : 'text-aeris-amber'}>
                      LTE {drone.connectivity.lte === 'CONNECTED' ? '●' : '○'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`font-medium ${
                      drone.battery > 50 ? 'text-aeris-green' : drone.battery > 25 ? 'text-aeris-amber' : 'text-aeris-red'
                    }`}>
                      {drone.battery}%
                    </span>
                    {/* Visual mini battery bar */}
                    <div className="w-7 h-2 bg-aeris-surface3 rounded-sm p-0.5 border border-white/10 overflow-hidden">
                      <div 
                        className={`h-full rounded-xs transition-all ${
                          drone.battery > 50 ? 'bg-aeris-green' : drone.battery > 25 ? 'bg-aeris-amber' : 'bg-aeris-red'
                        }`}
                        style={{ width: `${drone.battery}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
