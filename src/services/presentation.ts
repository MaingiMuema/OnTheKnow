/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FileContent } from '@/types/files';
import { type PresentationData, type Slide } from '@/components/PresentationTemplate';

const API_URL = '/api/ai';
const POLLINATIONS_API = 'https://image.pollinations.ai/prompt/';

const generateImageUrl = async (prompt: string): Promise<string> => {
  // Use Pollinations API for both icons and images
  return `${POLLINATIONS_API}${encodeURIComponent(prompt)}`;
};

const generateIconPrompt = (slide: Partial<Slide>): string => {
  // Optimize prompt for Pollinations
  return `minimalist simple icon ${slide.title}, flat design, vector style, single color, clean lines`;
};

const generateSlideImagePrompt = (slide: Partial<Slide>): string => {
  // Optimize prompt for Pollinations
  return `professional presentation visual, ${slide.title}, modern business style, high quality, 16:9 aspect ratio, clean design`;
};

const generateThemeColors = (slide: Partial<Slide>): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
} => {
  // Function to generate a color based on string input
  const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL values
    const h = Math.abs(hash) % 360;
    const s = 65 + (Math.abs(hash) % 20); // 65-85%
    const l = 45 + (Math.abs(hash) % 15); // 45-60%
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Generate base color from slide title
  const baseHue = Math.abs(slide.title?.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0) || 0) % 360;

  // Create a harmonious color palette
  const primary = hslToHex(baseHue, 75, 55);
  const secondary = hslToHex((baseHue + 30) % 360, 70, 60);
  const accent = hslToHex((baseHue + 180) % 360, 80, 50);
  
  // Predefined dark backgrounds and light text for better readability
  const backgrounds = [
    '#111827', // Dark blue-gray
    '#1F2937', // Darker blue-gray
    '#18181B', // Dark neutral
    '#1E1B4B', // Dark indigo
    '#312E81', // Deep purple
  ];
  
  const backgroundIndex = Math.abs(slide.title?.length || 0) % backgrounds.length;
  
  return {
    primary,
    secondary,
    accent,
    background: backgrounds[backgroundIndex],
    text: '#FFFFFF',
  };
};

