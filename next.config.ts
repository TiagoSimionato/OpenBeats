import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('http://coverartarchive.org/release/**'),
      new URL('https://coverartarchive.org/release/**'),
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
