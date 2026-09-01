import React from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Compass, 
  Gauge, 
  Layers, 
  Cpu, 
  RotateCcw, 
  Flame, 
  Search, 
  AlertTriangle 
} from 'lucide-react';

export default function MissionConfigPanel({ config, onChangeConfig }) {
  const missionTypes = [
    { id: 'Search & Rescue', label: 'Search & Rescue', icon: Search },
    { id: 'Disaster Reconnaissance', label: 'Disaster Reconnaissance', icon: Compass },
    { id: 'Hazard Assessment', label: 'Hazard Assessment', icon: AlertTriangle },
    { id: 'Thermal Survey', label: 'Thermal Survey', icon: Flame },
  ];

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const autonomyModes = [
    { id: 'FULL_AUTONOMOUS', label: 'FULL AUTONOMOUS' },
    { id: 'SUPERVISED', label: 'SUPERVISED' },
    { id: 'MANUAL', label: 'MANUAL' },
  ];

  const handleToggleSafety = (key) => {
    onChangeConfig({
      ...config,
      safety: {
        ...config.safety,
        [key]: !config.safety[key]
      }
    });
  };

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Panel Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#3B9EFF]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Mission Configuration
            </h2>
          </div>
          <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 font-bold">
            AERIS-01
          </span>
        </div>
      </div>

      {/* 2. Scrollable Configuration Fields */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 min-h-0 text-[11px] font-mono">
        {/* A. Mission Name Input */}
        <div>
          <label className="text-[10px] text-[#8B949E] uppercase tracking-wider block mb-1">
            MISSION NAME
          </label>
          <input
            type="text"
            value={config.missionName}
            onChange={(e) => onChangeConfig({ ...config, missionName: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-xl bg-[#181D1E] border border-white/10 text-[#E8ECEF] font-mono text-xs focus:outline-none focus:border-[#3B9EFF]"
          />
        </div>

        {/* B. Mission Type Options */}
        <div>
          <label className="text-[10px] text-[#8B949E] uppercase tracking-wider block mb-1">
            MISSION TYPE
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {missionTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = config.missionType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => onChangeConfig({ ...config, missionType: type.id })}
                  className={`p-2 rounded-xl border text-left flex items-center space-x-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#1C2125] text-[#3B9EFF] border-[#3B9EFF]/50 shadow-[0_0_10px_rgba(59,158,255,0.15)] font-bold'
                      : 'bg-[#181D1E] text-[#8B949E] hover:text-[#E8ECEF] border-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="text-[9.5px] truncate">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* C. Mission Priority Segmented Controls */}
        <div>
          <label className="text-[10px] text-[#8B949E] uppercase tracking-wider block mb-1">
            MISSION PRIORITY
          </label>
          <div className="flex space-x-1 p-0.5 bg-[#181D1E] rounded-xl border border-white/5 text-[9.5px]">
            {priorities.map((p) => {
              const isSelected = config.missionPriority === p;
              const colorClass = p === 'CRITICAL' ? 'text-[#FF4D3D]' : p === 'HIGH' ? 'text-[#F5A623]' : 'text-[#63C174]';
              return (
                <button
                  key={p}
                  onClick={() => onChangeConfig({ ...config, missionPriority: p })}
                  className={`flex-1 py-1 rounded-lg text-center font-semibold transition-all ${
                    isSelected
                      ? `bg-[#111516] ${colorClass} border border-white/10 shadow-sm`
                      : 'text-[#8B949E] hover:text-[#E8ECEF]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* D. Autonomy Mode */}
        <div>
          <label className="text-[10px] text-[#8B949E] uppercase tracking-wider block mb-1">
            AUTONOMY MODE
          </label>
          <div className="flex space-x-1 p-0.5 bg-[#181D1E] rounded-xl border border-white/5 text-[9.5px]">
            {autonomyModes.map((mode) => {
              const isSelected = config.autonomyMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onChangeConfig({ ...config, autonomyMode: mode.id })}
                  className={`flex-1 py-1 rounded-lg text-center font-bold transition-all ${
                    isSelected
                      ? 'bg-[#111516] text-[#3B9EFF] border border-white/10 shadow-sm'
                      : 'text-[#8B949E] hover:text-[#E8ECEF]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* E. Mission Altitude Slider */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span className="flex items-center">
              <Layers className="w-3 h-3 mr-1 text-[#3B9EFF]" />
              MISSION ALTITUDE
            </span>
            <strong className="text-[#3B9EFF] text-xs font-bold">{config.altitudeMeters} m AGL</strong>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            value={config.altitudeMeters}
            onChange={(e) => onChangeConfig({ ...config, altitudeMeters: Number(e.target.value) })}
            className="w-full accent-[#3B9EFF] cursor-pointer h-1.5 bg-[#070909] rounded-lg"
          />
          <div className="flex justify-between text-[8px] text-[#8B949E] mt-1">
            <span>20 m (Min)</span>
            <span>120 m (Max AGL)</span>
          </div>
        </div>

        {/* F. Cruise Speed Slider */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span className="flex items-center">
              <Gauge className="w-3 h-3 mr-1 text-[#63C174]" />
              CRUISE SPEED
            </span>
            <strong className="text-[#63C174] text-xs font-bold">{config.cruiseSpeedMs} m/s</strong>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            value={config.cruiseSpeedMs}
            onChange={(e) => onChangeConfig({ ...config, cruiseSpeedMs: Number(e.target.value) })}
            className="w-full accent-[#63C174] cursor-pointer h-1.5 bg-[#070909] rounded-lg"
          />
          <div className="flex justify-between text-[8px] text-[#8B949E] mt-1">
            <span>2 m/s (Precision)</span>
            <span>15 m/s (Fast Transit)</span>
          </div>
        </div>

        {/* G. Mission Safety Toggles */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 space-y-2">
          <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">
            MISSION SAFETY GUARDS
          </span>

          {/* Obstacle Avoidance */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-[#E8ECEF]">Obstacle Avoidance</span>
            <button
              onClick={() => handleToggleSafety('obstacleAvoidance')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                config.safety.obstacleAvoidance
                  ? 'bg-[#63C174]/20 text-[#63C174] border-[#63C174]/40'
                  : 'bg-white/5 text-[#8B949E] border-white/10'
              }`}
            >
              {config.safety.obstacleAvoidance ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Return To Home */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-[#E8ECEF]">Return To Home (RTH)</span>
            <button
              onClick={() => handleToggleSafety('returnToHome')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                config.safety.returnToHome
                  ? 'bg-[#63C174]/20 text-[#63C174] border-[#63C174]/40'
                  : 'bg-white/5 text-[#8B949E] border-white/10'
              }`}
            >
              {config.safety.returnToHome ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Automatic Backtracking */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-[#E8ECEF]">Automatic Backtracking</span>
            <button
              onClick={() => handleToggleSafety('automaticBacktracking')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                config.safety.automaticBacktracking
                  ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40'
                  : 'bg-white/5 text-[#8B949E] border-white/10'
              }`}
            >
              {config.safety.automaticBacktracking ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
