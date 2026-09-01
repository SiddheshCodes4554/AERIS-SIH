import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, Users, Flame, Waves, Radio, ShieldCheck, Target, Crosshair } from 'lucide-react';

export default function AIDetectionsPanel() {
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
        const [statusRes, latestRes, historyRes] = await Promise.all([
          fetch(`${backendUrl}/api/ai/status`),
          fetch(`${backendUrl}/api/detections/latest`),
          fetch(`${backendUrl}/api/detections/history`)
        ]);

        if (statusRes.ok) setAiStatus(await statusRes.json());
        if (latestRes.ok) {
          const d = await latestRes.json();
          setLiveDetections(d.detections || []);
        }
        if (historyRes.ok) {
          const h = await historyRes.json();
          setEventHistory(h.history || []);
        }
      } catch (err) {
        console.debug("Backend polling standby:", err);
      }
    };

    const setupWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected to AERIS AI Stream");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'init') {
              if (msg.ai_status) setAiStatus(msg.ai_status);
              if (msg.latest_detections) setLiveDetections(msg.latest_detections.detections || []);
            } else if (msg.type === 'detections_update') {
              setLiveDetections(msg.data.detections || []);
              if (msg.data.inference_fps !== undefined) {
                setAiStatus(prev => ({ ...prev, inference_fps: msg.data.inference_fps, status: 'active' }));
              }
            } else if (msg.type === 'detection') {
              setEventHistory(prev => [msg.data, ...prev.slice(0, 40)]);
            }
          } catch (e) {
            console.error("Error parsing WS message:", e);
          }
        };

        ws.onerror = () => {
          if (!pollInterval) {
            pollInterval = setInterval(fetchInitialData, 2000);
          }
        };

        ws.onclose = () => {
          if (!pollInterval) {
            pollInterval = setInterval(fetchInitialData, 2000);
          }
        };
      } catch (e) {
        pollInterval = setInterval(fetchInitialData, 2000);
      }
    };

    fetchInitialData();
    setupWebSocket();

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [backendUrl, wsUrl]);

  return (
    <div className="w-full h-full aeris-panel-container p-2.5 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1.5 shrink-0">
        <div className="flex items-center space-x-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
          <h2 className="text-[10.5px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            AI Detections
          </h2>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
            aiStatus.status === 'active'
              ? 'bg-aeris-green/15 text-aeris-green border border-aeris-green/30'
              : 'bg-aeris-amber/15 text-aeris-amber border border-aeris-amber/30 animate-pulse'
          }`}>
            {aiStatus.status === 'active' 
              ? `EDGE AI • ${aiStatus.inference_fps || 0} FPS` 
              : 'AI INITIALIZING...'}
          </span>
        </div>
      </div>

      {/* Live & Recent Detections List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 min-h-0">
        {/* 1. Currently Active Live Detections in Frame */}
        {liveDetections.length > 0 ? (
          liveDetections.map((det, idx) => {
            const pct = det.confidence_pct || Math.round((det.confidence || 0.95) * 100);
            return (
              <div
                key={`live-${idx}`}
                className="aeris-surface-card px-2.5 py-1.5 flex items-center justify-between font-mono text-[10px] border-l-2 border-l-aeris-green bg-aeris-green/10 shadow-[0_0_10px_rgba(99,193,116,0.2)] animate-pulse"
              >
                <div className="min-w-0 pr-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-aeris-green animate-spin" />
                    <span className="font-bold text-aeris-green tracking-wide text-[11px]">
                      {det.display_name}
                    </span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-aeris-green/20 text-aeris-green font-bold">
                      IN SIGHT
                    </span>
                  </div>
                  <div className="text-[9px] text-aeris-textSecondary mt-0.5 flex items-center space-x-2">
                    <span>
                      Confidence: <strong className="text-aeris-green text-[10px] font-extrabold">{pct}%</strong>
                    </span>
                    {det.bounding_box && (
                      <span className="text-[8px] text-aeris-textMuted">
                        [{det.bounding_box.w}x{det.bounding_box.h} px]
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono text-aeris-green font-extrabold px-1.5 py-0.5 rounded bg-black/60 border border-aeris-green/40">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })
        ) : null}

        {/* 2. Chronological History of Confirmed Detections */}
        {eventHistory.length > 0 ? (
          eventHistory.slice(0, 6).map((item) => {
            const pct = item.confidence_pct || Math.round((item.confidence || 0.95) * 100);
            return (
              <div
                key={item.event_id}
                className={`aeris-surface-card px-2 py-1 flex items-center justify-between font-mono text-[10px] border-l-2 ${
                  item.class === 'person' ? 'border-l-aeris-green bg-aeris-green/5' : 'border-l-aeris-cyan bg-aeris-cyan/5'
                }`}
              >
                <div className="min-w-0 pr-1.5">
                  <div className="flex items-center space-x-1">
                    <span className={`font-bold ${item.class === 'person' ? 'text-aeris-green' : 'text-aeris-cyan'}`}>
                      {item.display_name}
                    </span>
                  </div>
                  <div className="text-[8.5px] text-aeris-textSecondary">
                    Confidence: <strong className="text-aeris-green font-bold">{pct}%</strong>
                  </div>
                </div>

                <span className="text-[8.5px] text-aeris-textMuted shrink-0">
                  {item.timestamp ? item.timestamp.substring(11, 19) : '10:42:01'}
                </span>
              </div>
            );
          })
        ) : liveDetections.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-2 text-center font-mono text-[9.5px] text-aeris-textMuted space-y-1">
            <Crosshair className="w-4 h-4 text-aeris-cyan animate-pulse" />
            <span className="text-aeris-textSecondary font-bold">● SCANNING FOR TARGETS...</span>
            <span className="text-[8px] text-[#8C9492]">Real-time YOLOv8 inference active on camera</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
