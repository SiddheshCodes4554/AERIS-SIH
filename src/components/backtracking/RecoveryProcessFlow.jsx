import React from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Wifi, 
  HardDrive, 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Cpu,
  Check
} from 'lucide-react';

export default function RecoveryProcessFlow({ 
  currentStage, 
  syncProgress = 82, 
  backtrackProgress = 72 
}) {
  const steps = [
    { id: 'SIGNAL_LOST', label: 'SIGNAL LOST' },
    { id: 'OFFLINE_AUTONOMY', label: 'LOCAL AI' },
    { id: 'DATA_BUFFERING', label: 'DATA BUFFER' },
    { id: 'PATH_RECORDED', label: 'PATH LOG' },
    { id: 'BACKTRACKING', label: 'BACKTRACK' },
    { id: 'RECONNECTED', label: 'RECONNECT' },
    { id: 'DATA_SYNC', label: 'SYNC DATA' },
    { id: 'MISSION_RESUMED', label: 'RESUME' },
  ];

  const getStepStatus = (stepId) => {
    const stageOrder = [
      'CONNECTED',
      'SIGNAL_LOST',
      'OFFLINE_AUTONOMY',
      'DATA_BUFFERING',
      'PATH_RECORDED',
      'BACKTRACKING',
      'RECONNECTED',
      'DATA_SYNC',
      'MISSION_RESUMED'
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const stepIndex = stageOrder.indexOf(stepId);

    if (currentIndex > stepIndex) return 'PASSED';
    if (currentIndex === stepIndex) return 'ACTIVE';
    return 'WAITING';
  };

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* 1. Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Autonomous Recovery Pipeline
            </h2>
          </div>
          <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 font-bold">
            STAGE MONITOR
          </span>
        </div>
      </div>

      {/* 2. Step-by-Step Flow Pipeline */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-[7.5px] font-mono text-center mb-2.5">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const isPassed = status === 'PASSED';
          const isActive = status === 'ACTIVE';

          return (
            <div
              key={step.id}
              className={`p-1.5 rounded-lg border transition-all ${
                isPassed
                  ? 'bg-[#63C174]/15 border-[#63C174]/40 text-[#63C174]'
                  : isActive
                    ? 'bg-[#F5A623]/25 border-[#F5A623] text-[#F5A623] font-bold shadow-[0_0_8px_rgba(245,166,35,0.4)] animate-pulse'
                    : 'bg-[#181D1E] border-white/5 text-[#8B949E]'
              }`}
            >
              <div className="font-bold text-[8.5px] mb-0.5">
                {isPassed ? '✓' : isActive ? '●' : '○'}
              </div>
              <span className="block truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Dynamic State-Specific Card */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {currentStage === 'BACKTRACKING' ? (
          // BACKTRACKING ACTIVE STATE CARD
          <div className="p-3 rounded-xl bg-[#1C2125] border border-[#F5A623]/40 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#F5A623] font-bold text-xs flex items-center">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                AUTONOMOUS BACKTRACKING IN PROGRESS
              </span>
              <span className="text-[#F5A623] font-bold">{backtrackProgress}% COMPLETE</span>
            </div>

            {/* Backtrack Progress Bar */}
            <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#F5A623] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#F5A623]"
                style={{ width: `${backtrackProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-[#8B949E]">
              <div>TARGET: <strong className="text-[#E8ECEF]">CP-04</strong></div>
              <div>REMAINING: <strong className="text-[#3B9EFF]">420 m</strong></div>
              <div>EST TIME: <strong className="text-[#63C174]">48 sec</strong></div>
            </div>
          </div>
        ) : currentStage === 'DATA_SYNC' ? (
          // DATA SYNCHRONIZATION ACTIVE STATE CARD
          <div className="p-3 rounded-xl bg-[#1C2125] border border-[#3B9EFF]/40 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#3B9EFF] font-bold text-xs flex items-center">
                <HardDrive className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                UPLOADING BUFFERED MISSION DATA
              </span>
              <span className="text-[#3B9EFF] font-bold">{syncProgress}% SYNCED</span>
            </div>

            {/* Sync Progress Bar */}
            <div className="w-full bg-[#0B0E0F] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#3B9EFF] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#3B9EFF]"
                style={{ width: `${syncProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-[#8B949E]">
              <div>EVENTS: <strong className="text-[#E8ECEF]">5 / 5</strong></div>
              <div>IMAGES: <strong className="text-[#E8ECEF]">12 / 12</strong></div>
              <div>SAMPLES: <strong className="text-[#63C174]">248 / 248</strong></div>
            </div>
          </div>
        ) : currentStage === 'MISSION_RESUMED' ? (
          // RECOVERY SUCCESS REPORT CARD
          <div className="p-3 rounded-xl bg-[#181D1E] border border-[#63C174]/40 space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#63C174] font-bold text-xs flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                MISSION RECOVERY SUCCESSFUL
              </span>
              <span className="text-[9px] bg-[#63C174]/20 text-[#63C174] px-2 py-0.5 rounded font-bold">
                RESUMED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/5 text-[9px] text-[#8B949E]">
              <div>SIGNAL DURATION: <strong className="text-[#E8ECEF]">2m 18s</strong></div>
              <div>OFFLINE DETECTIONS: <strong className="text-[#63C174]">03</strong></div>
              <div>DATA INTEGRITY: <strong className="text-[#63C174]">100%</strong></div>
            </div>
          </div>
        ) : (
          // NORMAL CONNECTED / STANDBY STATE CARD
          <div className="p-3 rounded-xl bg-[#181D1E] border border-white/5 space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#63C174] font-bold flex items-center">
                <Wifi className="w-3.5 h-3.5 mr-1.5" />
                COMMUNICATION LINK VERIFIED
              </span>
              <span className="text-[#8B949E]">LATENCY: 42 ms</span>
            </div>
            <p className="text-[9.5px] text-[#8B949E] font-sans">
              AERIS-01 is operating autonomously under active ground station supervision. Checkpoint CP-04 is set as the recovery return anchor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
