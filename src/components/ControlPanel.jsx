import React, { useState } from 'react';
import { 
  Sliders, 
  Home, 
  Pause, 
  Play, 
  AlertOctagon, 
  Radio, 
  Package, 
  Compass, 
  ShieldAlert, 
  Check, 
  RotateCcw
} from 'lucide-react';

export default function ControlPanel({ onCommandTrigger }) {
  const [flightMode, setFlightMode] = useState('AUTO_MISSION');
  const [lastCommand, setLastCommand] = useState(null);
  const [isEmergencyArmed, setIsEmergencyArmed] = useState(false);

  const handleCommand = (cmdName, description) => {
    setLastCommand({ name: cmdName, time: new Date().toLocaleTimeString() });
    if (onCommandTrigger) {
      onCommandTrigger(cmdName);
    }
  };

  return (
    <div className="bg-aeris-panel border border-aeris-border rounded-md flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-aeris-panelHeader border-b border-aeris-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-aeris-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Tactical Flight Control
          </h2>
        </div>
        <span className="text-[10px] font-mono text-aeris-cyan bg-aeris-surface px-1.5 py-0.5 rounded border border-aeris-border">
          AUTH: COMMANDER-01
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto font-mono">
        {/* Flight Mode Select */}
        <div>
          <label className="text-[11px] text-aeris-textSecondary block mb-1.5">FLIGHT CONTROL MODE</label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { id: 'AUTO_MISSION', label: 'AUTO' },
              { id: 'GUIDED', label: 'GUIDED' },
              { id: 'MANUAL', label: 'MANUAL' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setFlightMode(mode.id);
                  handleCommand(`SET_MODE_${mode.id}`, `Switched mode to ${mode.id}`);
                }}
                className={`py-1.5 px-2 rounded border text-center font-bold transition-colors ${
                  flightMode === mode.id
                    ? 'bg-aeris-cyan/20 text-aeris-cyan border-aeris-cyan shadow-sm'
                    : 'bg-aeris-surface text-aeris-textSecondary border-aeris-border hover:bg-aeris-surfaceHover'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-aeris-textSecondary block mb-1">QUICK ACTIONS</label>
          
          <div className="grid grid-cols-2 gap-2">
            {/* RTL Button */}
            <button
              onClick={() => handleCommand('RTL', 'Initiated Return to Launch')}
              className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textPrimary border border-aeris-border hover:border-aeris-cyan/50 rounded flex items-center justify-center space-x-1.5 text-xs font-bold transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-aeris-cyan" />
              <span>RTL (RETURN)</span>
            </button>

            {/* Loiter / Hold */}
            <button
              onClick={() => handleCommand('LOITER', 'Holding Position / Loiter')}
              className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textPrimary border border-aeris-border hover:border-aeris-warning/50 rounded flex items-center justify-center space-x-1.5 text-xs font-bold transition-colors"
            >
              <Pause className="w-3.5 h-3.5 text-aeris-warning" />
              <span>LOITER / HOLD</span>
            </button>

            {/* Resume Mission Grid */}
            <button
              onClick={() => handleCommand('RESUME_SEARCH', 'Resumed Search Grid Pattern')}
              className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textPrimary border border-aeris-border hover:border-aeris-success/50 rounded flex items-center justify-center space-x-1.5 text-xs font-bold transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-aeris-success" />
              <span>RESUME GRID</span>
            </button>

            {/* Deploy Beacon / Payload */}
            <button
              onClick={() => handleCommand('DEPLOY_BEACON', 'Emergency Beacon Deployed')}
              className="py-2 px-2.5 bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textPrimary border border-aeris-border hover:border-aeris-blueLight/50 rounded flex items-center justify-center space-x-1.5 text-xs font-bold transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-aeris-blueLight" />
              <span>RELEASE PAYLOAD</span>
            </button>
          </div>
        </div>

        {/* Guarded Emergency Land / Kill Switch */}
        <div className="pt-1">
          <div className="bg-aeris-danger/10 border border-aeris-danger/30 rounded p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-aeris-danger font-bold uppercase flex items-center">
                <ShieldAlert className="w-3 h-3 mr-1" />
                Emergency Flight Termination
              </span>
              <button
                onClick={() => setIsEmergencyArmed(!isEmergencyArmed)}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                  isEmergencyArmed
                    ? 'bg-aeris-danger text-white border-aeris-danger font-bold'
                    : 'bg-aeris-surface text-aeris-textSecondary border-aeris-border'
                }`}
              >
                {isEmergencyArmed ? 'ARMED' : 'DISARMED'}
              </button>
            </div>

            <button
              disabled={!isEmergencyArmed}
              onClick={() => handleCommand('EMERGENCY_LAND', 'EMERGENCY IMMEDIATE LAND EXECUTED')}
              className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                isEmergencyArmed
                  ? 'bg-aeris-danger hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-950/50'
                  : 'bg-aeris-surface text-aeris-textMuted border border-aeris-border cursor-not-allowed opacity-50'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>EMERGENCY IMMEDIATE LAND</span>
            </button>
          </div>
        </div>

        {/* Command Log Feedback */}
        {lastCommand && (
          <div className="bg-aeris-surface rounded p-2 border border-aeris-border text-[10px] flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-aeris-cyan truncate">
              <Check className="w-3 h-3 text-aeris-success shrink-0" />
              <span className="truncate">CMD ACK: {lastCommand.name}</span>
            </div>
            <span className="text-aeris-textMuted shrink-0">{lastCommand.time}</span>
          </div>
        )}
      </div>
    </div>
  );
}
