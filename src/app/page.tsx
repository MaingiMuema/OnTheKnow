/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PresentationTemplate, type PresentationData } from '@/components/PresentationTemplate';
import { generatePresentation, downloadPresentation } from '../services/presentation';
import { type FileContent } from '@/types/files';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const rotate = useTransform(scrollY, [0, 300], [0, 6]);
  const bgY = useTransform(scrollY, [0, 300], [0, 150]);
  const bgRotate = useTransform(scrollY, [0, 300], [0, 6]);
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true });

  const handleGenerate = async () => {
    if (!prompt && !file) return;
    
    console.log('🚀 Starting presentation generation...', { prompt, file });
    setIsGenerating(true);
    setGenerationStatus('Starting generation...');
    
    try {
      let input: string | FileContent;
      
      if (file) {
        const content = await file.text();
        console.log('📄 File content loaded:', { type: file.type, contentLength: content.length });
        input = { content, type: file.type };
      } else {
        input = prompt;
      }

      const data = await generatePresentation(input, (status) => {
        console.log('📊 Generation status:', status);
        setGenerationStatus(status);
      });
      
      console.log('✅ Presentation generated:', data);
      setPresentationData(data);
      setCurrentSlide(0);
    } catch (error) {
      console.error('❌ Error generating presentation:', error);
      setGenerationStatus('Error generating presentation. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!presentationData) return;
    await downloadPresentation(presentationData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentationData) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => Math.min(presentationData.slides.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationData]);

  const handleSlideChange = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <motion.div 
        style={{ scale, opacity, y }}
        className="relative min-h-screen flex items-center justify-center"
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

        <div className={`relative z-10 w-full transition-all duration-500 ${isGenerating ? 'px-8 flex gap-8' : 'px-4 max-w-3xl mx-auto'}`}>
          <motion.div 
            layout
            className={`space-y-8 ${isGenerating ? 'w-1/2 text-left pt-20' : 'text-center'}`}
          >
            <motion.h1 
              layout
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 ${isGenerating ? 'text-4xl md:text-5xl' : 'text-6xl md:text-8xl'}`}
            >
              OnTheKnow
            </motion.h1>
            <motion.p 
              layout
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300"
            >
              Transform your ideas into stunning presentations with AI
            </motion.p>
            
            <motion.div 
              layout
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your presentation or paste your content here..."
                className="w-full h-32 p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-white placeholder-gray-400 transition-all resize-none"
              />
              
              <div className="flex gap-4 justify-center">
                <label className="px-6 py-3 rounded-xl border border-purple-500 hover:bg-purple-600/20 transition-colors text-white font-semibold cursor-pointer group flex items-center gap-2">
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Upload Document
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".doc,.docx,.pdf,.txt" 
                  />
                </label>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors text-white font-semibold flex-1"
                >
                  Generate Presentation
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-1/2 bg-gray-900/50 backdrop-blur rounded-2xl p-6 border mt-20 border-purple-500/20 h-[600px] relative"
              >
                {presentationData ? (
                  <div className="h-full overflow-y-auto pb-16 custom-scrollbar">
                    <PresentationTemplate
                      data={presentationData}
                      currentSlide={currentSlide}
                      onSlideChange={handleSlideChange}
                      onDownload={handleDownload}
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="space-y-4 text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <h2 className="text-2xl font-semibold">
                        {generationStatus}
                      </h2>
                      <p className="text-gray-400">
                        This may take a few moments...
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
