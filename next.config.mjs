/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  devIndicators: false,
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.56.1',
    '*.trycloudflare.com',
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.loca.lt'
  ],
};

export default nextConfig;
