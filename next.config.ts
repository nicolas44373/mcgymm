import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Solo durante el build en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Solo durante el build en producción
    ignoreBuildErrors: true,
  },
};

export default nextConfig;