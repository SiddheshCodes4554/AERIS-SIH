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
  const [lastAction, setLastAction] = useState(null);

  const handleCommand = (cmd) => {
    setLastAction(cmd);
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
    <div className="h-full aeris-panel-container p-3.5 select-none font-sans flex flex-col justify-between relative">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-aeris-cyan" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Mission Controls
            </h2>
          </div>
          <span className="text-[10px] font-mono text-aeris-cyan">
            AUTH: COMMANDER-01
          </span>
        </div>

        {/* 2. Control Grid Actions */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
          {/* Start Mission */}
          <button
            onClick={() => handleCommand('START_MISSION')}
            className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-green border border-aeris-border hover:border-aeris-green/50 rounded-card flex items-center justify-center space-x-1.5 font-bold transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START MISSION</span>
          </button>

          {/* Pause Mission */}
          <button
            onClick={() => handleCommand('PAUSE_MISSION')}
            className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-amber border border-aeris-border hover:border-aeris-amber/50 rounded-card flex items-center justify-center space-x-1.5 font-bold transition-all shadow-sm"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE MISSION</span>
          </button>

          {/* Initiate Backtrack */}
          <button
            onClick={() => handleCommand('INITIATE_BACKTRACK')}
            className={`py-2 px-2.5 border rounded-card flex items-center justify-center space-x-1.5 font-bold transition-all shadow-sm ${
              isOfflineMode
                ? 'bg-aeris-amber/20 text-aeris-amber border-aeris-amber'
                : 'bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-amber border-aeris-border hover:border-aeris-amber/50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>INITIATE BACKTRACK</span>
          </button>

          {/* Return to Base */}
          <button
            onClick={() => handleCommand('RETURN_TO_BASE')}
            className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-blue border border-aeris-border hover:border-aeris-blue/50 rounded-card flex items-center justify-center space-x-1.5 font-bold transition-all shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO BASE</span>
          </button>
        </div>
      </div>

      {/* 3. Manual Override Button (Requires Confirmation Modal) */}
      <div>
        <button
          onClick={() => setShowOverrideModal(true)}
          className="w-full py-2.5 px-3 bg-aeris-red/15 hover:bg-aeris-red/25 text-aeris-red border border-aeris-red/40 rounded-card font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-glow-red"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>EMERGENCY MANUAL OVERRIDE</span>
        </button>
      </div>

      {/* Manual Override Confirmation Modal Overlay */}
      {showOverrideModal && (
        <div className="absolute inset-0 bg-[#070909]/95 backdrop-blur-md rounded-panel p-4 flex flex-col justify-between z-20 border border-aeris-red/50 shadow-2xl">
          <div>
            <div className="flex items-center space-x-2 text-aeris-red font-mono font-bold text-xs mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>MANUAL OVERRIDE CONFIRMATION</span>
            </div>
            <p className="text-[11px] text-aeris-textSecondary font-light leading-tight mt-2">
              Are you sure you want to trigger <strong>MANUAL OVERRIDE</strong>? This will disable autonomous mission logic and switch to direct joystick control.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="flex-1 py-1.5 rounded-card bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textSecondary font-mono text-xs border border-white/10 flex items-center justify-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>CANCEL</span>
            </button>

            <button
              onClick={handleConfirmOverride}
              className="flex-1 py-1.5 rounded-card bg-aeris-red hover:bg-red-600 text-white font-mono text-xs font-bold shadow-lg shadow-red-950 flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>CONFIRM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
