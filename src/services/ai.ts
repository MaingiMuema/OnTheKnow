const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5saWtlbWFpbmdpQGdtYWlsLmNvbSIsImlhdCI6MTczNTMxNDIwMX0.dy4jANPuzStUYy46hyD5HUVm0mHBZ0aidd7B55wvpIw';

export interface TrendResponse {
  category: string;
  title: string;
  color: string;
}

const categoryColors = {
  Technology: "bg-gradient-to-r from-blue-500/30 to-cyan-500/30",
  Science: "bg-gradient-to-r from-purple-500/30 to-pink-500/30",
  Health: "bg-gradient-to-r from-green-500/30 to-emerald-500/30",
  Environment: "bg-gradient-to-r from-teal-500/30 to-green-500/30",
  Business: "bg-gradient-to-r from-orange-500/30 to-red-500/30",
  Politics: "bg-gradient-to-r from-indigo-500/30 to-purple-500/30",
  Culture: "bg-gradient-to-r from-pink-500/30 to-rose-500/30",
  Sports: "bg-gradient-to-r from-yellow-500/30 to-orange-500/30"
};

const generateTrendPrompt = () => {
  const prompts = [
    "Generate a trending news headline about recent developments in technology, science, health, environment, business, politics, culture, or sports. Format: Category: [category]\nHeadline: [headline]",
    "What's the latest breakthrough or significant development in technology, science, health, environment, business, politics, culture, or sports? Format: Category: [category]\nHeadline: [headline]",
    "Share a current trend or important update in technology, science, health, environment, business, politics, culture, or sports. Format: Category: [category]\nHeadline: [headline]"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
};

export const generateTrend = async (): Promise<TrendResponse> => {
  try {
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
            role: 'user',
            content: generateTrendPrompt()
          }
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      }),
    });

    const json = await response.json();
    const output = json.choices[0].message.content;

    // Parse the AI response
    const categoryMatch = output.match(/Category:\s*([^\n]+)/);
    const headlineMatch = output.match(/Headline:\s*([^\n]+)/);

    if (!categoryMatch || !headlineMatch) {
      throw new Error('Invalid AI response format');
    }

    const category = categoryMatch[1].trim();
    const title = headlineMatch[1].trim();

    return {
      category,
      title,
      color: categoryColors[category as keyof typeof categoryColors] || categoryColors.Technology
    };
  } catch (error) {
    console.error('Error generating trend:', error);
    // Return a fallback trend if the API call fails
    return {
      category: 'Technology',
      title: 'AI Continues to Transform Industries Worldwide',
      color: categoryColors.Technology
    };
  }
};
