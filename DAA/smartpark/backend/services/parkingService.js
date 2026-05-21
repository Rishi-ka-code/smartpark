/**
 * Parking service — business logic for slot management and recommendations.
 * Now strictly filters only available slots for recommendations.
 */

import ParkingSlot from '../models/ParkingSlot.js';
import ParkingArea from '../models/ParkingArea.js';
import { findNearestAvailable } from '../algorithms/slotRecommendation.js';
import { getTopRecommendations } from '../algorithms/priorityManager.js';
import { calculateRouteFromEntry } from '../algorithms/routeOptimizer.js';
import { emitSlotUpdate, emitStatsUpdate } from './socketService.js';

// Entry gate coordinates per zone
const ENTRY_GATES = {
  A: { x: 50, y: 50 },
  B: { x: 550, y: 50 },
  C: { x: 50, y: 450 },
  D: { x: 550, y: 450 }
};

/**
 * Get recommended parking slot based on zone preference and availability.
 * Now includes route waypoints for presentation mode.
 */
export async function getRecommendedSlot(zone, floor) {
  const query = { status: 'available' };
  if (zone) query.zone = zone;
  if (floor) query.floor = floor;

  // Only fetch available slots for recommendations
  const availableSlots = await ParkingSlot.find(query);

  if (!availableSlots || availableSlots.length === 0) {
    return null;
  }

  // Also fetch ALL slots in the zone for graph construction (route planning needs full topology)
  const allZoneQuery = {};
  if (zone) allZoneQuery.zone = zone;
  const allZoneSlots = await ParkingSlot.find(allZoneQuery);

  const entryPoint = ENTRY_GATES[zone] || ENTRY_GATES['A'];

  // Calculate zone occupancies for priority scoring
  const zoneOccupancies = {};
  const zones = ['A', 'B', 'C', 'D'];
  for (const z of zones) {
    const total = await ParkingSlot.countDocuments({ zone: z });
    const occupied = await ParkingSlot.countDocuments({ zone: z, status: { $ne: 'available' } });
    zoneOccupancies[z] = total > 0 ? Math.round((occupied / total) * 100) : 0;
  }

  // Use priority manager for smart scoring (only available slots)
  const ranked = getTopRecommendations(availableSlots, entryPoint, zoneOccupancies, 1);

  if (ranked.length > 0) {
    const best = ranked[0];
    const slotDoc = await ParkingSlot.findById(best.slot._id).populate('area');

    // Compute walk distance and time
    const dx = best.slot.coordinates.x - entryPoint.x;
    const dy = best.slot.coordinates.y - entryPoint.y;
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
    const walkTime = Math.max(1, Math.round(distance / 1.2 / 60)); // minutes

    // Calculate route waypoints for presentation mode
    const routeData = calculateRouteFromEntry(allZoneSlots, entryPoint, best.slot._id.toString());

    return {
      slot: slotDoc,
      distance,
      walkTime,
      zone: best.slot.zone,
      floor: best.slot.floor,
      score: best.score,
      route: {
        waypoints: routeData.waypoints,
        totalDistance: routeData.totalDistance,
        estimatedWalkTime: routeData.estimatedWalkTime
      }
    };
  }

  // Fallback: graph-based nearest available
  const result = findNearestAvailable(availableSlots, entryPoint);
  if (result) {
    const slotDoc = await ParkingSlot.findById(result.slot._id).populate('area');
    const routeData = calculateRouteFromEntry(allZoneSlots, entryPoint, result.slot._id.toString());

    return {
      slot: slotDoc,
      distance: result.distance,
      walkTime: Math.max(1, Math.round(result.distance / 1.2 / 60)),
      zone: result.slot.zone,
      floor: result.slot.floor,
      score: null,
      route: {
        waypoints: routeData.waypoints,
        totalDistance: routeData.totalDistance,
        estimatedWalkTime: routeData.estimatedWalkTime
      }
    };
  }

  return null;
}

/**
 * Update a slot's status and broadcast the change.
 */
export async function updateSlotStatus(slotId, status, vehicleInfo = {}) {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) return null;

  slot.status = status;
  if (vehicleInfo.vehicleNumber) slot.vehicleNumber = vehicleInfo.vehicleNumber;
  if (vehicleInfo.reservedBy) slot.reservedBy = vehicleInfo.reservedBy;
  if (status === 'reserved') {
    slot.reservedAt = new Date();
  } else if (status === 'available') {
    slot.vehicleNumber = '';
    slot.reservedBy = null;
    slot.reservedAt = null;
  }

  await slot.save();

  // Update area counts and broadcast
  await updateAreaCounts(slot.zone);

  // Broadcast slot update
  emitSlotUpdate(slot);

  return slot;
}

/**
 * Get availability summary for all zones.
 */
export async function getAvailability() {
  const zones = ['A', 'B', 'C', 'D'];
  const summary = {};

  let totalAll = 0;
  let availableAll = 0;
  let occupiedAll = 0;
  let reservedAll = 0;

  for (const zone of zones) {
    const total = await ParkingSlot.countDocuments({ zone });
    const available = await ParkingSlot.countDocuments({ zone, status: 'available' });
    const occupied = await ParkingSlot.countDocuments({ zone, status: 'occupied' });
    const reserved = await ParkingSlot.countDocuments({ zone, status: 'reserved' });

    totalAll += total;
    availableAll += available;
    occupiedAll += occupied;
    reservedAll += reserved;

    summary[zone] = { total, available, occupied, reserved };
  }

  return {
    zones: summary,
    overall: totalAll > 0 ? Math.round(((occupiedAll + reservedAll) / totalAll) * 100) : 0,
    totalSlots: totalAll,
    totalAvailable: availableAll,
    totalOccupied: occupiedAll,
    totalReserved: reservedAll
  };
}

/**
 * Recalculate and update area slot counts, then broadcast stats.
 */
async function updateAreaCounts(zone) {
  const area = await ParkingArea.findOne({ zone });
  if (!area) return;

  const total = await ParkingSlot.countDocuments({ zone });
  const available = await ParkingSlot.countDocuments({ zone, status: 'available' });

  area.totalSlots = total;
  area.availableSlots = available;
  await area.save();

  // Broadcast fresh stats to all clients
  const availability = await getAvailability();
  emitStatsUpdate(availability);
}

/**
 * Simulate vehicle movement for demo realism.
 * Randomly changes some occupied slots to available and vice versa.
 * NEVER touches reserved slots (those are user-controlled).
 */
export async function simulateMovement() {
  const occupiedSlots = await ParkingSlot.find({ status: 'occupied' });
  const availableSlots = await ParkingSlot.find({ status: 'available' });

  // Randomly free 1-2 occupied slots
  const toFree = occupiedSlots
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 1);

  for (const slot of toFree) {
    slot.status = 'available';
    slot.vehicleNumber = '';
    await slot.save();
    emitSlotUpdate(slot);
  }

  // Randomly occupy 1-2 available slots (simulating cars parking without reservations)
  const toOccupy = availableSlots
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 1);

  for (const slot of toOccupy) {
    slot.status = 'occupied';
    slot.vehicleNumber = `VH-${Math.floor(Math.random() * 9000) + 1000}`;
    await slot.save();
    emitSlotUpdate(slot);
  }

  // Update all area counts (this also broadcasts stats)
  for (const zone of ['A', 'B', 'C', 'D']) {
    await updateAreaCounts(zone);
  }
}
