// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Africa's Talking
    AT_USERNAME: process.env.AT_USERNAME,
    AT_API_KEY: process.env.AT_API_KEY,
    AT_SENDER_ID: process.env.AT_SENDER_ID,
  },
};

module.exports = nextConfig;
