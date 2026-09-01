import React from 'react';
import { 
  Radio, 
  Cpu, 
  HardDrive, 
  RotateCcw, 
  MapPin, 
  Clock, 
  Eye, 
  ShieldCheck, 
  Wifi, 
  AlertTriangle 
} from 'lucide-react';

export default function AutonomyStatusPanel({ 
  currentStage, 
  bufferedEvents = [] 
}) {
  const isOffline = currentStage === 'SIGNAL_LOST' || currentStage === 'OFFLINE_AUTONOMY' || currentStage === 'BACKTRACKING';
  const isBacktracking = currentStage === 'BACKTRACKING';
  const isConnected = currentStage === 'CONNECTED' || currentStage === 'RECONNECTED' || currentStage === 'DATA_SYNC' || currentStage === 'MISSION_RESUMED';

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#3B9EFF]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Autonomy & Buffer Diagnostics
            </h2>
          </div>
          <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold border ${
            isOffline 
              ? 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/40' 
              : 'bg-[#63C174]/15 text-[#63C174] border-[#63C174]/30'
          }`}>
            {isOffline ? 'LOCAL EDGE AI' : 'CLOUD LINKED'}
          </span>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 min-h-0 font-mono text-[10px]">
        {/* A. Connection State Box */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          isOffline 
            ? 'bg-[#FF4D3D]/10 border-[#FF4D3D]/30 text-[#E8ECEF]' 
            : 'bg-[#181D1E] border-white/5 text-[#E8ECEF]'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-[#8B949E] mb-1">
            <span className="flex items-center">
              <Radio className={`w-3.5 h-3.5 mr-1 ${isOffline ? 'text-[#FF4D3D]' : 'text-[#63C174]'}`} />
              RF GROUND LINK (5.8 GHz)
            </span>
            <span className={`font-bold text-[9.5px] ${isOffline ? 'text-[#FF4D3D]' : 'text-[#63C174]'}`}>
              {isOffline ? '● SIGNAL LOST' : '● CONNECTED'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9.5px] text-[#8B949E]">
            <span>SIGNAL STRENGTH:</span>
            <span className="font-bold text-[#E8ECEF]">
              {isOffline ? '░░░░░░░░░░ (0%)' : '█████████░ (88%)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9.5px] text-[#8B949E] pt-1 border-t border-white/5 mt-1">
            <span>LATENCY: <strong className="text-[#E8ECEF]">{isOffline ? 'N/A' : '42 ms'}</strong></span>
            <span>LAST SYNC: <strong className="text-[#E8ECEF]">{isOffline ? '02:14 AGO' : '1 sec ago'}</strong></span>
          </div>
        </div>

        {/* B. Local Edge Intelligence Panel */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1 text-[#3B9EFF]" />
              LOCAL EDGE INTELLIGENCE
            </span>
            <span className="text-[#63C174] font-bold">● 28 FPS LOCAL</span>
          </div>

          <div className="text-[9.5px] text-[#A0AAB0]">
            Model: <strong className="text-[#E8ECEF]">AERIS Vision AI (Jetson Orin Nano)</strong>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/5 text-[9px]">
            <div className="p-1 rounded bg-[#111516] text-[#63C174] flex justify-between">
              <span>PERSON DET:</span>
              <strong>96%</strong>
            </div>
            <div className="p-1 rounded bg-[#111516] text-[#F5A623] flex justify-between">
              <span>HAZARD DET:</span>
              <strong>91%</strong>
            </div>
          </div>
        </div>

        {/* C. Mission Data Buffer */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center text-[#8B949E]">
              <HardDrive className="w-3.5 h-3.5 mr-1 text-[#F5A623]" />
              MISSION DATA BUFFER
            </span>
            <span className="text-[#F5A623] font-bold text-[9px] bg-[#F5A623]/15 px-1.5 py-0.2 rounded">
              {isOffline ? '● BUFFERING ACTIVE' : '● BUFFER SYNCED'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[8.5px] text-center pt-1 border-t border-white/5">
            <div className="p-1 rounded bg-[#111516]">
              <span className="text-[#8B949E] block">EVENTS</span>
              <strong className="text-xs text-[#F5A623] font-bold">{isOffline ? '05' : '0'}</strong>
            </div>
            <div className="p-1 rounded bg-[#111516]">
              <span className="text-[#8B949E] block">IMAGES</span>
              <strong className="text-xs text-[#E8ECEF] font-bold">{isOffline ? '12' : '0'}</strong>
            </div>
            <div className="p-1 rounded bg-[#111516]">
              <span className="text-[#8B949E] block">SIZE</span>
              <strong className="text-xs text-[#3B9EFF] font-bold">{isOffline ? '18.4 MB' : '0 MB'}</strong>
            </div>
          </div>
        </div>

        {/* D. Autonomous Recovery Decision */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="flex items-center">
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#F5A623]" />
              AUTONOMOUS RECOVERY TARGET
            </span>
            <strong className="text-[#F5A623]">CP-04</strong>
          </div>

          <div className="flex justify-between text-[9px] text-[#A0AAB0] pt-1 border-t border-white/5">
            <span>ACTION: <strong className="text-[#E8ECEF]">BACKTRACK FLIGHT PATH</strong></span>
            <span>DISTANCE: <strong className="text-[#3B9EFF]">620 m</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
