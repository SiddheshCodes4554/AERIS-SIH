import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  ShieldAlert, 
  Sliders,
  Check,
  X
} from 'lucide-react';

export default function MissionControls({ 
  onActionTrigger, 
  isOfflineMode, 
  onToggleOffline 
}) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const handleCommand = (cmd) => {
    if (cmd === 'INITIATE_BACKTRACK') {
      onToggleOffline(true);
    }
    if (onActionTrigger) {
      onActionTrigger(cmd);
    }
  };

  const handleConfirmOverride = () => {
    handleCommand('MANUAL_OVERRIDE_ACTIVE');
    setShowOverrideModal(false);
  };

  return (
    <div className="w-full h-full aeris-panel-container p-2.5 select-none font-sans flex flex-col justify-between relative overflow-hidden">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Mission Controls
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-aeris-cyan">
            AUTH: CMD-01
          </span>
        </div>

        {/* 2. Control Grid Actions */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono mb-1.5">
          {/* Start Mission */}
          <button
            onClick={() => handleCommand('START_MISSION')}
            className="py-1 px-2 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-green border border-aeris-border hover:border-aeris-green/50 rounded-card flex items-center justify-center space-x-1 font-bold transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>START</span>
          </button>

          {/* Pause Mission */}
          <button
            onClick={() => handleCommand('PAUSE_MISSION')}
            className="py-1 px-2 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-amber border border-aeris-border hover:border-aeris-amber/50 rounded-card flex items-center justify-center space-x-1 font-bold transition-all"
          >
            <Pause className="w-3 h-3 fill-current" />
            <span>PAUSE</span>
          </button>

          {/* Initiate Backtrack */}
          <button
            onClick={() => handleCommand('INITIATE_BACKTRACK')}
            className={`py-1 px-2 border rounded-card flex items-center justify-center space-x-1 font-bold transition-all ${
              isOfflineMode
                ? 'bg-aeris-amber/20 text-aeris-amber border-aeris-amber'
                : 'bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-amber border-aeris-border hover:border-aeris-amber/50'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>BACKTRACK</span>
          </button>

          {/* Return to Base */}
          <button
            onClick={() => handleCommand('RETURN_TO_BASE')}
            className="py-1 px-2 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-blue border border-aeris-border hover:border-aeris-blue/50 rounded-card flex items-center justify-center space-x-1 font-bold transition-all"
          >
            <Home className="w-3 h-3" />
            <span>RTL BASE</span>
          </button>
        </div>
      </div>

      {/* 3. Manual Override Button */}
      <div>
        <button
          onClick={() => setShowOverrideModal(true)}
          className="w-full py-1.5 px-2 bg-aeris-red/15 hover:bg-aeris-red/25 text-aeris-red border border-aeris-red/40 rounded-card font-mono text-[10.5px] font-bold flex items-center justify-center space-x-1.5 transition-all shadow-glow-red"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>MANUAL OVERRIDE</span>
        </button>
      </div>

      {/* Manual Override Confirmation Modal Overlay */}
      {showOverrideModal && (
        <div className="absolute inset-0 bg-[#070909]/95 backdrop-blur-md rounded-panel p-3 flex flex-col justify-between z-20 border border-aeris-red/50 shadow-2xl">
          <div>
            <div className="flex items-center space-x-1.5 text-aeris-red font-mono font-bold text-[10.5px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>MANUAL OVERRIDE CONFIRMATION</span>
            </div>
            <p className="text-[9.5px] text-aeris-textSecondary font-light leading-tight mt-1">
              Disable autonomous mission logic & switch to direct joystick control?
            </p>
          </div>

          <div className="flex items-center space-x-1.5 pt-1">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="flex-1 py-1 rounded-card bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textSecondary font-mono text-[10px] border border-white/10 flex items-center justify-center space-x-0.5"
            >
              <X className="w-3 h-3" />
              <span>CANCEL</span>
            </button>

            <button
              onClick={handleConfirmOverride}
              className="flex-1 py-1 rounded-card bg-aeris-red hover:bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center space-x-0.5"
            >
              <Check className="w-3 h-3" />
              <span>CONFIRM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
