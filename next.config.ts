import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'i.pravatar.cc',
      'derekhutbucket.s3.ap-northeast-1.amazonaws.com'
    ]
  }
};

export default nextConfig;
