import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_AI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    console.log('Received request body:', body);

    const aiResponse = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('API error:', errorText);
      return NextResponse.json({ error: `API error: ${errorText}` }, { status: aiResponse.status });
    }

    const data = await aiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
