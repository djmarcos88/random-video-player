import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Pin the file-tracing root to this project so the standalone output
  // is not nested under parent directories when multiple lockfiles exist.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
