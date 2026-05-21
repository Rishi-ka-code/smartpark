import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const ParkingContext = createContext();

export const ParkingProvider = ({ children }) => {
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [recommendedSlot, setRecommendedSlot] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState('A');
  const [presentationMode, setPresentationMode] = useState(true);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [parkingRes, analyticsRes] = await Promise.all([
        api.get('/parking'),
        api.get('/analytics/occupancy')
      ]);
      setAreas(parkingRes.data.areas);
      setLiveStats(analyticsRes.data);
      fetchSlots(selectedZone);
    } catch (error) {
      console.error('Error fetching parking data', error);
    }
    setLoading(false);
  };

  const fetchSlots = async (zone, floor) => {
    try {
      const query = [];
      if (zone) query.push(`zone=${zone}`);
      if (floor) query.push(`floor=${floor}`);
      
      const res = await api.get(`/parking/slots?${query.join('&')}`);
      setSlots(res.data);
    } catch (error) {
      console.error('Error fetching slots', error);
    }
  };

  const getRecommendation = async (zone, floor) => {
    setLoading(true);
    try {
      const query = [];
      if (zone) query.push(`zone=${zone}`);
      if (floor) query.push(`floor=${floor}`);
      
      const res = await api.get(`/parking/recommended-slot?${query.join('&')}`);
      setRecommendedSlot(res.data);
      toast.success('Found best spot for you');
    } catch (error) {
      setRecommendedSlot(null);
      toast.error(error.response?.data?.error || 'Could not find a slot');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();

    const socket = getSocket();

    // When any slot changes, update it in the local array immediately
    socket.on('slot_update', (updatedSlot) => {
      setSlots((prevSlots) => 
        prevSlots.map((slot) => 
          slot._id === updatedSlot.slotId 
            ? { ...slot, status: updatedSlot.status, vehicleNumber: updatedSlot.vehicleNumber || '' }
            : slot
        )
      );

      // If someone else reserved the slot we recommended, clear our recommendation
      setRecommendedSlot((prev) => {
        if (prev && prev.slot && prev.slot._id === updatedSlot.slotId && updatedSlot.status !== 'available') {
          return null;
        }
        return prev;
      });
    });

    // When stats change, update the live stats object immediately
    socket.on('stats_update', (stats) => {
      if (stats && stats.zones) {
        setLiveStats(stats);
      }
    });

    // On facility_refresh, refetch everything (backup for complex state changes)
    socket.on('facility_refresh', () => {
      fetchSlots(selectedZone);
      api.get('/analytics/occupancy').then(res => setLiveStats(res.data)).catch(() => {});
    });

    return () => {
      socket.off('slot_update');
      socket.off('stats_update');
      socket.off('facility_refresh');
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    fetchSlots(selectedZone);
  }, [selectedZone]);

  return (
    <ParkingContext.Provider
      value={{
        areas,
        slots,
        recommendedSlot,
        liveStats,
        loading,
        selectedZone,
        setSelectedZone,
        fetchSlots,
        getRecommendation,
        setRecommendedSlot,
        presentationMode,
        setPresentationMode,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};
