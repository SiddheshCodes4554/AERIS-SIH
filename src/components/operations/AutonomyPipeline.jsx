import React from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Cpu, 
  Radio, 
  ArrowRight, 
  ShieldAlert, 
  Compass, 
  HardDrive 
} from 'lucide-react';

export default function AutonomyPipeline({ isOffline, isBacktracking }) {
  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 shrink-0">
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-[#3B9EFF]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            {isBacktracking 
              ? 'Autonomous Backtracking Recovery' 
              : isOffline 
                ? 'Offline Autonomous Mode' 
                : 'Autonomous System Pipeline'}
          </h3>
        </div>
        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold border ${
          isBacktracking 
            ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 animate-pulse'
            : isOffline 
              ? 'bg-[#FF4D3D]/20 text-[#FF4D3D] border-[#FF4D3D]/40'
              : 'bg-[#63C174]/15 text-[#63C174] border-[#63C174]/30'
        }`}>
          {isBacktracking ? '● BACKTRACKING ACTIVE' : isOffline ? '● OFFLINE LOCAL AI' : '● ALL SYSTEMS AUTONOMOUS'}
        </span>
      </div>

      {/* Main Content: Standard Pipeline vs Offline Backtracking Sequence */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {isBacktracking ? (
          // Backtracking Active View
          <div className="p-2.5 rounded-xl bg-[#1C2125] border border-[#F5A623]/40 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F5A623] font-bold flex items-center">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#F5A623]" />
                RETURNING TO: CP-03
              </span>
              <span className="text-[#F5A623] font-bold">PROGRESS: 72%</span>
            </div>

            {/* Backtrack Progress Bar */}
            <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#F5A623] h-full rounded-full w-[72%] transition-all duration-300" />
            </div>

            {/* 7-Step Sequence Tracker */}
            <div className="grid grid-cols-7 gap-1 text-[7.5px] text-center pt-1 border-t border-white/5">
              <div className="p-1 rounded bg-[#111516] text-[#63C174] border border-[#63C174]/30">
                <span className="block font-bold">✓</span>
                <span>SIGNAL LOST</span>
              </div>
              <div className="p-1 rounded bg-[#111516] text-[#63C174] border border-[#63C174]/30">
                <span className="block font-bold">✓</span>
                <span>LOCAL AI</span>
              </div>
              <div className="p-1 rounded bg-[#111516] text-[#63C174] border border-[#63C174]/30">
                <span className="block font-bold">✓</span>
                <span>DATA BUFFER</span>
              </div>
              <div className="p-1 rounded bg-[#111516] text-[#F5A623] border border-[#F5A623]/40 animate-pulse font-bold">
                <span className="block font-bold">●</span>
                <span>BACKTRACK</span>
              </div>
              <div className="p-1 rounded bg-[#111516] text-[#8B949E] border border-white/5">
                <span className="block font-bold">○</span>
                <span>RECONNECT</span>
              </div>
              <div className="p-1 rounded bg-[#111516] text-[#8B949E] border border-white/5">
                <span className="block font-bold">○</span>
                <span>SYNC DATA</span>
              </div>
              <div className="p-1 rounded bg-[#111516] text-[#8B949E] border border-white/5">
                <span className="block font-bold">○</span>
                <span>RESUME</span>
              </div>
            </div>
          </div>
        ) : (
          // Normal Autonomous Pipeline Horizontal Flow
          <div className="grid grid-cols-4 gap-2 font-mono text-[9.5px]">
            <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
              <span className="text-[#8B949E] block text-[8px]">STAGE 01</span>
              <span className="font-bold text-[#E8ECEF] block mt-0.5">MISSION PLANNING</span>
              <span className="text-[#63C174] font-bold text-[8.5px] block mt-1">✓ COMPLETE</span>
            </div>

            <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
              <span className="text-[#8B949E] block text-[8px]">STAGE 02</span>
              <span className="font-bold text-[#E8ECEF] block mt-0.5">AUTONOMOUS NAV</span>
              <span className="text-[#3B9EFF] font-bold text-[8.5px] block mt-1">● ACTIVE (WAYPOINT)</span>
            </div>

            <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
              <span className="text-[#8B949E] block text-[8px]">STAGE 03</span>
              <span className="font-bold text-[#E8ECEF] block mt-0.5">AI ENVIRONMENT SCAN</span>
              <span className="text-[#63C174] font-bold text-[8.5px] block mt-1">● ACTIVE (YOLOv8)</span>
            </div>

            <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
              <span className="text-[#8B949E] block text-[8px]">STAGE 04</span>
              <span className="font-bold text-[#E8ECEF] block mt-0.5">MISSION EXECUTION</span>
              <span className="text-[#3B9EFF] font-bold text-[8.5px] block mt-1">● ACTIVE (68%)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
