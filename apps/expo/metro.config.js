const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Ensure we resolve packages from the monorepo
config.resolver.disableHierarchicalLookup = true;

// Prioritize .native.tsx over .tsx - Metro will ONLY use .native if available
config.resolver.sourceExts = [
  "native.tsx",
  "native.ts",
  "native.js",
  ...config.resolver.sourceExts,
];

module.exports = withNativeWind(config, { input: "./src/global.css" });
