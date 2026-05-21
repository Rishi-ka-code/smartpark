/**
 * Live Update Manager
 * Background service that simulates realistic parking activity.
 * Runs every 20 seconds to randomly toggle slot states,
 * giving the impression of cars entering and leaving the facility.
 */

import { simulateMovement } from './parkingService.js';

let simulationInterval = null;

const SIMULATION_INTERVAL = 20000; // 20 seconds

export function startLiveUpdates() {
  if (simulationInterval) return; // Already running

  console.log('🚗 Live update manager started (simulating every 20s)');

  simulationInterval = setInterval(async () => {
    try {
      await simulateMovement();
    } catch (error) {
      console.error('Live update error:', error.message);
    }
  }, SIMULATION_INTERVAL);
}

export function stopLiveUpdates() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('🚗 Live update manager stopped');
  }
}
