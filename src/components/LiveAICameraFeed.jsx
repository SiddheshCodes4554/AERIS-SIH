import React, { useState } from 'react';
import { 
  Video, 
  Flame, 
  Sparkles, 
  Disc, 
  Camera, 
  Crosshair, 
  Maximize2,
  Layers,
  Cpu
} from 'lucide-react';

export default function LiveAICameraFeed({ missionState }) {
  const [feedMode, setFeedMode] = useState('AI_OVERLAY'); // 'RGB' | 'THERMAL' | 'AI_OVERLAY'
  const [isRecording, setIsRecording] = useState(true);

  return (
    <div className="w-full h-full aeris-panel-container p-3 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Header & Live Status */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1.5 mb-2">
          <div className="flex items-center space-x-1.5">
            <Video className="w-3.5 h-3.5 text-aeris-cyan" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Live AI Camera
            </h2>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="flex items-center text-aeris-red font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-aeris-red/15 border border-aeris-red/30">
              <span className="w-1.5 h-1.5 rounded-full bg-aeris-red mr-1 animate-pulse"></span>
              LIVE
            </span>
          </div>
        </div>

        {/* 2. Mode Switcher Tabs: [ RGB ] [ THERMAL ] [ AI OVERLAY ] */}
        <div className="flex space-x-1 p-0.5 bg-aeris-surface rounded-card border border-aeris-border mb-2 text-[10px] font-mono">
          {[
            { id: 'RGB', label: 'RGB' },
            { id: 'THERMAL', label: 'THERMAL' },
            { id: 'AI_OVERLAY', label: 'AI OVERLAY' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFeedMode(tab.id)}
              className={`flex-1 py-1 rounded text-center font-semibold transition-all ${
                feedMode === tab.id
                  ? 'bg-aeris-surfaceHover text-aeris-cyan border border-aeris-cyan/30 shadow-sm'
                  : 'text-aeris-textSecondary hover:text-aeris-textPrimary border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Drone Camera Feed Visual Canvas */}
      <div className="flex-1 relative bg-[#06090B] rounded-card overflow-hidden border border-white/10 flex flex-col justify-between p-2.5 min-h-0">
        {/* Synthetic Graphic Rendering based on Mode */}
        {feedMode === 'THERMAL' ? (
          // Thermal Ironbow Radiometric View
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050014] via-[#3a084c] to-[#d65100] opacity-85"></div>
        ) : (
          // RGB & AI Overlay Optical View
          <>
            <div className="absolute inset-0 bg-[radial-gradient(#1a2634_1px,transparent_1px)] [background-size:14px_14px] opacity-40"></div>
            {/* Flooded River Basin Graphic Simulation */}
            <div className="absolute w-[180%] h-32 bg-[#092032]/70 -rotate-12 top-6 blur-[2px]"></div>
            <div className="absolute w-28 h-20 bg-[#16212b]/80 top-12 left-16 border border-white/5 rounded-sm"></div>
          </>
        )}

        {/* Top HUD Telemetry Overlay */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-white/90 drop-shadow">
          <div className="bg-black/60 px-2 py-0.5 rounded border border-white/10 flex items-center space-x-1.5">
            <span>CAM-01</span>
            <span className="text-white/40">|</span>
            <span>ALT {missionState.altitude}m</span>
            <span className="text-white/40">|</span>
            <span>SPD {missionState.speed}m/s</span>
          </div>

          <div className="bg-black/60 px-2 py-0.5 rounded border border-white/10 text-aeris-green">
            GPS ACTIVE
          </div>
        </div>

        {/* Center Detections Visual Overlays */}
        <div className="relative z-10 flex items-center justify-center pointer-events-none h-full">
          {/* Thermal Signature in Thermal Mode */}
          {feedMode === 'THERMAL' && (
            <>
              <div className="absolute top-6 left-[35%] w-16 h-20 bg-gradient-to-r from-yellow-300 to-white rounded-full blur-md opacity-90 animate-pulse"></div>
              <div className="absolute top-2 left-[30%] bg-black/80 text-yellow-300 border border-yellow-400 font-mono text-[8px] px-1 py-0.2 rounded font-bold">
                PERSON • 37.1°C
              </div>

              {/* Fire Hotspot */}
              <div className="absolute bottom-4 right-[15%] w-14 h-14 bg-gradient-to-r from-red-600 to-yellow-400 rounded-full blur-md opacity-90"></div>
              <div className="absolute bottom-14 right-[10%] bg-black/80 text-aeris-red border border-red-500 font-mono text-[8px] px-1 py-0.2 rounded font-bold">
                FIRE • 385°C
              </div>

              {/* Vertical Thermal Scale */}
              <div className="absolute right-2 top-8 bottom-8 w-2.5 bg-gradient-to-b from-white via-yellow-400 via-red-600 via-purple-900 to-black rounded border border-white/20 flex flex-col justify-between text-[6px] font-mono text-white px-0.5">
                <span>HOT</span>
                <span>MED</span>
                <span>COLD</span>
              </div>
            </>
          )}

          {/* YOLO AI Detection Bounding Boxes in AI_OVERLAY mode */}
          {feedMode === 'AI_OVERLAY' && (
            <div className="absolute top-6 left-[30%] w-32 h-28 border-2 border-aeris-green rounded bg-aeris-green/10 flex flex-col justify-between p-1 animate-pulse shadow-glow-green">
              <div className="bg-aeris-green text-black font-mono text-[8px] font-bold px-1 rounded w-fit">
                PERSON
              </div>
              <div className="text-right text-[7.5px] font-mono text-aeris-green font-bold">
                CONFIDENCE: 94%
              </div>
            </div>
          )}
        </div>

        {/* Bottom HUD Bar */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono">
          <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-aeris-textSecondary">
            REC ● LIVE • 14:32:08
          </div>

          <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-aeris-cyan">
            YOLOv8s • 32 FPS
          </div>
        </div>
      </div>

      {/* 4. Camera Control Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-aeris-border mt-2 text-[9.5px] font-mono shrink-0">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 border border-white/5 ${
              isRecording ? 'text-aeris-red bg-aeris-red/20' : 'text-aeris-textSecondary'
            }`}
          >
            <Disc className="w-2.5 h-2.5 mr-0.5" />
            <span>{isRecording ? 'REC' : 'STBY'}</span>
          </button>

          <button className="px-2 py-0.5 rounded text-aeris-textSecondary hover:text-white bg-aeris-surface border border-white/5 flex items-center">
            <Camera className="w-2.5 h-2.5 mr-0.5" />
            <span>SNAP</span>
          </button>

          <button className="px-2 py-0.5 rounded text-aeris-cyan bg-aeris-cyan/15 border border-aeris-cyan/30 flex items-center">
            <Crosshair className="w-2.5 h-2.5 mr-0.5" />
            <span>TRACK</span>
          </button>
        </div>

        <button className="px-1.5 py-0.5 text-aeris-textSecondary hover:text-white bg-aeris-surface rounded border border-white/5">
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
