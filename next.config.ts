import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "vipfkk.com" },
      { protocol: "http", hostname: "103.236.57.111" },
    ],
  },
};

export default nextConfig;
