import path from "node:path";
import baseConfig from "@packages/test/base-vitest.config";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: ["node_modules", "dist", "e2e"],
    },
    resolve: {
      alias: {
        "@/domain": path.resolve(__dirname, "./src/domain"),
        "@/application": path.resolve(__dirname, "./src/application"),
        "@/adapters": path.resolve(__dirname, "./src/adapters"),
        "@/shared": path.resolve(__dirname, "./src/shared"),
        "@/common": path.resolve(__dirname, "./common"),
        "@": path.resolve(__dirname, "./"),
      },
    },
  }),
);
