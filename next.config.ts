import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for nginx direct serving
  output: 'export',
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Enable trailing slash for better static file serving
  trailingSlash: true,
};

export default nextConfig;
