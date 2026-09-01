import React from 'react';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Users
} from 'lucide-react';

export default function LiveIntelligenceFeed({ events = [] }) {
  const getBadgeStyle = (priorityCode) => {
    switch (priorityCode) {
      case 'CRITICAL':
        return {
          badge: 'bg-[#FF4D3D]/15 text-[#FF4D3D] border border-[#FF4D3D]/30',
          dot: 'bg-[#FF4D3D] shadow-[0_0_8px_#FF4D3D]',
          border: 'border-l-2 border-l-[#FF4D3D]'
        };
      case 'HIGH':
      case 'WARNING':
        return {
          badge: 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30',
          dot: 'bg-[#F5A623] shadow-[0_0_8px_#F5A623]',
          border: 'border-l-2 border-l-[#F5A623]'
        };
      case 'RESOLVED':
        return {
          badge: 'bg-[#63C174]/15 text-[#63C174] border border-[#63C174]/30',
          dot: 'bg-[#63C174]',
          border: 'border-l-2 border-l-[#63C174]'
        };
      case 'INFO':
      default:
        return {
          badge: 'bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30',
          dot: 'bg-[#3B9EFF]',
          border: 'border-l-2 border-l-[#3B9EFF]'
        };
    }
  };

  return (
    <div className="w-full h-full bg-[#15191C] border border-white/5 rounded-2xl p-3 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3B9EFF] animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Live Intelligence Feed
            </h2>
          </div>
          <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 font-bold">
            STREAM ACTIVE
          </span>
        </div>
      </div>

      {/* Events Stream List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 min-h-0">
        {events.map((evt) => {
          const style = getBadgeStyle(evt.priorityCode);
          return (
            <div
              key={evt.id}
              className={`p-2.5 rounded-xl bg-[#181D20] border border-white/5 hover:border-white/10 transition-all ${style.border}`}
            >
              {/* Top: Timestamp & Priority Badge */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#8B949E] flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-1" />
                  {evt.time}
                </span>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${style.badge}`}>
                  {evt.priority}
                </span>
              </div>

              {/* Event Description */}
              <p className="text-[11px] font-semibold text-[#E8ECEF] leading-snug mb-1.5 font-sans">
                {evt.eventType}
              </p>

              {/* Location & Confidence */}
              <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 border-t border-white/5">
                <span className="flex items-center text-[#3B9EFF] truncate max-w-[130px]">
                  <MapPin className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                  {evt.location}
                </span>
                <span className="text-[#8B949E]">
                  Conf: <strong className="text-[#63C174]">{evt.confidence}%</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-white/5 text-[9.5px] font-mono text-[#8B949E] flex items-center justify-between shrink-0">
        <span className="flex items-center text-[#63C174]">
          <Cpu className="w-3 h-3 mr-1 text-[#63C174]" />
          AUTONOMOUS SYNC
        </span>
        <span className="text-[#3B9EFF]">REAL-TIME</span>
      </div>
    </div>
  );
}
