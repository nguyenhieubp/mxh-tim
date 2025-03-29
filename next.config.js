/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    return config;
  },
  images: {
    domains: ["localhost", "openui.fly.dev", "via.placeholder.com", "source.unsplash.com", "placekitten.com", "randomuser.me", "images.unsplash.com", "via.placeholder.com"]
  }
}

module.exports = nextConfig;