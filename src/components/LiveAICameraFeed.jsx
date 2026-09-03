import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Flame, 
  Sparkles, 
  Disc, 
  Camera, 
  Crosshair, 
  Maximize2,
  Minimize2,
  Layers,
  Cpu,
  Radio,
  RefreshCw,
  ChevronDown,
  Smartphone,
  Sliders,
  ShieldAlert,
  Target,
  Users,
  X
} from 'lucide-react';

export default function LiveAICameraFeed({ missionState }) {
  const [feedMode, setFeedMode] = useState('AI_OVERLAY'); // 'RGB' | 'THERMAL' | 'AI_OVERLAY'
  const [isRecording, setIsRecording] = useState(true);
  const [cameraStatus, setCameraStatus] = useState('LIVE'); // 'LIVE' | 'STANDBY'
  const [devices, setDevices] = useState([
    { index: 0, name: 'Camera 0 (Primary Webcam)' },
    { index: 1, name: 'Camera 1 (Phone Link / Phone Cam)' }
  ]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(1);
  const [isSwitching, setIsSwitching] = useState(false);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);
  const [aiStatus, setAiStatus] = useState({
    status: 'active',
    model: 'yolov8s.pt',
    confidence_threshold: 0.58,
    target_filter: 'ALL',
    inference_fps: 28.0
  });

  const [selectedModel, setSelectedModel] = useState('yolov8s.pt');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [confThreshold, setConfThreshold] = useState(58);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  // Choose correct endpoint based on mode: AI_OVERLAY -> detection-feed, RGB -> raw feed
  const streamEndpoint = feedMode === 'RGB' ? '/api/video/feed' : '/api/video/detection-feed';
  const videoFeedUrl = `${backendUrl}${streamEndpoint}?t=${streamKey}`;

  // 1. Fetch available camera devices
  const fetchDevices = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/camera/devices`, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        if (data.devices && data.devices.length > 0) {
          setDevices(data.devices);
          if (data.active_index !== undefined) {
            setSelectedCameraIndex(data.active_index);
          }
        }
      }
    } catch (err) {
      console.warn("Error fetching camera devices:", err);
    }
  };

  // 2. Poll camera status & AI metrics
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const [camRes, aiRes] = await Promise.all([
          fetch(`${backendUrl}/api/camera/status`, { mode: 'cors' }),
          fetch(`${backendUrl}/api/ai/status`, { mode: 'cors' })
        ]);

        if (camRes.ok) {
          const camData = await camRes.json();
          if (isMounted) {
            setCameraStatus(camData.camera_available ? 'LIVE' : 'STANDBY');
          }
        }

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (isMounted) {
            setAiStatus(aiData);
            if (aiData.model) setSelectedModel(aiData.model);
            if (aiData.target_filter) setTargetFilter(aiData.target_filter);
            if (aiData.confidence_threshold) setConfThreshold(Math.round(aiData.confidence_threshold * 100));
          }
        }
      } catch (err) {
        if (isMounted) setCameraStatus('STANDBY');
      }
    };

    fetchDevices();
    checkStatus();
    const interval = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendUrl, streamKey]);

  // 3. Dynamic Camera Switch
  const handleSelectCamera = async (newIndex) => {
    const idx = parseInt(newIndex, 10);
    setSelectedCameraIndex(idx);
    setIsSwitching(true);

    try {
      const res = await fetch(`${backendUrl}/api/camera/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_index: idx }),
        mode: 'cors'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.status.camera_available) {
          setCameraStatus('LIVE');
        }
        setStreamKey(Date.now());
        setTimeout(() => {
          setIsSwitching(false);
        }, 300);
      }
    } catch (err) {
      console.error("Failed to switch camera:", err);
      setIsSwitching(false);
    }
  };

  // 4. Force Reconnect Action
  const handleForceReconnect = async () => {
    setIsSwitching(true);
    try {
      const res = await fetch(`${backendUrl}/api/camera/reconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.status.camera_available) {
          setCameraStatus('LIVE');
        }
        setStreamKey(Date.now());
        setTimeout(() => {
          setIsSwitching(false);
        }, 300);
      }
    } catch (err) {
      console.error("Reconnect failed:", err);
      setIsSwitching(false);
    }
  };

  // 5. Update AI Model / Confidence / Filter Settings
  const handleUpdateAIConfig = async (model, conf, filter) => {
    try {
      await fetch(`${backendUrl}/api/ai/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: model || selectedModel,
          confidence_threshold: (conf !== undefined ? conf : confThreshold) / 100.0,
          target_filter: filter || targetFilter
        }),
        mode: 'cors'
      });
    } catch (err) {
      console.error("Failed to update AI config:", err);
    }
  };

  const activeDeviceName = devices.find(d => d.index === selectedCameraIndex)?.name || `CAM-${selectedCameraIndex}`;
  const isPhoneCam = selectedCameraIndex === 1 || activeDeviceName.toLowerCase().includes('phone');

  return (
    <>
      <div className="w-full h-full aeris-panel-container p-3 flex flex-col justify-between select-none font-sans overflow-hidden">
        {/* 1. Header & Live Status */}
        <div>
          <div className="flex items-center justify-between border-b border-aeris-border pb-1.5 mb-2">
            <div className="flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-aeris-cyan" />
              <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
                Live AI Camera Feed
              </h2>
            </div>

            <div className="flex items-center space-x-1.5">
              {cameraStatus === 'LIVE' ? (
                <span className="flex items-center text-aeris-red font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-aeris-red/15 border border-aeris-red/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-aeris-red mr-1 animate-pulse"></span>
                  ● LIVE
                </span>
              ) : isSwitching ? (
                <span className="flex items-center text-aeris-amber font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-aeris-amber/15 border border-aeris-amber/30 animate-pulse">
                  RECONNECTING...
                </span>
              ) : (
                <button
                  onClick={handleForceReconnect}
                  className="flex items-center text-aeris-amber font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-aeris-amber/15 border border-aeris-amber/30 hover:bg-aeris-amber/25 transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />
                  STANDBY • RECONNECT
                </button>
              )}
            </div>
          </div>

          {/* 2. Top Control Strips: Mode, Camera Device & AI Model Precision */}
          <div className="space-y-1.5 mb-2">
            <div className="flex items-center space-x-1.5">
              {/* Mode Switcher Tabs: [ RGB ] [ THERMAL ] [ AI OVERLAY ] */}
              <div className="flex-1 flex space-x-0.5 p-0.5 bg-aeris-surface rounded-card border border-aeris-border text-[9px] font-mono">
                {[
                  { id: 'RGB', label: 'RGB' },
                  { id: 'THERMAL', label: 'THERMAL' },
                  { id: 'AI_OVERLAY', label: 'AI OVERLAY' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFeedMode(tab.id)}
                    className={`flex-1 py-0.5 rounded text-center font-semibold transition-all ${
                      feedMode === tab.id
                        ? 'bg-aeris-surfaceHover text-aeris-cyan border border-aeris-cyan/30 shadow-sm'
                        : 'text-aeris-textSecondary hover:text-aeris-textPrimary border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Camera Device Selector Dropdown */}
              <div className="flex items-center bg-[#15191C] border border-white/10 rounded-card px-2 py-0.5 text-[9px] font-mono text-[#E8ECEF]">
                {isPhoneCam ? (
                  <Smartphone className="w-2.5 h-2.5 text-aeris-green mr-1 shrink-0" />
                ) : (
                  <Camera className="w-2.5 h-2.5 text-aeris-cyan mr-1 shrink-0" />
                )}
                <select
                  value={selectedCameraIndex}
                  onChange={(e) => handleSelectCamera(e.target.value)}
                  className="bg-transparent text-[#E8ECEF] focus:outline-none cursor-pointer text-[9px] font-bold pr-1 max-w-[130px] truncate"
                  title="Select Camera Device"
                >
                  {devices.map((d) => (
                    <option key={d.index} value={d.index} className="bg-[#111516] text-[#E8ECEF]">
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    fetchDevices();
                    setStreamKey(Date.now());
                  }}
                  className="p-0.5 text-[#8C9492] hover:text-aeris-cyan transition-colors ml-0.5"
                  title="Rescan camera devices"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* AI Tactical Model & Filter Selection Bar */}
            <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-card px-2 py-1 text-[8.5px] font-mono text-aeris-textSecondary">
              <div className="flex items-center space-x-1">
                <Cpu className="w-2.5 h-2.5 text-aeris-cyan shrink-0" />
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    const m = e.target.value;
                    setSelectedModel(m);
                    handleUpdateAIConfig(m, undefined, undefined);
                  }}
                  className="bg-transparent text-aeris-cyan font-bold focus:outline-none cursor-pointer text-[8.5px] max-w-[160px] truncate"
                  title="Select YOLO Architecture Precision"
                >
                  <option value="yolov8s.pt" className="bg-[#111516] text-white">YOLOv8-Small (High Precision)</option>
                  <option value="yolov8m.pt" className="bg-[#111516] text-white">YOLOv8-Medium (Competition)</option>
                  <option value="yolov8n.pt" className="bg-[#111516] text-white">YOLOv8-Nano (Ultra Fast)</option>
                </select>
              </div>

              {/* Target Filter Buttons */}
              <div className="flex items-center space-x-0.5">
                {[
                  { id: 'ALL', label: 'ALL' },
                  { id: 'HUMAN_ONLY', label: 'HUMANS' },
                  { id: 'VEHICLES', label: 'VEHICLES' },
                  { id: 'GEAR', label: 'GEAR' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setTargetFilter(filter.id);
                      handleUpdateAIConfig(undefined, undefined, filter.id);
                    }}
                    className={`px-1.5 py-0.2 rounded text-[8px] font-bold transition-all ${
                      targetFilter === filter.id
                        ? 'bg-aeris-cyan/20 text-aeris-cyan border border-aeris-cyan/40'
                        : 'text-aeris-textMuted hover:text-white border border-transparent'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Real Drone Camera Feed Visual Canvas */}
        <div className="flex-1 relative bg-[#06090B] rounded-card overflow-hidden border border-white/10 flex flex-col justify-between p-2.5 min-h-0">
          {/* Real Live Hardware Video Stream with YOLO Annotations */}
          <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[#07090B]">
            <img
              key={`${feedMode}-${selectedCameraIndex}-${selectedModel}-${streamKey}`}
              src={videoFeedUrl}
              alt="AERIS-01 Real Hardware Camera Stream"
              crossOrigin="anonymous"
              className={`w-full h-full object-contain transition-all duration-200 ${
                feedMode === 'THERMAL'
                  ? 'contrast-150 saturate-200 hue-rotate-[180deg] filter invert-[0.15]'
                  : ''
              }`}
            />
          </div>

          {/* Top HUD Telemetry Overlay */}
          <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-white/90 drop-shadow pointer-events-none">
            <div className="bg-black/70 px-2 py-0.5 rounded border border-white/10 flex items-center space-x-1.5 backdrop-blur-sm">
              <span className={`${isPhoneCam ? 'text-aeris-green' : 'text-aeris-cyan'} font-bold`}>
                {isPhoneCam ? '📱 PHONE LINK (CAM-1)' : `CAM-${selectedCameraIndex} (EO/IR)`}
              </span>
              <span className="text-white/40">|</span>
              <span>ALT {missionState.altitude}</span>
              <span className="text-white/40">|</span>
              <span>SPD {missionState.speed}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              {aiStatus.hazard_level === 'CRITICAL' && (
                <div className="bg-red-950/85 px-2 py-0.5 rounded border border-red-500 text-red-400 font-bold backdrop-blur-sm animate-pulse flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-red-400 animate-bounce" />
                  <span>🔥 CRITICAL HAZARD</span>
                </div>
              )}
              {aiStatus.hazard_level === 'HAZARD' && (
                <div className="bg-orange-950/85 px-2 py-0.5 rounded border border-orange-500 text-orange-400 font-bold backdrop-blur-sm flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>🔥 FIRE DETECTED</span>
                </div>
              )}
              {aiStatus.hazard_level === 'WATCH' && (
                <div className="bg-green-950/85 px-2 py-0.5 rounded border border-green-500 text-green-400 font-bold backdrop-blur-sm flex items-center space-x-1">
                  <Users className="w-3 h-3 text-green-400" />
                  <span>👤 PERSON DETECTED</span>
                </div>
              )}
              <div className="bg-black/70 px-2 py-0.5 rounded border border-white/10 text-aeris-green font-bold backdrop-blur-sm">
                GPS ACTIVE
              </div>
            </div>
          </div>

          {/* Thermal Palette Scale in Thermal Mode */}
          {feedMode === 'THERMAL' && (
            <div className="relative z-10 flex items-center justify-end pointer-events-none h-full">
              <div className="w-2.5 h-36 bg-gradient-to-b from-white via-yellow-400 via-red-600 via-purple-900 to-black rounded border border-white/20 flex flex-col justify-between text-[6px] font-mono text-white px-0.5">
                <span>HOT</span>
                <span>MED</span>
                <span>COLD</span>
              </div>
            </div>
          )}

          {/* Bottom HUD Bar showing real YOLO inference metrics */}
          <div className="relative z-10 flex items-center justify-between text-[9px] font-mono pointer-events-none">
            <div className="bg-black/70 px-1.5 py-0.5 rounded border border-white/10 text-aeris-textSecondary backdrop-blur-sm">
              REC ● LIVE • 30 FPS
            </div>

            <div className="bg-black/70 px-1.5 py-0.5 rounded border border-white/10 text-aeris-cyan font-bold backdrop-blur-sm flex items-center space-x-1.5">
              <span>{aiStatus.model || 'YOLOv8'} • {aiStatus.inference_fps || 28} FPS</span>
              {aiStatus.fire_model_available && (
                <>
                  <span className="text-white/30">|</span>
                  <span className={aiStatus.fire_detected ? "text-red-400 font-bold animate-pulse" : "text-orange-400/80"}>
                    🔥 FIRE AI {aiStatus.fire_detected ? 'DETECTED' : 'READY'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4. Camera & Sensitivity Actions Strip */}
        <div className="flex items-center justify-between pt-2 border-t border-aeris-border mt-2 text-[9.5px] font-mono shrink-0">
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 border border-white/5 ${
                isRecording ? 'text-aeris-red bg-aeris-red/20' : 'text-aeris-textSecondary'
              }`}
            >
              <Disc className="w-2.5 h-2.5 mr-0.5" />
              <span>{isRecording ? 'REC' : 'STBY'}</span>
            </button>

            {/* Confidence Threshold Dial */}
            <div className="flex items-center space-x-1 bg-aeris-surface px-2 py-0.5 rounded border border-white/5 text-[8.5px]">
              <Sliders className="w-2.5 h-2.5 text-aeris-cyan" />
              <span className="text-aeris-textSecondary">CONF:</span>
              <input
                type="range"
                min="35"
                max="85"
                value={confThreshold}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setConfThreshold(val);
                  handleUpdateAIConfig(undefined, val, undefined);
                }}
                className="w-14 h-1 bg-white/20 rounded accent-aeris-cyan cursor-pointer"
                title={`Confidence Filter: ${confThreshold}%`}
              />
              <span className="text-aeris-cyan font-bold">{confThreshold}%</span>
            </div>

            <button className="px-2 py-0.5 rounded text-aeris-cyan bg-aeris-cyan/15 border border-aeris-cyan/30 flex items-center">
              <Crosshair className="w-2.5 h-2.5 mr-0.5" />
              <span>LOCK</span>
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setStreamKey(Date.now())}
              className="px-1.5 py-0.5 text-aeris-textSecondary hover:text-white bg-aeris-surface rounded border border-white/5"
              title="Force refresh stream canvas"
            >
              <RefreshCw className="w-3 h-3" />
            </button>

            <button 
              onClick={() => setIsFullscreenModal(true)}
              className="px-1.5 py-0.5 text-aeris-cyan hover:text-white bg-aeris-cyan/15 hover:bg-aeris-cyan/30 rounded border border-aeris-cyan/30 flex items-center space-x-1"
              title="Expand Camera Feed to Fullscreen"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="text-[8.5px] font-bold">EXPAND</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Fullscreen High-Resolution Tactical Modal */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 font-mono text-sm">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-aeris-cyan animate-pulse" />
              <span className="font-bold text-white tracking-wider">AERIS-01 EO/IR TACTICAL SURVEILLANCE FEED</span>
              <span className="px-2 py-0.5 rounded bg-aeris-green/20 text-aeris-green text-xs font-bold border border-aeris-green/40">
                ● HIGH PRECISION YOLO ACTIVE
              </span>
            </div>

            <button
              onClick={() => setIsFullscreenModal(false)}
              className="p-1.5 text-white/70 hover:text-white bg-white/10 hover:bg-red-500/80 rounded transition-colors flex items-center space-x-1"
            >
              <X className="w-5 h-5" />
              <span className="text-xs font-bold">CLOSE</span>
            </button>
          </div>

          <div className="flex-1 relative bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
            <img
              src={videoFeedUrl}
              alt="Fullscreen AERIS Video Feed"
              crossOrigin="anonymous"
              className="w-full h-full object-contain"
            />

            <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-card border border-white/15 font-mono text-xs text-white space-y-1">
              <div className="text-aeris-cyan font-bold">PAYLOAD: {activeDeviceName}</div>
              <div className="text-white/80">ALT: {missionState.altitude} | SPD: {missionState.speed}</div>
              <div className="text-aeris-green font-bold">MODEL: {selectedModel} ({aiStatus.inference_fps} FPS)</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
