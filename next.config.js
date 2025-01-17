/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.pollinations.ai'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Configure serverless function settings
  serverRuntimeConfig: {
    // Will only be available on the server side
    timeoutMs: 60000, // 60 seconds
  },
};

module.exports = nextConfig;
