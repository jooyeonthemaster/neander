import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // 가견적서 PDF(/api/quote-pdf)가 서버에서 읽는 한글 폰트를 배포 번들에 포함한다
  outputFileTracingIncludes: {
    '/api/quote-pdf': ['./src/assets/fonts/*.ttf'],
  },
  // subset-font(harfbuzz wasm)는 번들하면 wasm 파일 경로를 찾지 못해 Node가 직접 불러오게 둔다
  serverExternalPackages: ['subset-font', 'harfbuzzjs', 'fontverter'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
