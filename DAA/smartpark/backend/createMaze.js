import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingSlot from './models/ParkingSlot.js';
import ParkingArea from './models/ParkingArea.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark')
  .then(async () => {
    console.log('MongoDB connected for maze creation');
    
    const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
    
    // We will build a "maze" pattern out of the available slots
    // This will force the routing algorithm to snake around obstacles.
    // Let's do this for all zones.
    
    let updatedCount = 0;
    
    for (const slot of slots) {
      const numMatch = slot.slotNumber.match(/\d+/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[0], 10);
      
      // Determine row (0-4) and col (0-9)
      // slots are 1-50.
      const index = num - 1; 
      const col = index % 10;
      const row = Math.floor(index / 10);
      
      let status = 'occupied';
      let vehicleNumber = `VH-${Math.floor(Math.random() * 9000) + 1000}`;
      
      // Create a snake-like path of 'available' slots
      // Top row open
      if (row === 0 && col < 8) {
        status = 'available'; vehicleNumber = '';
      }
      // Drop down at col 7
      else if (col === 7 && row <= 2) {
        status = 'available'; vehicleNumber = '';
      }
      // Go left on row 2
      else if (row === 2 && col >= 2 && col <= 7) {
        status = 'available'; vehicleNumber = '';
      }
      // Drop down at col 2
      else if (col === 2 && row >= 2 && row <= 4) {
        status = 'available'; vehicleNumber = '';
      }
      // Go right on row 4 (bottom row)
      else if (row === 4 && col >= 2 && col <= 8) {
        status = 'available'; vehicleNumber = '';
      }
      // Target slot at bottom right!
      else if (row === 4 && col === 9) {
         status = 'available'; vehicleNumber = '';
      }
      // A few random 'reserved' slots for visuals
      else if ((row === 1 && col === 3) || (row === 3 && col === 8) || (row === 2 && col === 1) || (row === 0 && col === 9)) {
         status = 'reserved'; vehicleNumber = 'RES-999';
      }
      // Another random path opening to trick it
      else if (col === 5 && row === 1) {
         status = 'available'; vehicleNumber = '';
      }
      // The rest are occupied (red) or reserved (yellow)
      else {
         if (Math.random() > 0.8) {
            status = 'reserved';
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

    console.log(`Updated ${updatedCount} slots to create a maze pattern.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
