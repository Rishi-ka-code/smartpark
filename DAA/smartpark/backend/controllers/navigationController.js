import ParkingSlot from '../models/ParkingSlot.js';
import ParkingArea from '../models/ParkingArea.js';
import { calculateRouteFromEntry, calculateRoute } from '../algorithms/routeOptimizer.js';

// Entry gate coordinates per zone
const ENTRY_GATES = {
  A: { x: 50, y: 50 },
  B: { x: 550, y: 50 },
  C: { x: 50, y: 450 },
  D: { x: 550, y: 450 }
};

/**
 * @desc    Get navigation route to a slot
 * @route   GET /api/navigation/:slotId
 * @access  Private
 */
export const getNavigation = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    
    const targetSlot = await ParkingSlot.findById(slotId).populate('area');
    
    if (!targetSlot) {
      res.status(404);
      throw new Error('Target parking slot not found');
    }
    
    // Get all slots in the same zone to build the graph
    const zoneSlots = await ParkingSlot.find({ zone: targetSlot.zone });
    
    // Calculate route from the zone's entry gate
    const entryGateCoords = ENTRY_GATES[targetSlot.zone] || ENTRY_GATES['A'];
    
    const routeInfo = calculateRouteFromEntry(zoneSlots, entryGateCoords, slotId);
    
    res.json({
      slot: targetSlot,
      route: routeInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get route between two slots
 * @route   GET /api/navigation/route
 * @access  Private
 */
export const getRoute = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      res.status(400);
      throw new Error('Please provide both from and to slot IDs');
    }
    
    const fromSlot = await ParkingSlot.findById(from);
    const toSlot = await ParkingSlot.findById(to);
    
    if (!fromSlot || !toSlot) {
      res.status(404);
      throw new Error('One or both slots not found');
    }
    
    // We assume they are in the same zone for this simple implementation
    // For cross-zone, we'd need a global graph
    const zoneSlots = await ParkingSlot.find({ zone: fromSlot.zone });
    
    const routeInfo = calculateRoute(zoneSlots, from, to);
    
    res.json({
      from: fromSlot,
      to: toSlot,
      route: routeInfo
    });
  } catch (error) {
    next(error);
  }
};
