import React, { useState } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Cpu, 
  Radio, 
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function IncidentListPanel({ 
  incidents = [], 
  selectedIncidentId, 
  onSelectIncident 
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // ALL | CRITICAL | HIGH | MEDIUM | RESOLVED

  const filterOptions = [
    { id: 'ALL', label: 'All' },
    { id: 'CRITICAL', label: 'Critical' },
    { id: 'HIGH', label: 'High' },
    { id: 'MEDIUM', label: 'Medium' },
    { id: 'RESOLVED', label: 'Resolved' },
  ];

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const getIncidentIcon = (category) => {
    switch (category) {
      case 'FIRE':
        return <Flame className="w-3.5 h-3.5 text-[#FF4D3D]" />;
      case 'SECURITY':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#F5A623]" />;
      case 'STRUCTURAL':
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-[#F5A623]" />;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          text: 'CRITICAL',
          icon: '🔴',
          badge: 'bg-[#FF4D3D]/15 text-[#FF4D3D] border border-[#FF4D3D]/30',
          indicator: 'bg-[#FF4D3D] shadow-[0_0_8px_rgba(255,77,61,0.6)]'
        };
      case 'HIGH':
        return {
          text: 'HIGH',
          icon: '🟠',
          badge: 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30',
          indicator: 'bg-[#F5A623] shadow-[0_0_8px_rgba(245,166,35,0.6)]'
        };
      case 'MEDIUM':
      default:
        return {
          text: 'MEDIUM',
          icon: '🟡',
          badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
          indicator: 'bg-yellow-400'
        };
    }
  };

  return (
    <div className="w-full h-full bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Title Bar */}
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#FF4D3D]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Active Incidents
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF4D3D]/15 text-[#FF4D3D] border border-[#FF4D3D]/30 font-bold">
            {incidents.length} ALERTS
          </span>
        </div>

        {/* 2. Filter Chips: All | Critical | High | Medium | Resolved */}
        <div className="flex space-x-1 p-1 bg-[#1C2125] rounded-xl border border-white/5 mb-3 text-[10.5px] font-mono">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id)}
              className={`flex-1 py-1 rounded-lg text-center font-semibold transition-all ${
                filterSeverity === f.id
                  ? 'bg-[#15191C] text-[#E8ECEF] border border-white/10 shadow-sm'
                  : 'text-[#8B949E] hover:text-[#E8ECEF] border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Vertically Stacked Incident Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 min-h-0">
        {filteredIncidents.map((inc) => {
          const isSelected = selectedIncidentId === inc.id;
          const sev = getSeverityBadge(inc.severity);

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 relative border ${
                isSelected
                  ? 'bg-[#1C2125] border-[#3B9EFF]/50 shadow-[0_0_18px_rgba(59,158,255,0.15)] ring-1 ring-[#3B9EFF]/30'
                  : 'bg-[#181D20] border-white/5 hover:border-white/15 hover:bg-[#1C2125]/70'
              }`}
            >
              {/* Top: Code & Severity Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#8B949E]">
                  {inc.code}
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${sev.indicator}`}></span>
                  <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded ${sev.badge}`}>
                    {sev.text}
                  </span>
                </div>
              </div>

              {/* Title & Icon */}
              <div className="flex items-center space-x-1.5 mb-1.5">
                {getIncidentIcon(inc.category)}
                <h3 className="text-xs font-semibold text-[#E8ECEF] truncate">
                  {inc.title}
                </h3>
              </div>

              {/* Location & Time */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B949E] mb-2">
                <span className="flex items-center text-[#3B9EFF]">
                  <MapPin className="w-2.5 h-2.5 mr-1" />
                  {inc.location}
                </span>
                <span className="flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-1 text-[#8B949E]" />
                  {inc.detectedTime}
                </span>
              </div>

              {/* Bottom Metadata: AI Confidence & Detecting Drone */}
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[9.5px] font-mono">
                <span className="text-[#8B949E]">
                  AI Conf: <strong className="text-[#63C174] font-bold">{inc.confidence}%</strong>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-white/5 text-[#E8ECEF] border border-white/5">
                  {inc.detectingDrone}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Summary Footer */}
      <div className="mt-2.5 pt-2 border-t border-white/5 text-[10px] font-mono text-[#8B949E] flex items-center justify-between shrink-0">
        <span className="flex items-center text-[#63C174]">
          <Cpu className="w-3 h-3 mr-1 text-[#63C174]" />
          EDGE AI PERCEPTION
        </span>
        <span className="text-[#3B9EFF]">LIVE CLUSTER</span>
      </div>
    </div>
  );
}
