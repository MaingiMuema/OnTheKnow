# OnTheKnow Platform Setup Instructions

This guide provides comprehensive instructions for building and deploying the OnTheKnow platform, a fully automated system for generating articles on emerging trends and insights using Next.js, Supabase, and DeepSeek AI.

## Table of Contents
- [Project Setup](#project-setup)
- [Supabase Integration](#supabase-integration)
- [DeepSeek AI Integration](#deepseek-ai-integration)
- [Automated Workflow](#automated-workflow)
- [Frontend Development](#frontend-development)
- [Deployment](#deployment)
- [Testing and Optimization](#testing-and-optimization)
- [Optional Features](#optional-features)

## Project Setup

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest ontheknow
cd ontheknow
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs openai axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Project Structure
```
ontheknow/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── articles/
│   │   ├── ArticleCard.tsx
│   │   └── ArticleList.tsx
│   └── common/
├── lib/
│   ├── supabase.ts
│   ├── deepseek.ts
│   └── utils.ts
├── pages/
│   ├── api/
│   │   ├── articles/
│   │   └── trends/
│   ├── articles/
│   └── dashboard/
├── styles/
│   └── globals.css
└── types/
    └── index.ts
```

## Supabase Integration

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Database Schema
```sql
-- Users table (handled by Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Articles table
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  summary text,
  slug text unique not null,
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trends table
create table public.trends (
  id uuid default uuid_generate_v4() primary key,
  topic text not null,
  source text,
  relevance_score float,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 3. Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## DeepSeek AI Integration

### 1. API Setup
```typescript
// lib/deepseek.ts
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export const deepseek = new OpenAIApi(configuration)

export async function generateArticle(topic: string) {
  const completion = await deepseek.createCompletion({
    model: "text-davinci-003",
    prompt: `Write an informative article about ${topic}...`,
    max_tokens: 1500,
    temperature: 0.7,
  })

  return completion.data.choices[0].text
}
```

### 2. Article Generation API Route
```typescript
// pages/api/articles/generate.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { generateArticle } from '@/lib/deepseek'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { topic } = req.body
    const content = await generateArticle(topic)
    
    const { data, error } = await supabase
      .from('articles')
      .insert([
        { 
          title: topic,
          content,
          slug: topic.toLowerCase().replace(/\s+/g, '-'),
        }
      ])

    if (error) throw error

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Error generating article' })
  }
}
```

## Automated Workflow

### 1. Vercel Cron Job Setup
```typescript
// pages/api/cron/generate-articles.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { generateArticle } from '@/lib/deepseek'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Fetch trending topics
    const { data: trends } = await supabase
      .from('trends')
      .select('*')
      .order('relevance_score', { ascending: false })
      .limit(5)

    // Generate articles for each trend
    for (const trend of trends) {
      const content = await generateArticle(trend.topic)
      await supabase
        .from('articles')
        .insert([{
          title: trend.topic,
          content,
          slug: trend.topic.toLowerCase().replace(/\s+/g, '-'),
          status: 'published'
        }])
    }

    return res.status(200).json({ message: 'Articles generated successfully' })
  } catch (error) {
    return res.status(500).json({ error: 'Error in cron job' })
  }
}
```

## Frontend Development

### 1. Homepage Layout
```typescript
// pages/index.tsx
import { GetStaticProps } from 'next'
import { supabase } from '@/lib/supabase'
import ArticleList from '@/components/articles/ArticleList'

export default function Home({ articles }) {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Latest Insights</h1>
        <ArticleList articles={articles} />
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    props: {
      articles,
    },
    revalidate: 3600, // Revalidate every hour
  }
}
```

## Deployment

### 1. Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DEEPSEEK_API_KEY=your_deepseek_api_key
CRON_SECRET=your_cron_secret
```

### 2. Deploy to Vercel
```bash
vercel
```

## Testing and Optimization

### 1. API Testing
```typescript
// __tests__/api/articles.test.ts
import { describe, it, expect } from 'vitest'
import { generateArticle } from '@/lib/deepseek'

describe('Article Generation', () => {
  it('should generate article content', async () => {
    const content = await generateArticle('Test Topic')
    expect(content).toBeTruthy()
    expect(typeof content).toBe('string')
  })
})
```

## Optional Features

### 1. Newsletter Integration
```typescript
// pages/api/newsletter/subscribe.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])

    if (error) throw error

    return res.status(200).json({ message: 'Subscribed successfully' })
  } catch (error) {
    return res.status(500).json({ error: 'Error subscribing to newsletter' })
  }
}
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [DeepSeek AI Documentation](https://deepseek.ai/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For any questions or issues, please refer to our GitHub repository or contact our support team.
