import React, { useState } from 'react';
import { Video, Flame, Sparkles, Disc, Maximize2, Radio } from 'lucide-react';

export default function CameraPreviewCompact() {
  const [cameraTab, setCameraTab] = useState('FUSION'); // RGB | THERMAL | FUSION
  const [isError, setIsError] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const videoFeedUrl = cameraTab === 'RGB' 
    ? `${backendUrl}/api/video/feed` 
    : `${backendUrl}/api/video/detection-feed`;

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

      {/* Real Live Camera Feed Canvas */}
      <div className="flex-1 relative bg-[#07090B] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between p-2 min-h-0">
        {/* Real Live Hardware Video Stream */}
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black">
          {!isError ? (
            <img
              key={cameraTab}
              src={videoFeedUrl}
              alt="AERIS-01 Hardware Camera Stream"
              className={`w-full h-full object-cover ${
                cameraTab === 'THERMAL'
                  ? 'contrast-150 saturate-200 hue-rotate-[180deg] filter invert-[0.15]'
                  : ''
              }`}
              onError={() => setIsError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center font-mono">
              <Radio className="w-4 h-4 text-[#F5A623] mb-1 animate-pulse" />
              <span className="text-[9px] font-bold text-[#F2F4F3]">● CAMERA STANDBY</span>
            </div>
          )}
        </div>

        {/* Top Minimal Telemetry HUD */}
        <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-white/90 drop-shadow pointer-events-none">
          <div className="bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
            CAM-01 • 720p30
          </div>
          <div className="bg-black/70 px-1.5 py-0.5 rounded border border-white/10 text-[#63C174]">
            {cameraTab === 'RGB' ? 'OPTICAL RGB' : 'YOLOv8 DETECT ACTIVE'}
          </div>
        </div>

        {/* Bottom Minimal HUD */}
        <div className="relative z-10 flex items-center justify-between text-[7.5px] font-mono bg-black/70 px-1.5 py-0.5 rounded border border-white/10 text-[#A0AAB0] pointer-events-none">
          <span>GIMBAL: -35° • FOV: 84°</span>
          <span className="text-[#3B9EFF]">SECTOR B-4 OVERLOOK</span>
        </div>
      </div>
    </div>
  );
}
