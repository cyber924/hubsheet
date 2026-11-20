import type { NextConfig } from "next";
import path from "node:path";

// Firebase authentication and /api/me stay on Vercel. The existing Cloudflare
// service continues to own D1, object storage and other data APIs.
const proxied = [
  "ad-assets","admin","agent-recommend","ai","assets","brand-upload",
  "brand","hub","inquiries","market","milo",
  "product-images","product-jobs","product-sets","projects"
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
      beforeFiles: proxied.flatMap(prefix => [
        { source: `/api/${prefix}`, destination: `/api/vercel-proxy/${prefix}` },
        { source: `/api/${prefix}/:path*`, destination: `/api/vercel-proxy/${prefix}/:path*` }
      ]),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
