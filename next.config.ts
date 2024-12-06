import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'api.dicebear.com',
      'derekhutbucket.s3.ap-northeast-1.amazonaws.com'
    ]
  }
};

export default nextConfig;
