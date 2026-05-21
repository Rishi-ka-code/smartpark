/**
 * Route optimization between two points in the parking structure.
 * Internally uses shortest-path computation.
 * Walk speed assumed: 1.2 m/s (~4.3 km/h average walking pace).
 */

import { buildProximityGraph } from './graph.js';

// Min-heap for route computation
class MinHeap {
  constructor() { this.heap = []; }
  push(item) {
    this.heap.push(item);
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority < this.heap[parent].priority) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
        idx = parent;
      } else break;
    }
  }
  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let idx = 0;
      while (true) {
        let smallest = idx;
        const l = 2 * idx + 1, r = 2 * idx + 2;
        if (l < this.heap.length && this.heap[l].priority < this.heap[smallest].priority) smallest = l;
        if (r < this.heap.length && this.heap[r].priority < this.heap[smallest].priority) smallest = r;
        if (smallest !== idx) {
          [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
          idx = smallest;
        } else break;
      }
    }
    return min;
  }
  get size() { return this.heap.length; }
}

/**
 * Calculate the optimal route between two slots.
 * @param {Array} slots - All ParkingSlot documents
 * @param {string} fromSlotId - Starting slot ID
 * @param {string} toSlotId - Destination slot ID
 * @returns {{ path, totalDistance, estimatedTime, waypoints }}
 */
export function calculateRoute(slots, fromSlotId, toSlotId) {
  const graph = buildProximityGraph(slots);
  const slotMap = new Map();
  for (const s of slots) {
    slotMap.set(s._id.toString(), s);
  }

  const from = fromSlotId.toString();
  const to = toSlotId.toString();

  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const pq = new MinHeap();

  distances.set(from, 0);
  pq.push({ id: from, priority: 0 });

  while (pq.size > 0) {
    const { id: currentId } = pq.pop();
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === to) break;

    const neighbors = graph.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.id)) continue;
      const newDist = (distances.get(currentId) || 0) + neighbor.distance;
      const currentBest = distances.get(neighbor.id);
      if (currentBest === undefined || newDist < currentBest) {
        distances.set(neighbor.id, newDist);
        previous.set(neighbor.id, currentId);
        pq.push({ id: neighbor.id, priority: newDist });
      }
    }
  }

  // Reconstruct path
  const path = [];
  let traceId = to;
  while (traceId) {
    path.unshift(traceId);
    traceId = previous.get(traceId) || null;
  }

  // If path doesn't start from 'from', no route found — return direct path
  if (path[0] !== from) {
    const fromSlot = slotMap.get(from);
    const toSlot = slotMap.get(to);
    if (fromSlot && toSlot) {
      const dx = fromSlot.coordinates.x - toSlot.coordinates.x;
      const dy = fromSlot.coordinates.y - toSlot.coordinates.y;
      const directDist = Math.sqrt(dx * dx + dy * dy);
      return {
        path: [from, to],
        totalDistance: Math.round(directDist),
        estimatedTime: Math.round(directDist / 1.2),
        waypoints: [fromSlot.coordinates, toSlot.coordinates]
      };
    }
  }

  const totalDistance = distances.get(to) || 0;
  const waypoints = path
    .map(id => slotMap.get(id))
    .filter(Boolean)
    .map(s => ({ x: s.coordinates.x, y: s.coordinates.y }));

  return {
    path,
    totalDistance: Math.round(totalDistance),
    estimatedTime: Math.max(1, Math.round(totalDistance / 1.2)),
    waypoints
  };
}

/**
 * Calculate route from an entry gate coordinate to a slot.
 * @param {Array} slots - All slots in the zone
 * @param {Object} entryCoords - { x, y } of entry gate
 * @param {string} targetSlotId - Destination slot ID
 * @returns {{ totalDistance, estimatedWalkTime, waypoints }}
 */
export function calculateRouteFromEntry(slots, entryCoords, targetSlotId) {
  const slotMap = new Map();
  for (const s of slots) {
    slotMap.set(s._id.toString(), s);
  }

  const targetSlot = slotMap.get(targetSlotId.toString());
  if (!targetSlot) {
    return { totalDistance: 0, estimatedWalkTime: 0, waypoints: [] };
  }

  // Find the slot nearest to entry gate
  let nearestToEntry = null;
  let minDist = Infinity;
  for (const s of slots) {
    const dx = s.coordinates.x - entryCoords.x;
    const dy = s.coordinates.y - entryCoords.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < minDist) {
      minDist = d;
      nearestToEntry = s;
    }
  }

  if (!nearestToEntry) {
    return { totalDistance: 0, estimatedWalkTime: 0, waypoints: [entryCoords] };
  }

  // Calculate route from nearest entry slot to target
  const route = calculateRoute(slots, nearestToEntry._id.toString(), targetSlotId);

  // Prepend entry gate coordinate
  const waypoints = [entryCoords, ...route.waypoints];
  const entryToFirstDist = Math.round(minDist);
  const totalDistance = entryToFirstDist + route.totalDistance;

  return {
    totalDistance,
    estimatedWalkTime: Math.max(1, Math.round(totalDistance / 1.2)),
    waypoints
  };
}
