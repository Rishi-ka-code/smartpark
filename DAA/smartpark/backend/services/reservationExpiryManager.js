/**
 * Reservation Expiry Manager
 * Background service that automatically expires time-based reservations.
 * Runs every 10 seconds to check for bookings past their expectedEndTime.
 */

import { expireTimedBookings } from './bookingService.js';

let expiryInterval = null;

const CHECK_INTERVAL = 10000; // 10 seconds

export function startExpiryManager() {
  if (expiryInterval) return; // Already running

  console.log('⏰ Reservation expiry manager started (checking every 10s)');

  expiryInterval = setInterval(async () => {
    try {
      const expiredCount = await expireTimedBookings();
      if (expiredCount > 0) {
        console.log(`⏰ Auto-expired ${expiredCount} reservation(s)`);
      }
    } catch (error) {
      console.error('Expiry manager error:', error.message);
    }
  }, CHECK_INTERVAL);
}

export function stopExpiryManager() {
  if (expiryInterval) {
    clearInterval(expiryInterval);
    expiryInterval = null;
    console.log('⏰ Reservation expiry manager stopped');
  }
}
