import { type FileContent } from '@/types/files';

const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;
const POLLINATIONS_API = 'https://image.pollinations.ai/prompt/';

export interface SlideContent {
  type: 'title' | 'content' | 'image' | 'bullets';
  title?: string;
  content?: string;
  imagePrompt?: string;
  imageUrl?: string;
  bullets?: string[];
}

export interface PresentationResponse {
  title: string;
  slides: SlideContent[];
}

const generateImageUrl = (prompt: string) => {
  return `${POLLINATIONS_API}${encodeURIComponent(prompt)}`;
};

const parseContent = (aiResponse: string): PresentationResponse => {
  // Implementation to parse AI response into structured presentation format
  try {
    const slides = JSON.parse(aiResponse);
    return slides;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse presentation content');
  }
};

export const generatePresentation = async (
  input: string | FileContent
): Promise<PresentationResponse> => {
  try {
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
            2. Include compelling visuals described in imagePrompt
            3. Use professional business language
            4. Format the response as a JSON object with slides array
            5. Each slide should have a clear purpose`
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
      throw new Error('Failed to generate presentation');
    }

    const data = await response.json();
    const presentationContent = parseContent(data.choices[0].message.content);

    // Generate images for slides that need them
    const slidesWithImages = await Promise.all(
      presentationContent.slides.map(async (slide) => {
        if (slide.imagePrompt) {
          slide.imageUrl = generateImageUrl(slide.imagePrompt);
        }
        return slide;
      })
    );

    return {
      ...presentationContent,
      slides: slidesWithImages,
    };
  } catch (error) {
    console.error('Error generating presentation:', error);
    throw error;
  }
};
