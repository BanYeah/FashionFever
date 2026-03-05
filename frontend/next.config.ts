import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 이미지 최적화 기능을 끄고 원본 주소로 직접 연결
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMG_DOMAIN!,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
