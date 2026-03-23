/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  outputFileTracingIncludes: {
    '/api/export/pdf': ['./public/fonts/**/*'],
  },
};

module.exports = nextConfig;
