import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingSlot from './models/ParkingSlot.js';
import ParkingArea from './models/ParkingArea.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark')
  .then(async () => {
    console.log('MongoDB connected for update');
    
    // We want to make the path look complex. Let's make the first 35 slots of each zone occupied.
    // That means slots ending in 01 through 35 will be occupied.
    const slots = await ParkingSlot.find();
    let updatedCount = 0;
    
    for (const slot of slots) {
      // Extract the number part of the slot (e.g., "A01" -> 1, "B45" -> 45)
      const numMatch = slot.slotNumber.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        
        // Make slots 1 to 40 occupied so the algorithm has to route to the back rows
        // We'll also leave a few random ones open if we want, but let's just occupy 1-40.
        if (num <= 40) {
          slot.status = 'occupied';
          slot.vehicleNumber = `VH-SIM-${Math.floor(Math.random() * 1000)}`;
        } else {
          slot.status = 'available';
          slot.vehicleNumber = '';
        }
        
        // Just for fun, let's block off some specific slots in the back so it has to snake around?
        // Actually, the graph allows routing through occupied slots (cars can drive past parked cars).
        // So the path will just be the shortest distance.
        
        await slot.save();
        updatedCount++;
      }
    }
    
    // Update area availability
    const areas = await ParkingArea.find();
    for (const area of areas) {
      const available = await ParkingSlot.countDocuments({ zone: area.zone, status: 'available' });
      area.availableSlots = available;
      await area.save();
    }

    console.log(`Updated ${updatedCount} slots to be mostly occupied.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
