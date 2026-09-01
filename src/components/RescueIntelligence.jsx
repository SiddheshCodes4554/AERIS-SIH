import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Users, 
  Flame, 
  Waves, 
  Building2, 
  Clock, 
  MapPin, 
  Cpu,
  Layers,
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
          border: 'border-l-4 border-l-aeris-red',
          badge: 'bg-aeris-red/20 text-aeris-red border border-aeris-red/30',
        };
      case 'HIGH':
        return {
          border: 'border-l-4 border-l-aeris-amber',
          badge: 'bg-aeris-amber/20 text-aeris-amber border border-aeris-amber/30',
        };
      case 'MEDIUM':
      default:
        return {
          border: 'border-l-4 border-l-aeris-purple',
          badge: 'bg-aeris-purple/20 text-aeris-purple border border-aeris-purple/30',
        };
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'RGB + THERMAL') {
      return (
        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-aeris-cyan/15 text-aeris-cyan border border-aeris-cyan/30 font-semibold">
          RGB + THERMAL FUSED
        </span>
      );
    }
    if (source === 'THERMAL') {
      return (
        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-aeris-purple/20 text-aeris-purple border border-aeris-purple/30">
          MLX90640 THERMAL
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-aeris-blue/20 text-aeris-blue border border-aeris-blue/30">
        RGB OPTICAL
      </span>
    );
  };

  const getItemIcon = (item) => {
    if (item.type === 'SURVIVOR') return <Users className="w-3.5 h-3.5 text-aeris-amber shrink-0" />;
    if (item.hazardType === 'FIRE') return <Flame className="w-3.5 h-3.5 text-aeris-red shrink-0" />;
    if (item.hazardType === 'FLOOD') return <Waves className="w-3.5 h-3.5 text-aeris-cyan shrink-0" />;
    return <Building2 className="w-3.5 h-3.5 text-aeris-amber shrink-0" />;
  };

  return (
    <div className="w-[320px] h-full aeris-panel-container p-4 flex flex-col justify-between select-none shrink-0 font-sans">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-2.5 mb-3">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-aeris-cyan animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Rescue Intelligence
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-aeris-green/15 text-aeris-green border border-aeris-green/30 font-medium">
            EDGE AI ACTIVE
          </span>
        </div>

        {/* 2. Filter Tabs */}
        <div className="flex space-x-1 p-1 bg-aeris-surface rounded-card border border-aeris-border mb-3 text-[11px] font-mono">
          {[
            { id: 'ALL', label: `ALL (${detections.length})` },
            { id: 'SURVIVORS', label: `SURVIVORS (${survivorsCount})` },
            { id: 'HAZARDS', label: `HAZARDS (${hazardsCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex-1 py-1 rounded text-center transition-colors ${
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
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const style = getPriorityStyle(item.priority);
          return (
            <div
              key={item.id}
              className={`aeris-surface-card p-2.5 transition-all ${style.border}`}
            >
              {/* Title, Sector & Priority */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                  {getItemIcon(item)}
                  <span className="text-xs font-semibold text-aeris-textPrimary truncate">
                    {item.title}
                  </span>
                </div>
                <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${style.badge}`}>
                  {item.confidence}%
                </span>
              </div>

              {/* Sector & Time */}
              <div className="flex items-center justify-between text-[10.5px] font-mono text-aeris-textMuted mb-1.5">
                <span className="flex items-center text-aeris-textSecondary">
                  <MapPin className="w-3 h-3 mr-1 text-aeris-cyan" />
                  {item.sector}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.time}
                </span>
              </div>

              {/* Details text */}
              <p className="text-[11px] text-aeris-textSecondary font-light leading-snug mb-2 font-sans line-clamp-2">
                {item.details}
              </p>

              {/* Sensor Source Badge */}
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px]">
                <span className="text-aeris-textMuted font-mono text-[9.5px]">SENSOR SOURCE:</span>
                {getSourceBadge(item.source)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Sensor Fusion Capabilities Footer */}
      <div className="mt-3 pt-2.5 border-t border-aeris-border text-[10px] font-mono text-aeris-textMuted flex items-center justify-between">
        <span className="flex items-center text-aeris-cyan">
          <Sparkles className="w-3 h-3 mr-1 text-aeris-cyan" />
          MULTI-MODAL SENSOR FUSION
        </span>
        <span className="text-aeris-green">ONLINE</span>
      </div>
    </div>
  );
}
