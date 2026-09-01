import React from 'react';
import { 
  Eye, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  TrendingUp, 
  Sparkles,
  Radio
} from 'lucide-react';

export default function MetricsTopRow({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full select-none font-sans">
      {/* Card 1: AI Detections */}
      <div className="bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8B949E] mb-1">
          <span className="tracking-wider uppercase">AI DETECTIONS</span>
          <div className="w-6 h-6 rounded-lg bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF]">
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-light text-[#E8ECEF] font-mono tracking-tight">
            {metrics.aiDetections.value}
          </span>
          <span className="text-[10px] font-mono font-bold text-[#63C174] flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {metrics.aiDetections.trend}
          </span>
        </div>

        <span className="text-[10px] text-[#8B949E] font-mono">
          {metrics.aiDetections.period}
        </span>
      </div>

      {/* Card 2: High-Risk Zones */}
      <div className="bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8B949E] mb-1">
          <span className="tracking-wider uppercase">HIGH-RISK ZONES</span>
          <div className="w-6 h-6 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-light text-[#F5A623] font-mono tracking-tight">
            {metrics.highRiskZones.value}
          </span>
          <span className="text-[10px] font-mono text-[#F5A623] font-semibold">
            {metrics.highRiskZones.trend}
          </span>
        </div>

        <span className="text-[10px] text-[#8B949E] font-mono">
          {metrics.highRiskZones.period}
        </span>
      </div>

      {/* Card 3: Active Incidents */}
      <div className="bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8B949E] mb-1">
          <span className="tracking-wider uppercase">ACTIVE INCIDENTS</span>
          <div className="w-6 h-6 rounded-lg bg-[#FF4D3D]/10 border border-[#FF4D3D]/20 flex items-center justify-center text-[#FF4D3D]">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-light text-[#FF4D3D] font-mono tracking-tight">
            {metrics.activeIncidents.value}
          </span>
          <span className="text-[10px] font-mono text-[#FF4D3D] font-semibold">
            {metrics.activeIncidents.trend}
          </span>
        </div>

        <span className="text-[10px] text-[#8B949E] font-mono">
          {metrics.activeIncidents.period}
        </span>
      </div>

      {/* Card 4: Drone Coverage */}
      <div className="bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8B949E] mb-1">
          <span className="tracking-wider uppercase">DRONE COVERAGE</span>
          <div className="w-6 h-6 rounded-lg bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF]">
            <Compass className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-light text-[#3B9EFF] font-mono tracking-tight">
            {metrics.droneCoverage.value}
          </span>
          <span className="text-[10px] font-mono text-[#63C174] font-semibold">
            {metrics.droneCoverage.trend}
          </span>
        </div>

        <span className="text-[10px] text-[#8B949E] font-mono">
          {metrics.droneCoverage.period}
        </span>
      </div>
    </div>
  );
}
