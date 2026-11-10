import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The shared guide navigation also loads these files on fallback routes.
  outputFileTracingIncludes: {
    '/*': ['./data/article-bundles/*.json'],
  },
};

export default nextConfig;
