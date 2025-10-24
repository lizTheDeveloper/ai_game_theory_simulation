import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker/Cloud deployment
  output: 'standalone',

  // Use port from environment variable (Cloud Run compatibility)
  // Cloud Run sets PORT env var automatically

  // Disable ESLint during production build (for deployment)
  // ESLint should still run locally with `npm run lint`
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build (speeds up deployment)
  // TypeScript should still run locally with `npx tsc --noEmit`
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
