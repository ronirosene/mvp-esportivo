/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://mvp-backend-little-woodland-6494.fly.dev/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
