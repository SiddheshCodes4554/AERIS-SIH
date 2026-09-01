import React, { useState } from 'react';
import { 
  Scan, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  MapPin, 
  Filter
} from 'lucide-react';

export default function DetectionPanel({ detections }) {
  const [filter, setFilter] = useState('ALL'); // ALL | SURVIVOR | HAZARD

  const filteredDetections = detections.filter(d => {
    if (filter === 'ALL') return true;
    if (filter === 'SURVIVOR') return d.type.includes('SURVIVOR');
    if (filter === 'HAZARD') return d.type === 'HAZARD';
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-aeris-danger/20 text-aeris-danger border-aeris-danger/50 font-bold';
      case 'HIGH':
        return 'bg-aeris-warning/20 text-aeris-warning border-aeris-warning/50 font-bold';
      case 'MODERATE':
        return 'bg-aeris-blue/20 text-aeris-blueLight border-aeris-blue/50';
      case 'SAFE':
        return 'bg-aeris-success/20 text-aeris-success border-aeris-success/50';
      default:
        return 'bg-aeris-surface text-aeris-textSecondary border-aeris-border';
    }
  };

  const getIcon = (type) => {
    if (type.includes('SURVIVOR')) return <Users className="w-3.5 h-3.5 text-aeris-danger shrink-0" />;
    if (type === 'HAZARD') return <AlertTriangle className="w-3.5 h-3.5 text-aeris-warning shrink-0" />;
    return <ShieldCheck className="w-3.5 h-3.5 text-aeris-success shrink-0" />;
  };

  return (
    <div className="bg-aeris-panel border border-aeris-border rounded-md flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-2 bg-aeris-panelHeader border-b border-aeris-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scan className="w-4 h-4 text-aeris-cyan animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-aeris-textPrimary">
            AI Detections & Priority
          </h2>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1 font-mono text-[10px]">
          {['ALL', 'SURVIVOR', 'HAZARD'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                filter === f
                  ? 'bg-aeris-cyan/20 text-aeris-cyan border-aeris-cyan font-bold'
                  : 'bg-aeris-surface text-aeris-textSecondary border-aeris-border hover:text-aeris-textPrimary'
              }`}
            >
              {f === 'ALL' ? `ALL (${detections.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Detections List */}
      <div className="p-2 space-y-2 flex-1 overflow-y-auto font-mono text-xs">
        {filteredDetections.map((det) => (
          <div
            key={det.id}
            className={`p-2.5 rounded bg-aeris-surface border transition-all ${
              det.priority === 'CRITICAL'
                ? 'border-aeris-danger/40 border-l-4 border-l-aeris-danger bg-aeris-danger/5'
                : 'border-aeris-border hover:border-aeris-borderLight'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                {getIcon(det.type)}
                <span className="font-bold text-aeris-textPrimary truncate">{det.label}</span>
              </div>
              <span className={`px-1.5 py-0.2 text-[10px] rounded border uppercase shrink-0 ${getPriorityBadge(det.priority)}`}>
                {det.priority}
              </span>
            </div>

            <p className="text-[11px] text-aeris-textSecondary font-sans mb-1.5 line-clamp-1">
              {det.details}
            </p>

            <div className="flex items-center justify-between text-[10px] text-aeris-textMuted pt-1 border-t border-aeris-border/50">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {det.timestamp}
              </span>
              <span className="text-aeris-cyan">
                CONF: {det.confidence}%
              </span>
              <span className="flex items-center text-aeris-textSecondary">
                <MapPin className="w-3 h-3 mr-0.5 text-aeris-cyan" />
                {det.lat.toFixed(4)}, {det.lng.toFixed(4)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
