/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FileContent } from '@/types/files';
import { type PresentationData, type Slide } from '@/components/PresentationTemplate';

const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;
const POLLINATIONS_API = 'https://image.pollinations.ai/prompt/';

const generateImageUrl = async (prompt: string): Promise<string> => {
  return `${POLLINATIONS_API}${encodeURIComponent(prompt)}`;
};

const generateSlideImagePrompt = (slide: Partial<Slide>): string => {
  const context = `Create a professional, modern business presentation visual for: ${slide.title}. ${slide.content}`;
  return context;
};

const generateSlideHTML = (content: any, theme: any) => {
  const baseStyles = `
    .slide-content {
      height: 100%;
      padding: 2rem;
      color: ${theme.text};
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%);
    }
    .slide-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      background: linear-gradient(to right, ${theme.text}, ${theme.secondary});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .slide-body {
      font-size: 1.25rem;
      line-height: 1.6;
    }
    .bullet-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .bullet-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      opacity: 0;
      animation: fadeIn 0.5s ease forwards;
    }
    .bullet-number {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: ${theme.accent};
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;

  let slideHTML = '';
  let slideCSS = baseStyles;

  if (content.type === 'title') {
    slideHTML = `
      <div class="slide-content flex flex-col items-center justify-center text-center">
        <h1 class="slide-title text-5xl mb-8">${content.title}</h1>
        <p class="slide-body text-2xl">${content.subtitle || ''}</p>
      </div>
    `;
  } else if (content.type === 'bullets') {
    const bullets = content.bullets.map((bullet: string, index: number) => `
      <li class="bullet-item" style="animation-delay: ${index * 0.1}s">
        <span class="bullet-number">${String(index + 1).padStart(2, '0')}</span>
        <span>${bullet}</span>
      </li>
    `).join('');

    slideHTML = `
      <div class="slide-content">
        <h2 class="slide-title">${content.title}</h2>
        <ul class="bullet-list">
          ${bullets}
        </ul>
      </div>
    `;
  } else if (content.type === 'image') {
    slideCSS += `
      .image-container {
        position: relative;
        width: 100%;
        height: 60%;
        border-radius: 1rem;
        overflow: hidden;
        margin: 1rem 0;
      }
      .slide-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;

    slideHTML = `
      <div class="slide-content">
        <h2 class="slide-title">${content.title}</h2>
        <div class="image-container">
          <img src="${content.imageUrl}" alt="${content.title}" class="slide-image">
        </div>
        ${content.caption ? `<p class="slide-body text-center mt-4">${content.caption}</p>` : ''}
      </div>
    `;
  } else {
    slideHTML = `
      <div class="slide-content">
        <h2 class="slide-title">${content.title}</h2>
        <div class="slide-body">
          ${content.content.split('\n').map((p: string) => `<p class="mb-4">${p}</p>`).join('')}
        </div>
      </div>
    `;
  }

  return { html: slideHTML.trim(), css: slideCSS.trim() };
};

const formatContent = (slide: any): Partial<Slide> => {
  const formattedSlide = { ...slide };

  if (slide.content && typeof slide.content === 'string') {
    // Convert bullet point content into arrays
    if (slide.content.includes('•')) {
      formattedSlide.bullets = slide.content
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.startsWith('•'))
        .map((line: string) => line.replace('•', '').trim());
      
      // If it's a bullets type slide, ensure it's marked as such
      if (formattedSlide.bullets.length > 0 && !slide.type) {
        formattedSlide.type = 'bullets';
      }
    }
  }

  // Ensure type is set
  if (!formattedSlide.type) {
    formattedSlide.type = 'content';
  }

  return formattedSlide;
};

