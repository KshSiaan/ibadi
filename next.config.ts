import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
<<<<<<< HEAD
<<<<<<< HEAD
  allowedDevOrigins: ['103.186.20.117', "tc55qd1c-5000.inc1.devtunnels.ms"],
=======
  allowedDevOrigins: ['*.ngrok-free.app', 'localhost:3000', "nonpharmaceutical-aloud-millard.ngrok-free.dev"],
>>>>>>> bc58a6205208b9d8d85bc13a6a6550aa5930a857
=======
>>>>>>> 04d8663768bf6b774b37f0dde2479a8ebb8d5e35
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
