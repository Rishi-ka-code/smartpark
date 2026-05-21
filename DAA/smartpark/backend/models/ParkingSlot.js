import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    trim: true
  },
  zone: {
    type: String,
    required: [true, 'Zone is required'],
    enum: ['A', 'B', 'C', 'D']
  },
  floor: {
    type: String,
    required: [true, 'Floor is required'],
    enum: ['G', '1', '2', '3']
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true
  },
  coordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
  connections: [{
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot'
    },
    distance: {
      type: Number,
      default: 1
    }
  }],
  vehicleNumber: {
    type: String,
    default: ''
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

parkingSlotSchema.index({ zone: 1, floor: 1, status: 1 });
parkingSlotSchema.index({ area: 1 });

export default mongoose.model('ParkingSlot', parkingSlotSchema);
