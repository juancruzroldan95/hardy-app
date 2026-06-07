import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Receta renombrada (v3): slug viejo → nuevo
        source: '/recetas/pancakes-saludables',
        destination: '/recetas/pancakes-de-mani',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
