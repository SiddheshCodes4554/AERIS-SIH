import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  X, 
  CheckCircle2, 
  Cpu, 
  Navigation, 
  Radio, 
  BatteryMedium, 
  Layers, 
  Compass,
  ArrowRight
} from 'lucide-react';

export default function LaunchConfirmationModal({ 
  plan, 
  isOpen, 
  onClose, 
  onLaunchSuccess 
}) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);

  const launchSteps = [
    { label: "MISSION INITIALIZING...", icon: Navigation },
    { label: "CHECKING SENSORS & IMU...", icon: Compass },
    { label: "RTK GPS CARRIER PHASE LOCKED (14 SATS)", icon: Compass },
    { label: "EDGE AI VISION PERCEPTION ARMED", icon: Cpu },
    { label: "COLLISION-FREE ROUTE LOADED (3.8 km)", icon: Layers },
    { label: "5.8 GHz MESH GROUND LINK ACTIVE", icon: Radio },
    { label: "AUTONOMOUS FLIGHT STARTED • TAKEOFF LZ", icon: Play },
  ];

  useEffect(() => {
    let timer;
    if (isLaunching) {
      if (launchStep < launchSteps.length - 1) {
        timer = setTimeout(() => {
          setLaunchStep(prev => prev + 1);
        }, 550);
      } else {
        // Final launch step reached -> short pause then navigate to live mission
        timer = setTimeout(() => {
          setIsLaunching(false);
          setLaunchStep(0);
          onLaunchSuccess();
        }, 800);
      }
    }
    return () => clearTimeout(timer);
  }, [isLaunching, launchStep]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsLaunching(true);
    setLaunchStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070909]/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#111516] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#63C174] shadow-[0_0_20px_#63C174]"></div>

        {!isLaunching ? (
          // 1. Initial Confirmation Review State
          <div className="space-y-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#63C174]/15 border border-[#63C174]/30 flex items-center justify-center text-[#63C174]">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E8ECEF]">
                    LAUNCH MISSION?
                  </h3>
                  <span className="text-[9px] text-[#8B949E]">
                    AERIS-01 AUTONOMOUS DEPLOYMENT
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#8B949E] hover:text-[#E8ECEF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mission Configuration Summary Grid */}
            <div className="p-3 rounded-xl bg-[#181D1E] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#8B949E]">DRONE UNIT:</span>
                <strong className="text-[#3B9EFF]">{plan.droneId}</strong>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#8B949E]">MISSION NAME:</span>
                <strong className="text-[#E8ECEF]">{plan.missionName}</strong>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#8B949E]">TOTAL DISTANCE:</span>
                <strong className="text-[#E8ECEF]">{plan.metrics.totalDistanceKm} km</strong>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#8B949E]">ESTIMATED DURATION:</span>
                <strong className="text-[#E8ECEF]">{plan.metrics.estimatedDurationMin} min</strong>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#8B949E]">STARTING BATTERY:</span>
                <strong className="text-[#63C174]">{plan.metrics.startingBatteryPercent}%</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8B949E]">AUTONOMY LEVEL:</span>
                <strong className="text-[#3B9EFF]">{plan.autonomyMode.replace('_', ' ')}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#181D1E] hover:bg-[#1C2125] text-[#8B949E] hover:text-[#E8ECEF] font-bold text-xs border border-white/10 transition-colors"
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#63C174] hover:bg-[#52a862] text-black font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_16px_rgba(99,193,116,0.4)] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>CONFIRM & LAUNCH</span>
              </button>
            </div>
          </div>
        ) : (
          // 2. Pre-Flight Sensor & Route Arming Sequence Animation
          <div className="space-y-4 font-mono text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-[#63C174]/15 border border-[#63C174]/40 flex items-center justify-center text-[#63C174] mx-auto animate-pulse">
              <Navigation className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#E8ECEF]">
                ARMING AERIS-01 AUTONOMOUS MISSION
              </h3>
              <p className="text-[10px] text-[#8B949E] mt-0.5">
                Executing pre-flight sensor & communication verification...
              </p>
            </div>

            {/* Animated Step-by-Step Sequence */}
            <div className="space-y-1.5 text-left p-3 rounded-xl bg-[#181D1E] border border-white/5 text-[10.5px]">
              {launchSteps.map((step, idx) => {
                const isPassed = idx < launchStep;
                const isCurrent = idx === launchStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between transition-all ${
                      isPassed
                        ? 'text-[#63C174]'
                        : isCurrent
                          ? 'text-[#3B9EFF] font-bold animate-pulse'
                          : 'text-[#8B949E]/40'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current"></span>
                      {step.label}
                    </span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-[#3B9EFF] animate-pulse flex items-center justify-center space-x-1">
              <span>REDIRECTING TO LIVE MISSION DASHBOARD</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
