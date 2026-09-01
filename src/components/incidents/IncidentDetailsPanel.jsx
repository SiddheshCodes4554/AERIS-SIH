import React, { useState } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Cpu, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Radio, 
  BatteryMedium,
  Check
} from 'lucide-react';

export default function IncidentDetailsPanel({ 
  incident, 
  nearbyDrones = [], 
  onDeployDrone,
  onMarkFalsePositive 
}) {
  const [dispatchedDrones, setDispatchedDrones] = useState([]);
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [checklistState, setChecklistState] = useState([true, true, true, false]);

  const handleDispatch = (callsign) => {
    setDispatchedDrones(prev => [...prev, callsign]);
    if (onDeployDrone) onDeployDrone(callsign);
  };

  const toggleChecklist = (index) => {
    setChecklistState(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="w-full h-full bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Header & Incident Overview */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3B9EFF]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Incident Analysis
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#8B949E]">
            {incident.coordinates}
          </span>
        </div>

        {/* Incident Summary Card */}
        <div className="p-2.5 rounded-xl bg-[#1C2125] border border-white/5 mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF4D3D] shadow-[0_0_8px_#FF4D3D]"></span>
              <span className="text-xs font-bold text-[#E8ECEF]">{incident.title}</span>
            </div>
            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FF4D3D]/20 text-[#FF4D3D] border border-[#FF4D3D]/30">
              {incident.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[#8B949E] mt-1 pt-1 border-t border-white/5">
            <span>Location: <strong className="text-[#E8ECEF]">{incident.location}</strong></span>
            <span>Detected: <strong className="text-[#E8ECEF]">{incident.detectedTimestamp}</strong></span>
            <span>Drone: <strong className="text-[#3B9EFF]">{incident.detectingDrone}</strong></span>
            <span>AI Conf: <strong className="text-[#63C174]">{incident.confidence}%</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body: AI Assessment, Environmental Data, Recommendations, Drones & Timeline */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 min-h-0">
        {/* A. AI Assessment Glass Panel */}
        <div className="p-2.5 rounded-xl bg-[#181D20] border border-white/5">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-[#E8ECEF] mb-1.5">
            <span className="font-semibold text-[#3B9EFF] flex items-center">
              <Cpu className="w-3 h-3 mr-1" />
              AI Assessment
            </span>
            <span className="text-[9px] text-[#63C174]">HIGH FIDELITY</span>
          </div>

          <p className="text-[11px] text-[#A0AAB0] leading-relaxed font-light mb-2">
            {incident.description}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono pt-1.5 border-t border-white/5">
            <div>
              <div className="flex justify-between text-[#8B949E] mb-0.5">
                <span>Spread Risk:</span>
                <strong className="text-[#FF4D3D]">{incident.riskMetrics.spreadRisk}</strong>
              </div>
              <div className="w-full bg-[#0B0E0F] h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-[#FF4D3D] h-full rounded-full" 
                  style={{ width: `${incident.riskMetrics.spreadPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-[#8B949E] items-center">
              <span>Risk Radius:</span>
              <strong className="text-[#E8ECEF]">{incident.riskMetrics.estimatedRiskRadius}</strong>
            </div>

            <div className="flex justify-between text-[#8B949E] items-center">
              <span>Wind Impact:</span>
              <strong className="text-[#F5A623]">{incident.riskMetrics.windImpact}</strong>
            </div>

            <div className="flex justify-between text-[#8B949E] items-center">
              <span>Population:</span>
              <strong className="text-[#63C174]">{incident.riskMetrics.nearbyPopulation}</strong>
            </div>
          </div>
        </div>

        {/* B. Live Environmental Sensor Data */}
        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <span className="text-[10px] font-mono text-[#8B949E] uppercase block mb-1.5">
            Environmental Telemetry
          </span>
          <div className="grid grid-cols-4 gap-1 text-center font-mono">
            <div className="p-1 rounded bg-[#131719] border border-white/5">
              <Thermometer className="w-3 h-3 mx-auto text-[#FF4D3D] mb-0.5" />
              <span className="text-[10px] text-[#E8ECEF] font-bold block">{incident.environmentalData.temperature}</span>
              <span className="text-[7.5px] text-[#8B949E]">TEMP</span>
            </div>
            <div className="p-1 rounded bg-[#131719] border border-white/5">
              <Droplets className="w-3 h-3 mx-auto text-[#3B9EFF] mb-0.5" />
              <span className="text-[10px] text-[#E8ECEF] font-bold block">{incident.environmentalData.humidity}</span>
              <span className="text-[7.5px] text-[#8B949E]">HUMID</span>
            </div>
            <div className="p-1 rounded bg-[#131719] border border-white/5">
              <Wind className="w-3 h-3 mx-auto text-[#63C174] mb-0.5" />
              <span className="text-[10px] text-[#E8ECEF] font-bold block">{incident.environmentalData.windSpeed}</span>
              <span className="text-[7.5px] text-[#8B949E]">WIND</span>
            </div>
            <div className="p-1 rounded bg-[#131719] border border-white/5">
              <Activity className="w-3 h-3 mx-auto text-[#F5A623] mb-0.5" />
              <span className="text-[9px] text-[#E8ECEF] font-bold block truncate">{incident.environmentalData.airQuality.split(' ')[0]}</span>
              <span className="text-[7.5px] text-[#8B949E]">AQI</span>
            </div>
          </div>
        </div>

        {/* C. AI Recommended Actions & Primary Dispatch Button */}
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1C2125] to-[#161D22] border border-[#3B9EFF]/30 shadow-lg">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#3B9EFF] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI RECOMMENDATION</span>
          </div>

          <p className="text-[10.5px] text-[#E8ECEF] leading-tight mb-2">
            {incident.aiRecommendation}
          </p>

          {/* Checklist */}
          <div className="space-y-1 mb-2.5 font-mono text-[9.5px]">
            {incident.recommendedChecklist?.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => toggleChecklist(idx)}
                className="flex items-center space-x-1.5 cursor-pointer text-[#A0AAB0] hover:text-[#E8ECEF]"
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                  checklistState[idx] ? 'bg-[#3B9EFF] border-[#3B9EFF] text-black' : 'border-white/20'
                }`}>
                  {checklistState[idx] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons: Deploy Response Drone / False Positive */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => handleDispatch('Drone A-12')}
              className="flex-1 py-2 px-3 rounded-lg bg-[#FF4D3D]/25 hover:bg-[#FF4D3D]/35 text-[#FF4D3D] border border-[#FF4D3D]/50 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,77,61,0.25)] flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DEPLOY RESPONSE DRONE</span>
            </button>

            <button
              onClick={() => setIsFalsePositive(!isFalsePositive)}
              className="py-2 px-2.5 rounded-lg bg-[#15191C] hover:bg-[#1C2125] text-[#8B949E] hover:text-[#E8ECEF] border border-white/10 font-mono text-[10px] transition-colors"
              title="Mark as False Positive"
            >
              {isFalsePositive ? 'MARKED' : 'FALSE POSITIVE'}
            </button>
          </div>
        </div>

        {/* D. Available Response Drones (Nearby Assets) */}
        <div className="p-2 rounded-xl bg-[#181D20] border border-white/5">
          <span className="text-[10px] font-mono text-[#8B949E] uppercase block mb-1.5">
            Nearby Response Assets
          </span>

          <div className="space-y-1.5">
            {nearbyDrones.filter(d => d.status === 'Available').map((drone) => {
              const isSent = dispatchedDrones.includes(drone.callsign);

              return (
                <div
                  key={drone.id}
                  className="p-2 rounded-lg bg-[#131719] border border-white/5 flex items-center justify-between font-mono text-[10px]"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-[#E8ECEF]">{drone.callsign}</span>
                      <span className="text-[8.5px] text-[#63C174] font-semibold">● {drone.status}</span>
                    </div>
                    <div className="text-[9px] text-[#8B949E] mt-0.5">
                      Dist: <strong className="text-[#3B9EFF]">{drone.distance}</strong> • Bat: <strong className="text-[#63C174]">{drone.battery}%</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispatch(drone.callsign)}
                    disabled={isSent}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      isSent
                        ? 'bg-[#63C174]/20 text-[#63C174] border border-[#63C174]/40'
                        : 'bg-[#3B9EFF]/20 hover:bg-[#3B9EFF]/30 text-[#3B9EFF] border border-[#3B9EFF]/40'
                    }`}
                  >
                    {isSent ? 'DISPATCHED' : 'DISPATCH'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* E. Incident Timeline */}
        <div className="p-2.5 rounded-xl bg-[#181D20] border border-white/5">
          <span className="text-[10px] font-mono text-[#8B949E] uppercase block mb-2">
            Incident Timeline
          </span>

          <div className="relative pl-3 space-y-2 border-l border-white/10 font-mono text-[10px]">
            {incident.timeline?.map((evt, idx) => (
              <div key={idx} className="relative">
                {/* Glowing Dot */}
                <span className={`absolute -left-[16.5px] top-1 w-2 h-2 rounded-full ${
                  evt.isOfflineEvent 
                    ? 'bg-[#F5A623] shadow-[0_0_8px_#F5A623]' 
                    : 'bg-[#3B9EFF] shadow-[0_0_6px_#3B9EFF]'
                }`}></span>

                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[#E8ECEF] text-[9.5px]">{evt.time}</span>
                </div>
                <p className="text-[10px] text-[#A0AAB0] font-sans leading-tight">
                  {evt.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
