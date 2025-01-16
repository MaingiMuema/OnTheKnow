# OnTheKnow Platform

A fully automated system for generating articles on emerging trends and insights using Next.js, Supabase, and DeepSeek AI.

## Project Overview

OnTheKnow is a platform that automatically generates high-quality articles based on trending topics using AI technology. The system integrates Next.js for the frontend, Supabase for database management, and DeepSeek AI for content generation.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Database**: Supabase
- **AI Integration**: DeepSeek AI
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth

## Project Structure

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

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
DEEPSEEK_API_KEY=your_deepseek_api_key
CRON_SECRET=your_cron_secret
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Automated article generation using DeepSeek AI
- Real-time database with Supabase
- Automated trend detection and analysis
- Modern, responsive UI with TailwindCSS
- Automated workflow with Vercel Cron Jobs

## Deployment

The application is optimized for deployment on Vercel. For deployment instructions, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
