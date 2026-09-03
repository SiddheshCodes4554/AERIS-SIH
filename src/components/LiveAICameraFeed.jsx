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
  X,
  Wind
} from 'lucide-react';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://10.10.8.241:8000';
};

export default function LiveAICameraFeed({ missionState }) {
  const [feedMode, setFeedMode] = useState('AI_OVERLAY'); // 'RGB' | 'THERMAL' | 'AI_OVERLAY'
  const [isRecording, setIsRecording] = useState(true);
  const [cameraStatus, setCameraStatus] = useState('LIVE'); // 'LIVE' | 'STANDBY'
  const [devices, setDevices] = useState([
    { index: 1, name: '🎥 OBS Virtual Camera / Phone Link (CAM-1)' },
    { index: 0, name: '📷 Primary Laptop Webcam (CAM-0)' }
  ]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(1);
  const [isSwitching, setIsSwitching] = useState(false);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);
  
  const [aiStatus, setAiStatus] = useState({
    status: 'active',
    models: {
      object_model: { active: true, name: 'yolov8s.pt' },
      fire_model: { active: true, name: 'fire_smoke_yolov8n.pt', classes: ['smoke', 'fire'] }
    },
    summary: { persons: 0, fire: 0, smoke: 0, hazard_status: 'NORMAL', fire_status: 'NO_FIRE' },
    confidence_threshold: 0.45,
    fire_confidence_threshold: 0.68,
    target_filter: 'ALL',
    inference_fps: 28.0
  });

  const [selectedModel, setSelectedModel] = useState('yolov8s.pt');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [confThreshold, setConfThreshold] = useState(45);

  const backendUrl = getBackendUrl();
  
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

  // 2. Poll camera status & multi-hazard AI metrics
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
            if (aiData.confidence_threshold) setConfThreshold(Math.round(aiData.confidence_threshold * 100));
          }
        }
      } catch (err) {
        if (isMounted) setCameraStatus('STANDBY');
      }
    };

    fetchDevices();
    checkStatus();
    const interval = setInterval(checkStatus, 2500);

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
  const isObsCam = activeDeviceName.toLowerCase().includes('obs') || selectedCameraIndex >= 1;

  const summary = aiStatus.summary || {};
  const hazardStatus = summary.hazard_status || 'NORMAL';
  const isCriticalHazard = hazardStatus === 'CRITICAL';
  const isHighHazard = hazardStatus === 'HIGH';

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
              {isCriticalHazard ? (
                <span className="flex items-center text-red-400 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded bg-red-950/40 border border-red-500/60 animate-pulse">
                  <Flame className="w-3 h-3 mr-1 text-red-400 animate-bounce" />
                  🚨 MULTI-HAZARD DETECTED
                </span>
              ) : isHighHazard ? (
                <span className="flex items-center text-amber-400 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/50">
                  <Flame className="w-3 h-3 mr-1 text-amber-400" />
                  🔥 FIRE HAZARD DETECTED
                </span>
              ) : cameraStatus === 'LIVE' ? (
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

          {/* 2. Top Control Strips: Mode, Camera Device Selector & Quick OBS Switch */}
          <div className="space-y-1.5 mb-2">
            <div className="flex items-center space-x-1.5">
              {/* Mode Switcher Tabs */}
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

              {/* Dedicated OBS Quick Switch Button */}
              <button
                onClick={() => handleSelectCamera(selectedCameraIndex === 1 ? 0 : 1)}
                className={`px-2 py-1 rounded text-[8.5px] font-mono font-bold transition-all flex items-center shrink-0 border ${
                  isObsCam 
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,166,35,0.3)]' 
                    : 'bg-white/5 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title="Quick Switch Active Feed to OBS Virtual Camera"
              >
                <Flame className="w-3 h-3 mr-1 text-amber-400" />
                🎥 OBS VIRTUAL CAM
              </button>

              {/* Camera Device Selector Dropdown */}
              <div className="flex items-center bg-[#15191C] border border-white/10 rounded-card px-2 py-0.5 text-[9px] font-mono text-[#E8ECEF]">
                <Camera className="w-2.5 h-2.5 text-aeris-cyan mr-1 shrink-0" />
                <select
                  value={selectedCameraIndex}
                  onChange={(e) => handleSelectCamera(e.target.value)}
                  className="bg-transparent text-[#E8ECEF] focus:outline-none cursor-pointer text-[9px] font-bold pr-1 max-w-[170px] truncate"
                  title="Select Active Camera Input Device"
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

            {/* AI Multi-Model Architecture Bar */}
            <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-card px-2 py-1 text-[8.5px] font-mono text-aeris-textSecondary">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Cpu className="w-2.5 h-2.5 text-aeris-cyan shrink-0" />
                  <span className="text-white/70">OBJECT:</span>
                  <strong className="text-aeris-cyan">YOLOv8s</strong>
                  <span className="text-[7px] text-aeris-green bg-aeris-green/10 border border-aeris-green/20 px-1 py-0.2 rounded font-bold">ACTIVE</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center space-x-1">
                  <Flame className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="text-white/70">FIRE & SMOKE:</span>
                  <strong className="text-amber-400">YOLOv8n</strong>
                  <span className="text-[7px] text-aeris-green bg-aeris-green/10 border border-aeris-green/20 px-1 py-0.2 rounded font-bold">ACTIVE</span>
                </div>
              </div>

              {/* Target Filter Buttons */}
              <div className="flex items-center space-x-0.5">
                {[
                  { id: 'ALL', label: 'ALL' },
                  { id: 'HUMAN_ONLY', label: 'HUMANS' },
                  { id: 'HAZARDS', label: 'HAZARDS' }
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

        {/* 3. Real Camera Feed Visual Canvas */}
        <div className="flex-1 relative bg-[#06090B] rounded-card overflow-hidden border border-white/10 flex flex-col justify-between p-2.5 min-h-0">
          {/* Real Video Stream */}
          <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[#07090B]">
            <img
              key={`${feedMode}-${selectedCameraIndex}-${selectedModel}-${streamKey}`}
              src={videoFeedUrl}
              alt="AERIS Multi-Hazard Video Stream"
              crossOrigin="anonymous"
              onError={() => {
                setTimeout(() => setStreamKey(Date.now()), 2000);
              }}
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
              <span className="text-amber-400 font-bold">
                🎥 {activeDeviceName}
              </span>
              <span className="text-white/40">|</span>
              <span>ALT {typeof missionState.altitude === 'number' ? `${missionState.altitude.toFixed(1)}m` : missionState.altitude || '42.5m'}</span>
              <span className="text-white/40">|</span>
              <span>SPD {typeof missionState.speed === 'number' ? `${missionState.speed.toFixed(1)}m/s` : missionState.speed || '8.6 m/s'}</span>
            </div>

            <button
              onClick={() => setIsFullscreenModal(true)}
              className="bg-black/70 hover:bg-black p-1 rounded border border-white/10 text-white/80 hover:text-white transition-colors pointer-events-auto"
              title="Expand Feed"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Bottom HUD Status Overlay */}
          <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-white/90 drop-shadow pointer-events-none">
            <div className="flex items-center space-x-2">
              <div className="bg-black/70 px-2 py-0.5 rounded border border-white/10 flex items-center space-x-1 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>REC • LIVE</span>
              </div>
              <div className="bg-black/70 px-2 py-0.5 rounded border border-white/10 flex items-center space-x-1 backdrop-blur-sm text-aeris-green">
                <span>👤 PEOPLE: {summary.persons || 0}</span>
                <span className="text-white/30">|</span>
                <span className={(summary.fire || 0) > 0 ? 'text-red-400 font-bold animate-pulse' : 'text-white/70'}>
                  🔥 FIRE: {summary.fire || 0}
                </span>
                <span className="text-white/30">|</span>
                <span className="text-cyan-300">💨 SMOKE: {summary.smoke || 0}</span>
              </div>
            </div>

            <div className="bg-black/70 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm text-aeris-cyan">
              <span>{aiStatus.inference_fps || 28.0} FPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col p-4 animate-fadeIn select-none font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                AERIS FULLSCREEN MULTI-HAZARD FEED • {activeDeviceName}
              </h2>
            </div>
            <button
              onClick={() => setIsFullscreenModal(false)}
              className="p-1 text-white/70 hover:text-white bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative bg-black rounded border border-white/10 overflow-hidden flex items-center justify-center">
            <img
              src={videoFeedUrl}
              alt="Fullscreen AI Feed"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
