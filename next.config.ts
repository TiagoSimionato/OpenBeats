import type { NextConfig } from 'next';
import { CONFIGS } from 'configs/constants';

const nextConfig: NextConfig = {
  allowedDevOrigins: CONFIGS.ALLOWED_DEV_ORIGINS ?? [],
  images: {
    remotePatterns: [
      new URL('http://coverartarchive.org/release/**'),
      new URL('https://coverartarchive.org/release/**'),
    ],
  },
  output: 'standalone',
  reactCompiler: true,
};

export default nextConfig;
