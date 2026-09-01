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
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function LiveCameraFeeds({ fusionData }) {
  const [viewMode, setViewMode] = useState('FUSION'); // RGB | THERMAL | FUSION
  const [isRecording, setIsRecording] = useState(true);

  return (
    <div className="w-full aeris-panel-container p-4 select-none font-sans">
      {/* 1. Header & Sensor Fusion Mode Selector */}
      <div className="flex items-center justify-between border-b border-aeris-border pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-aeris-cyan" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Live Camera & AI Feed
          </h2>
          <span className="text-[10px] font-mono text-aeris-textMuted hidden sm:inline">
            (OPTICAL 4K + MLX90640 RADIOMETRIC IR)
          </span>
        </div>

        {/* View Mode Buttons: RGB, THERMAL, FUSION */}
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <button
            onClick={() => setViewMode('RGB')}
            className={`px-3 py-1 rounded-pill border transition-colors flex items-center space-x-1.5 ${
              viewMode === 'RGB'
                ? 'bg-aeris-blue/20 border-aeris-blue text-aeris-blue font-bold'
                : 'bg-aeris-surface border-aeris-border text-aeris-textSecondary hover:text-aeris-textPrimary'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>RGB</span>
          </button>

          <button
            onClick={() => setViewMode('THERMAL')}
            className={`px-3 py-1 rounded-pill border transition-colors flex items-center space-x-1.5 ${
              viewMode === 'THERMAL'
                ? 'bg-aeris-purple/25 border-aeris-purple text-aeris-purple font-bold'
                : 'bg-aeris-surface border-aeris-border text-aeris-textSecondary hover:text-aeris-textPrimary'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>THERMAL</span>
          </button>

          <button
            onClick={() => setViewMode('FUSION')}
            className={`px-3 py-1 rounded-pill border transition-colors flex items-center space-x-1.5 ${
              viewMode === 'FUSION'
                ? 'bg-aeris-cyan/20 border-aeris-cyan text-aeris-cyan font-bold shadow-sm'
                : 'bg-aeris-surface border-aeris-border text-aeris-textSecondary hover:text-aeris-textPrimary'
            }`}
          >
            <Sparkles className="w-3 h-3 text-aeris-cyan" />
            <span>FUSION</span>
          </button>
        </div>
      </div>

      {/* 2. Sensor Fusion Banner (Visible in FUSION mode) */}
      {viewMode === 'FUSION' && (
        <div className="mb-3 p-2.5 rounded-card bg-gradient-to-r from-aeris-surface to-[#121B24] border border-aeris-cyan/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-aeris-cyan animate-pulse shadow-glow-blue"></span>
            <span className="text-aeris-textPrimary font-semibold">
              SENSOR FUSION INTELLIGENCE: <span className="text-aeris-cyan">{fusionData.target}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>RGB CONF: <strong className="text-aeris-blue">{fusionData.rgbConfidence}%</strong></span>
            <span>THERMAL CONF: <strong className="text-aeris-purple">{fusionData.thermalConfidence}%</strong></span>
            <span className="px-2 py-0.5 rounded bg-aeris-green/20 text-aeris-green border border-aeris-green/40 font-bold">
              FUSED CONFIDENCE: {fusionData.fusedConfidence}%
            </span>
          </div>
        </div>
      )}

      {/* 3. Dual Camera Panels Grid (50/50 Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Left: RGB Camera Feed */}
        <div className="relative h-[220px] bg-[#05080A] rounded-card overflow-hidden border border-white/10 flex flex-col justify-between p-3">
          {/* Synthetic Disaster Environment Graphic Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#1a2634_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          {/* Simulated Flood River Stream */}
          <div className="absolute w-[180%] h-28 bg-[#0a1e2e]/60 -rotate-6 top-16 blur-[2px]"></div>

          {/* Top HUD: Live Indicator, CAM-01, FPS, Resolution */}
          <div className="relative z-10 flex items-center justify-between text-[10.5px] font-mono text-white/90 drop-shadow">
            <div className="flex items-center space-x-2 bg-black/60 px-2.5 py-1 rounded border border-white/10">
              <span className="flex items-center text-aeris-red font-bold">
                <span className="w-2 h-2 rounded-full bg-aeris-red mr-1.5 animate-pulse"></span>
                LIVE
              </span>
              <span className="text-white/40">|</span>
              <span>CAM-01 (EO 4K)</span>
              <span className="text-white/40">|</span>
              <span className="text-aeris-cyan">60 FPS</span>
            </div>

            <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-aeris-textSecondary">
              FOV: 84° • GIMBAL -35°
            </div>
          </div>

          {/* YOLO AI Detection Bounding Box on RGB Feed */}
          <div className="relative z-10 flex items-center justify-center pointer-events-none">
            {/* Person Bounding Box */}
            <div className="absolute top-1 left-[36%] w-28 h-28 border-2 border-aeris-green rounded-sm bg-aeris-green/10 flex flex-col justify-between p-1 animate-pulse">
              <span className="text-[9px] font-mono bg-aeris-green text-black font-bold px-1 rounded w-fit">
                PERSON 96%
              </span>
              <span className="text-[8px] font-mono text-aeris-green font-bold self-end">
                SECTOR B-3
              </span>
            </div>
          </div>

          {/* Bottom Overlay: Minimal Camera Controls */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center space-x-1.5 bg-black/60 p-1 rounded border border-white/10">
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 ${
                  isRecording ? 'text-aeris-red bg-aeris-red/20' : 'text-aeris-textSecondary'
                }`}
              >
                <Disc className="w-3 h-3 mr-1" />
                <span>{isRecording ? 'REC' : 'STANDBY'}</span>
              </button>

              <button className="px-2 py-0.5 rounded text-aeris-textSecondary hover:text-white transition-colors flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                <span>SNAP</span>
              </button>

              <button className="px-2 py-0.5 rounded text-aeris-cyan bg-aeris-cyan/15 flex items-center">
                <Crosshair className="w-3 h-3 mr-1" />
                <span>TRACK</span>
              </button>
            </div>

            <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-aeris-textSecondary">
              AI INFERENCE: 28.5 FPS
            </div>
          </div>
        </div>

        {/* Right: MLX90640 Thermal Camera Feed */}
        <div className="relative h-[220px] bg-[#0A0414] rounded-card overflow-hidden border border-white/10 flex flex-col justify-between p-3">
          {/* Realistic Ironbow / Radiometric Thermal False-Color Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050014] via-[#3a084c] to-[#d65100] opacity-85"></div>

          {/* Top HUD: Thermal Sensor Status */}
          <div className="relative z-10 flex items-center justify-between text-[10.5px] font-mono text-white/90 drop-shadow">
            <div className="flex items-center space-x-2 bg-black/60 px-2.5 py-1 rounded border border-white/10">
              <span className="flex items-center text-aeris-purple font-bold">
                <Flame className="w-3.5 h-3.5 mr-1 text-aeris-purple" />
                THERMAL VIEW
              </span>
              <span className="text-white/40">|</span>
              <span>MLX90640 (32x24 IR)</span>
            </div>

            <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-aeris-green">
              SENSOR ACTIVE
            </div>
          </div>

          {/* Detected Heat Signatures (Human body in white/yellow, fire hotspot in orange/red) */}
          <div className="relative z-10 flex items-center justify-center pointer-events-none">
            {/* Human Thermal Hotspot */}
            <div className="absolute top-2 left-[38%] w-16 h-20 bg-gradient-to-r from-yellow-300 to-white rounded-full blur-md opacity-90 animate-pulse"></div>
            
            <div className="absolute top-0 left-[36%] bg-black/70 text-yellow-300 border border-yellow-400 font-mono text-[9px] px-1 py-0.2 rounded">
              PERSON 94% • 36.8°C
            </div>

            {/* Fire Hotspot on Right */}
            <div className="absolute bottom-2 right-[20%] w-14 h-14 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300 rounded-full blur-lg opacity-85"></div>
            <div className="absolute bottom-16 right-[15%] bg-black/70 text-aeris-red border border-red-500 font-mono text-[9px] px-1 py-0.2 rounded">
              FIRE 92% • 385°C
            </div>
          </div>

          {/* Vertical Thermal Color Scale on Far Right */}
          <div className="absolute right-3 top-10 bottom-10 w-3 bg-gradient-to-b from-white via-yellow-400 via-red-600 via-purple-900 to-black rounded border border-white/20 flex flex-col justify-between text-[7px] font-mono text-white px-0.5 z-10">
            <span>HOT</span>
            <span>WARM</span>
            <span>COOL</span>
          </div>

          {/* Bottom Overlay: Radiometric Range */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
            <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-aeris-textSecondary">
              RANGE: -40°C ~ +400°C
            </div>

            <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-yellow-300 mr-5">
              MAX HEAT: 385°C (Sector C-2)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
