import React from 'react';
import { Layers, Sparkles, ShieldCheck } from 'lucide-react';

export default function RiskHeatmapStatus() {
  return (
    <div className="w-full h-full aeris-panel-container p-2.5 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
        <div className="flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-aeris-purple" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Risk Heatmap & Fusion
          </h2>
        </div>
        <span className="text-[8.5px] font-mono text-aeris-cyan">
          CHAMOLI 4B
        </span>
      </div>

      {/* Sensor Fusion Card */}
      <div className="aeris-surface-card p-1.5 font-mono text-[9.5px] mb-1.5">
        <div className="flex items-center justify-between text-aeris-textPrimary font-semibold mb-0.5">
          <span className="flex items-center text-aeris-cyan">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            SENSOR FUSION
          </span>
          <span className="px-1 py-0.2 rounded bg-aeris-green/20 text-aeris-green font-bold text-[8.5px]">
            FUSED: 97%
          </span>
        </div>
        <div className="flex justify-between text-aeris-textSecondary text-[8.5px]">
          <span>RGB: <strong className="text-aeris-blue">91%</strong></span>
          <span>THERMAL: <strong className="text-aeris-purple">94%</strong></span>
          <span>TARGET: <strong className="text-aeris-textPrimary">SURVIVOR</strong></span>
        </div>
      </div>

      {/* Severity Breakdown Strip */}
      <div className="grid grid-cols-4 gap-1 text-center font-mono text-[8.5px]">
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-aeris-green block font-bold">1</span>
          <span className="text-[7.5px] text-aeris-textMuted">LOW</span>
        </div>
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-[#D99A4A] block font-bold">1</span>
          <span className="text-[7.5px] text-aeris-textMuted">MOD</span>
        </div>
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-aeris-amber block font-bold">1</span>
          <span className="text-[7.5px] text-aeris-textMuted">HIGH</span>
        </div>
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-aeris-red block font-bold">1</span>
          <span className="text-[7.5px] text-aeris-textMuted">CRIT</span>
        </div>
      </div>
    </div>
  );
}
