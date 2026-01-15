import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@packages/ui", "@packages/drizzle", "@packages/ddd-kit"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.js",
      ...config.resolve.extensions,
    ];
    return config;
  },
};

const withNextIntl = createNextIntlPlugin("./common/i18n/request.ts");
const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  hideSourceMaps: true,
  disableLogger: true,
};

export default withSentryConfig(
  withNextIntl(withMDX(nextConfig)),
  sentryWebpackPluginOptions,
);
