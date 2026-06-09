/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite exportar como sitio estático para Firebase Hosting
  output: 'export',

  // Optimización de imágenes (desactivada en export estático)
  images: {
    unoptimized: true,
    domains: [
      'firebasestorage.googleapis.com', // imágenes subidas desde el admin
    ],
  },

  // Variables de entorno públicas (accesibles en el browser)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Trailing slash para compatibilidad con Firebase Hosting
  trailingSlash: true,
};

module.exports = nextConfig;
