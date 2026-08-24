import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Uploaded images are already optimized with sharp (webp q80, max 1600px).
    // Disable Next.js Image Optimization for /uploads/ paths to avoid
    // double-processing and to work with the catch-all route handler.
    unoptimized: true,
  },
};

export default nextConfig;
