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
        port: '',
        pathname: '/compleat/**',
      },
      {
        protocol: 'https',
        hostname: 'prismic.io',
        port: '',
        pathname: '/compleat/**',
      },
    ],
  },
};

module.exports = nextConfig;
