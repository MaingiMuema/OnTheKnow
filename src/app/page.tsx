/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Upload } from 'lucide-react';
import { Header } from '@/components/layout/Header';

const strategicPositions = [
  { x: '10%', y: '20%' },  // Top left
  { x: '70%', y: '15%' },  // Top right
  { x: '15%', y: '60%' },  // Bottom left
  { x: '65%', y: '70%' },  // Bottom right
  { x: '40%', y: '40%' }   // Center
];

export default function Home() {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const rotate = useTransform(scrollY, [0, 300], [0, 6]);
  const bgY = useTransform(scrollY, [0, 300], [0, 150]);
  const bgRotate = useTransform(scrollY, [0, 300], [0, 6]);
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true });

  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        <div className="relative z-10 text-center space-y-8 px-4 max-w-3xl mx-auto">
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
            className="text-xl md:text-2xl text-gray-300"
          >
            Transform your ideas into stunning presentations with AI
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <textarea
              placeholder="Describe your presentation or paste your content here..."
              className="w-full h-32 p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-white placeholder-gray-400 transition-all resize-none"
            />
            
            <div className="flex gap-4 justify-center">
              <label className="px-6 py-3 rounded-xl border border-purple-500 hover:bg-purple-600/20 transition-colors text-white font-semibold cursor-pointer group flex items-center gap-2">
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Upload Document
                <input type="file" className="hidden" accept=".doc,.docx,.pdf,.txt" />
              </label>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors text-white font-semibold flex-1"
              >
                Generate Presentation
              </motion.button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          style={{
            y: bgY,
            rotate: bgRotate,
          }}
          animate={{ 
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
    </div>
  );
}
