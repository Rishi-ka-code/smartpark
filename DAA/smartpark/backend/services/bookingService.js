/**
 * Booking service — business logic for reservations and booking lifecycle.
 * Supports time-based reservations with start/end times.
 */

import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import { updateSlotStatus } from './parkingService.js';
import { emitBookingUpdate } from './socketService.js';

// Fare rate: $2 per 30 minutes
const FARE_RATE = 2;
const FARE_INTERVAL = 30; // minutes

/**
 * Create a new parking reservation with optional time window.
 */
export async function createBooking(userId, slotId, vehicleNumber, startTime, endTime) {
  // Check if user already has an active booking
  const existingBooking = await Booking.findOne({ user: userId, status: 'active' });
  if (existingBooking) {
    throw new Error('You already have an active booking. Please complete or cancel it first.');
  }

  const slot = await ParkingSlot.findById(slotId).populate('area');
  if (!slot) {
    throw new Error('Parking slot not found');
  }

  if (slot.status !== 'available') {
    throw new Error('This slot is no longer available');
  }

  // Parse times
  const now = new Date();
  const expectedStart = startTime ? new Date(startTime) : now;
  const expectedEnd = endTime ? new Date(endTime) : new Date(now.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  if (expectedEnd <= expectedStart) {
    throw new Error('End time must be after start time');
  }

  // Reserve the slot immediately
  await updateSlotStatus(slotId, 'reserved', {
    vehicleNumber,
    reservedBy: userId
  });

  // Create booking record
  const booking = await Booking.create({
    user: userId,
    slot: slot._id,
    area: slot.area._id,
    vehicleNumber: vehicleNumber || '',
    entryTime: now,
    expectedStartTime: expectedStart,
    expectedEndTime: expectedEnd,
    status: 'active'
  });

  const populated = await Booking.findById(booking._id)
    .populate('slot')
    .populate('area');

  emitBookingUpdate(populated);

  return populated;
}

/**
 * Complete a booking — calculate duration and fare, free the slot.
 */
export async function completeBooking(bookingId, userId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new Error('Not authorized to complete this booking');
  }

  if (booking.status !== 'active') {
    throw new Error('This booking is not active');
  }

  const exitTime = new Date();
  const durationMs = exitTime - booking.entryTime;
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

  // Calculate fare
  const fareIntervals = Math.ceil(durationMinutes / FARE_INTERVAL);
  const fare = fareIntervals * FARE_RATE;

  booking.exitTime = exitTime;
  booking.duration = durationMinutes;
  booking.fare = fare;
  booking.status = 'completed';
  await booking.save();

  // Free the slot
  await updateSlotStatus(booking.slot, 'available');

  const populated = await Booking.findById(booking._id)
    .populate('slot')
    .populate('area');

  emitBookingUpdate(populated);

  return populated;
}

/**
 * Cancel a booking and free the slot.
 */
export async function cancelBooking(bookingId, userId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status !== 'active') {
    throw new Error('This booking is not active');
  }

  booking.status = 'cancelled';
  booking.exitTime = new Date();
  booking.duration = Math.round((booking.exitTime - booking.entryTime) / 60000);
  booking.fare = 0;
  await booking.save();

  // Free the slot
  await updateSlotStatus(booking.slot, 'available');

  const populated = await Booking.findById(booking._id)
    .populate('slot')
    .populate('area');

  emitBookingUpdate(populated);

  return populated;
}

/**
 * Expire bookings that have passed their expectedEndTime.
 * Called by the reservationExpiryManager background service.
 */
export async function expireTimedBookings() {
  const now = new Date();

  const expiredBookings = await Booking.find({
    status: 'active',
    expectedEndTime: { $lte: now }
  });

  let expiredCount = 0;
  for (const booking of expiredBookings) {
    booking.status = 'expired';
    booking.exitTime = now;
    booking.duration = Math.round((now - booking.entryTime) / 60000);
    const fareIntervals = Math.ceil(booking.duration / FARE_INTERVAL);
    booking.fare = fareIntervals * FARE_RATE;
    await booking.save();

    // Free the slot
    await updateSlotStatus(booking.slot, 'available');
    emitBookingUpdate(booking);
    expiredCount++;
  }

  return expiredCount;
}

/**
 * Get user's booking history.
 */
export async function getUserHistory(userId) {
  const bookings = await Booking.find({ user: userId })
    .populate('slot')
    .populate('area')
    .sort({ createdAt: -1 })
    .limit(50);

  return bookings;
}

/**
 * Get user's active booking.
 */
export async function getActiveBooking(userId) {
  const booking = await Booking.findOne({ user: userId, status: 'active' })
    .populate('slot')
    .populate('area');

  return booking;
}
