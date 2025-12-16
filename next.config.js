/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const target =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_ORIGIN ||
      'http://127.0.0.1:8000';

    return [
      {
        source: '/api/:path((?!templates).*)',
        destination: `${target.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
