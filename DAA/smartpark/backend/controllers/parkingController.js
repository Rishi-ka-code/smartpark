import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import { getRecommendedSlot, updateSlotStatus, getAvailability } from '../services/parkingService.js';

/**
 * @desc    Get all parking areas with slot counts
 * @route   GET /api/parking
 * @access  Public
 */
export const getAreas = async (req, res, next) => {
  try {
    const areas = await ParkingArea.find({});
    const availability = await getAvailability();
    
    res.json({
      areas,
      availability
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get slots based on filters
 * @route   GET /api/parking/slots
 * @access  Public
 */
export const getSlots = async (req, res, next) => {
  try {
    const { zone, floor, status } = req.query;
    
    const query = {};
    if (zone) query.zone = zone;
    if (floor) query.floor = floor;
    if (status) query.status = status;
    
    const slots = await ParkingSlot.find(query).populate('area', 'name entryGate');
    
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended parking slot
 * @route   GET /api/parking/recommended-slot
 * @access  Private
 */
export const getRecommendedSlotController = async (req, res, next) => {
  try {
    const { zone, floor } = req.query;
    
    const recommendation = await getRecommendedSlot(zone, floor);
    
    if (!recommendation) {
      res.status(404);
      throw new Error('No available parking slots found for your criteria');
    }
    
    res.json(recommendation);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update slot status (Admin only or system service)
 * @route   PUT /api/parking/slot-status/:id
 * @access  Private/Admin
 */
export const updateSlotStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, vehicleNumber } = req.body;
    
    if (!['available', 'occupied', 'reserved'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }
    
    const updatedSlot = await updateSlotStatus(id, status, { vehicleNumber });
    
    if (!updatedSlot) {
      res.status(404);
      throw new Error('Slot not found');
    }
    
    res.json(updatedSlot);
  } catch (error) {
    next(error);
  }
};
