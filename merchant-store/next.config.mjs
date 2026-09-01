/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '*.trycloudflare.com',
    '*.ngrok-free.app'
  ],
};

export default nextConfig;
