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
  bullets?: string[];
  subtitle?: string;
  caption?: string;
  backgroundColor?: string;
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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <style jsx global>{`
        @media (max-width: 640px) {
          .slide-content {
            padding: 1rem !important;
          }
          .slide-title {
            font-size: 1.75rem !important;
          }
          .slide-body {
            font-size: 1rem !important;
          }
          .bullet-item {
            margin-bottom: 0.5rem !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .slide-content {
            padding: 1.5rem !important;
          }
          .slide-title {
            font-size: 2rem !important;
          }
          .slide-body {
            font-size: 1.125rem !important;
          }
        }
        .image-container {
          position: relative;
          width: 100%;
          max-height: 60vh;
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .slide-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: rgba(0, 0, 0, 0.1);
        }
        @media (orientation: landscape) {
          .image-container {
            max-height: 50vh;
          }
        }
      `}</style>

      <div className="absolute top-4 right-4 space-x-4">
        {onDownload && (
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Download
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl aspect-[16/9] relative overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <style dangerouslySetInnerHTML={{ __html: presentation.slides[currentSlide].css }} />
            <div
              dangerouslySetInnerHTML={{ __html: presentation.slides[currentSlide].html }}
              className="w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
          {currentSlide + 1} / {presentation.slides.length}
        </div>
      </div>

      <button
        onClick={nextSlide}
        disabled={currentSlide === presentation.slides.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};