import type { NextConfig } from "next";
import path from "node:path";
import webpack from "webpack";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  webpack(config) {
    if (!process.env.VERCEL && process.env.BUILD_TARGET !== "vercel") {
      return config;
    }
    const shim = path.resolve(
      process.cwd(),
      "lib/server/vercel-cloudflare-shim.ts",
    );
    config.resolve.alias["cloudflare:workers"] = shim;
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/, shim),
    );
    return config;
  },
};

export default nextConfig;
