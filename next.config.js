/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  transpilePackages: ['markitdown-ts'],
  outputFileTracingIncludes: {
    '/api/export/pdf': ['./public/fonts/**/*'],
  },
};

module.exports = nextConfig;
