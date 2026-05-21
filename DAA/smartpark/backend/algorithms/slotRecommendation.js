/**
 * Slot recommendation engine.
 * Uses a priority-queue-based nearest-available search internally.
 * All implementation details are hidden from the API layer.
 */

import { buildProximityGraph, euclideanDistance } from './graph.js';

// Min-heap priority queue for efficient nearest-slot search
class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  get size() {
    return this.heap.length;
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority < this.heap[parent].priority) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
        idx = parent;
      } else break;
    }
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < length && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else break;
    }
  }
}

/**
 * Find the nearest available parking slot from an entry point.
 * Uses a shortest-path search through the slot graph.
 * @param {Array} slots - Array of ParkingSlot documents
 * @param {Object} entryPoint - { x, y } coordinates of entry gate
 * @returns {{ slot, distance, path }} - Recommended slot with distance and path
 */
export function findNearestAvailable(slots, entryPoint) {
  if (!slots || slots.length === 0) return null;

  const graph = buildProximityGraph(slots);
  const slotMap = new Map();
  for (const s of slots) {
    slotMap.set(s._id.toString(), s);
  }

  // Find the slot closest to the entry point to start the search
  let startSlotId = null;
  let minEntryDist = Infinity;
  for (const s of slots) {
    const d = euclideanDistance(s.coordinates, entryPoint);
    if (d < minEntryDist) {
      minEntryDist = d;
      startSlotId = s._id.toString();
    }
  }

  if (!startSlotId) return null;

  // Priority-queue-based shortest path search
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const pq = new MinHeap();

  distances.set(startSlotId, 0);
  pq.push({ id: startSlotId, priority: 0 });

  while (pq.size > 0) {
    const { id: currentId } = pq.pop();

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentSlot = slotMap.get(currentId);

    // If this slot is available, we found our nearest available slot
    if (currentSlot && currentSlot.status === 'available') {
      // Reconstruct path
      const path = [];
      let traceId = currentId;
      while (traceId) {
        path.unshift(traceId);
        traceId = previous.get(traceId) || null;
      }

      return {
        slot: currentSlot,
        distance: Math.round(distances.get(currentId)),
        path
      };
    }

    // Explore neighbors
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

  // Fallback: if graph search didn't find one, pick the nearest available by Euclidean distance
  const availableSlots = slots.filter(s => s.status === 'available');
  if (availableSlots.length === 0) return null;

  let nearest = availableSlots[0];
  let nearestDist = euclideanDistance(nearest.coordinates, entryPoint);

  for (const s of availableSlots) {
    const d = euclideanDistance(s.coordinates, entryPoint);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = s;
    }
  }

  return {
    slot: nearest,
    distance: Math.round(nearestDist),
    path: [startSlotId, nearest._id.toString()]
  };
}
