import React, { useState } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  ShieldAlert, 
  Sliders, 
  Check, 
  X,
  Activity
} from 'lucide-react';

export default function TimelineAndControls({ 
  events = [], 
  onActionTrigger, 
  isOffline, 
  onToggleOffline 
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const handlePauseResume = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    if (onActionTrigger) onActionTrigger(nextState ? 'PAUSE_MISSION' : 'RESUME_MISSION');
  };

  const handleBacktrack = () => {
    if (onToggleOffline) onToggleOffline(true);
    if (onActionTrigger) onActionTrigger('INITIATE_BACKTRACK');
  };

  const handleRTL = () => {
    if (onActionTrigger) onActionTrigger('RETURN_TO_BASE');
  };

  const handleConfirmOverride = () => {
    if (onActionTrigger) onActionTrigger('MANUAL_OVERRIDE_ACTIVE');
    setShowOverrideModal(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 w-full h-full select-none font-sans">
      {/* 1. Left (8 Cols): System Event Timeline */}
      <div className="md:col-span-8 bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5 shrink-0">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-[#3B9EFF]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              System Events Timeline
            </h3>
          </div>
          <span className="text-[9px] font-mono text-[#8B949E]">
            REAL-TIME LOG
          </span>
        </div>

        {/* Scrollable Timeline Stream */}
        <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 min-h-0">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-[#181D1E] border border-white/5 flex items-center justify-between font-mono text-[10px] hover:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  evt.color === 'red' ? 'bg-[#FF4D3D] shadow-[0_0_6px_#FF4D3D]' :
                  evt.color === 'amber' ? 'bg-[#F5A623] shadow-[0_0_6px_#F5A623]' :
                  evt.color === 'green' ? 'bg-[#63C174] shadow-[0_0_6px_#63C174]' :
                  'bg-[#3B9EFF]'
                }`}></span>
                <span className="text-[9px] font-bold text-[#8B949E] shrink-0">
                  [{evt.category}]
                </span>
                <span className="text-[#E8ECEF] font-sans truncate text-[10.5px]">
                  {evt.text}
                </span>
              </div>

              <span className="text-[9px] text-[#8B949E] shrink-0 font-mono">
                {evt.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Right (4 Cols): Mission Command Controls */}
      <div className="md:col-span-4 bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        <div>
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2 shrink-0">
            <div className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#3B9EFF]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
                Mission Control
              </h3>
            </div>
            <span className="text-[8.5px] font-mono text-[#3B9EFF]">CMD-01</span>
          </div>

          {/* 4 Action Command Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono mb-2">
            {/* Pause / Resume */}
            <button
              onClick={handlePauseResume}
              className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1 font-bold transition-all ${
                isPaused
                  ? 'bg-[#63C174]/20 text-[#63C174] border-[#63C174]/50'
                  : 'bg-[#181D1E] hover:bg-[#1C2125] text-[#F5A623] border-white/5 hover:border-[#F5A623]/40'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>

            {/* Initiate Backtrack */}
            <button
              onClick={handleBacktrack}
              className="py-2 px-2 rounded-xl bg-[#181D1E] hover:bg-[#1C2125] text-[#F5A623] border border-white/5 hover:border-[#F5A623]/40 flex items-center justify-center space-x-1 font-bold transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>BACKTRACK</span>
            </button>

            {/* Return to Base (RTL) */}
            <button
              onClick={handleRTL}
              className="py-2 px-2 rounded-xl bg-[#181D1E] hover:bg-[#1C2125] text-[#3B9EFF] border border-white/5 hover:border-[#3B9EFF]/40 flex items-center justify-center space-x-1 font-bold transition-all col-span-2"
            >
              <Home className="w-3 h-3" />
              <span>RETURN TO BASE (RTL)</span>
            </button>
          </div>
        </div>

        {/* Emergency Manual Override Button */}
        <div>
          <button
            onClick={() => setShowOverrideModal(true)}
            className="w-full py-2 px-2 rounded-xl bg-[#FF4D3D]/20 hover:bg-[#FF4D3D]/30 text-[#FF4D3D] border border-[#FF4D3D]/40 font-mono text-[10px] font-bold flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(255,77,61,0.2)]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>EMERGENCY MANUAL OVERRIDE</span>
          </button>
        </div>

        {/* Confirmation Modal Overlay */}
        {showOverrideModal && (
          <div className="absolute inset-0 bg-[#070909]/95 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between z-30 border border-[#FF4D3D]/50 shadow-2xl">
            <div>
              <div className="flex items-center space-x-1.5 text-[#FF4D3D] font-mono font-bold text-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MANUAL OVERRIDE?</span>
              </div>
              <p className="text-[10px] text-[#A0AAB0] font-sans mt-1 leading-tight">
                This action will temporarily disable autonomous mission execution. The operator will assume direct joystick control of AERIS-01.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="flex-1 py-1.5 rounded-lg bg-[#181D1E] text-[#8B949E] hover:text-[#E8ECEF] font-mono text-[10px] border border-white/10"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmOverride}
                className="flex-1 py-1.5 rounded-lg bg-[#FF4D3D] hover:bg-red-600 text-white font-mono text-[10px] font-bold shadow-lg"
              >
                CONFIRM OVERRIDE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
