import { getDailyStats, getOccupancyRate, getPeakHours, getZoneStats } from '../services/analyticsService.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDailyStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current occupancy rate
 * @route   GET /api/analytics/occupancy
 * @access  Public
 */
export const getOccupancy = async (req, res, next) => {
  try {
    const occupancy = await getOccupancyRate();
    res.json(occupancy);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get peak hour analysis
 * @route   GET /api/analytics/peak-hours
 * @access  Private/Admin
 */
export const getPeakHoursController = async (req, res, next) => {
  try {
    const peakHours = await getPeakHours();
    res.json(peakHours);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get zone statistics
 * @route   GET /api/analytics/zones
 * @access  Private/Admin
 */
export const getZoneStatsController = async (req, res, next) => {
  try {
    const zoneStats = await getZoneStats();
    res.json(zoneStats);
  } catch (error) {
    next(error);
  }
};
