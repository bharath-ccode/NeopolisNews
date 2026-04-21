/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      { source: "/sitemap.xml", destination: "/api/sitemap" },
    ];
  },
};

module.exports = nextConfig;
