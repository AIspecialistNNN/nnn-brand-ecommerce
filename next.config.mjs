const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/nnn-brand-ecommerce",
        assetPrefix: "/nnn-brand-ecommerce/",
        trailingSlash: true,
      }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
