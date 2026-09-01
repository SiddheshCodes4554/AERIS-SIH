import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, Users, Flame, Waves, Radio, ShieldCheck } from 'lucide-react';

export default function AIDetectionsPanel() {
  const [liveDetections, setLiveDetections] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [aiStatus, setAiStatus] = useState({ status: 'CONNECTING', inference_fps: 0, model: 'YOLO' });

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
          // Fallback to polling if WebSocket drops
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
      <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 min-h-0">
        {/* 1. Currently Active Live Detections in Frame */}
        {liveDetections.length > 0 ? (
          liveDetections.map((det, idx) => (
            <div
              key={`live-${idx}`}
              className="aeris-surface-card px-2 py-1 flex items-center justify-between font-mono text-[10px] border-l-2 border-l-aeris-green bg-aeris-green/5 shadow-[0_0_8px_rgba(99,193,116,0.15)]"
            >
              <div className="min-w-0 pr-1.5">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-aeris-green animate-pulse"></span>
                  <span className="font-bold text-aeris-green">
                    {det.display_name}
                  </span>
                  <span className="text-[8px] text-aeris-textMuted">(ACTIVE)</span>
                </div>
                <div className="text-[8.5px] text-aeris-textSecondary">
                  Conf: <strong className="text-aeris-green">{Math.round(det.confidence * 100)}%</strong> • {det.class.toUpperCase()}
                </div>
              </div>

              <span className="text-[8px] font-mono text-aeris-green font-bold px-1 rounded bg-aeris-green/20">
                LIVE IN FRAME
              </span>
            </div>
          ))
        ) : null}

        {/* 2. Chronological History of Confirmed Detections */}
        {eventHistory.length > 0 ? (
          eventHistory.slice(0, 6).map((item) => (
            <div
              key={item.event_id}
              className={`aeris-surface-card px-2 py-1 flex items-center justify-between font-mono text-[10px] border-l-2 ${
                item.class === 'person' ? 'border-l-aeris-green' : 'border-l-aeris-cyan'
              }`}
            >
              <div className="min-w-0 pr-1.5">
                <div className="flex items-center space-x-1">
                  <span className={`font-bold ${item.class === 'person' ? 'text-aeris-textPrimary' : 'text-aeris-cyan'}`}>
                    {item.display_name}
                  </span>
                </div>
                <div className="text-[8.5px] text-aeris-textSecondary">
                  Confidence: <strong className="text-aeris-green">{Math.round(item.confidence * 100)}%</strong>
                </div>
              </div>

              <span className="text-[8.5px] text-aeris-textMuted shrink-0">
                {item.timestamp ? item.timestamp.substring(11, 19) : '10:42:01'}
              </span>
            </div>
          ))
        ) : liveDetections.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-2 text-center font-mono text-[9.5px] text-aeris-textMuted space-y-1">
            <Radio className="w-4 h-4 text-aeris-cyan animate-pulse" />
            <span className="text-aeris-textSecondary font-bold">● SCANNING FOR OBJECTS...</span>
            <span className="text-[8px] text-[#8C9492]">YOLO inference running on live camera feed</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