const generateSlideCode = async (slide: Partial<Slide>): Promise<{ html: string; css: string }> => {
  const theme = slide.theme || generateThemeColors(slide);

  // Base styles for all slides
  const baseStyles = `
    .slide-content {
      height: 100%;
      padding: clamp(1rem, 5vw, 3rem);
      color: ${theme.text};
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, ${theme.background}dd, ${theme.background});
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: clamp(1rem, 3vw, 2rem);
      position: relative;
      overflow: hidden;
      min-height: 100vh;
    }
    .slide-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, ${theme.primary}15, ${theme.accent}15);
      z-index: 0;
    }
    .slide-header {
      position: relative;
      display: flex;
      align-items: center;
      gap: clamp(0.75rem, 2vw, 1.5rem);
      z-index: 1;
      flex-shrink: 0;
    }
    .slide-icon {
      width: clamp(32px, 6vw, 48px);
      height: clamp(32px, 6vw, 48px);
      min-width: clamp(32px, 6vw, 48px);
      object-fit: contain;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
      animation: fadeIn 0.5s ease-out;
    }
    .slide-title {
      font-size: clamp(1.5rem, 5vw, 2.5rem);
      font-weight: bold;
      background: linear-gradient(to right, ${theme.text}, ${theme.secondary});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
      animation: slideIn 0.5s ease-out;
      max-width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
      hyphens: auto;
    }
    .slide-body {
      position: relative;
      z-index: 1;
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      line-height: 1.6;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      animation: fadeIn 0.5s ease-out 0.2s both;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: ${theme.accent}40 transparent;
      padding-right: 0.5rem;
    }
    .slide-body::-webkit-scrollbar {
      width: 6px;
    }
    .slide-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .slide-body::-webkit-scrollbar-thumb {
      background-color: ${theme.accent}40;
      border-radius: 3px;
    }
    /* Auto-scaling content */
    .auto-scale {
      transform-origin: top left;
      transition: transform 0.3s ease;
    }
  `;

  const typeStyles = {
    bullets: `
      .bullet-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: clamp(0.5rem, 1.5vw, 1rem);
        width: 100%;
        max-width: 1200px;
      }
      .bullet-item {
        display: flex;
        align-items: flex-start;
        gap: clamp(0.5rem, 1.5vw, 1rem);
        opacity: 0;
        transform: translateY(20px);
        animation: slideIn 0.5s ease forwards;
        padding: clamp(0.5rem, 1.5vw, 1rem);
        background: ${theme.primary}10;
        border-radius: 0.5rem;
        backdrop-filter: blur(4px);
        min-height: 0;
      }
      .bullet-item:nth-child(1) { animation-delay: 0.1s; }
      .bullet-item:nth-child(2) { animation-delay: 0.2s; }
      .bullet-item:nth-child(3) { animation-delay: 0.3s; }
      .bullet-item:nth-child(4) { animation-delay: 0.4s; }
      .bullet-item:nth-child(5) { animation-delay: 0.5s; }
      .bullet-marker {
        width: clamp(24px, 4vw, 32px);
        height: clamp(24px, 4vw, 32px);
        min-width: clamp(24px, 4vw, 32px);
        background: ${theme.accent};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: clamp(0.75rem, 2vw, 0.875rem);
        color: ${theme.text};
        flex-shrink: 0;
        box-shadow: 0 2px 4px ${theme.accent}40;
      }
      .bullet-item span {
        flex: 1;
        font-size: clamp(0.875rem, 2vw, 1.125rem);
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
        min-width: 0;
      }
    `,
    image: `
      .image-slide {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: clamp(1rem, 3vw, 2rem);
        align-items: start;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      @media (max-width: 768px) {
        .image-slide {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
      }
      .image-container {
        width: 100%;
        aspect-ratio: 16/9;
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.5s ease-out;
      }
      .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .image-content {
        display: flex;
        flex-direction: column;
        gap: clamp(0.75rem, 2vw, 1.5rem);
        animation: slideIn 0.5s ease-out 0.2s both;
        overflow-y: auto;
        padding-right: 0.5rem;
      }
      .caption {
        font-size: clamp(0.75rem, 2vw, 0.875rem);
        color: ${theme.text}99;
        font-style: italic;
      }
    `,
    title: `
      .slide-title {
        font-size: clamp(2rem, 7vw, 3.5rem);
      }
      .subtitle {
        font-size: clamp(1rem, 3vw, 1.5rem);
        color: ${theme.text}cc;
        margin-top: clamp(0.5rem, 2vw, 1rem);
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
      }
    `,
  };

  // Animations
  const animations = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @media (max-width: 640px) {
      .slide-content {
        padding: 1rem;
      }
      .bullet-list {
        gap: 0.75rem;
      }
      .bullet-item {
        padding: 0.5rem;
      }
      .image-container {
        height: 200px;
      }
    }
    @media (min-width: 1440px) {
      .slide-content {
        max-width: 1400px;
        margin: 0 auto;
      }
      .bullet-list {
        max-width: 1000px;
        margin: 0 auto;
      }
    }
  `;

  let html = '';
  let additionalStyles = '';
  
  // Add content scaling script
  const contentScalingScript = `
    <script>
      (function() {
        const content = document.querySelector('.slide-body');
        const container = document.querySelector('.slide-content');
        
        function adjustContent() {
          if (!content || !container) return;
          
          // Reset any previous scaling
          content.style.transform = 'scale(1)';
          
          const contentHeight = content.scrollHeight;
          const containerHeight = container.clientHeight - container.querySelector('.slide-header').offsetHeight - 32; // Account for padding
          
          if (contentHeight > containerHeight) {
            const scale = containerHeight / contentHeight;
            content.style.transform = \`scale(\${Math.max(scale, 0.7)})\`;
          }
        }
        
        // Run on load and resize
        window.addEventListener('load', adjustContent);
        window.addEventListener('resize', adjustContent);
        
        // Run immediately
        adjustContent();
      })();
    </script>
  `;
  
  if (slide.type === 'title') {
    additionalStyles = typeStyles.title;
    html = `
      <div class="slide-content">
        <div class="slide-header">
          ${slide.iconUrl ? `<img src="${slide.iconUrl}" alt="Slide icon" class="slide-icon" />` : ''}
          <h1 class="slide-title">${slide.title}</h1>
        </div>
        <div class="slide-body">
          ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ''}
          ${!slide.subtitle && slide.content ? `<p>${slide.content}</p>` : ''}
        </div>
      </div>
      ${contentScalingScript}
    `;
  } else if (slide.type === 'bullets') {
    additionalStyles = typeStyles.bullets;
    const bulletItems = slide.bullets?.map((bullet: string, index: number) => 
      `<li class="bullet-item">
        <div class="bullet-marker">${index + 1}</div>
        <span>${bullet}</span>
       </li>`
    ).join('') || '';
    
    html = `
      <div class="slide-content">
        <div class="slide-header">
          ${slide.iconUrl ? `<img src="${slide.iconUrl}" alt="Slide icon" class="slide-icon" />` : ''}
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          <ul class="bullet-list">
            ${bulletItems}
          </ul>
        </div>
      </div>
      ${contentScalingScript}
    `;
  } else if (slide.type === 'image') {
    additionalStyles = typeStyles.image;
    html = `
      <div class="slide-content">
        <div class="slide-header">
          ${slide.iconUrl ? `<img src="${slide.iconUrl}" alt="Slide icon" class="slide-icon" />` : ''}
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="image-slide">
          <div class="image-container">
            ${slide.imageUrl ? `<img src="${slide.imageUrl}" alt="${slide.title}" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
          </div>
          <div class="image-content">
            ${slide.content ? `<p>${slide.content}</p>` : ''}
            ${slide.caption ? `<p class="caption">${slide.caption}</p>` : ''}
          </div>
        </div>
      </div>
      ${contentScalingScript}
    `;
  } else {
    html = `
      <div class="slide-content">
        <div class="slide-header">
          ${slide.iconUrl ? `<img src="${slide.iconUrl}" alt="Slide icon" class="slide-icon" />` : ''}
          <h2 class="slide-title">${slide.title}</h2>
        </div>
        <div class="slide-body">
          ${slide.content ? `<p>${slide.content}</p>` : ''}
        </div>
      </div>
      ${contentScalingScript}
    `;
  }

  return { 
    html: html.trim(),
    css: `${baseStyles}${additionalStyles}${animations}`.trim()
  };
};

const formatContent = async (slide: any): Promise<Partial<Slide>> => {
  // Only generate icons for specific slides
  const shouldHaveIcon = (slide: any): boolean => {
    const importantKeywords = ['summary', 'key', 'features', 'benefits', 'conclusion'];
    const hasImportantKeyword = importantKeywords.some(keyword => 
      slide.title?.toLowerCase().includes(keyword) || 
      slide.content?.toLowerCase().includes(keyword)
    );
    
    return slide.type === 'title' || 
           hasImportantKeyword || 
           (slide.index && slide.index % 3 === 0);
  };

  const [iconUrl, imageUrl] = await Promise.all([
    shouldHaveIcon(slide) ? generateImageUrl(generateIconPrompt(slide)) : null,
    slide.type === 'image' ? generateImageUrl(generateSlideImagePrompt(slide)) : null,
  ]);

  const bullets = slide.content?.split('\n').filter((line: string) => line.trim().startsWith('•'));
  const hasMultipleLines = slide.content?.split('\n').length > 1;

  const enrichedSlide = {
    ...slide,
    type: slide.type || (hasMultipleLines ? 'bullets' : 'content'),
    bullets,
    iconUrl,
    imageUrl,
    theme: generateThemeColors(slide),
  };

  const { html, css } = await generateSlideCode(enrichedSlide);
  return { ...enrichedSlide, html, css };
};

const parseAIResponse = async (response: string): Promise<PresentationData> => {
  try {
    // Clean the response by removing markdown formatting
    const jsonStr = response.replace(/```json\s*|\s*```/g, '').trim();
    const data = JSON.parse(jsonStr);

    // Validate the response structure
    if (!data.title || !Array.isArray(data.slides)) {
      throw new Error('Invalid presentation data structure');
    }

    // Generate a unique ID for the presentation
    const id = Date.now().toString();

    // Process each slide and add index
    const processedSlides = await Promise.all(data.slides.map(async (slide: any, index: number) => {
      return await formatContent({
        ...slide,
        index, // Add slide index for icon logic
        id: Math.random().toString(36).substring(7),
      });
    }));

    return {
      id,
      title: data.title,
      slides: processedSlides,
      theme: processedSlides[0]?.theme || {
        primary: '#9333EA',
        secondary: '#EC4899',
        accent: '#A855F7',
        background: '#111827',
        text: '#FFFFFF',
      },
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Raw response:', response);
    throw new Error('Failed to parse AI response');
  }
};

export const generatePresentation = async (
  input: string | FileContent,
  onProgress?: (status: string) => void
): Promise<PresentationData> => {
  try {
    onProgress?.('Generating presentation structure...');
    console.log('🎯 Generating presentation for:', typeof input === 'string' ? input : 'file content');
    
    const prompt = typeof input === 'string' 
      ? input 
      : `Generate presentation from this document: ${input.content}`;

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'system',
            content: `You are an expert presentation creator. Create a professional presentation based on the given topic.
            The presentation should:
            - Have a clear structure with introduction, body, and conclusion
            - Include relevant examples and data points
            - Use concise and impactful language
            - Have 8-12 slides
            
            Return a JSON object in this exact format:
            {
              "title": "Presentation Title",
              "slides": [
                {
                  "type": "title|content|bullets|image",
                  "title": "Slide Title",
                  "content": "Slide content or bullet points (use • for bullets)",
                  "imagePrompt": "Description for image generation (only for image slides)"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate presentation');
    }

    const data = await response.json();
    console.log('🎨 Raw response:', data.choices[0].message.content);
    
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
