import { NextResponse } from 'next/server';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  model?: string;
  temperature?: number;
}

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_AI_API_KEY) {
      console.error('API key not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body: RequestBody = await req.json();
    console.log('Making API request to DeepSeek...');

    // Optimize the prompt to be more concise
    const messages = body.messages.map((msg: Message) => {
      if (msg.role === 'system') {
        return {
          role: 'system',
          content: `Create a concise presentation outline. Format: {
            "title": "Title",
            "slides": [
              {
                "type": "title|bullets",
                "title": "Slide Title",
                "content": "3-4 bullet points"
              }
            ]
          }. Use 4-6 slides only.`
        };
      }
      return msg;
    });

    const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9,
        frequency_penalty: 0.5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `API responded with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
