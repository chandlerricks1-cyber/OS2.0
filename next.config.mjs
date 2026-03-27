/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  optimizeFonts: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
