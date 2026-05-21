import ParkingSlot from '../models/ParkingSlot.js';
import ParkingArea from '../models/ParkingArea.js';
import Booking from '../models/Booking.js';
import Analytics from '../models/Analytics.js';

/**
 * @desc    Get all bookings with pagination
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
export const viewAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('slot', 'slotNumber zone floor')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new parking slot
 * @route   POST /api/admin/slot
 * @access  Private/Admin
 */
export const addSlot = async (req, res, next) => {
  try {
    const { slotNumber, zone, floor, areaId, coordinates } = req.body;

    const area = await ParkingArea.findById(areaId);
    if (!area) {
      res.status(404);
      throw new Error('Parking area not found');
    }

    const slotExists = await ParkingSlot.findOne({ slotNumber, area: areaId });
    if (slotExists) {
      res.status(400);
      throw new Error('Slot number already exists in this area');
    }

    const slot = await ParkingSlot.create({
      slotNumber,
      zone,
      floor,
      area: areaId,
      coordinates: coordinates || { x: 0, y: 0 },
      status: 'available'
    });

    // Update area count
    area.totalSlots += 1;
    area.availableSlots += 1;
    await area.save();

    res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a parking slot
 * @route   DELETE /api/admin/slot/:id
 * @access  Private/Admin
 */
export const removeSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      res.status(404);
      throw new Error('Slot not found');
    }

    if (slot.status !== 'available') {
      res.status(400);
      throw new Error('Cannot remove a slot that is currently occupied or reserved');
    }

    const area = await ParkingArea.findById(slot.area);
    
    await ParkingSlot.deleteOne({ _id: req.params.id });

    // Update area count
    if (area) {
      area.totalSlots -= 1;
      area.availableSlots -= 1;
      await area.save();
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update parking area
 * @route   PUT /api/admin/area/:id
 * @access  Private/Admin
 */
export const updateArea = async (req, res, next) => {
  try {
    let area = await ParkingArea.findById(req.params.id);

    if (!area) {
      res.status(404);
      throw new Error('Parking area not found');
    }

    area = await ParkingArea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: area
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily reports
 * @route   GET /api/admin/report
 * @access  Private/Admin
 */
export const getDailyReport = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    
    const d = new Date();
    d.setDate(d.getDate() - days);
    
    const reports = await Analytics.find({ date: { $gte: d } }).sort({ date: 1 });
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};
