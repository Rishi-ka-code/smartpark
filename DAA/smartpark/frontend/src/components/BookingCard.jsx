import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BookingCard = ({ booking }) => {
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const isActive = booking.status === 'active';
  const isExpired = booking.status === 'expired';

  const entryDate = new Date(booking.entryTime);
  const exitDate = booking.exitTime ? new Date(booking.exitTime) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 rounded-xl border-l-4 ${
        isActive ? 'border-brand-500' :
        isCompleted ? 'border-blue-500' :
        isCancelled ? 'border-red-500' : 'border-yellow-500'
      } relative overflow-hidden group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-bold text-white">
              {booking.slot.slotNumber} <span className="text-gray-500 font-normal text-sm">/ Zone {booking.slot.zone}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {entryDate.toLocaleDateString()}
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
          isActive ? 'bg-brand-500/20 text-brand-400' :
          isCompleted ? 'bg-blue-500/20 text-blue-400' :
          isCancelled ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isActive && <Clock className="w-3 h-3" />}
          {isCompleted && <CheckCircle className="w-3 h-3" />}
          {isCancelled && <XCircle className="w-3 h-3" />}
          {isExpired && <AlertCircle className="w-3 h-3" />}
          <span className="capitalize">{booking.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500 mb-1">Entry</p>
          <p className="text-sm text-gray-200">{entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Exit</p>
          <p className="text-sm text-gray-200">
            {exitDate ? exitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Duration</p>
          <p className="text-sm text-gray-200">
            {booking.duration > 0 ? `${booking.duration} min` : 'Ongoing'}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Fare</p>
          <p className={`text-sm font-medium ${booking.fare > 0 ? 'text-brand-400' : 'text-gray-200'}`}>
            ${booking.fare.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingCard;
