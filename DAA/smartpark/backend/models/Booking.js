import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true
  },
  vehicleNumber: {
    type: String,
    default: ''
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  expectedStartTime: {
    type: Date,
    default: Date.now
  },
  expectedEndTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  fare: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ status: 1, expectedEndTime: 1 });

export default mongoose.model('Booking', bookingSchema);
