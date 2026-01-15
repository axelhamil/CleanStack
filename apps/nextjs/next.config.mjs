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
  async redirects() {
    return [
      // Redirect old doc routes to main docs page
      {
        source: "/docs/getting-started",
        destination: "/docs",
        permanent: true,
      },
      { source: "/docs/core-concepts", destination: "/docs", permanent: true },
      {
        source: "/docs/core-concepts/:path*",
        destination: "/docs",
        permanent: true,
      },
      { source: "/docs/architecture", destination: "/docs", permanent: true },
      {
        source: "/docs/architecture/:path*",
        destination: "/docs",
        permanent: true,
      },
      { source: "/docs/ai", destination: "/docs", permanent: true },
      { source: "/docs/ai/:path*", destination: "/docs", permanent: true },
      { source: "/docs/guides", destination: "/docs", permanent: true },
      { source: "/docs/guides/:path*", destination: "/docs", permanent: true },
    ];
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
