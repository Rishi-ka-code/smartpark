import { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import { getSocket } from '../services/socket';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [activeBooking, setActiveBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/booking/history');
      setActiveBooking(res.data.active);
      setHistory(res.data.history);
    } catch (error) {
      console.error('Error fetching history', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
      
      const socket = getSocket();

      // Listen for booking updates (our own or system-triggered expirations)
      socket.on('booking_update', (bookingUpdate) => {
        // If this booking expired or was completed, clear active booking
        if (bookingUpdate.userId === user._id && bookingUpdate.status !== 'active') {
          setActiveBooking(null);
          if (bookingUpdate.status === 'expired') {
            toast('Your reservation has expired', { icon: '⏰' });
          }
        }
        // Refetch to get clean populated data
        fetchHistory();
      });

      return () => {
        socket.off('booking_update');
      };
    } else {
      setActiveBooking(null);
      setHistory([]);
    }
  }, [user]); // eslint-disable-line

  const reserveSlot = async (slotId, vehicleNumber, startTime, endTime) => {
    setLoading(true);
    try {
      const res = await api.post('/booking/reserve', { slotId, vehicleNumber, startTime, endTime });
      setActiveBooking(res.data);
      toast.success('Slot reserved successfully');
      await fetchHistory();
      setLoading(false);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reserve slot');
      setLoading(false);
      return false;
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.put(`/booking/cancel/${id}`);
      setActiveBooking(null);
      toast.success('Booking cancelled');
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    }
  };

  const completeBooking = async (id) => {
    try {
      await api.put(`/booking/complete/${id}`);
      setActiveBooking(null);
      toast.success('Parking completed successfully');
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete booking');
    }
  };

  return (
    <BookingContext.Provider
      value={{
        activeBooking,
        history,
        loading,
        reserveSlot,
        cancelBooking,
        completeBooking,
        fetchHistory,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
