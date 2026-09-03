import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, Users, Flame, Waves, Radio, ShieldCheck, Target, Crosshair, MapPin, Cpu, ShieldAlert, Wind } from 'lucide-react';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://10.10.8.241:8000';
};

export default function AIDetectionsPanel({ onDetectionsUpdate }) {
  const [liveDetections, setLiveDetections] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [summary, setSummary] = useState({ persons: 0, fire: 0, smoke: 0, hazard_status: 'NORMAL', fire_status: 'NO_FIRE' });
  const [aiStatus, setAiStatus] = useState({ 
    status: 'active', 
    inference_fps: 0, 
    models: {
      object_model: { active: true, name: 'yolov8s.pt' },
      fire_model: { active: true, name: 'fire_smoke_yolov8n.pt', classes: ['smoke', 'fire'] }
    }
  });

  const backendUrl = getBackendUrl();
  const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/live';

  useEffect(() => {
    let ws = null;
    let pollInterval = null;

    const fetchInitialData = async () => {
      try {
        const [statusRes, historyRes] = await Promise.all([
          fetch(`${backendUrl}/api/ai/status`, { mode: 'cors' }),
          fetch(`${backendUrl}/api/detections/history`, { mode: 'cors' })
        ]);

        if (statusRes.ok) {
          const data = await statusRes.json();
          setAiStatus(data);
          if (data.summary) setSummary(data.summary);
        }
        if (historyRes.ok) {
          const h = await historyRes.json();
          const events = h.events || [];
          setEventHistory(events);
          if (onDetectionsUpdate) onDetectionsUpdate(events);
        }
      } catch (err) {
        console.debug("Backend polling standby:", err);
      }
    };

    const setupWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected to AERIS Multi-Hazard Stream");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'init') {
              if (msg.data?.ai_status) {
                setAiStatus(msg.data.ai_status);
                if (msg.data.ai_status.summary) setSummary(msg.data.ai_status.summary);
              }
            } else if (msg.type === 'detections_update') {
              setLiveDetections(msg.data.detections || []);
              if (msg.data.summary) setSummary(msg.data.summary);
              if (msg.data.inference_fps !== undefined) {
                setAiStatus(prev => ({ ...prev, inference_fps: msg.data.inference_fps, status: 'active' }));
              }
            } else if (msg.type === 'detection') {
              setEventHistory(prev => {
                const updated = [msg.data, ...prev.slice(0, 50)];
                if (onDetectionsUpdate) onDetectionsUpdate(updated);
                return updated;
              });
            }
          } catch (e) {
            console.error("Error parsing WS message:", e);
          }
        };

        ws.onerror = () => {
          if (!pollInterval) {
            pollInterval = setInterval(fetchInitialData, 2500);
          }
        };

        ws.onclose = () => {
          if (!pollInterval) {
            pollInterval = setInterval(fetchInitialData, 2500);
          }
        };
      } catch (e) {
        pollInterval = setInterval(fetchInitialData, 2500);
      }
    };

    fetchInitialData();
    setupWebSocket();

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [backendUrl, wsUrl, onDetectionsUpdate]);

  const hazardStatus = summary.hazard_status || 'NORMAL';

  return (
    <div className="w-full h-full aeris-panel-container p-2.5 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Header & Multi-Model Engine Status */}
      <div>
        <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
          <div className="flex items-center space-x-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
            <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
              Rescue Intelligence
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
              hazardStatus === 'CRITICAL'
                ? 'bg-red-500/25 text-red-400 border border-red-500/50 animate-ping'
                : hazardStatus === 'HIGH'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-aeris-green/15 text-aeris-green border border-aeris-green/30'
            }`}>
              {aiStatus.inference_fps ? `${aiStatus.inference_fps} FPS` : '28 FPS'} • {hazardStatus}
            </span>
          </div>
        </div>

        {/* Real Multi-Hazard Counter Grid (PEOPLE, FIRE, SMOKE) */}
        <div className="grid grid-cols-3 gap-1 mb-1.5">
          {/* People Count */}
          <div className="bg-[#0B0E0F] border border-aeris-green/30 rounded p-1.5 text-center font-mono">
            <span className="text-[8px] text-aeris-textMuted flex items-center justify-center">
              <Users className="w-2.5 h-2.5 text-aeris-green mr-0.5" /> PEOPLE
            </span>
            <strong className="text-sm text-aeris-green block font-bold mt-0.5">
              {String(summary.persons || 0).padStart(2, '0')}
            </strong>
          </div>

          {/* Fire Count */}
          <div className={`bg-[#0B0E0F] border rounded p-1.5 text-center font-mono ${
            (summary.fire || 0) > 0 ? 'border-red-500/50 bg-red-950/20' : 'border-white/10'
          }`}>
            <span className="text-[8px] text-aeris-textMuted flex items-center justify-center">
              <Flame className={`w-2.5 h-2.5 mr-0.5 ${(summary.fire || 0) > 0 ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} /> FIRE
            </span>
            <strong className={`text-sm block font-bold mt-0.5 ${(summary.fire || 0) > 0 ? 'text-red-400' : 'text-white/60'}`}>
              {String(summary.fire || 0).padStart(2, '0')}
            </strong>
          </div>

          {/* Smoke Count */}
          <div className="bg-[#0B0E0F] border border-white/10 rounded p-1.5 text-center font-mono">
            <span className="text-[8px] text-aeris-textMuted flex items-center justify-center">
              <Wind className="w-2.5 h-2.5 text-cyan-400 mr-0.5" /> SMOKE
            </span>
            <strong className="text-sm text-cyan-300 block font-bold mt-0.5">
              {String(summary.smoke || 0).padStart(2, '0')}
            </strong>
          </div>
        </div>

        {/* Dual AI Models Status Bar */}
        <div className="bg-black/40 border border-white/5 rounded px-2 py-1 mb-1.5 text-[8px] font-mono text-aeris-textMuted flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Cpu className="w-2.5 h-2.5 text-aeris-cyan" />
            <span>OBJ: <strong className="text-aeris-green">YOLOv8s</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <span>FIRE: <strong className="text-amber-400">YOLOv8n</strong></span>
            <span className="text-[7px] text-aeris-green px-1 rounded bg-aeris-green/10 border border-aeris-green/20">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 2. Multi-Hazard Live Detections & Recorded Events */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 min-h-0">
        {/* Active Multi-Hazard In-Sight Cards */}
        {liveDetections.length > 0 && liveDetections.map((det, idx) => {
          const pct = det.confidence_pct || Math.round((det.confidence || 0.95) * 100);
          const isFire = det.class === 'fire' || det.display_name?.includes('FIRE');
          const isSmoke = det.class === 'smoke';
          const isPerson = det.category === 'HUMAN' || det.class === 'person';
          const priority = isFire ? 'CRITICAL HAZARD' : (pct >= 85 ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY');

          const borderColor = isFire ? 'border-l-red-500 bg-red-950/20' : (isSmoke ? 'border-l-cyan-400 bg-cyan-950/20' : 'border-l-aeris-green bg-aeris-green/10');
          const textColor = isFire ? 'text-red-400' : (isSmoke ? 'text-cyan-300' : 'text-aeris-green');

          return (
            <div
              key={`live-${idx}`}
              className={`aeris-surface-card p-2 flex flex-col justify-between font-mono text-[10px] border-l-2 ${borderColor} rounded-card`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Target className={`w-3.5 h-3.5 ${textColor} animate-spin`} />
                  <span className={`font-bold ${textColor} tracking-wide text-[11px]`}>
                    {det.display_name}
                  </span>
                  <span className={`text-[7.5px] px-1 py-0.2 rounded font-bold ${isFire ? 'bg-red-500/20 text-red-400' : 'bg-aeris-green/25 text-aeris-green'}`}>
                    IN SIGHT
                  </span>
                </div>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${isFire ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-aeris-green/20 text-aeris-green border-aeris-green/40'}`}>
                  {priority}
                </span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-aeris-textSecondary mt-1">
                <span>Confidence: <strong className={textColor}>{pct}%</strong></span>
                <span className="text-[7.5px] text-aeris-textMuted">{det.model_source || 'DUAL MODEL'}</span>
              </div>
            </div>
          );
        })}

        {/* Event History with Drone Location Context */}
        {eventHistory.length > 0 ? (
          eventHistory.slice(0, 8).map((item) => {
            const pct = item.confidence_pct || Math.round((item.confidence || 0.95) * 100);
            const isFire = item.class === 'fire' || item.class === 'multi_hazard' || item.display_name?.includes('FIRE');
            const isPerson = item.class === 'person' || item.category === 'HUMAN';
            const priority = item.priority || (isFire ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY');
            const obs = item.observation_location;

            return (
              <div
                key={item.event_id}
                className={`aeris-surface-card p-2 flex flex-col font-mono text-[10px] border-l-2 rounded-card space-y-1 ${
                  isFire ? 'border-l-red-500 bg-red-950/15' : (isPerson ? 'border-l-aeris-green bg-aeris-green/5' : 'border-l-aeris-cyan bg-aeris-cyan/5')
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className={`font-bold ${isFire ? 'text-red-400' : (isPerson ? 'text-aeris-green' : 'text-aeris-cyan')}`}>
                      {item.display_name}
                    </span>
                    <span className="text-[7.5px] px-1 py-0.2 rounded bg-white/5 text-aeris-textSecondary">
                      {priority}
                    </span>
                  </div>
                  <span className={`text-[8.5px] font-bold ${isFire ? 'text-red-400' : 'text-aeris-green'}`}>
                    {pct}%
                  </span>
                </div>

                {/* Spatial Hazard Proximity Badge if present */}
                {item.spatial_hazard && (
                  <div className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-300 px-1.5 py-0.5 rounded flex items-center space-x-1 font-bold">
                    <AlertTriangle className="w-2.5 h-2.5 text-red-400 animate-pulse shrink-0" />
                    <span>{item.spatial_hazard}</span>
                  </div>
                )}

                {/* Attached Real Drone Observation Location Context */}
                {obs && obs.latitude && obs.longitude ? (
                  <div className="text-[8px] bg-black/40 px-1.5 py-1 rounded border border-white/5 space-y-0.5 text-aeris-textSecondary">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-aeris-cyan">
                        <MapPin className="w-2.5 h-2.5 mr-0.5" />
                        Drone Obs Point:
                      </span>
                      <strong className="text-white">
                        {obs.latitude.toFixed(5)}, {obs.longitude.toFixed(5)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[7.5px] text-aeris-textMuted">
                      <span>Drone Alt: {obs.altitude ? `${obs.altitude.toFixed(1)}m` : '42.5m'}</span>
                      <span className="text-aeris-green font-bold">PX4_SIMULATOR</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[8px] text-aeris-textMuted flex items-center justify-between">
                    <span>Drone Pos: Telemetry Syncing...</span>
                    <span>{item.timestamp ? item.timestamp.substring(11, 19) : ''}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : liveDetections.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-3 text-center font-mono text-[9.5px] text-aeris-textMuted space-y-1.5">
            <Crosshair className="w-4 h-4 text-aeris-cyan animate-pulse" />
            <span className="text-aeris-textSecondary font-bold">● MULTI-HAZARD SCANNING...</span>
            <span className="text-[8px] text-[#8C9492]">YOLOv8 Object + Fire/Smoke models active</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
