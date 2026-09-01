import React, { useState } from 'react';
import { Video, Flame, Sparkles, Disc, Maximize2 } from 'lucide-react';

export default function CameraPreviewCompact() {
  const [cameraTab, setCameraTab] = useState('FUSION'); // RGB | THERMAL | FUSION

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5 shrink-0">
        <div className="flex items-center space-x-1.5">
          <Video className="w-3.5 h-3.5 text-[#3B9EFF]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Camera System
          </h3>
          <span className="text-[9px] font-mono text-[#FF4D3D] font-bold">● LIVE (CAM-01)</span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex space-x-0.5 p-0.5 bg-[#181D1E] rounded-lg border border-white/5 text-[9px] font-mono">
          {['RGB', 'THERMAL', 'FUSION'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCameraTab(tab)}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                cameraTab === tab
                  ? 'bg-[#111516] text-[#3B9EFF] border border-white/10 shadow-sm'
                  : 'text-[#8B949E] hover:text-[#E8ECEF]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Camera Feed Canvas */}
      <div className="flex-1 relative bg-[#07090B] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between p-2 min-h-0">
        {/* Dynamic Graphic Simulation */}
        {cameraTab === 'THERMAL' ? (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050014] via-[#3a084c] to-[#d65100] opacity-85"></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#092032] to-[#050C10]">
            <div className="absolute w-[180%] h-20 bg-[#124268]/50 -rotate-12 top-2 blur-[1px]"></div>
          </div>
        )}

        {/* Top Minimal Telemetry HUD */}
        <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-white/90 drop-shadow">
          <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
            CAM-01 • 1080p30
          </div>
          <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-[#63C174]">
            IR FUSION ACTIVE
          </div>
        </div>

        {/* YOLO AI Bounding Box Overlay */}
        <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
          <div className="border-2 border-[#63C174] rounded bg-[#63C174]/15 p-1 flex flex-col justify-between w-24 h-12 animate-pulse">
            <span className="text-[6.5px] font-mono bg-[#63C174] text-black font-bold px-1 rounded w-fit">
              PERSON
            </span>
            <span className="text-[6px] font-mono text-[#63C174] font-bold self-end">
              CONF: 96%
            </span>
          </div>
        </div>

        {/* Bottom Minimal HUD */}
        <div className="relative z-10 flex items-center justify-between text-[7.5px] font-mono bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-[#A0AAB0]">
          <span>GIMBAL: -35° • FOV: 84°</span>
          <span className="text-[#3B9EFF]">SECTOR B-4 OVERLOOK</span>
        </div>
      </div>
    </div>
  );
}
