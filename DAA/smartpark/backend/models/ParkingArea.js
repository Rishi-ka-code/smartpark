import mongoose from 'mongoose';

const parkingAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Area name is required'],
    unique: true,
    trim: true
  },
  floor: {
    type: String,
    required: [true, 'Floor is required'],
    enum: ['G', '1', '2', '3']
  },
  zone: {
    type: String,
    required: [true, 'Zone is required'],
    enum: ['A', 'B', 'C', 'D']
  },
  entryGate: {
    type: String,
    required: [true, 'Entry gate is required']
  },
  coordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  totalSlots: {
    type: Number,
    default: 0
  },
  availableSlots: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ParkingArea', parkingAreaSchema);
