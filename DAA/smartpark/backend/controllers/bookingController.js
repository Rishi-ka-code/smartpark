import { createBooking, cancelBooking, completeBooking, getUserHistory, getActiveBooking } from '../services/bookingService.js';

/**
 * @desc    Reserve a parking slot (with optional start/end time)
 * @route   POST /api/booking/reserve
 * @access  Private
 */
export const reserve = async (req, res, next) => {
  try {
    const { slotId, vehicleNumber, startTime, endTime } = req.body;
    const userId = req.user._id;
    
    const booking = await createBooking(
      userId,
      slotId,
      vehicleNumber || req.user.vehicleNumber,
      startTime,
      endTime
    );
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

/**
 * @desc    Get user's booking history
 * @route   GET /api/booking/history
 * @access  Private
 */
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const bookings = await getUserHistory(userId);
    const activeBooking = await getActiveBooking(userId);
    
    res.json({
      active: activeBooking,
      history: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   PUT /api/booking/cancel/:id
 * @access  Private
 */
export const cancelBookingController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const booking = await cancelBooking(id, userId);
    
    res.json(booking);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

/**
 * @desc    Complete a booking (exit parking)
 * @route   PUT /api/booking/complete/:id
 * @access  Private
 */
export const completeBookingController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const booking = await completeBooking(id, userId);
    
    res.json(booking);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
