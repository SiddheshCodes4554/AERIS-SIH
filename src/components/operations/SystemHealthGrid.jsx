import React from 'react';
import { 
  Activity, 
  BatteryMedium, 
  Zap, 
  MapPin, 
  Compass, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  Wifi,
  Sparkles
} from 'lucide-react';

export default function SystemHealthGrid({ healthData, isOffline }) {
  const { battery, navigation, imu, communication, edgeAi } = healthData;

  const getBatteryColor = (pct) => {
    if (pct < 20) return 'text-[#FF4D3D] bg-[#FF4D3D]';
    if (pct < 40) return 'text-[#F5A623] bg-[#F5A623]';
    return 'text-[#63C174] bg-[#63C174]';
  };

  const batStyle = getBatteryColor(battery.percentage);

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Header & Overall Health Banner */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#63C174]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              System Health
            </h2>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#63C174]/15 text-[#63C174] border border-[#63C174]/30 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63C174] shadow-[0_0_6px_#63C174]"></span>
            <span>● NOMINAL</span>
          </div>
        </div>

        <p className="text-[9.5px] font-mono text-[#8B949E] uppercase tracking-wider mb-2">
          ALL CRITICAL SYSTEMS OPERATIONAL
        </p>
      </div>

      {/* 2. Scrollable Body of Detailed Sub-Systems */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 min-h-0">
        {/* A. Battery & Power System */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 font-mono">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>BATTERY & POWER</span>
            <BatteryMedium className="w-3.5 h-3.5 text-[#63C174]" />
          </div>

          <div className="flex items-baseline space-x-2 mb-1.5">
            <span className={`text-2xl font-light tracking-tight ${batStyle.split(' ')[0]}`}>
              {battery.percentage}%
            </span>
            <span className="text-[9.5px] text-[#8B949E]">
              {battery.voltage}V • {battery.temperature}°C • {battery.powerConsumptionWatts}W
            </span>
          </div>

          {/* Battery Bar */}
          <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden mb-1.5">
            <div 
              className={`h-full rounded-full transition-all ${batStyle.split(' ')[1]}`}
              style={{ width: `${battery.percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-[#8B949E] pt-1 border-t border-white/5">
            <span>EST FLIGHT TIME: <strong className="text-[#E8ECEF]">{battery.estimatedFlightTimeMin} MIN</strong></span>
            <span>MAIN CELL: <strong className="text-[#63C174]">● NORMAL</strong></span>
          </div>
        </div>

        {/* B. GPS & Navigation */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 font-mono">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>NAVIGATION (GPS)</span>
            <MapPin className="w-3.5 h-3.5 text-[#63C174]" />
          </div>

          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#63C174] font-bold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63C174] mr-1.5 shadow-[0_0_6px_#63C174]"></span>
              {navigation.gpsStatus} ({navigation.fixType})
            </span>
            <span className="text-[9.5px] text-[#8B949E]">{navigation.satellites} SATS • {navigation.accuracyMeters}m ACC</span>
          </div>

          <div className="text-[9.5px] text-[#A0AAB0] pt-1 border-t border-white/5 flex justify-between">
            <span>COORDINATES:</span>
            <strong className="text-[#3B9EFF]">{navigation.coordinatesFormatted}</strong>
          </div>
        </div>

        {/* C. Flight Stabilization (IMU) */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 font-mono">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>FLIGHT STABILIZATION</span>
            <Compass className="w-3.5 h-3.5 text-[#3B9EFF]" />
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9.5px] text-[#8B949E]">
            <div>IMU: <strong className="text-[#63C174]">● ACTIVE</strong></div>
            <div>AUTOPILOT: <strong className="text-[#63C174]">● NORMAL</strong></div>
            <div>STATUS: <strong className="text-[#E8ECEF]">{imu.orientation}</strong></div>
            <div>HEADING: <strong className="text-[#3B9EFF]">{imu.headingCardinal}</strong></div>
          </div>
        </div>

        {/* D. Communication Link & Checkpoint Recovery */}
        <div className={`p-2.5 rounded-xl border font-mono transition-all ${
          isOffline 
            ? 'bg-[#FF4D3D]/10 border-[#FF4D3D]/40' 
            : 'bg-[#181D1E] border-white/5'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>COMMUNICATION</span>
            <Radio className={`w-3.5 h-3.5 ${isOffline ? 'text-[#FF4D3D]' : 'text-[#3B9EFF]'}`} />
          </div>

          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`font-bold flex items-center ${isOffline ? 'text-[#FF4D3D]' : 'text-[#63C174]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOffline ? 'bg-[#FF4D3D] animate-pulse' : 'bg-[#63C174]'}`}></span>
              {isOffline ? 'SIGNAL LOST • OFFLINE' : '● CONNECTED'}
            </span>
            <span className="text-[9.5px] text-[#8B949E]">
              {isOffline ? 'BUFFER: 5 EVENTS' : `${communication.latencyMs}ms • ${communication.lastSync}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9.5px] pt-1 border-t border-white/5">
            <span className="text-[#8B949E]">LAST CONNECTED CP:</span>
            <strong className="text-[#63C174]">{communication.lastConnectedCheckpoint}</strong>
          </div>
        </div>

        {/* E. Edge AI Processor */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 font-mono">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span>EDGE AI PROCESSOR</span>
            <Cpu className="w-3.5 h-3.5 text-[#3B9EFF]" />
          </div>

          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#3B9EFF] font-bold">● ACTIVE ({edgeAi.inferenceMode.split(' ')[0]})</span>
            <span className="text-[9.5px] text-[#63C174] font-bold">{edgeAi.inferenceSpeedFps} FPS</span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9px] text-[#8B949E] pt-1 border-t border-white/5">
            <div>PROCESSED: <strong className="text-[#E8ECEF]">{edgeAi.objectsProcessed}</strong></div>
            <div>AVG CONF: <strong className="text-[#63C174]">{edgeAi.averageConfidence}%</strong></div>
            <div>SURVIVORS: <strong className="text-[#F5A623]">{edgeAi.survivorsDetected}</strong></div>
            <div>HAZARDS: <strong className="text-[#FF4D3D]">{edgeAi.hazardsDetected}</strong></div>
          </div>

          <div className="text-[8.5px] text-[#3B9EFF] mt-1 pt-0.5 border-t border-white/5 truncate">
            TASK: {edgeAi.currentTask}
          </div>
        </div>
      </div>
    </div>
  );
}
