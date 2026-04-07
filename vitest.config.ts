import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["**/node_modules/**", "**/example.spec.ts", "**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` throws outside Next.js; audit.ts and similar use it
      "server-only": path.resolve(__dirname, "./tests/mocks/server-only.ts"),
    },
  },
});
