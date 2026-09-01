import React from 'react';
import { 
  Play, 
  RotateCcw, 
  Radio, 
  HardDrive, 
  CheckCircle2, 
  Sliders, 
  FastForward,
  Pause
} from 'lucide-react';

export default function SimulationControls({ 
  currentStage, 
  onSetStage, 
  onPlayFullDemo, 
  isPlayingDemo 
}) {
  const stageButtons = [
    { id: 'CONNECTED', label: '1. CONNECTED', color: 'text-[#63C174]' },
    { id: 'SIGNAL_LOST', label: '2. SIGNAL LOSS', color: 'text-[#FF4D3D]' },
    { id: 'OFFLINE_AUTONOMY', label: '3. OFFLINE AI', color: 'text-[#A78BFA]' },
    { id: 'BACKTRACKING', label: '4. BACKTRACK', color: 'text-[#F5A623]' },
    { id: 'RECONNECTED', label: '5. RECONNECT', color: 'text-[#63C174]' },
    { id: 'DATA_SYNC', label: '6. SYNC DATA', color: 'text-[#3B9EFF]' },
    { id: 'MISSION_RESUMED', label: '7. RESUME', color: 'text-[#63C174]' },
  ];

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* Header & Full Auto-Play Demo CTA */}
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5 shrink-0">
        <div className="flex items-center space-x-2">
          <Sliders className="w-3.5 h-3.5 text-[#3B9EFF]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Simulation Controls
          </h3>
        </div>

        {/* Master Full Demo Action Button */}
        <button
          onClick={onPlayFullDemo}
          className={`px-3 py-1 rounded-xl font-mono text-[10px] font-bold flex items-center space-x-1.5 transition-all shadow-lg ${
            isPlayingDemo
              ? 'bg-[#F5A623] text-black animate-pulse'
              : 'bg-[#63C174] hover:bg-[#52a862] text-black shadow-[0_0_12px_rgba(99,193,116,0.4)]'
          }`}
        >
          {isPlayingDemo ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlayingDemo ? 'PLAYING DEMO...' : '▶ PLAY FULL RECOVERY DEMO'}</span>
        </button>
      </div>

      {/* Discrete Step Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 text-[9px] font-mono">
        <button
          onClick={() => onSetStage('CONNECTED')}
          className="p-1.5 rounded-lg bg-[#181D1E] hover:bg-[#1C2125] text-[#8B949E] hover:text-[#E8ECEF] border border-white/5 transition-colors text-center"
        >
          RESET
        </button>

        {stageButtons.map((btn) => {
          const isActive = currentStage === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => onSetStage(btn.id)}
              className={`p-1.5 rounded-lg border transition-all text-center font-semibold ${
                isActive
                  ? 'bg-[#1C2125] text-white border-white/30 shadow-sm font-bold'
                  : 'bg-[#181D1E] hover:bg-[#1C2125] text-[#8B949E] border-white/5'
              }`}
            >
              <span className={btn.color}>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
