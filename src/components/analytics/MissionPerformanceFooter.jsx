import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Map, 
  HardDrive, 
  Radio, 
  Wifi, 
  ShieldCheck 
} from 'lucide-react';

export default function MissionPerformanceFooter({ 
  performance, 
  isOffline, 
  onToggleOffline 
}) {
  return (
    <div className="w-full bg-[#15191C] border border-white/5 rounded-2xl p-3.5 select-none font-sans shadow-xl">
      {/* Header & Connectivity State Switcher */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#63C174]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Mission Performance & Connectivity
          </h3>
        </div>

        {/* Connectivity Intelligence Component */}
        <div 
          onClick={onToggleOffline}
          className={`cursor-pointer px-2.5 py-0.5 rounded-pill border transition-all flex items-center space-x-1.5 text-[10px] font-mono ${
            isOffline
              ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 shadow-[0_0_8px_rgba(245,166,35,0.4)] animate-pulse'
              : 'bg-[#1C2125] text-[#63C174] border-white/5 hover:border-white/15'
          }`}
          title="Click to toggle Connectivity Intelligence Mode"
        >
          <Radio className="w-3 h-3" />
          <span>
            {isOffline 
              ? 'OFFLINE MODE • Local AI Active (Data Buffered)' 
              : 'ONLINE MODE • Cloud Sync Active (5.8 GHz Mesh Link)'}
          </span>
        </div>
      </div>

      {/* 5 Performance Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-center">
        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <div className="flex items-center justify-center text-[#63C174] mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span className="text-base font-light font-mono">{performance.successRate}</span>
          </div>
          <span className="text-[8.5px] text-[#8B949E] uppercase tracking-wider block">
            Success Rate
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <div className="flex items-center justify-center text-[#3B9EFF] mb-1">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span className="text-base font-light font-mono">{performance.avgResponseTime}</span>
          </div>
          <span className="text-[8.5px] text-[#8B949E] uppercase tracking-wider block">
            Avg Response Time
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <div className="flex items-center justify-center text-[#63C174] mb-1">
            <Cpu className="w-3.5 h-3.5 mr-1" />
            <span className="text-base font-light font-mono">{performance.avgAiConfidence}</span>
          </div>
          <span className="text-[8.5px] text-[#8B949E] uppercase tracking-wider block">
            Avg AI Confidence
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <div className="flex items-center justify-center text-[#E8ECEF] mb-1">
            <Map className="w-3.5 h-3.5 mr-1 text-[#3B9EFF]" />
            <span className="text-base font-light font-mono">{performance.areaCovered}</span>
          </div>
          <span className="text-[8.5px] text-[#8B949E] uppercase tracking-wider block">
            Area Covered
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <div className="flex items-center justify-center text-[#E8ECEF] mb-1">
            <HardDrive className="w-3.5 h-3.5 mr-1 text-[#F5A623]" />
            <span className="text-base font-light font-mono">{performance.dataCaptured}</span>
          </div>
          <span className="text-[8.5px] text-[#8B949E] uppercase tracking-wider block">
            Telemetry Captured
          </span>
        </div>
      </div>
    </div>
  );
}
