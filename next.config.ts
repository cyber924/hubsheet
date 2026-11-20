import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack(config, { isServer, webpack }) {
    if (process.env.VERCEL && isServer) {
      const shim = path.resolve(process.cwd(), "lib/vercel-workers.ts");
      config.plugins ??= [];
      // URL-scheme imports must be replaced before Webpack tries loading them.
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/, shim));
    }
    return config;
  },
  async rewrites() {
    if (!process.env.VERCEL) return [];
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
