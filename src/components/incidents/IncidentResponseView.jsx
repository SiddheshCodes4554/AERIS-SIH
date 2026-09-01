import React, { useState } from 'react';
import IncidentListPanel from './IncidentListPanel.jsx';
import IncidentMap from './IncidentMap.jsx';
import IncidentDetailsPanel from './IncidentDetailsPanel.jsx';
import { ACTIVE_INCIDENTS, NEARBY_ASSET_DRONES } from '../../data/incidentsData.js';

export default function IncidentResponseView() {
  const [incidents, setIncidents] = useState(ACTIVE_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-01');
  const [dronesList, setDronesList] = useState(NEARBY_ASSET_DRONES);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const handleDeployDrone = (callsign) => {
    // Dynamically update timeline when a drone is deployed
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncidentId) {
        return {
          ...inc,
          timeline: [
            { time: now, text: `${callsign} dispatched to incident zone • ETA 2 min`, status: 'in_progress' },
            ...inc.timeline
          ]
        };
      }
      return inc;
    }));
  };

  const handleMarkFalsePositive = () => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncidentId) {
        return { ...inc, severity: 'RESOLVED' };
      }
      return inc;
    }));
  };

  return (
    <div className="w-full h-full p-2 grid grid-cols-12 gap-2 min-h-0 overflow-hidden font-sans select-none">
      {/* 1. LEFT PANEL: Active Incidents List (25% Width / Col 1-3) */}
      <section className="col-span-3 h-full min-h-0">
        <IncidentListPanel 
          incidents={incidents}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={setSelectedIncidentId}
        />
      </section>

      {/* 2. CENTER PANEL: Tactical Incident Map + Live Floating Camera (45% Width / Col 4-8) */}
      <section className="col-span-5 lg:col-span-5 h-full min-h-0">
        <IncidentMap 
          incident={selectedIncident}
          nearbyDrones={dronesList}
        />
      </section>

      {/* 3. RIGHT PANEL: Incident Analysis, AI Assessment & Drones (30% Width / Col 9-12) */}
      <section className="col-span-4 lg:col-span-4 h-full min-h-0">
        <IncidentDetailsPanel 
          incident={selectedIncident}
          nearbyDrones={dronesList}
          onDeployDrone={handleDeployDrone}
          onMarkFalsePositive={handleMarkFalsePositive}
        />
      </section>
    </div>
  );
}
