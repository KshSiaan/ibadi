import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['103.186.20.117', "tc55qd1c-5000.inc1.devtunnels.ms"],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "nazmulhasan.s3.us-east-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
