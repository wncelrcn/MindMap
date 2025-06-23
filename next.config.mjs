/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["noelvefpnflbskwltoao.supabase.co"],
  },
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Increase body size limit for image uploads
    },
  },
};

export default nextConfig;
