import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, AlertCircle } from 'lucide-react';

export default function AIInsightsPanel({ insights = [] }) {
  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'border-l-2 border-l-[#FF4D3D] text-[#FF4D3D]';
      case 'HIGH':
        return 'border-l-2 border-l-[#F5A623] text-[#F5A623]';
      case 'MEDIUM':
      default:
        return 'border-l-2 border-l-[#3B9EFF] text-[#3B9EFF]';
    }
  };

  return (
    <div className="w-full bg-[#15191C] border border-white/5 rounded-2xl p-3.5 select-none font-sans shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            AERIS AI Insights
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#63C174]/15 text-[#63C174] border border-[#63C174]/30 font-bold">
          3 RECOMMENDATIONS GENERATED
        </span>
      </div>

      {/* 3 Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {insights.map((ins, idx) => (
          <div
            key={ins.id}
            className={`p-3 rounded-xl bg-[#181D20] border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all ${getSeverityStyle(ins.severity)}`}
          >
            <div>
              {/* Insight Code & Header */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className="font-bold text-[#8B949E]">INSIGHT 0{idx + 1}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5">
                  {ins.severity}
                </span>
              </div>

              {/* Title / Finding */}
              <h4 className="text-xs font-semibold text-[#E8ECEF] mb-1.5 leading-snug">
                {ins.title}
              </h4>

              {/* AI Recommendation */}
              <div className="text-[10.5px] text-[#A0AAB0] font-light leading-relaxed mb-2.5 font-sans">
                <span className="text-[#3B9EFF] font-mono font-medium block text-[9.5px]">AI Recommendation:</span>
                {ins.recommendation}
              </div>
            </div>

            {/* Action Link Button */}
            <button className="pt-2 border-t border-white/5 text-[10px] font-mono text-[#3B9EFF] hover:text-[#63C174] flex items-center justify-between transition-colors">
              <span>{ins.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
