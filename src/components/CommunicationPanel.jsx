import React from 'react';
import { 
  Radio, 
  Wifi, 
  HardDrive, 
  Cpu, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CommunicationPanel({ commData, isOfflineMode, onToggleOffline }) {
  const current = isOfflineMode ? commData.offlineBacktrack : commData.normal;

  return (
    <div className="h-full aeris-panel-container p-3.5 select-none font-sans flex flex-col justify-between">
      {/* 1. Header & State Badge */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-aeris-cyan" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Communication & Link
            </h2>
          </div>

          <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-mono font-bold border ${
            isOfflineMode
              ? 'bg-aeris-amber/20 text-aeris-amber border-aeris-amber/40 shadow-glow-amber animate-pulse'
              : 'bg-aeris-green/20 text-aeris-green border-aeris-green/40 shadow-glow-green'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              isOfflineMode ? 'bg-aeris-amber' : 'bg-aeris-green'
            }`}></span>
            {isOfflineMode ? 'SIGNAL LOST • OFFLINE' : 'NORMAL • CONNECTED'}
          </span>
        </div>

        {/* 2. Link Parameters Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2.5">
          <div className="aeris-surface-card p-2">
            <span className="text-[9.5px] text-aeris-textMuted block">GROUND RF LINK</span>
            <span className={`font-semibold ${isOfflineMode ? 'text-aeris-red' : 'text-aeris-green'}`}>
              {isOfflineMode ? 'LINK LOST (0 Mbps)' : 'ACTIVE (48.2 Mbps)'}
            </span>
          </div>

          <div className="aeris-surface-card p-2">
            <span className="text-[9.5px] text-aeris-textMuted block">LAST CONNECTED CP</span>
            <span className="text-aeris-cyan font-semibold">
              {current.lastConnectedCp} (92% RF)
            </span>
          </div>

          <div className="aeris-surface-card p-2">
            <span className="text-[9.5px] text-aeris-textMuted block">BUFFERED DATA</span>
            <span className={`font-semibold ${isOfflineMode ? 'text-aeris-amber' : 'text-aeris-textSecondary'}`}>
              {isOfflineMode ? '5 EVENTS (STORED)' : '0 EVENTS (SYNCED)'}
            </span>
          </div>

          <div className="aeris-surface-card p-2">
            <span className="text-[9.5px] text-aeris-textMuted block">SIGNAL STRENGTH</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`font-bold ${isOfflineMode ? 'text-aeris-red' : 'text-aeris-green'}`}>
                {isOfflineMode ? '0%' : '88%'}
              </span>
              <div className="flex-1 bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${isOfflineMode ? 'bg-aeris-red' : 'bg-aeris-green'}`} 
                  style={{ width: `${isOfflineMode ? 0 : 88}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Autonomous Backtracking Status & Sequence (Highlighted in Offline Mode) */}
      <div className={`p-2.5 rounded-card border font-mono transition-all ${
        isOfflineMode 
          ? 'bg-aeris-amber/10 border-aeris-amber/40 shadow-sm' 
          : 'bg-aeris-surface border-aeris-border'
      }`}>
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span className="text-aeris-textSecondary font-semibold uppercase flex items-center">
            <RotateCcw className={`w-3 h-3 mr-1 ${isOfflineMode ? 'text-aeris-amber animate-spin' : 'text-aeris-textMuted'}`} />
            {isOfflineMode ? 'AUTONOMOUS BACKTRACKING ACTIVE' : 'AERIS OFFLINE BACKTRACK LOGIC'}
          </span>
          {isOfflineMode && (
            <span className="text-aeris-amber font-bold">PROGRESS: 72%</span>
          )}
        </div>

        {/* Horizontal Sequence Flow */}
        <div className="flex items-center justify-between text-[8px] text-aeris-textMuted pt-1 border-t border-white/5">
          <span className={isOfflineMode ? 'text-aeris-amber font-bold' : 'text-aeris-green'}>
            SIGNAL LOST
          </span>
          <span>→</span>
          <span className={isOfflineMode ? 'text-aeris-cyan font-bold' : ''}>
            EDGE AI
          </span>
          <span>→</span>
          <span className={isOfflineMode ? 'text-aeris-cyan font-bold' : ''}>
            DATA BUFFER
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
