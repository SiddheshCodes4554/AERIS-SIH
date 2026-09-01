/**
 * useGeolocation — INACTIVE / DISABLED
 * 
 * The AERIS Command Center dashboard uses Gazebo/ROS2 Simulator Drone Telemetry
 * as the sole authoritative location and navigation source.
 * Browser/laptop geolocation is intentionally disabled to ensure simulation integrity.
 */
export function useGeolocation() {
  return {
    location: null,
    status: 'SIMULATOR_ACTIVE',
    error: null,
    source: 'SIMULATOR TELEMETRY',
    isTracking: false,
    retryTracking: () => {}
  };
}
