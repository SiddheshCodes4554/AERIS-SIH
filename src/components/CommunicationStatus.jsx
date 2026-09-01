import React from 'react';
import { 
  Radio, 
  Wifi, 
  Satellite, 
  Cpu, 
  Flag, 
  HardDrive, 
  CheckCircle2, 
  Zap, 
  Activity,
  Server
} from 'lucide-react';

export default function CommunicationStatus({ commStatus, missionData }) {
  const { primaryLink, satelliteLink, aiEdgeCompute, bufferedData, ros2Bridge } = commStatus;

  return (
    <div className="h-11 bg-aeris-panel border-t border-aeris-border flex items-center justify-between px-4 z-20 shrink-0 select-none text-xs font-mono">
      {/* 1. Communication Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-aeris-textSecondary">
          <Wifi className="w-4 h-4 text-aeris-cyan" />
          <span className="font-bold text-aeris-textPrimary">COMMS:</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-aeris-success font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-aeris-success mr-1 animate-pulse"></span>
            RF MESH ({primaryLink.signalStrength}%)
          </span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-textSecondary">{primaryLink.latencyMs}ms</span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-textSecondary">SAT: <span className="text-aeris-blueLight">{satelliteLink.status}</span></span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-textSecondary">ROS2 DDS: <span className="text-aeris-success font-semibold">{ros2Bridge.status}</span></span>
        </div>
      </div>

      <div className="h-5 w-[1px] bg-aeris-border hidden md:block"></div>

      {/* 2. Checkpoint Telemetry */}
      <div className="hidden md:flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-aeris-textSecondary">
          <Flag className="w-4 h-4 text-aeris-cyan" />
          <span className="font-bold text-aeris-textPrimary">CHECKPOINT:</span>
        </div>
        <div className="text-[11px] flex items-center space-x-2">
          <span className="text-aeris-cyan font-bold">
            CP-{missionData.checkpoints.current}/{missionData.checkpoints.total}
          </span>
          <span className="text-aeris-textSecondary truncate max-w-[150px]">
            ({missionData.checkpoints.currentLabel})
          </span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-textPrimary font-semibold">{missionData.progress}% DONE</span>
        </div>
      </div>

      <div className="h-5 w-[1px] bg-aeris-border hidden lg:block"></div>

      {/* 3. Buffered Data Status */}
      <div className="hidden lg:flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-aeris-textSecondary">
          <HardDrive className="w-4 h-4 text-aeris-cyan" />
          <span className="font-bold text-aeris-textPrimary">BUFFERED DATA:</span>
        </div>
        <div className="text-[11px] flex items-center space-x-2">
          <span className="text-aeris-textPrimary">{bufferedData.totalBufferedMb} MB</span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-success font-semibold">0 DROPS</span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-textSecondary">SYNC: {bufferedData.syncRate}</span>
        </div>
      </div>

      <div className="h-5 w-[1px] bg-aeris-border hidden sm:block"></div>

      {/* 4. AI Engine Status */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-aeris-textSecondary">
          <Cpu className="w-4 h-4 text-aeris-cyan" />
          <span className="font-bold text-aeris-textPrimary">AI STATUS:</span>
        </div>
        <div className="text-[11px] flex items-center space-x-2">
          <span className="text-aeris-cyan font-bold">{aiEdgeCompute.inferenceFps} FPS</span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-textSecondary">GPU {aiEdgeCompute.gpuLoad}%</span>
          <span className="text-aeris-textMuted">•</span>
          <span className="text-aeris-success font-semibold">{aiEdgeCompute.status}</span>
        </div>
      </div>
    </div>
  );
}
