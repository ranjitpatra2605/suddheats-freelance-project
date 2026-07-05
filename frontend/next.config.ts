import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'suddheats-freelance-project-production-b773.up.railway.app',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Proxy API calls to backend (works on any network)
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

