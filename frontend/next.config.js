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

  // Trailing slash para compatibilidad con Firebase Hosting
  trailingSlash: true,
};

export default nextConfig;
