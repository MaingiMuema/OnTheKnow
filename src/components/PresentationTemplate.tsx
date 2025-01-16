/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'image' | 'bullets';
  title?: string;
  content?: string;
  imageUrl?: string;
  bullets?: string[];
  backgroundColor?: string;
  layout?: 'left' | 'right' | 'center';
}

export interface PresentationData {
  id: string;
  title: string;
  slides: Slide[];
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

interface PresentationTemplateProps {
  data: PresentationData;
  currentSlide: number;
  onNext?: () => void;
  onPrev?: () => void;
  onDownload?: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const PresentationTemplate: React.FC<PresentationTemplateProps> = ({
  data,
  currentSlide,
  onNext,
  onPrev,
  onDownload
}) => {
  const slide = data.slides[currentSlide];
  const [[page, direction], setPage] = React.useState([0, 0]);

  const renderSlideContent = (slide: Slide) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {slide.title}
            </h1>
            {slide.content && (
              <p className="text-2xl text-gray-300">{slide.content}</p>
            )}
          </div>
        );
      case 'content':
        return (
          <div className={`flex flex-col h-full p-12 ${slide.layout === 'center' ? 'items-center text-center' : ''}`}>
            <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
            <p className="text-xl text-gray-300 leading-relaxed">{slide.content}</p>
          </div>
        );
      case 'image':
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
            <div className="relative flex-1 rounded-xl overflow-hidden">
              {slide.imageUrl && (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            {slide.content && (
              <p className="mt-6 text-xl text-gray-300">{slide.content}</p>
            )}
          </div>
        );
      case 'bullets':
        return (
          <div className="flex flex-col h-full p-12">
            <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
            <ul className="space-y-4 text-xl text-gray-300">
              {slide.bullets?.map((bullet, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <span className="inline-block w-2 h-2 mt-2 mr-4 rounded-full bg-purple-500" />
                  {bullet}
                </motion.li>
              ))}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden">
      <motion.div
        key={page}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
        className="absolute inset-0"
        style={{
          backgroundColor: slide.backgroundColor || data.theme.background
        }}
      >
        {renderSlideContent(slide)}
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <span className="text-sm text-gray-400">
          {currentSlide + 1} / {data.slides.length}
        </span>
        <button
          onClick={onNext}
          disabled={currentSlide === data.slides.length - 1}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>

      {onDownload && (
        <button
          onClick={onDownload}
          className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white"
        >
          Download
        </button>
      )}
    </div>
  );
};