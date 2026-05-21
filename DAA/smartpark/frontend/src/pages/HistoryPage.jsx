import { useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { BookingContext } from '../context/BookingContext';
import { History } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryPage = () => {
  const { history, loading, fetchHistory } = useContext(BookingContext);

  useEffect(() => {
    fetchHistory();
  }, []); // eslint-disable-line

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Booking History</h1>
          <p className="text-gray-400">View your past and current parking reservations.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-2xl py-12">
             <EmptyState 
               icon={History}
               title="No bookings yet"
               description="You haven't made any parking reservations. Once you book a spot, it will appear here."
             />
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {history.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
