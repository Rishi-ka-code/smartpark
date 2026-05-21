import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock } from 'lucide-react';

const RecommendationCard = ({ recommendation, onReserve, isLoading }) => {
  if (!recommendation && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 border border-brand-500/30 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      {isLoading ? (
        <div className="animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-6 w-24 bg-dark-700 rounded"></div>
            <div className="h-10 w-20 bg-dark-700 rounded-lg"></div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-4 w-32 bg-dark-700 rounded"></div>
            <div className="h-4 w-28 bg-dark-700 rounded"></div>
          </div>
          <div className="h-12 w-full bg-dark-700 rounded-lg"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-400 text-sm font-medium mb-1">Recommended Spot</p>
              <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                {recommendation.slot.slotNumber}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
              </h3>
            </div>
            <div className="bg-dark-700 px-3 py-1 rounded-lg text-sm border border-white/5">
              Zone {recommendation.zone}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Navigation className="w-4 h-4 text-brand-400" />
              <span className="text-sm">Distance: {recommendation.distance}m</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="text-sm">Walk: {recommendation.walkTime} min</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span className="text-sm">Floor {recommendation.floor}</span>
            </div>
          </div>

          <button
            onClick={onReserve}
            className="w-full bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(20,184,166,0.3)]"
          >
            Reserve This Spot
          </button>
        </>
      )}
    </motion.div>
  );
};

export default RecommendationCard;
