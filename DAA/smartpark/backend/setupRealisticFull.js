import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingSlot from './models/ParkingSlot.js';
import ParkingArea from './models/ParkingArea.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark')
  .then(async () => {
    console.log('MongoDB connected for realistic setup');
    
    const slots = await ParkingSlot.find();
    let updatedCount = 0;
    
    for (const slot of slots) {
      const numMatch = slot.slotNumber.match(/\d+/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[0], 10);
      
      let status = 'available';
      let vehicleNumber = '';
      
      // Make the front of the parking lot almost completely full
      if (num <= 35) {
        if (Math.random() > 0.15) { // 85% full
          status = Math.random() > 0.8 ? 'reserved' : 'occupied';
          vehicleNumber = status === 'reserved' ? 'RES-777' : `VH-${Math.floor(Math.random() * 9000) + 1000}`;
        }
      } else {
        // Back of the parking lot is mostly empty
        if (Math.random() > 0.8) { // 20% full
          status = Math.random() > 0.8 ? 'reserved' : 'occupied';
          vehicleNumber = status === 'reserved' ? 'RES-777' : `VH-${Math.floor(Math.random() * 9000) + 1000}`;
        }
      }
      
      slot.status = status;
      slot.vehicleNumber = vehicleNumber;
      await slot.save();
      updatedCount++;
    }
    
    // Update area availability
    const areas = await ParkingArea.find();
    for (const area of areas) {
      const available = await ParkingSlot.countDocuments({ zone: area.zone, status: 'available' });
      area.availableSlots = available;
      await area.save();
    }

    console.log(`Updated ${updatedCount} slots to a realistically congested state.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
