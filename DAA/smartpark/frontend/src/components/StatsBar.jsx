import { motion } from 'framer-motion';

const StatsBar = ({ label, available, total, color = "brand-500" }) => {
  const percentage = total > 0 ? (available / total) * 100 : 0;
  
  // Choose color based on availability (if color not strictly forced)
  let barColor = 'bg-brand-500';
  if (percentage < 10) barColor = 'bg-red-500';
  else if (percentage < 30) barColor = 'bg-yellow-500';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        <span className="text-gray-300">{label}</span>
        <span className={percentage < 10 ? 'text-red-400' : 'text-brand-400'}>
          {available} <span className="text-gray-500">/ {total} avail</span>
        </span>
      </div>
      <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-2 rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
};

export default StatsBar;
