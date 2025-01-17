'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generatePresentation } from '@/services/presentation';
import { type PresentationData, type Slide } from '@/components/PresentationTemplate';
import { Upload } from 'lucide-react';

export const PresentationGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let input: string | { content: string; type: string };
      
      if (file) {
        const content = await file.text();
        input = { content, type: file.type };
      } else {
        input = prompt;
      }

      const result = await generatePresentation(input);
      setPresentation(result);
      setCurrentSlide(0);
    } catch (error) {
      console.error('Error generating presentation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSlide = (slide: Slide) => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl">
        {slide.type === 'title' && (
          <h1 className="text-4xl font-bold text-white mb-4">{slide.title}</h1>
        )}
        {slide.type === 'content' && (
          <>
            <h2 className="text-2xl font-semibold text-white mb-4">{slide.title}</h2>
            <p className="text-lg text-gray-300">{slide.content}</p>
          </>
        )}
        {slide.type === 'image' && slide.imageUrl && (
          <div className="relative w-full h-64">
            <img
              src={slide.imageUrl}
              alt={slide.title || 'Slide image'}
              className="object-cover rounded-lg"
            />
          </div>
        )}
        {slide.type === 'bullets' && (
          <>
            <h2 className="text-2xl font-semibold text-white mb-4">{slide.title}</h2>
            <ul className="list-disc text-gray-300 space-y-2 pl-5">
              {slide.bullets?.map((bullet: string, index: number) => (
                <li key={index} className="text-lg">
                  {bullet}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your presentation topic or description..."
            className="w-full h-32 p-4 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700">
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".doc,.docx,.pdf,.txt"
                className="hidden"
              />
            </label>
            {file && <span className="text-sm text-gray-400">{file.name}</span>}
          </div>
          <button
            type="submit"
            disabled={isLoading || (!prompt && !file)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 rounded-lg transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Presentation'}
          </button>
        </div>
      </form>

      {presentation && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
          >
            {renderSlide(presentation.slides[currentSlide])}
          </motion.div>
          
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:bg-gray-700 disabled:text-gray-500"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Slide {currentSlide + 1} of {presentation.slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(presentation.slides.length - 1, prev + 1))}
              disabled={currentSlide === presentation.slides.length - 1}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:bg-gray-700 disabled:text-gray-500"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
