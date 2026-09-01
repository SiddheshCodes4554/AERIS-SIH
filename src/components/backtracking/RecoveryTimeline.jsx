import React from 'react';
import { Clock, Radio, RotateCcw, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function RecoveryTimeline({ timelineEvents = [] }) {
  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5 shrink-0">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-[#3B9EFF]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Autonomous Recovery Event Timeline
          </h3>
        </div>
        <span className="text-[9px] font-mono text-[#8B949E]">
          CHRONOLOGICAL LOG
        </span>
      </div>

      {/* Events Stream */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 min-h-0 font-mono text-[9.5px]">
        {timelineEvents.map((evt, idx) => (
          <div
            key={idx}
            className="p-1.5 rounded-lg bg-[#181D1E] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
          >
            <div className="flex items-center space-x-2 min-w-0 pr-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                evt.color === 'amber' ? 'bg-[#F5A623] shadow-[0_0_6px_#F5A623]' :
                evt.color === 'green' ? 'bg-[#63C174] shadow-[0_0_6px_#63C174]' :
                evt.color === 'purple' ? 'bg-[#A78BFA] shadow-[0_0_6px_#A78BFA]' :
                'bg-[#3B9EFF]'
              }`}></span>
              <span className="text-[8.5px] font-bold text-[#8B949E] shrink-0">
                [{evt.type}]
              </span>
              <span className="text-[#E8ECEF] font-sans truncate text-[10px]">
                {evt.text}
              </span>
            </div>

            <span className="text-[8.5px] text-[#8B949E] shrink-0 font-mono">
              {evt.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
