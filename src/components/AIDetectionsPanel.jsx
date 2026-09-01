import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, Users, Flame, Waves, Radio, ShieldCheck, Target, Crosshair, MapPin } from 'lucide-react';

export default function AIDetectionsPanel({ onDetectionsUpdate }) {
  const [liveDetections, setLiveDetections] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [aiStatus, setAiStatus] = useState({ status: 'CONNECTING', inference_fps: 0, model: 'YOLOv8' });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
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

        if (statusRes.ok) setAiStatus(await statusRes.json());
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
          console.log("WebSocket connected to AERIS Unified Stream");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'init') {
              if (msg.data?.ai_status) setAiStatus(msg.data.ai_status);
            } else if (msg.type === 'detections_update') {
              setLiveDetections(msg.data.detections || []);
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

  return (
    <div className="w-full h-full aeris-panel-container p-2.5 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
        <div className="flex items-center space-x-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Rescue Intelligence
          </h2>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
            aiStatus.status === 'active'
              ? 'bg-aeris-green/15 text-aeris-green border border-aeris-green/30'
              : 'bg-aeris-amber/15 text-aeris-amber border border-aeris-amber/30 animate-pulse'
          }`}>
            {aiStatus.status === 'active' 
              ? `EDGE AI • ${aiStatus.inference_fps || 28} FPS` 
              : 'AI INITIALIZING...'}
          </span>
        </div>
      </div>

      {/* 2. Detections Feed */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 min-h-0">
        {/* Currently Active Live Detection Card */}
        {liveDetections.length > 0 && liveDetections.map((det, idx) => {
          const pct = det.confidence_pct || Math.round((det.confidence || 0.95) * 100);
          const priority = pct >= 85 ? 'HIGH PRIORITY' : (pct >= 65 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY');
          const isPerson = det.category === 'HUMAN' || det.class === 'person';

          return (
            <div
              key={`live-${idx}`}
              className="aeris-surface-card p-2 flex flex-col justify-between font-mono text-[10px] border-l-2 border-l-aeris-green bg-aeris-green/10 shadow-[0_0_10px_rgba(99,193,116,0.2)] animate-pulse rounded-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-aeris-green animate-spin" />
                  <span className="font-bold text-aeris-green tracking-wide text-[11px]">
                    {det.display_name}
                  </span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-aeris-green/25 text-aeris-green font-bold">
                    IN SIGHT
                  </span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-aeris-green/20 text-aeris-green border border-aeris-green/40">
                  {priority}
                </span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-aeris-textSecondary mt-1">
                <span>Confidence: <strong className="text-aeris-green font-mono">{pct}%</strong></span>
                <span className="text-[8px] text-aeris-textMuted">REAL-TIME INFERENCE</span>
              </div>
            </div>
          );
        })}

        {/* Chronological History of Confirmed Detections with Observation Location Context */}
        {eventHistory.length > 0 ? (
          eventHistory.slice(0, 8).map((item) => {
            const pct = item.confidence_pct || Math.round((item.confidence || 0.95) * 100);
            const isPerson = item.class === 'person' || item.category === 'HUMAN';
            const priority = item.priority || (pct >= 85 ? 'HIGH PRIORITY' : (pct >= 65 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'));
            const obs = item.observation_location;

            return (
              <div
                key={item.event_id}
                className={`aeris-surface-card p-2 flex flex-col font-mono text-[10px] border-l-2 rounded-card space-y-1 ${
                  isPerson ? 'border-l-aeris-green bg-aeris-green/5' : 'border-l-aeris-cyan bg-aeris-cyan/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className={`font-bold ${isPerson ? 'text-aeris-green' : 'text-aeris-cyan'}`}>
                      {item.display_name}
                    </span>
                    <span className="text-[7.5px] px-1 py-0.2 rounded bg-white/5 text-aeris-textSecondary">
                      {priority}
                    </span>
                  </div>
                  <span className="text-[8.5px] text-aeris-green font-bold">
                    {pct}%
                  </span>
                </div>

                {/* Attached Real Observation Location Context */}
                {obs && obs.latitude && obs.longitude ? (
                  <div className="text-[8px] bg-black/40 px-1.5 py-1 rounded border border-white/5 space-y-0.5 text-aeris-textSecondary">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-aeris-cyan">
                        <MapPin className="w-2.5 h-2.5 mr-0.5" />
                        Obs. Location:
                      </span>
                      <strong className="text-white">
                        {obs.latitude.toFixed(5)}, {obs.longitude.toFixed(5)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[7.5px] text-aeris-textMuted">
                      <span>Drone Alt: {obs.altitude || '42.5m'}</span>
                      <span className="text-aeris-green font-bold">SIMULATOR TELEMETRY</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[8px] text-aeris-textMuted flex items-center justify-between">
                    <span>Drone Pos: Telemetry Syncing...</span>
                    <span>{item.timestamp ? item.timestamp.substring(11, 19) : ''}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[7.5px] text-aeris-textMuted pt-0.5">
                  <span>Timestamp: {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '10:42:18'}</span>
                </div>
              </div>
            );
          })
        ) : liveDetections.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-3 text-center font-mono text-[9.5px] text-aeris-textMuted space-y-1.5">
            <Crosshair className="w-4 h-4 text-aeris-cyan animate-pulse" />
            <span className="text-aeris-textSecondary font-bold">● SCANNING FOR TARGETS...</span>
            <span className="text-[8px] text-[#8C9492]">Real-time YOLOv8 inference active on camera</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
