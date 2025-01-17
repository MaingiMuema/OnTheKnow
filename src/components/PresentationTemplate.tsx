/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  bullets?: string[];
  type: 'bullets' | 'text' | 'title' | 'content' | 'overview' | 'image';
  backgroundColor?: string;
  layout?: 'left' | 'right' | 'center' | 'split';
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
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
  data: PresentationData;
  currentSlide: number;
  onSlideChange?: (index: number) => void;
  onDownload?: () => void;
}

type ThemeKey = 'blue' | 'purple' | 'indigo';
type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
};

const defaultThemes: Record<ThemeKey, ThemeColors> = {
  blue: {
    primary: '#0066FF',
    secondary: '#E6F0FF',
    accent: '#00D1FF',
    text: '#FFFFFF'
  },
  purple: {
    primary: '#6B46C1',
    secondary: '#F3E8FF',
    accent: '#9F7AEA',
    text: '#FFFFFF'
  },
  indigo: {
    primary: '#4F46E5',
    secondary: '#E0E7FF',
    accent: '#818CF8',
    text: '#FFFFFF'
  }
};

const themeKeys: ThemeKey[] = ['blue', 'purple', 'indigo'];

const getSlideTheme = (index: number, type: string) => {
  const themes = Object.values(defaultThemes);
  const theme = themes[index % themes.length];
  
  switch (type) {
    case 'title':
      return {
        containerClass: 'grid grid-cols-2 gap-8',
        titleClass: 'text-5xl font-bold leading-tight',
        contentClass: 'flex flex-col justify-center'
      };
    case 'overview':
      return {
        containerClass: 'grid grid-cols-2 bg-gradient-to-r from-primary to-accent',
        titleClass: 'text-3xl font-bold mb-6',
        contentClass: 'prose prose-lg prose-invert'
      };
    case 'content':
      return {
        containerClass: 'flex items-center justify-between',
        titleClass: 'text-4xl font-bold mb-8',
        contentClass: 'space-y-4'
      };
    default:
      return {
        containerClass: 'flex flex-col',
        titleClass: 'text-3xl font-bold mb-6',
        contentClass: 'prose prose-lg'
      };
  }
};

const SlideContent: React.FC<{ slide: Slide; index: number }> = ({ slide, index }) => {
  const theme = slide.theme || defaultThemes[themeKeys[index % themeKeys.length]];
  const layout = getSlideTheme(index, slide.type);

  const renderContent = () => {
    if (slide.type === 'bullets' && slide.bullets) {
      return (
        <ul className="space-y-4 text-lg">
          {slide.bullets.map((bullet, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start"
            >
              <span className="mr-3 text-[${theme.accent}]">
                <div className="w-6 h-6 rounded-full bg-[${theme.accent}] flex items-center justify-center text-sm">
                  {String(idx + 1).padStart(2, '0')}
                </div>
              </span>
              <span className="leading-relaxed">{bullet}</span>
            </motion.li>
          ))}
        </ul>
      );
    }

    if (slide.type === 'image' && slide.imageUrl) {
      return (
        <div className="w-full h-full flex flex-col">
          <h2 className="text-2xl md:text-4xl font-bold mb-6">{slide.title}</h2>
          <div className="flex-1 relative rounded-xl overflow-hidden">
            <img
              src={slide.imageUrl}
              alt={slide.title || 'Slide image'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {slide.content && (
            <p className="mt-4 text-lg leading-relaxed">
              {slide.content}
            </p>
          )}
        </div>
      );
    }

    if (slide.type === 'overview') {
      return (
        <div className={layout.containerClass}>
          <div className="bg-[${theme.primary}] p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
            <div className="prose prose-invert">
              {slide.content}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {slide.content.split('\n').map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 p-6 rounded-xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={layout.contentClass}>
        {slide.content.split('\n').map((paragraph, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-lg leading-relaxed"
          >
            {paragraph.trim()}
          </motion.p>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`h-full ${layout.containerClass}`}
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
        color: theme.text
      }}
    >
      <motion.div 
        className="p-8 h-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className={layout.titleClass}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {slide.title}
        </motion.h2>
        <div className="flex-1">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};

export const PresentationTemplate: React.FC<PresentationTemplateProps> = ({
  data,
  currentSlide,
  onSlideChange,
  onDownload,
}) => {
  const slide = data.slides[currentSlide];

  return (
    <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden">
      <div className="relative w-full pb-[56.25%]">
        <div className="absolute inset-0">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="w-full h-full"
          >
            <SlideContent slide={slide} index={currentSlide} />
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={() => onSlideChange?.(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-2">
          {data.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSlideChange?.(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => onSlideChange?.(Math.min(data.slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === data.slides.length - 1}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {onDownload && (
          <button
            onClick={onDownload}
            className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
      </div>

      <div className="absolute bottom-4 right-4 text-sm text-white/60">
        {currentSlide + 1} / {data.slides.length}
      </div>
    </div>
  );
};