import { NextResponse } from 'next/server';
import { fetchWithRetries } from '@/utils/api';

export const maxDuration = 60; // Set max duration to 60 seconds (Vercel hobby plan limit)

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_AI_API_KEY) {
      console.error('API key not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log('Making API request to DeepSeek...');

    const response = await fetchWithRetries('https://api.hyperbolic.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_API_KEY}`,
      },
      body: JSON.stringify(body),
      maxRetries: 2,
      timeout: 25000, // 25 seconds timeout to allow for retries within 60s limit
      retryDelay: 1000, // 1 second delay between retries
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
