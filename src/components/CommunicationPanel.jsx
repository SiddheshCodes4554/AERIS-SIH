import React from 'react';
import { 
  Radio, 
  Wifi, 
  HardDrive, 
  RotateCcw
} from 'lucide-react';

export default function CommunicationPanel({ commData, isOfflineMode, onToggleOffline }) {
  const current = isOfflineMode ? commData.offlineBacktrack : commData.normal;

  return (
    <div className="w-full h-full aeris-panel-container p-3 select-none font-sans flex flex-col justify-between overflow-hidden">
      {/* 1. Header & State Badge */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1.5 mb-2">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Communication & Link
            </h2>
          </div>

          <span className={`inline-flex items-center px-1.5 py-0.2 rounded-pill text-[9px] font-mono font-bold border ${
            isOfflineMode
              ? 'bg-aeris-amber/20 text-aeris-amber border-aeris-amber/40 shadow-glow-amber animate-pulse'
              : 'bg-aeris-green/20 text-aeris-green border-aeris-green/40 shadow-glow-green'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
              isOfflineMode ? 'bg-aeris-amber' : 'bg-aeris-green'
            }`}></span>
            {isOfflineMode ? 'SIGNAL LOST • OFFLINE' : 'CONNECTED'}
          </span>
        </div>

        {/* 2. Link Parameters Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono mb-2">
          <div className="aeris-surface-card p-1.5">
            <span className="text-[8.5px] text-aeris-textMuted block">RF GROUND LINK</span>
            <span className={`font-semibold ${isOfflineMode ? 'text-aeris-red' : 'text-aeris-green'}`}>
              {isOfflineMode ? 'LOST (0 Mbps)' : 'ACTIVE (48M)'}
            </span>
          </div>

          <div className="aeris-surface-card p-1.5">
            <span className="text-[8.5px] text-aeris-textMuted block">LAST LINK CP</span>
            <span className="text-aeris-cyan font-semibold">
              {current.lastConnectedCp} (92%)
            </span>
          </div>

          <div className="aeris-surface-card p-1.5">
            <span className="text-[8.5px] text-aeris-textMuted block">BUFFERED DATA</span>
            <span className={`font-semibold ${isOfflineMode ? 'text-aeris-amber' : 'text-aeris-textSecondary'}`}>
              {isOfflineMode ? '5 EVENTS' : '0 (SYNCED)'}
            </span>
          </div>

          <div className="aeris-surface-card p-1.5">
            <span className="text-[8.5px] text-aeris-textMuted block">SIGNAL STRENGTH</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className={`font-bold text-[10px] ${isOfflineMode ? 'text-aeris-red' : 'text-aeris-green'}`}>
                {isOfflineMode ? '0%' : '88%'}
              </span>
              <div className="flex-1 bg-[#0B0E0F] h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${isOfflineMode ? 'bg-aeris-red' : 'bg-aeris-green'}`} 
                  style={{ width: `${isOfflineMode ? 0 : 88}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Autonomous Backtracking Status & Sequence */}
      <div className={`p-2 rounded-card border font-mono transition-all ${
        isOfflineMode 
          ? 'bg-aeris-amber/10 border-aeris-amber/40 shadow-sm' 
          : 'bg-aeris-surface border-aeris-border'
      }`}>
        <div className="flex items-center justify-between text-[9px] mb-1">
          <span className="text-aeris-textSecondary font-semibold uppercase flex items-center">
            <RotateCcw className={`w-2.5 h-2.5 mr-1 ${isOfflineMode ? 'text-aeris-amber animate-spin' : 'text-aeris-textMuted'}`} />
            {isOfflineMode ? 'AUTONOMOUS BACKTRACKING' : 'OFFLINE BACKTRACK LOGIC'}
          </span>
          {isOfflineMode && (
            <span className="text-aeris-amber font-bold">72%</span>
          )}
        </div>

        {/* Horizontal Sequence Flow */}
        <div className="flex items-center justify-between text-[7.5px] text-aeris-textMuted pt-0.5 border-t border-white/5">
          <span className={isOfflineMode ? 'text-aeris-amber font-bold' : 'text-aeris-green'}>
            SIGNAL LOST
          </span>
          <span>→</span>
          <span className={isOfflineMode ? 'text-aeris-cyan font-bold' : ''}>
            EDGE AI
          </span>
          <span>→</span>
          <span className={isOfflineMode ? 'text-aeris-amber font-bold animate-pulse' : ''}>
            BACKTRACK
          </span>
          <span>→</span>
          <span>RECONNECT</span>
          <span>→</span>
          <span>SYNC</span>
        </div>
      </div>
    </div>
  );
}
