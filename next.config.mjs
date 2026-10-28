/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: { unoptimized: true },
  devIndicators: false,
};
export default nextConfig;
