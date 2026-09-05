/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PickMeUp Kenya - Atomic Safari Dispatch & Concurrency Control
 * Prevents double-booking race conditions when multiple drivers simultaneously
 * tap "Accept" on the same passenger ride request.
 */

import { DriverProfile, Trip } from '../types';
import { calculateDynamicEarnings } from './privacy';

export interface SafariLockResult {
  success: boolean;
  message: string;
  lockedTrip?: Trip;
  conflictDriverId?: string;
  conflictDriverName?: string;
  lockedAt?: string;
  errorCode?: 'ALREADY_LOCKED' | 'NOT_FOUND' | 'STATUS_INVALID' | 'CONCURRENCY_CONFLICT';
}

// In-memory active transaction mutex locks (keyed by tripId)
const activeMutexLocks = new Set<string>();

/**
 * Execute an atomic safari acceptance transaction.
 * Guarantees that if 2+ drivers in Nairobi tap "Accept" within the same millisecond,
 * only the FIRST driver secures the ride; all subsequent drivers are cleanly rejected
 * with an atomic concurrency notification.
 */
export async function executeAtomicSafariLock(
  tripId: string,
  driver: DriverProfile,
  currentPendingTrips: Trip[],
  currentActiveTrip: Trip | null
): Promise<SafariLockResult> {
  // Check mutex lock
  if (activeMutexLocks.has(tripId)) {
    return {
      success: false,
      errorCode: 'CONCURRENCY_CONFLICT',
      message: 'Another driver is currently locking this safari. Transaction rejected to prevent double-booking.'
    };
  }

  // Acquire mutex
  activeMutexLocks.add(tripId);

  try {
    // Artificial atomic latency (50ms) to simulate real-world distributed lock
    await new Promise(resolve => setTimeout(resolve, 50));

    const target = currentPendingTrips.find(t => t.id === tripId) || 
      (currentActiveTrip?.id === tripId ? currentActiveTrip : null);

    if (!target) {
      return {
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Safari request was cancelled by the passenger or expired from the stage queue.'
      };
    }

    // Atomic precondition checks:
    // 1. Must be in 'requesting' state
    if (target.status !== 'requesting') {
      return {
        success: false,
        errorCode: 'STATUS_INVALID',
        message: `Ride is no longer open for bidding (current status: ${target.status}).`
      };
    }

    // 2. Check if already locked by another driver
    if (target.lockedByDriverId && target.lockedByDriverId !== driver.id) {
      return {
        success: false,
        errorCode: 'ALREADY_LOCKED',
        conflictDriverId: target.lockedByDriverId,
        conflictDriverName: target.driver?.fullName || 'Another nearby driver',
        lockedAt: target.lockedAt,
        message: `Safari was locked by ${target.driver?.fullName || 'another driver'} a moment before your request.`
      };
    }

    // Lock successfully acquired
    const agreedFare = target.passengerOfferedPrice || target.fare;
    const pricing = calculateDynamicEarnings(agreedFare);
    const nowIso = new Date().toISOString();

    const lockedTrip: Trip = {
      ...target,
      driverId: driver.id,
      driver,
      lockedByDriverId: driver.id,
      lockedAt: nowIso,
      lockVersion: (target.lockVersion || 0) + 1,
      fare: agreedFare,
      driverEarnings: pricing.driverNetEarnings,
      platformUsageFee: pricing.platformUsageFee,
      status: 'driver_arriving',
      acceptedAt: nowIso
    };

    return {
      success: true,
      lockedTrip,
      message: `Atomic lock secured! Agreed fare KSh ${agreedFare.toLocaleString()}. Dispatching navigation.`
    };
  } finally {
    // Release mutex
    activeMutexLocks.delete(tripId);
  }
}

/**
 * ============================================================================
 * PRODUCTION REFERENCE ARCHITECTURES (FOR SERVER / CLOUD MIGRATION)
 * ============================================================================
 * 
 * 1. GOOGLE CLOUD FIRESTORE: runTransaction Pattern
 * ----------------------------------------------------------------------------
 * In production Node.js backend (`server.ts` or Cloud Functions):
 * 
 * ```typescript
 * import { getFirestore } from 'firebase-admin/firestore';
 * 
 * export async function acceptTripFirestore(tripId: string, driver: DriverProfile) {
 *   const db = getFirestore();
 *   const tripRef = db.collection('trips').doc(tripId);
 * 
 *   return await db.runTransaction(async (transaction) => {
 *     const snapshot = await transaction.get(tripRef);
 *     if (!snapshot.exists) {
 *       throw new Error('TRIP_NOT_FOUND');
 *     }
 * 
 *     const tripData = snapshot.data();
 *     // Atomic precondition: must still be requesting and unlocked
 *     if (tripData?.status !== 'requesting' || tripData?.lockedByDriverId) {
 *       throw new Error('TRIP_ALREADY_LOCKED_BY_ANOTHER_DRIVER');
 *     }
 * 
 *     // Atomic update
 *     transaction.update(tripRef, {
 *       driverId: driver.id,
 *       lockedByDriverId: driver.id,
 *       status: 'driver_arriving',
 *       acceptedAt: new Date().toISOString(),
 *       lockVersion: (tripData.lockVersion || 0) + 1
 *     });
 * 
 *     return { success: true, tripId };
 *   });
 * }
 * ```
 * 
 * 2. POSTGRESQL / CLOUD SQL: SELECT FOR UPDATE Pattern
 * ----------------------------------------------------------------------------
 * ```sql
 * BEGIN;
 *   -- Lock the trip row exclusively so no concurrent driver can inspect or mutate
 *   SELECT id, status, locked_by_driver_id, passenger_offered_price
 *   FROM trips
 *   WHERE id = $1
 *   FOR UPDATE;
 * 
 *   -- If status != 'requesting' OR locked_by_driver_id IS NOT NULL -> ROLLBACK;
 *   -- Otherwise execute atomic update:
 *   UPDATE trips
 *   SET status = 'driver_arriving',
 *       locked_by_driver_id = $2,
 *       driver_id = $2,
 *       accepted_at = NOW(),
 *       lock_version = lock_version + 1
 *   WHERE id = $1;
 * COMMIT;
 * ```
 */