export const parseAIResponse = async (response: string): Promise<PresentationData> => {
  try {
    // Remove markdown code block markers if present
    const cleanJson = response.replace(/^```json\n|\n```$/g, '').trim();
    console.log('🔍 Cleaned JSON:', cleanJson);
    
    const parsed = JSON.parse(cleanJson);
    const slides = parsed.slides.map(async (slide: any, index: number) => {
      // Format the content and convert bullet points
      const formattedSlide = formatContent(slide);
      
      if (formattedSlide.type === 'image' && !formattedSlide.imageUrl) {
        const imagePrompt = generateSlideImagePrompt(formattedSlide);
        formattedSlide.imageUrl = await generateImageUrl(imagePrompt);
      }

      const { html, css } = generateSlideHTML({
        ...formattedSlide,
        id: `slide-${index}`,
      } as Slide, parsed.theme || {
        primary: '#9333EA',
        secondary: '#EC4899',
        accent: '#A855F7',
        background: '#111827',
        text: '#FFFFFF',
      });

      return {
        ...formattedSlide,
        id: `slide-${index}`,
        html,
        css,
        backgroundColor: formattedSlide.backgroundColor,
        type: formattedSlide.type || 'content',
        title: formattedSlide.title || '',
      } as Slide;
    });

    return {
      id: Date.now().toString(),
      title: parsed.title,
      slides: await Promise.all(slides),
      theme: {
        primary: '#9333EA', // purple-600
        secondary: '#EC4899', // pink-600
        accent: '#A855F7', // purple-500
        background: '#111827', // gray-900
        text: '#FFFFFF',
      },
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to parse AI response');
  }
};

export const generatePresentation = async (
  input: string | FileContent,
  onProgress?: (status: string) => void
): Promise<PresentationData> => {
  try {
    onProgress?.('Generating presentation structure...');
    console.log('🎯 Making API request with input:', typeof input === 'string' ? 'text prompt' : 'file content');
    
    const prompt = typeof input === 'string' 
      ? input 
      : `Generate presentation from this document: ${input.content}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'system',
            content: `You are a professional presentation creator specializing in creating engaging, visually appealing presentations. Create a comprehensive presentation following these rules:

              1. Content Requirements:
                - Create at least 8-12 slides for comprehensive coverage
                - Each slide must be detailed and informative
                - Include relevant statistics, facts, or data points
                - Add engaging bullet points and key takeaways
                - Suggest relevant image descriptions for each slide

              2. Slide Structure:
                - Start with an attention-grabbing title slide
                - Include an agenda/overview slide
                - Main content slides with clear headings
                - End with a strong conclusion/summary slide

              3. Format the response as a JSON object with:
                - title: string (make it catchy and professional)
                - slides: array of slides, each with:
                  - type: 'title' | 'content' | 'image' | 'bullets'
                  - title: string (clear and descriptive)
                  - content: string (detailed content with bullet points using • for bullets)
                  - imagePrompt?: string (detailed description for slide visual)

              4. Visual Guidelines:
                - Each slide should have a suggested image prompt
                - Image prompts should be detailed and specific
                - Ensure visual continuity throughout the presentation

              Make the presentation engaging, professional, and visually appealing.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      }),
    });

    console.log('📡 API Response status:', response.status);
    if (!response.ok) {
      console.error('🔥 API Error:', response.status, response.statusText);
      throw new Error('Failed to generate presentation structure');
    }

    const data = await response.json();
    console.log('📦 Raw API response:', data);
    
    const presentationData = await parseAIResponse(data.choices[0].message.content);
    console.log('🎨 Parsed presentation data:', presentationData);

    onProgress?.('Generating visuals...');

    // Generate images for slides that need them
    const slidesWithImages = await Promise.all(
      presentationData.slides.map(async (slide) => {
        if (slide.type === 'image') {
          const imagePrompt = generateSlideImagePrompt(slide);
          slide.imageUrl = await generateImageUrl(imagePrompt);
        }
        return slide;
      })
    );

    onProgress?.('Finalizing presentation...');

    return {
      ...presentationData,
      slides: slidesWithImages,
    };
  } catch (error) {
    console.error('💥 Error in generatePresentation:', error);
    throw error;
  }
};

export const downloadPresentation = async (data: PresentationData) => {
  // Implementation for downloading presentation
  // This could be expanded to generate a PDF or PPTX file
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}-presentation.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
