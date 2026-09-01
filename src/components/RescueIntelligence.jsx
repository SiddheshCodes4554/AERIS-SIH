import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Users, 
  Flame, 
  Waves, 
  Building2, 
  Clock, 
  MapPin, 
  Sparkles
} from 'lucide-react';

export default function RescueIntelligence({ detections = [] }) {
  const [filterTab, setFilterTab] = useState('ALL'); // ALL | SURVIVORS | HAZARDS

  const survivorsCount = detections.filter(d => d.type === 'SURVIVOR').length;
  const hazardsCount = detections.filter(d => d.type === 'HAZARD').length;

  const filteredItems = detections.filter(item => {
    if (filterTab === 'SURVIVORS') return item.type === 'SURVIVOR';
    if (filterTab === 'HAZARDS') return item.type === 'HAZARD';
    return true;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          border: 'border-l-2 border-l-aeris-red',
          badge: 'bg-aeris-red/20 text-aeris-red border border-aeris-red/30',
        };
      case 'HIGH':
        return {
          border: 'border-l-2 border-l-aeris-amber',
          badge: 'bg-aeris-amber/20 text-aeris-amber border border-aeris-amber/30',
        };
      case 'MEDIUM':
      default:
        return {
          border: 'border-l-2 border-l-aeris-purple',
          badge: 'bg-aeris-purple/20 text-aeris-purple border border-aeris-purple/30',
        };
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'RGB + THERMAL') {
      return (
        <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-aeris-cyan/15 text-aeris-cyan border border-aeris-cyan/30 font-semibold">
          FUSED
        </span>
      );
    }
    if (source === 'THERMAL') {
      return (
        <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-aeris-purple/20 text-aeris-purple border border-aeris-purple/30">
          IR
        </span>
      );
    }
    return (
      <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-aeris-blue/20 text-aeris-blue border border-aeris-blue/30">
        RGB
      </span>
    );
  };

  const getItemIcon = (item) => {
    if (item.type === 'SURVIVOR') return <Users className="w-3 h-3 text-aeris-amber shrink-0" />;
    if (item.hazardType === 'FIRE') return <Flame className="w-3 h-3 text-aeris-red shrink-0" />;
    if (item.hazardType === 'FLOOD') return <Waves className="w-3 h-3 text-aeris-cyan shrink-0" />;
    return <Building2 className="w-3 h-3 text-aeris-amber shrink-0" />;
  };

  return (
    <div className="w-full h-full aeris-panel-container p-3 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1.5 mb-2 shrink-0">
          <div className="flex items-center space-x-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Rescue Intelligence
            </h2>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-aeris-green/15 text-aeris-green border border-aeris-green/30 font-medium">
            AI ACTIVE
          </span>
        </div>

        {/* 2. Filter Tabs */}
        <div className="flex space-x-1 p-0.5 bg-aeris-surface rounded-card border border-aeris-border mb-2 text-[10px] font-mono shrink-0">
          {[
            { id: 'ALL', label: `ALL (${detections.length})` },
            { id: 'SURVIVORS', label: `SURV (${survivorsCount})` },
            { id: 'HAZARDS', label: `HAZ (${hazardsCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex-1 py-0.5 rounded text-center transition-colors ${
                filterTab === tab.id
                  ? 'bg-aeris-surfaceHover text-aeris-textPrimary font-semibold border border-white/10'
                  : 'text-aeris-textSecondary hover:text-aeris-textPrimary border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Detections Scrollable Container */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 min-h-0">
        {filteredItems.map((item) => {
          const style = getPriorityStyle(item.priority);
          return (
            <div
              key={item.id}
              className={`aeris-surface-card p-2 transition-all ${style.border}`}
            >
              {/* Title, Sector & Priority */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center space-x-1 min-w-0 pr-1">
                  {getItemIcon(item)}
                  <span className="text-[11px] font-semibold text-aeris-textPrimary truncate">
                    {item.title}
                  </span>
                </div>
                <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-bold shrink-0 ${style.badge}`}>
                  {item.confidence}%
                </span>
              </div>

              {/* Sector & Time */}
              <div className="flex items-center justify-between text-[9.5px] font-mono text-aeris-textMuted mb-1">
                <span className="flex items-center text-aeris-textSecondary">
                  <MapPin className="w-2.5 h-2.5 mr-0.5 text-aeris-cyan" />
                  {item.sector}
                </span>
                <span className="flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                  {item.time}
                </span>
              </div>

              {/* Details text */}
              <p className="text-[10px] text-aeris-textSecondary font-light leading-tight mb-1 font-sans line-clamp-1">
                {item.details}
              </p>

              {/* Sensor Source Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px]">
                <span className="text-aeris-textMuted font-mono text-[8.5px]">SRC:</span>
                {getSourceBadge(item.source)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Sensor Fusion Capabilities Footer */}
      <div className="mt-1.5 pt-1.5 border-t border-aeris-border text-[9px] font-mono text-aeris-textMuted flex items-center justify-between shrink-0">
        <span className="flex items-center text-aeris-cyan">
          <Sparkles className="w-2.5 h-2.5 mr-1 text-aeris-cyan" />
          FUSION ACTIVE
        </span>
        <span className="text-aeris-green">ONLINE</span>
      </div>
    </div>
  );
}
