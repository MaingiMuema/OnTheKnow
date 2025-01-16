import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TrendCardProps {
  trend: {
    title: string;
    category: string;
    color: string;
  };
  position: { x: number; y: number };
  onRemove: () => void;
}

export const TrendCard = ({ trend, position, onRemove }: TrendCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onRemove, 500); // Wait for exit animation
    }, 6000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, x: position.x, y: position.y }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute z-20 cursor-pointer"
          style={{ left: position.x, top: position.y }}
          whileHover={{ scale: 1.05 }}
        >
          <div 
            className={`p-4 rounded-xl backdrop-blur-md shadow-lg border border-white/10
              ${trend.color} w-64 transform transition-transform duration-200`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-medium text-white/80">
                {trend.category}
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-snug">
              {trend.title}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
