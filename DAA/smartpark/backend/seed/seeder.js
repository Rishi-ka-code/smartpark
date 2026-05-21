import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import Analytics from '../models/Analytics.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const importData = async () => {
  try {
    console.log('Clearing old data...');
    await User.deleteMany();
    await ParkingArea.deleteMany();
    await ParkingSlot.deleteMany();
    await Booking.deleteMany();
    await Analytics.deleteMany();

    console.log('Creating users...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@smartpark.com',
      password: 'admin123',
      role: 'admin',
      vehicleNumber: 'ADMIN-01'
    });

    const normalUser = await User.create({
      name: 'John Doe',
      email: 'user@smartpark.com',
      password: 'user123',
      role: 'user',
      vehicleNumber: 'DEF-456'
    });

    console.log('Creating parking areas...');
    const areasData = [
      { name: 'North Wing', floor: 'G', zone: 'A', entryGate: 'Gate 1', coordinates: { x: 50, y: 50 } },
      { name: 'South Wing', floor: '1', zone: 'B', entryGate: 'Gate 2', coordinates: { x: 550, y: 50 } },
      { name: 'East Wing', floor: '2', zone: 'C', entryGate: 'Gate 3', coordinates: { x: 50, y: 450 } },
      { name: 'West Wing', floor: '3', zone: 'D', entryGate: 'Gate 4', coordinates: { x: 550, y: 450 } }
    ];
    
    const createdAreas = await ParkingArea.insertMany(areasData);
    const areaMap = {
      'A': createdAreas.find(a => a.zone === 'A')._id,
      'B': createdAreas.find(a => a.zone === 'B')._id,
      'C': createdAreas.find(a => a.zone === 'C')._id,
      'D': createdAreas.find(a => a.zone === 'D')._id,
    };

    console.log('Creating parking slots...');
    const slots = [];
    const zones = [
      { id: 'A', floor: 'G', startX: 100, startY: 100 },
      { id: 'B', floor: '1', startX: 600, startY: 100 },
      { id: 'C', floor: '2', startX: 100, startY: 500 },
      { id: 'D', floor: '3', startX: 600, startY: 500 }
    ];

    for (const z of zones) {
      let count = 0;
      // 5 rows, 10 columns = 50 slots per zone
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          count++;
          const slotNum = `${z.id}${count.toString().padStart(2, '0')}`;
          
          // Determine status randomly
          const rand = Math.random();
          let status = 'available';
          let vehicleNumber = '';
          
          if (rand > 0.7) {
            status = 'occupied';
            vehicleNumber = `VH-${Math.floor(Math.random() * 9000) + 1000}`;
          } else if (rand > 0.55) {
            status = 'reserved';
            vehicleNumber = `VH-${Math.floor(Math.random() * 9000) + 1000}`;
          }

          slots.push({
            slotNumber: slotNum,
            zone: z.id,
            floor: z.floor,
            area: areaMap[z.id],
            coordinates: {
              x: z.startX + (col * 40),
              y: z.startY + (row * 60)
            },
            status,
            vehicleNumber,
            connections: [] // We'll add these later if we were doing a real graph, but proximity based handles this for us
          });
        }
      }
      
      // Update area counts
      const areaToUpdate = await ParkingArea.findById(areaMap[z.id]);
      areaToUpdate.totalSlots = 50;
      areaToUpdate.availableSlots = slots.filter(s => s.zone === z.id && s.status === 'available').length;
      await areaToUpdate.save();
    }

    await ParkingSlot.insertMany(slots);

    console.log('Creating mock analytics...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analytics = [];
    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        analytics.push({
            date: d,
            totalBookings: Math.floor(Math.random() * 100) + 50,
            completedBookings: Math.floor(Math.random() * 80) + 40,
            cancelledBookings: Math.floor(Math.random() * 20),
            occupancyRate: Math.floor(Math.random() * 40) + 40,
            revenue: Math.floor(Math.random() * 500) + 200,
            peakHours: [
                { hour: 10, bookings: Math.floor(Math.random() * 20) + 10 },
                { hour: 14, bookings: Math.floor(Math.random() * 25) + 15 },
                { hour: 18, bookings: Math.floor(Math.random() * 30) + 20 }
            ],
            zoneStats: [
                { zone: 'A', occupancy: Math.floor(Math.random() * 40) + 40, bookings: Math.floor(Math.random() * 30) },
                { zone: 'B', occupancy: Math.floor(Math.random() * 40) + 40, bookings: Math.floor(Math.random() * 30) },
                { zone: 'C', occupancy: Math.floor(Math.random() * 40) + 40, bookings: Math.floor(Math.random() * 30) },
                { zone: 'D', occupancy: Math.floor(Math.random() * 40) + 40, bookings: Math.floor(Math.random() * 30) }
            ]
        });
    }
    await Analytics.insertMany(analytics);

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
