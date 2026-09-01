import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  Cpu, 
  Flame, 
  Users, 
  RotateCcw, 
  HardDrive,
  Activity
} from 'lucide-react';

export default function MissionEvents({ events = [] }) {
  const getEventBadge = (color) => {
    switch (color) {
      case 'green':
        return {
          dot: 'bg-aeris-green shadow-glow-green',
          text: 'text-aeris-textPrimary',
          time: 'text-aeris-green font-semibold',
        };
      case 'red':
        return {
          dot: 'bg-aeris-red shadow-glow-red',
          text: 'text-aeris-textPrimary font-medium',
          time: 'text-aeris-red font-semibold',
        };
      case 'amber':
        return {
          dot: 'bg-aeris-amber shadow-glow-amber',
          text: 'text-aeris-textPrimary font-medium',
          time: 'text-aeris-amber font-semibold',
        };
      case 'blue':
      default:
        return {
          dot: 'bg-aeris-cyan shadow-glow-blue',
          text: 'text-aeris-textPrimary',
          time: 'text-aeris-cyan font-semibold',
        };
    }
  };

  return (
    <div className="h-full aeris-panel-container p-3.5 select-none font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-aeris-border pb-2 mb-2 shrink-0">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-aeris-cyan" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Mission Events Log
          </h2>
        </div>
        <span className="text-[10px] font-mono text-aeris-textMuted">
          LIVE TIMELINE (9 EVENTS)
        </span>
      </div>

      {/* Events Chronological Scroll Container */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {events.map((evt, idx) => {
          const style = getEventBadge(evt.color);
          return (
            <div
              key={idx}
              className="aeris-surface-card px-2.5 py-1.5 flex items-center justify-between font-mono text-xs hover:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                <span className={`truncate text-[11px] font-sans ${style.text}`}>
                  {evt.label}
                </span>
              </div>

              <span className={`text-[10px] shrink-0 ${style.time}`}>
                {evt.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
