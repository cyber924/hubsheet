import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    if (process.env.VERCEL && isServer) {
      config.resolve ??= {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "cloudflare:workers$": path.resolve(process.cwd(), "lib/vercel-workers.ts"),
      };
    }
    return config;
  },
  async rewrites() {
    if (!process.env.VERCEL) return [];
    // Run before Next.js filesystem/API route matching. All D1/R2 APIs stay
    // on the existing service; the Vercel frontend remains separate.
    return {
      beforeFiles: [{
        source: "/api/:path*",
        destination: "https://hubsheet.herestay-4226.chatgpt.site/api/:path*",
      }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
