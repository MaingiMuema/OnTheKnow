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
            content: `You are a professional presentation creator. Create a well-structured presentation with the following rules:
            1. Each slide should be focused and concise
            2. Use professional business language
            3. Format the response as a JSON object with:
               - title: string
               - slides: array of slides, each with:
                 - type: 'title' | 'content' | 'image' | 'bullets'
                 - title: string
                 - content?: string
                 - bullets?: string[]
                 - layout?: 'left' | 'right' | 'center'
            4. Include 5-10 slides depending on content
            5. Vary slide types for engagement
            6. First slide should be type 'title'
            7. Use descriptive titles and clear content`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate presentation structure');
    }

    const data = await response.json();
    const presentationData = parseAIResponse(data.choices[0].message.content);

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
    console.error('Error generating presentation:', error);
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
