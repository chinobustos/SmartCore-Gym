/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    // @supabase/supabase-js carga @opentelemetry/api con require(<expresion>),
    // que webpack no puede resolver estaticamente. La carga es opcional
    // (.catch(() => null)), asi que el warning es ruido.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@supabase.supabase-js/, message: /Critical dependency/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
