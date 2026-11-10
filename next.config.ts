import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Runtime directory discovery must retain the registry in every server package.
  outputFileTracingIncludes: {
    '/*': ['./data/article-bundles/*.json'],
  },
};

export default nextConfig;
