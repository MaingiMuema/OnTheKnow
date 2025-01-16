/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { TrendCard } from '@/components/TrendCard';

const trends = [
  { 
    title: "AI revolutionizes healthcare with breakthrough diagnostics",
    category: "Healthcare",
    color: "bg-gradient-to-r from-blue-500/30 to-cyan-500/30"
  },
  {
    title: "New quantum computing milestone achieved",
    category: "Technology",
    color: "bg-gradient-to-r from-purple-500/30 to-pink-500/30"
  },
  {
    title: "Sustainable energy breakthrough in solar technology",
    category: "Environment",
    color: "bg-gradient-to-r from-green-500/30 to-emerald-500/30"
  },
  {
    title: "Space exploration: New exoplanet discovery",
    category: "Space",
    color: "bg-gradient-to-r from-orange-500/30 to-red-500/30"
  },
  {
    title: "Breakthrough in quantum cryptography",
    category: "Cybersecurity",
    color: "bg-gradient-to-r from-indigo-500/30 to-purple-500/30"
  }
];

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true });
  const [activeCards, setActiveCards] = useState<Array<{ trend: typeof trends[0]; position: { x: number; y: number }; id: number }>>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const addCard = () => {
      const randomTrend = trends[Math.floor(Math.random() * trends.length)];
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Calculate random position within viewport bounds
      const position = {
        x: Math.random() * (viewport.width - 300), // 300px is approximate card width
        y: Math.random() * (viewport.height - 200)  // 200px is approximate card height
      };

      setActiveCards(prev => [...prev, { trend: randomTrend, position, id: nextId }]);
      setNextId(prev => prev + 1);
    };

    // Add initial cards
    const initialCards = setInterval(() => {
      if (activeCards.length < 3) {
        addCard();
      }
    }, 2000);

    // Continue adding new cards periodically
    const newCards = setInterval(() => {
      if (activeCards.length < 3) {
        addCard();
      }
    }, 4000);

    return () => {
      clearInterval(initialCards);
      clearInterval(newCards);
    };
  }, [activeCards.length, nextId]);

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <motion.div 
        style={{ scale, opacity, y }}
        className="relative h-screen flex items-center justify-center"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
          />
        </div>

        {/* Trend Cards */}
        {activeCards.map(({ trend, position, id }) => (
          <TrendCard
            key={id}
            trend={trend}
            position={position}
            onRemove={() => setActiveCards(prev => prev.filter(card => card.id !== id))}
          />
        ))}
        
        <div className="relative z-10 text-center space-y-8 px-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
            className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            OnTheKnow
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
          >
            Stay ahead with real-time insights and emerging trends
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold"
            >
              Explore Trends
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full border border-purple-600 hover:bg-purple-600/20 transition-colors text-white font-semibold"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          animate={{ 
            y: scrollY * 0.5,
            rotate: scrollY * 0.02,
            scale: [1, 1.2, 1],
          }}
          transition={{
            scale: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full filter blur-3xl opacity-20"
        />
      </motion.div>

      {/* Trends Section */}
      <motion.section 
        ref={featuresRef}
        id="trends"
        className="py-20 px-4 md:px-8 relative overflow-hidden"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
          >
            Trending Now
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trends.map((trend, i) => (
              <motion.div 
                key={i}
                initial={{ y: 50, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ 
                  delay: i * 0.2,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.03,
                  y: -5,
                }}
                className={`relative group cursor-pointer`}
              >
                <div className={`absolute inset-0 ${trend.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
                <div className="relative p-6 rounded-2xl backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                      {trend.category}
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="ml-auto px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white"
                    >
                      Trending
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors duration-300">
                    {trend.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <motion.svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-4 h-4"
                        animate={{ y: [0, -2, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </motion.svg>
                      <span>Gaining traction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Updated recently</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors duration-300"
                  >
                    Read More
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold"
            >
              View All Trends
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
