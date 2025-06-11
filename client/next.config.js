// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // your config options here
//   images: {
//     domains: ['res.cloudinary.com'],
//   },
// };

// module.exports = nextConfig;




/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: ['res.cloudinary.com'], // For external images
  },

  experimental: {
    serverActions: true,   // Only enable if you're using server actions
    typedRoutes: true,     // Optional: adds type safety for route navigation
    appDir: true           // Required for App Router (which you are using)
  },
};

module.exports = nextConfig;

