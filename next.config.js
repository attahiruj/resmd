/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  transpilePackages: ['markitdown-ts'],
  outputFileTracingIncludes: {
    '/api/export/pdf': ['./public/fonts/**/*'],
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
};

module.exports = nextConfig;
