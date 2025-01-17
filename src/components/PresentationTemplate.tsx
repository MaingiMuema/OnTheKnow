/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Slide {
  id: string;
  title: string;
  type: 'title' | 'bullets' | 'text' | 'image' | 'content' | 'overview';
  content?: string;
  html: string;
  css: string;
  imageUrl?: string;
  iconUrl?: string;
  bullets?: string[];
  subtitle?: string;
  caption?: string;
  backgroundColor?: string;
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface PresentationData {
  id: string;
  title: string;
  slides: Slide[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

interface PresentationTemplateProps {
  presentation: PresentationData;
  currentSlide: number;
  onSlideChange: (slideIndex: number) => void;
  onClose?: () => void;
  onDownload?: () => void;
}

export const PresentationTemplate: React.FC<PresentationTemplateProps> = ({
  presentation,
  currentSlide,
  onSlideChange,
  onClose,
  onDownload,
}) => {
  const nextSlide = () => {
    if (currentSlide < presentation.slides.length - 1) {
      onSlideChange(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      onSlideChange(currentSlide - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {onDownload && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/20"
          >
            Download
          </motion.button>
        )}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg shadow-gray-500/20"
          >
            Close
          </motion.button>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      <div className="w-full max-w-6xl aspect-[16/9] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
            initial={{ width: `${(currentSlide / (presentation.slides.length - 1)) * 100}%` }}
            animate={{ width: `${(currentSlide / (presentation.slides.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-4 w-full h-full relative overflow-hidden rounded-2xl shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full h-full"
            >
              <style dangerouslySetInnerHTML={{ __html: presentation.slides[currentSlide].css }} />
              <div
                dangerouslySetInnerHTML={{ __html: presentation.slides[currentSlide].html }}
                className="w-full h-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-medium shadow-lg"
        >
          {currentSlide + 1} / {presentation.slides.length}
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        disabled={currentSlide === presentation.slides.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>
    </div>
  );
};