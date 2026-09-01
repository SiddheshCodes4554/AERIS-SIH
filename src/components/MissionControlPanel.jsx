import React, { useState } from 'react';
import { 
  Pause, 
  Play, 
  Home, 
  MapPin, 
  ShieldAlert, 
  Check, 
  X,
  Sliders
} from 'lucide-react';

export default function MissionControlPanel({ onActionTrigger }) {
  const [isPaused, setIsPaused] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const handlePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    if (onActionTrigger) {
      onActionTrigger(nextState ? 'PAUSE_MISSION' : 'RESUME_MISSION');
    }
  };

  const handleRTL = () => {
    if (onActionTrigger) {
      onActionTrigger('RETURN_TO_BASE');
    }
  };

  const handleMarkLocation = () => {
    if (onActionTrigger) {
      onActionTrigger('MARK_LOCATION');
    }
  };

  const handleConfirmOverride = () => {
    if (onActionTrigger) {
      onActionTrigger('MANUAL_OVERRIDE_ACTIVE');
    }
    setShowOverrideModal(false);
  };

  return (
    <div className="w-full h-full aeris-panel-container p-2.5 flex flex-col justify-between select-none font-sans relative overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Mission Control
            </h2>
          </div>
          <span className="text-[8px] font-mono text-aeris-cyan">
            CMD-01
          </span>
        </div>

        {/* 3 Compact Buttons */}
        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono mb-1.5">
          <button
            onClick={handlePause}
            className={`py-1 px-1.5 rounded border transition-colors flex items-center justify-center space-x-0.5 font-bold ${
              isPaused 
                ? 'bg-aeris-green/20 text-aeris-green border-aeris-green' 
                : 'bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-amber border-aeris-border'
            }`}
          >
            {isPaused ? <Play className="w-2.5 h-2.5 fill-current mr-0.5" /> : <Pause className="w-2.5 h-2.5 fill-current mr-0.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            onClick={handleRTL}
            className="py-1 px-1.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-blue border border-aeris-border rounded flex items-center justify-center space-x-0.5 font-bold transition-colors"
          >
            <Home className="w-2.5 h-2.5 mr-0.5" />
            <span>RTL</span>
          </button>

          <button
            onClick={handleMarkLocation}
            className="py-1 px-1.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textSecondary hover:text-white border border-aeris-border rounded flex items-center justify-center space-x-0.5 font-bold transition-colors"
          >
            <MapPin className="w-2.5 h-2.5 mr-0.5 text-aeris-cyan" />
            <span>MARK</span>
          </button>
        </div>
      </div>

      {/* Emergency Manual Override Button */}
      <div>
        <button
          onClick={() => setShowOverrideModal(true)}
          className="w-full py-1 px-2 bg-aeris-red/15 hover:bg-aeris-red/25 text-aeris-red border border-aeris-red/40 rounded font-mono text-[9.5px] font-bold flex items-center justify-center space-x-1 transition-all"
        >
          <ShieldAlert className="w-3 h-3" />
          <span>MANUAL OVERRIDE</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showOverrideModal && (
        <div className="absolute inset-0 bg-[#070909]/95 backdrop-blur-md rounded-panel p-2 flex flex-col justify-between z-20 border border-aeris-red/50 shadow-2xl">
          <div>
            <div className="flex items-center space-x-1 text-aeris-red font-mono font-bold text-[10px]">
              <ShieldAlert className="w-3 h-3" />
              <span>CONFIRM OVERRIDE?</span>
            </div>
            <p className="text-[8.5px] text-aeris-textSecondary mt-0.5 leading-tight">
              Disables autonomous navigation and switches to manual operator flight.
            </p>
          </div>

          <div className="flex items-center space-x-1 pt-1">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="flex-1 py-0.5 rounded bg-aeris-surface text-aeris-textSecondary font-mono text-[9px] border border-white/10"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirmOverride}
              className="flex-1 py-0.5 rounded bg-aeris-red text-white font-mono text-[9px] font-bold"
            >
              CONFIRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
