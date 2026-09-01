import React from 'react';
import { BrainCircuit, AlertTriangle, Users, Flame, Waves } from 'lucide-react';

export default function AIDetectionsPanel({ detections = [] }) {
  return (
    <div className="w-full h-full aeris-panel-container p-2.5 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
        <div className="flex items-center space-x-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            AI Detections
          </h2>
        </div>
        <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-aeris-green/15 text-aeris-green border border-aeris-green/30">
          EDGE AI ACTIVE
        </span>
      </div>

      {/* Detections List */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 min-h-0">
        {detections.map((det) => (
          <div
            key={det.id}
            className={`aeris-surface-card px-2 py-1 flex items-center justify-between font-mono text-[10px] border-l-2 ${
              det.color === 'red' ? 'border-l-aeris-red' : 'border-l-aeris-amber'
            }`}
          >
            <div className="min-w-0 pr-1.5">
              <div className="flex items-center space-x-1">
                <span className={`font-bold ${det.color === 'red' ? 'text-aeris-amber' : 'text-aeris-textPrimary'}`}>
                  {det.title}
                </span>
                <span className="text-[8.5px] text-aeris-textMuted">({det.sector})</span>
              </div>
              <div className="text-[8.5px] text-aeris-textSecondary">
                Conf: <strong className="text-aeris-green">{det.confidence}%</strong>
              </div>
            </div>

            <span className="text-[9px] text-aeris-textMuted shrink-0">
              {det.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
