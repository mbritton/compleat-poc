/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: ['**.prismic.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.prismic.io',
        pathname: '/compleat/**',
      },
      {
        protocol: 'https',
        hostname: 'prismic.io',
        pathname: '/compleat/**',
      },
    ],
  },
};

module.exports = nextConfig;
