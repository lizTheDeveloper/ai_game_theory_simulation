import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD

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

  // Webpack configuration to prevent code-splitting race conditions
  // Fix: Force synchronous loading of simulation initialization modules
  webpack: (config, { isServer }) => {
    // Only apply to server-side builds where workers run
    if (isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = config.optimization.splitChunks || {};

      // Prevent splitting of critical simulation modules
      // These must load synchronously to avoid race conditions
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        simulation: {
          test: /[\\/]src[\\/]simulation[\\/](initialization|technologicalRisk|environmental|socialCohesion)\.ts$/,
          name: 'simulation-core',
          chunks: 'all',
          priority: 30,
          enforce: true,
        },
      };
    }

    return config;
  },
=======
>>>>>>> 8e2778351 (Initial commit from Create Next App)
};

export default nextConfig;
