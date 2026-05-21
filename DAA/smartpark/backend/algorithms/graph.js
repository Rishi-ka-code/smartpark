/**
 * Graph construction utilities for parking slot network.
 * Slots are modeled as nodes; walkways between adjacent slots are edges.
 * This module is internal — no algorithm details are exposed to the API layer.
 */

// Build an adjacency list from an array of ParkingSlot documents
export function buildGraph(slots) {
  const adjacency = new Map();

  for (const slot of slots) {
    const id = slot._id.toString();
    if (!adjacency.has(id)) {
      adjacency.set(id, []);
    }

    if (slot.connections && slot.connections.length > 0) {
      for (const conn of slot.connections) {
        const neighborId = conn.slot.toString();
        const distance = conn.distance || 1;
        adjacency.get(id).push({ id: neighborId, distance });

        // Ensure bidirectional
        if (!adjacency.has(neighborId)) {
          adjacency.set(neighborId, []);
        }
      }
    }
  }

  return adjacency;
}

// Get neighbors of a specific slot in the graph
export function getNeighbors(graph, slotId) {
  return graph.get(slotId.toString()) || [];
}

// Build a coordinate-based distance lookup for slots without explicit connections
export function buildProximityGraph(slots, maxDistance = 80) {
  const adjacency = new Map();

  for (const slot of slots) {
    const id = slot._id.toString();
    adjacency.set(id, []);
  }

  // Connect slots that are physically close to each other
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      const dx = a.coordinates.x - b.coordinates.x;
      const dy = a.coordinates.y - b.coordinates.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= maxDistance) {
        const aId = a._id.toString();
        const bId = b._id.toString();
        adjacency.get(aId).push({ id: bId, distance: Math.round(dist) });
        adjacency.get(bId).push({ id: aId, distance: Math.round(dist) });
      }
    }
  }

  return adjacency;
}

// Calculate Euclidean distance between two coordinate points
export function euclideanDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
