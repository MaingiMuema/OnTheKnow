/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FileContent } from '@/types/files';
import { type PresentationData, type Slide } from '@/components/PresentationTemplate';

const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;
const POLLINATIONS_API = 'https://image.pollinations.ai/prompt/';

const generateImageUrl = (prompt: string) => {
  return `${POLLINATIONS_API}${encodeURIComponent(prompt)}`;
};

const generateSlideImagePrompt = (slide: Partial<Slide>) => {
  const context = `Create a professional, modern business presentation visual for: ${slide.title}. ${slide.content}`;
  return context;
};

const parseAIResponse = (response: string): PresentationData => {
  try {
    // Remove markdown code block if present
    const jsonStr = response.replace(/^```json\n|\n```$/g, '').trim();
    const data = JSON.parse(jsonStr);
    return {
      id: Date.now().toString(),
      title: data.title,
      slides: data.slides.map((slide: any, index: number) => ({
        id: `slide-${index}`,
        ...slide,
      })),
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
    throw new Error('Failed to parse presentation data');
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
    
    const presentationData = parseAIResponse(data.choices[0].message.content);
    console.log('🎨 Parsed presentation data:', presentationData);

    onProgress?.('Generating visuals...');

    // Generate images for slides that need them
    const slidesWithImages = await Promise.all(
      presentationData.slides.map(async (slide) => {
        if (slide.type === 'image') {
          const imagePrompt = generateSlideImagePrompt(slide);
          slide.imageUrl = generateImageUrl(imagePrompt);
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
