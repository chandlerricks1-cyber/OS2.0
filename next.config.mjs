/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  optimizeFonts: false,
  async rewrites() {
    return [
      { source: '/POV-Engine', destination: '/POV-Engine.html' },
    ];
  },
};

export default nextConfig;
