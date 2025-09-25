/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'], // Add your domain here for Image optimization
    unoptimized: true, // Don't optimize images to ensure direct file access
  },
  // Important: This allows us to serve media files directly
  trailingSlash: false,
  // Ensure media files are handled correctly in production
  async headers() {
    return [
      {
        // Apply these headers to all media file routes
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate', // Don't cache media files
          },
        ],
      },
    ];
  },
  // This helps with file upload processing
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'sharp'];
    return config;
  },
  // Output standalone build for better file handling
  output: 'standalone',
  // Explicitly configure static directory
  distDir: '.next',
};

export default nextConfig;
