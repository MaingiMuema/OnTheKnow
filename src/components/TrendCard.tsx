import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TrendCardProps {
  trend: {
    title: string;
    category: string;
    color: string;
  };
  position: { x: string; y: string };
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
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.5
          }}
          className="fixed z-20 cursor-pointer"
          style={{ 
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
          }}
          whileHover={{ scale: 1.05 }}
        >
          <div 
            className={`p-4 rounded-xl backdrop-blur-md shadow-lg border border-white/10
              ${trend.color} w-64 transform transition-transform duration-200`}
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full bg-white"
              />
              <span className="text-xs font-medium text-white/80">
                {trend.category}
              </span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="ml-auto text-xs text-white/60"
              >
                Just now
              </motion.span>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-semibold text-white leading-snug"
            >
              {trend.title}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
