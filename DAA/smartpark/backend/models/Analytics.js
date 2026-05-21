import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  cancelledBookings: {
    type: Number,
    default: 0
  },
  occupancyRate: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  peakHours: [{
    hour: { type: Number },
    bookings: { type: Number }
  }],
  zoneStats: [{
    zone: { type: String },
    occupancy: { type: Number },
    bookings: { type: Number }
  }]
});

analyticsSchema.index({ date: -1 });

export default mongoose.model('Analytics', analyticsSchema);
