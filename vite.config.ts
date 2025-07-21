/// <reference types="vitest" />
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    coverage: {
      include: ["src/**/*"],
      reporter: ["text", "html", "json-summary", "json"],
    },
  },
});
