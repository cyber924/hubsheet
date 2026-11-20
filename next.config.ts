import type { NextConfig } from "next";
import path from "node:path";

// Auth is handled locally on Vercel. Only data/file APIs go to Cloudflare.
const proxied = [
  "ad-assets", "admin", "agent-recommend", "ai", "assets", "brand-upload",
  "brand", "hub", "inquiries", "market", "me", "milo",
  "product-images", "product-jobs", "product-sets", "projects"
];

const nextConfig: NextConfig = {
  webpack(config, { isServer, webpack }) {
    if (process.env.VERCEL && isServer) {
      config.plugins ??= [];
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(
        /^cloudflare:workers$/,
        path.resolve(process.cwd(), "lib/vercel-workers.ts")
      ));
    }
    return config;
  },
  async rewrites() {
    if (!process.env.VERCEL) return [];
    return {
      beforeFiles: proxied.map(prefix => ({
        source: `/api/${prefix}/:path*`,
        destination: `/api/vercel-proxy/${prefix}/:path*`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
