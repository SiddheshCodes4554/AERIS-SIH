import React from 'react';
import { Video, Maximize2, Crosshair, Wifi, Disc } from 'lucide-react';

export default function LiveVisionIntelligence({ streams = [] }) {
  return (
    <div className="w-full bg-[#15191C] border border-white/5 rounded-2xl p-3.5 select-none font-sans shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-[#3B9EFF]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Live Vision Intelligence
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#8B949E]">
          3 ACTIVE EO/IR CAMERAS
        </span>
      </div>

      {/* 3 Camera Feed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="bg-[#181D20] border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-white/15 transition-all shadow-lg"
          >
            {/* Top Minimal Strip: LIVE ● | Camera Label | GPS */}
            <div className="px-2.5 py-1 bg-[#131719] border-b border-white/5 flex items-center justify-between text-[9.5px] font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="flex items-center text-[#FF4D3D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D3D] mr-1 animate-pulse"></span>
                  LIVE
                </span>
                <span className="text-white/40">|</span>
                <span className="text-[#E8ECEF] font-bold">{stream.droneId}</span>
              </div>
              <span className="text-[#8B949E]">{stream.cameraLabel}</span>
            </div>

            {/* Simulated Drone Aerial Canvas (16:9) */}
            <div className="relative aspect-video bg-[#07090B] overflow-hidden flex flex-col justify-between p-2">
              {/* Dynamic Synthetic Visual Backdrop */}
              {stream.streamType === 'THERMAL_FIRE' ? (
                // Thermal False-Color
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050014] via-[#3a084c] to-[#d65100] opacity-85"></div>
              ) : stream.streamType === 'RIVER_SURGE' ? (
                // River Surge Flow
                <div className="absolute inset-0 bg-gradient-to-br from-[#092032] to-[#040C12]">
                  <div className="absolute w-[180%] h-24 bg-[#103b5c]/50 -rotate-12 top-4 blur-[2px]"></div>
                </div>
              ) : (
                // Urban / Crowd Sector
                <div className="absolute inset-0 bg-gradient-to-br from-[#121B24] to-[#0A1016]">
                  <div className="absolute top-4 left-6 w-24 h-16 bg-black/40 border border-white/5 rounded"></div>
                </div>
              )}

              {/* Minimal Top Telemetry: Timestamp & Alt/Spd */}
              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-white/90 drop-shadow">
                <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                  {stream.timestamp}
                </div>
                <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-[#63C174]">
                  ALT {stream.alt} • {stream.spd}
                </div>
              </div>

              {/* Center YOLO AI Detection Bounding Boxes */}
              <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
                <div className="border-2 border-[#63C174] rounded bg-[#63C174]/10 p-1 flex flex-col justify-between w-28 h-14 animate-pulse">
                  <span className="text-[7px] font-mono bg-[#63C174] text-black font-bold px-1 rounded w-fit">
                    {stream.primaryDetection.label}
                  </span>
                  <span className="text-[6.5px] font-mono text-[#63C174] font-bold self-end">
                    CONF: {stream.primaryDetection.confidence}%
                  </span>
                </div>
              </div>

              {/* Minimal Bottom GPS Coordinates */}
              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono bg-black/60 px-1.5 py-0.5 rounded border border-white/10 text-[#A0AAB0]">
                <span>{stream.coords}</span>
                <span className="text-[#3B9EFF]">{stream.fps} FPS</span>
              </div>
            </div>

            {/* Bottom Card Footer: Drone ID, Sector, and Expand Button */}
            <div className="px-2.5 py-1.5 bg-[#131719] border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="text-[#E8ECEF] font-semibold">{stream.droneId}</span>
                <span className="text-[#8B949E]">({stream.location})</span>
              </div>

              <button className="text-[#8B949E] hover:text-[#E8ECEF] p-0.5 rounded transition-colors" title="Expand Feed">
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
