/**
 * Socket.io service for real-time event broadcasting.
 * Manages the io instance and provides emit utilities.
 */

let ioInstance = null;

// Initialize with the Socket.io server instance
export function initSocket(io) {
  ioInstance = io;
}

// Get the current io instance
export function getIO() {
  return ioInstance;
}

// Broadcast a slot status update to all connected clients
export function emitSlotUpdate(slot) {
  if (ioInstance) {
    ioInstance.emit('slot_update', {
      slotId: slot._id,
      slotNumber: slot.slotNumber,
      zone: slot.zone,
      floor: slot.floor,
      status: slot.status,
      vehicleNumber: slot.vehicleNumber || '',
      coordinates: slot.coordinates,
      timestamp: new Date().toISOString()
    });
  }
}

// Broadcast a booking event
export function emitBookingUpdate(booking) {
  if (ioInstance) {
    ioInstance.emit('booking_update', {
      bookingId: booking._id,
      slotId: booking.slot?._id || booking.slot,
      status: booking.status,
      userId: booking.user?._id || booking.user,
      timestamp: new Date().toISOString()
    });
  }
}

// Broadcast updated occupancy stats to all clients
export function emitStatsUpdate(stats) {
  if (ioInstance) {
    ioInstance.emit('stats_update', stats);
  }
}

// Broadcast a full facility refresh (used after simulation ticks)
export function emitFacilityRefresh() {
  if (ioInstance) {
    ioInstance.emit('facility_refresh', { timestamp: new Date().toISOString() });
  }
}
