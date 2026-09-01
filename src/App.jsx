import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MissionStatus from './components/MissionStatus.jsx';
import MissionMap from './components/MissionMap.jsx';
import DetectionPanel from './components/DetectionPanel.jsx';
import CameraPanel from './components/CameraPanel.jsx';
import CommunicationStatus from './components/CommunicationStatus.jsx';

import {
  INITIAL_MISSION_DATA,
  INITIAL_DRONE_TELEMETRY,
  MOCK_CHECKPOINTS,
  MOCK_FLIGHT_PATH,
  MOCK_SURVIVORS,
  MOCK_HAZARDS,
  GEOFENCE_POLYGON,
  INITIAL_DETECTIONS,
  INITIAL_COMM_STATUS
} from './data/mockData.js';

export default function App() {
  const [missionData, setMissionData] = useState(INITIAL_MISSION_DATA);
  const [droneTelemetry, setDroneTelemetry] = useState(INITIAL_DRONE_TELEMETRY);
  const [checkpoints, setCheckpoints] = useState(MOCK_CHECKPOINTS);
  const [flightPath, setFlightPath] = useState(MOCK_FLIGHT_PATH);
  const [survivors, setSurvivors] = useState(MOCK_SURVIVORS);
  const [hazards, setHazards] = useState(MOCK_HAZARDS);
  const [geofence, setGeofence] = useState(GEOFENCE_POLYGON);
  const [detections, setDetections] = useState(INITIAL_DETECTIONS);
  const [commStatus, setCommStatus] = useState(INITIAL_COMM_STATUS);

  return (
    <div className="h-screen w-screen flex flex-col bg-aeris-bg text-slate-100 overflow-hidden select-none">
      {/* 1. TOP HEADER */}
      <Header 
        missionData={missionData} 
        droneTelemetry={droneTelemetry} 
        commStatus={commStatus} 
      />

      {/* 2. COMMAND CENTER MAIN GRID (Full Viewport without page scroll) */}
      <main className="flex-1 grid grid-cols-12 grid-rows-12 gap-2.5 p-2.5 min-h-0 overflow-hidden">
        {/* UPPER LEFT: MISSION STATUS (Cols 1-4, Rows 1-7) */}
        <section className="col-span-12 lg:col-span-4 row-span-12 lg:row-span-7 min-h-0">
          <MissionStatus 
            missionData={missionData} 
            droneTelemetry={droneTelemetry} 
          />
        </section>

        {/* UPPER RIGHT / CENTER: LIVE MISSION MAP (VISUALLY DOMINANT) (Cols 5-12, Rows 1-7) */}
        <section className="col-span-12 lg:col-span-8 row-span-12 lg:row-span-7 min-h-0 shadow-lg">
          <MissionMap 
            droneTelemetry={droneTelemetry}
            checkpoints={checkpoints}
            flightPath={flightPath}
            survivors={survivors}
            hazards={hazards}
            geofence={geofence}
          />
        </section>

        {/* LOWER LEFT: DETECTIONS (Cols 1-4, Rows 8-12) */}
        <section className="col-span-12 lg:col-span-4 row-span-12 lg:row-span-5 min-h-0">
          <DetectionPanel 
            detections={detections}
          />
        </section>

        {/* LOWER RIGHT / CENTER: CAMERA / AI FEED (Cols 5-12, Rows 8-12) */}
        <section className="col-span-12 lg:col-span-8 row-span-12 lg:row-span-5 min-h-0 shadow-lg">
          <CameraPanel 
            droneTelemetry={droneTelemetry} 
          />
        </section>
      </main>

      {/* 3. UNIFIED BOTTOM STATUS BAR */}
      <CommunicationStatus 
        commStatus={commStatus} 
        missionData={missionData}
      />
    </div>
  );
}
