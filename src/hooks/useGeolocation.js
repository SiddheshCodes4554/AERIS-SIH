import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useGeolocation — AERIS Real Device Location Hook
 * 
 * Obtains real-world GPS coordinates from the browser Geolocation API,
 * manages permission lifecycle, and synchronizes real-time updates with FastAPI backend.
 * 
 * Source is honestly labeled as 'DEVICE LOCATION' / 'browser_geolocation'.
 */
export function useGeolocation(backendUrl = 'http://localhost:8000') {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('ACQUIRING'); // 'ACQUIRING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED'
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

  // Synchronize location update with FastAPI backend
  const syncLocationWithBackend = useCallback(async (locPayload) => {
    try {
      await fetch(`${backendUrl}/api/location/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locPayload),
        mode: 'cors'
      });
    } catch (err) {
      console.warn('[AERIS Location] Failed to sync location with backend:', err);
    }
  }, [backendUrl]);

  // Synchronize error status with FastAPI backend
  const syncStatusWithBackend = useCallback(async (statusState, reason) => {
    try {
      await fetch(`${backendUrl}/api/location/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusState,
          source: 'browser_geolocation',
          reason: reason
        }),
        mode: 'cors'
      });
    } catch (err) {
      console.warn('[AERIS Location] Failed to sync status with backend:', err);
    }
  }, [backendUrl]);

  // Geolocation Success Callback
  const handleSuccess = useCallback((position) => {
    const coords = position.coords;
    const nowIso = new Date(position.timestamp || Date.now()).toISOString();

    const locData = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy !== undefined ? coords.accuracy : null,
      altitude: coords.altitude !== undefined && coords.altitude !== null ? coords.altitude : null,
      altitudeAccuracy: coords.altitudeAccuracy !== undefined && coords.altitudeAccuracy !== null ? coords.altitudeAccuracy : null,
      heading: coords.heading !== undefined && coords.heading !== null && !isNaN(coords.heading) ? coords.heading : null,
      speed: coords.speed !== undefined && coords.speed !== null && !isNaN(coords.speed) ? coords.speed : null,
      timestamp: nowIso,
      source: 'browser_geolocation'
    };

    setLocation(locData);
    setStatus('ACTIVE');
    setError(null);

    // Throttle backend sync to at most once per 1.5 seconds to save network bandwidth
    const now = Date.now();
    if (now - lastSyncTimeRef.current > 1500) {
      lastSyncTimeRef.current = now;
      syncLocationWithBackend(locData);
    }
  }, [syncLocationWithBackend]);

  // Geolocation Error Callback
  const handleError = useCallback((err) => {
    let statusState = 'UNAVAILABLE';
    let errorMessage = 'Location services unavailable';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        statusState = 'DENIED';
        errorMessage = 'Location access denied by user or browser permission';
        break;
      case err.POSITION_UNAVAILABLE:
        statusState = 'UNAVAILABLE';
        errorMessage = 'Position unavailable — Check device GPS / Location Services';
        break;
      case err.TIMEOUT:
        statusState = 'TIMEOUT';
        errorMessage = 'Location acquisition timed out';
        break;
      default:
        statusState = 'UNAVAILABLE';
        errorMessage = err.message || 'Unknown location error';
    }

    setStatus(statusState);
    setError(errorMessage);
    syncStatusWithBackend(statusState.toLowerCase(), errorMessage);
  }, [syncStatusWithBackend]);

  // Start watching position
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('NOT_SUPPORTED');
      setError('Browser does not support Geolocation API');
      syncStatusWithBackend('not_supported', 'Browser does not support Geolocation API');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setStatus('ACQUIRING');
    setIsTracking(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 4000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, syncStatusWithBackend]);

  // Lifecycle on component mount
  useEffect(() => {
    startTracking();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startTracking]);

  return {
    location,
    status,
    error,
    source: 'DEVICE LOCATION',
    isTracking,
    retryTracking: startTracking
  };
}
