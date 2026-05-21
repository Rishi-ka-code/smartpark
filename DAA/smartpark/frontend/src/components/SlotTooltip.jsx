import { motion } from 'framer-motion';

const SlotTooltip = ({ x, y, slot, visible }) => {
  if (!visible || !slot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 5 }}
      style={{ left: x, top: y - 10 }}
      className="absolute z-50 -translate-x-1/2 -translate-y-full pointer-events-none"
    >
      <div className="glass-card px-4 py-3 rounded-lg shadow-2xl min-w-[140px]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">{slot.slotNumber}</span>
          <span className="text-xs text-gray-400 bg-dark-700 px-2 py-1 rounded">Zone {slot.zone}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            slot.status === 'available' ? 'bg-brand-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]' : 
            slot.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm text-gray-300 capitalize">{slot.status}</span>
        </div>
        
        {slot.vehicleNumber && (
          <div className="mt-2 text-xs text-gray-400 border-t border-dark-700 pt-2">
            Vehicle: <span className="text-white">{slot.vehicleNumber}</span>
          </div>
        )}
        
        {/* Tooltip arrow */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full border-[6px] border-transparent border-t-dark-800"></div>
      </div>
    </motion.div>
  );
};

export default SlotTooltip;
