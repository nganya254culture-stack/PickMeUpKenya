/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PickMeUp Kenya - GPS Geofencing & Adaptive Polling Engine
 * Reduces mobile battery consumption and network overhead on driver devices
 * by updating coordinates only when moved > 15 meters, and throttling polling
 * when stationary or offline.
 */

export const DISTANCE_FILTER_METERS = 15; // Minimum 15 meters movement threshold
export const POLLING_INTERVAL_IN_TRANSIT_MS = 2500; // 2.5s for turn-by-turn navigation
export const POLLING_INTERVAL_STATIONARY_MS = 15000; // 15s when parked at stage or stuck in heavy Nairobi jam
export const POLLING_INTERVAL_OFFLINE_MS = 0; // 0s (no polling when offline)

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeofenceEvaluation {
  shouldEmit: boolean;
  distanceDeltaMeters: number;
  reason: 'MOVED_BEYOND_FILTER' | 'FILTERED_STATIONARY' | 'OFFLINE_DISABLED' | 'FIRST_FIX';
  recommendedPollingIntervalMs: number;
  mode: 'in_transit' | 'stationary' | 'offline';
}

/**
 * High-precision Haversine distance formula between two GPS points on Earth.
 * Returns distance in exact meters.
 */
export function calculateHaversineDistanceMeters(
  point1: Coordinates,
  point2: Coordinates
): number {
  if (point1.lat === point2.lat && point1.lng === point2.lng) {
    return 0;
  }

  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lat1Rad = toRad(point1.lat);
  const lat2Rad = toRad(point2.lat);
  const deltaLat = toRad(point2.lat - point1.lat);
  const deltaLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place (decimeter)
}

/**
 * Evaluate incoming GPS coordinates against the 15-meter distance filter
 * and current driver online/trip status.
 */
export function evaluateGpsFilter(
  newPosition: Coordinates,
  lastEmittedPosition: Coordinates | null,
  isDriverOnline: boolean,
  hasActiveTrip: boolean
): GeofenceEvaluation {
  // 1. Offline Mode: Complete shutdown of polling (0ms interval)
  if (!isDriverOnline) {
    return {
      shouldEmit: false,
      distanceDeltaMeters: 0,
      reason: 'OFFLINE_DISABLED',
      recommendedPollingIntervalMs: POLLING_INTERVAL_OFFLINE_MS,
      mode: 'offline'
    };
  }

  // 2. First GPS fix
  if (!lastEmittedPosition) {
    return {
      shouldEmit: true,
      distanceDeltaMeters: 0,
      reason: 'FIRST_FIX',
      recommendedPollingIntervalMs: hasActiveTrip ? POLLING_INTERVAL_IN_TRANSIT_MS : POLLING_INTERVAL_STATIONARY_MS,
      mode: hasActiveTrip ? 'in_transit' : 'stationary'
    };
  }

  // 3. Compute distance delta
  const deltaMeters = calculateHaversineDistanceMeters(lastEmittedPosition, newPosition);

  // 4. Threshold check: > 15 meters
  if (deltaMeters >= DISTANCE_FILTER_METERS) {
    return {
      shouldEmit: true,
      distanceDeltaMeters: deltaMeters,
      reason: 'MOVED_BEYOND_FILTER',
      recommendedPollingIntervalMs: POLLING_INTERVAL_IN_TRANSIT_MS,
      mode: 'in_transit'
    };
  }

  // 5. Filtered out: Movement < 15 meters (Stationary / Parked / Stage Wait)
  return {
    shouldEmit: false,
    distanceDeltaMeters: deltaMeters,
    reason: 'FILTERED_STATIONARY',
    recommendedPollingIntervalMs: POLLING_INTERVAL_STATIONARY_MS,
    mode: 'stationary'
  };
}
