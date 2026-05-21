/**
 * Priority manager for slot scoring and ranking.
 * Scores each available slot based on multiple weighted factors.
 * The scoring is internal — users only see the recommended result.
 */

import { euclideanDistance } from './graph.js';

// Weight configuration for scoring factors
const WEIGHTS = {
  distance: 0.40,
  congestion: 0.30,
  floorPreference: 0.20,
  exitProximity: 0.10
};

// Floor desirability scores (lower floors preferred)
const FLOOR_SCORES = {
  'G': 1.0,
  '1': 0.8,
  '2': 0.6,
  '3': 0.4
};

/**
 * Score a single slot based on multiple factors.
 * Lower score = better recommendation.
 * @param {Object} slot - ParkingSlot document
 * @param {Object} entryPoint - { x, y } entry gate coordinates
 * @param {number} zoneOccupancy - Occupancy percentage of the slot's zone (0-100)
 * @param {Object} exitPoint - { x, y } exit gate coordinates (optional)
 * @returns {number} Priority score (lower is better)
 */
export function scoreSlot(slot, entryPoint, zoneOccupancy, exitPoint = null) {
  // Distance score: normalize distance (0-500 range expected)
  const distToEntry = euclideanDistance(slot.coordinates, entryPoint);
  const distanceScore = Math.min(distToEntry / 500, 1.0);

  // Congestion score: higher occupancy = higher score (worse)
  const congestionScore = (zoneOccupancy || 0) / 100;

  // Floor preference score: lower floors are better
  const floorScore = 1.0 - (FLOOR_SCORES[slot.floor] || 0.5);

  // Exit proximity score: closer to exit is better
  let exitScore = 0.5;
  if (exitPoint) {
    const distToExit = euclideanDistance(slot.coordinates, exitPoint);
    exitScore = Math.min(distToExit / 500, 1.0);
  }

  // Weighted sum
  const totalScore =
    WEIGHTS.distance * distanceScore +
    WEIGHTS.congestion * congestionScore +
    WEIGHTS.floorPreference * floorScore +
    WEIGHTS.exitProximity * exitScore;

  return Math.round(totalScore * 1000) / 1000;
}

/**
 * Rank all available slots by priority score.
 * @param {Array} slots - Array of available ParkingSlot documents
 * @param {Object} entryPoint - { x, y } entry gate coordinates
 * @param {Object} zoneOccupancies - { A: 65, B: 40, ... } occupancy percentages
 * @param {Object} exitPoint - Optional exit coordinates
 * @returns {Array} Sorted slots with scores (best first)
 */
export function rankSlots(slots, entryPoint, zoneOccupancies = {}, exitPoint = null) {
  const available = slots.filter(s => s.status === 'available');

  if (available.length === 0) return [];

  const scored = available.map(slot => ({
    slot,
    score: scoreSlot(slot, entryPoint, zoneOccupancies[slot.zone] || 0, exitPoint)
  }));

  // Sort by score ascending (lower = better)
  scored.sort((a, b) => a.score - b.score);

  return scored;
}

/**
 * Get the top N recommended slots.
 * @param {Array} slots - All slots
 * @param {Object} entryPoint - Entry coordinates
 * @param {Object} zoneOccupancies - Zone occupancy map
 * @param {number} topN - Number of recommendations (default: 3)
 * @returns {Array} Top N recommendations with scores
 */
export function getTopRecommendations(slots, entryPoint, zoneOccupancies = {}, topN = 3) {
  const ranked = rankSlots(slots, entryPoint, zoneOccupancies);
  return ranked.slice(0, topN);
}
