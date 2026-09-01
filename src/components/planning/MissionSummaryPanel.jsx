import React from 'react';
import { 
  FileText, 
  BatteryMedium, 
  Clock, 
  Map, 
  RotateCcw, 
  CheckCircle2, 
  Play, 
  ArrowDown, 
  Radio, 
  Cpu, 
  Home 
} from 'lucide-react';

export default function MissionSummaryPanel({ plan, onOpenLaunchModal }) {
  const { metrics, readinessChecks } = plan;

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#3B9EFF]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Mission Summary
            </h2>
          </div>
          <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#63C174]/15 text-[#63C174] border border-[#63C174]/30 font-bold">
            VALIDATED
          </span>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 min-h-0 font-mono text-[10px]">
        {/* A. Core Metric Blocks Grid */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
            <span className="text-[#8B949E] block text-[8px]">TOTAL DISTANCE</span>
            <strong className="text-xs text-[#3B9EFF] font-bold mt-0.5 block">{metrics.totalDistanceKm} km</strong>
          </div>

          <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
            <span className="text-[#8B949E] block text-[8px]">EST DURATION</span>
            <strong className="text-xs text-[#E8ECEF] font-bold mt-0.5 block">{metrics.estimatedDurationMin} min</strong>
          </div>

          <div className="p-2 rounded-xl bg-[#181D1E] border border-white/5">
            <span className="text-[#8B949E] block text-[8px]">EST BATTERY</span>
            <strong className="text-xs text-[#63C174] font-bold mt-0.5 block">{metrics.estimatedRemainingBatteryPercent}%</strong>
          </div>
        </div>

        {/* B. Vertical Flight Path Sequence */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[9px] text-[#8B949E] uppercase tracking-wider block mb-2 font-bold">
            MISSION FLIGHT PATH SEQUENCE
          </span>

          <div className="space-y-1 text-[9.5px]">
            <div className="flex items-center justify-between text-[#63C174]">
              <span className="flex items-center">
                <Home className="w-3 h-3 mr-1.5 shrink-0" />
                HOME BASE LZ (AERIS STATION)
              </span>
              <span className="text-[8px] bg-[#63C174]/15 px-1.5 py-0.2 rounded">START</span>
            </div>

            <div className="pl-4 text-[#8B949E] text-[8px]">↓ 0.6 km</div>

            <div className="flex items-center justify-between text-[#3B9EFF]">
              <span>WP-01: Gorge Ingress</span>
              <span className="text-[8px] text-[#8B949E]">50m AGL</span>
            </div>

            <div className="pl-4 text-[#F5A623] text-[8px]">↓ CP-01 (River Mesh Link 📶)</div>

            <div className="flex items-center justify-between text-[#3B9EFF]">
              <span>WP-02: Bridge Approach</span>
              <span className="text-[8px] text-[#8B949E]">50m AGL</span>
            </div>

            <div className="pl-4 text-[#F5A623] text-[8px]">↓ CP-02 (Bridge Relay 📶)</div>

            <div className="flex items-center justify-between text-[#3B9EFF]">
              <span>WP-03: Sector B-4 Rooftops</span>
              <span className="text-[8px] text-[#8B949E]">50m AGL</span>
            </div>

            <div className="pl-4 text-[#F5A623] text-[8px]">↓ CP-03 (Ridge Station 📶)</div>

            <div className="flex items-center justify-between text-[#3B9EFF]">
              <span>WP-04: Dam Outflow Sweep</span>
              <span className="text-[8px] text-[#8B949E]">50m AGL</span>
            </div>

            <div className="pl-4 text-[#63C174] text-[8px]">↓ 1.2 km (Return Transit)</div>

            <div className="flex items-center justify-between text-[#63C174]">
              <span className="flex items-center">
                <Home className="w-3 h-3 mr-1.5 shrink-0" />
                RETURN HOME BASE
              </span>
              <span className="text-[8px] bg-[#63C174]/15 px-1.5 py-0.2 rounded">LANDING</span>
            </div>
          </div>
        </div>

        {/* C. Autonomous Backtracking & Recovery Pipeline */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-[#F5A623] flex items-center">
              <RotateCcw className="w-3 h-3 mr-1" />
              COMMUNICATION RECOVERY
            </span>
            <span className="text-[8px] bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40 px-1.5 py-0.2 rounded font-bold">
              ARMED
            </span>
          </div>

          <p className="text-[9px] text-[#8B949E] font-sans leading-tight">
            If communication is lost, AERIS-01 continues local AI processing, buffers critical data, and navigates back along its recorded flight path to the last known connected checkpoint.
          </p>

          {/* Recovery Pipeline Compact Steps */}
          <div className="grid grid-cols-7 gap-0.5 text-[7px] text-center pt-1 border-t border-white/5">
            <div className="p-0.5 rounded bg-[#111516] text-[#FF4D3D]">SIGNAL LOST</div>
            <div className="p-0.5 rounded bg-[#111516] text-[#3B9EFF]">LOCAL AI</div>
            <div className="p-0.5 rounded bg-[#111516] text-[#F5A623]">BUFFER</div>
            <div className="p-0.5 rounded bg-[#111516] text-[#F5A623]">BACKTRACK</div>
            <div className="p-0.5 rounded bg-[#111516] text-[#63C174]">RECONNECT</div>
            <div className="p-0.5 rounded bg-[#111516] text-[#3B9EFF]">SYNC</div>
            <div className="p-0.5 rounded bg-[#111516] text-[#63C174]">RESUME</div>
          </div>
        </div>

        {/* D. Mission Readiness Validation Checklist */}
        <div className="p-2.5 rounded-xl bg-[#181D1E] border border-white/5 space-y-1">
          <span className="text-[9px] text-[#8B949E] uppercase tracking-wider block font-bold mb-1">
            MISSION READINESS CHECKS
          </span>
          {readinessChecks.map((check) => (
            <div key={check.id} className="flex items-center text-[9.5px] text-[#E8ECEF]">
              <CheckCircle2 className="w-3 h-3 text-[#63C174] mr-1.5 shrink-0" />
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Launch Mission Action Button */}
      <div className="pt-2 border-t border-white/5 shrink-0">
        <button
          onClick={onOpenLaunchModal}
          className="w-full py-2.5 px-3 rounded-xl bg-[#63C174] hover:bg-[#52a862] text-black font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_16px_rgba(99,193,116,0.4)]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>LAUNCH MISSION</span>
        </button>
      </div>
    </div>
  );
}
