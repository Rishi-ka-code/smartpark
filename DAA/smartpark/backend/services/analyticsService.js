/**
 * Analytics service — aggregation and statistics computation.
 */

import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Analytics from '../models/Analytics.js';

/**
 * Get dashboard statistics.
 */
export async function getDailyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalBookingsToday = await Booking.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow }
  });

  const completedToday = await Booking.countDocuments({
    status: 'completed',
    createdAt: { $gte: today, $lt: tomorrow }
  });

  const cancelledToday = await Booking.countDocuments({
    status: 'cancelled',
    createdAt: { $gte: today, $lt: tomorrow }
  });

  const activeBookings = await Booking.countDocuments({ status: 'active' });

  // Revenue today
  const revenueResult = await Booking.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: { _id: null, total: { $sum: '$fare' } }
    }
  ]);
  const revenueToday = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Total revenue all time
  const totalRevenueResult = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$fare' } } }
  ]);
  const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  const totalSlots = await ParkingSlot.countDocuments();
  const occupiedSlots = await ParkingSlot.countDocuments({ status: { $ne: 'available' } });
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  return {
    totalBookingsToday,
    completedToday,
    cancelledToday,
    activeBookings,
    revenueToday,
    totalRevenue,
    totalSlots,
    occupiedSlots,
    occupancyRate
  };
}

/**
 * Get current occupancy rate across all zones.
 */
export async function getOccupancyRate() {
  const zones = ['A', 'B', 'C', 'D'];
  const result = { overall: 0, zones: {} };

  let totalAll = 0;
  let occupiedAll = 0;

  for (const zone of zones) {
    const total = await ParkingSlot.countDocuments({ zone });
    const available = await ParkingSlot.countDocuments({ zone, status: 'available' });
    const occupied = await ParkingSlot.countDocuments({ zone, status: 'occupied' });
    const reserved = await ParkingSlot.countDocuments({ zone, status: 'reserved' });

    totalAll += total;
    occupiedAll += occupied + reserved;

    result.zones[zone] = {
      total,
      available,
      occupied,
      reserved,
      occupancyRate: total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0
    };
  }

  result.overall = totalAll > 0 ? Math.round((occupiedAll / totalAll) * 100) : 0;
  result.totalSlots = totalAll;
  result.totalAvailable = totalAll - occupiedAll;
  result.totalOccupied = occupiedAll;

  return result;
}

/**
 * Analyze peak hours based on booking entry times.
 */
export async function getPeakHours() {
  const result = await Booking.aggregate([
    {
      $group: {
        _id: { $hour: '$entryTime' },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    bookings: 0,
    label: `${i.toString().padStart(2, '0')}:00`
  }));

  for (const r of result) {
    hours[r._id].bookings = r.count;
  }

  return hours;
}

/**
 * Get per-zone statistics.
 */
export async function getZoneStats() {
  const zones = ['A', 'B', 'C', 'D'];
  const stats = [];

  for (const zone of zones) {
    const total = await ParkingSlot.countDocuments({ zone });
    const occupied = await ParkingSlot.countDocuments({ zone, status: { $ne: 'available' } });
    const bookings = await Booking.countDocuments({
      status: { $in: ['active', 'completed'] }
    });

    stats.push({
      zone,
      total,
      occupied,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      bookings
    });
  }

  return stats;
}

/**
 * Update daily analytics record.
 */
export async function updateDailyAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await getDailyStats();
  const peakHours = await getPeakHours();
  const zoneStats = await getZoneStats();

  await Analytics.findOneAndUpdate(
    { date: today },
    {
      date: today,
      totalBookings: stats.totalBookingsToday,
      completedBookings: stats.completedToday,
      cancelledBookings: stats.cancelledToday,
      occupancyRate: stats.occupancyRate,
      revenue: stats.revenueToday,
      peakHours: peakHours.filter(h => h.bookings > 0).map(h => ({
        hour: h.hour,
        bookings: h.bookings
      })),
      zoneStats: zoneStats.map(z => ({
        zone: z.zone,
        occupancy: z.occupancyRate,
        bookings: z.bookings
      }))
    },
    { upsert: true, new: true }
  );
}
