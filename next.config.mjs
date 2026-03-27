// Corporate network SSL bypass — local dev only
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.vercel-storage.com' },
      { protocol: 'https', hostname: 'world.openfoodfacts.org' },
    ],
  },
  serverExternalPackages: ['bcryptjs'],
}

export default nextConfig
