import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 2030 비전 목업(가상 사이트)은 별도 Vercel 프로젝트 neander-vision 에 있고, neander.co.kr/vision-mockup 아래로만 보인다
const VISION_MOCKUP_ORIGIN = 'https://neander-vision.vercel.app';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/vision-mockup', destination: `${VISION_MOCKUP_ORIGIN}/vision-mockup` },
        { source: '/vision-mockup/:path*', destination: `${VISION_MOCKUP_ORIGIN}/vision-mockup/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
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
