/// <reference types="vitest" />

import yaml from "@modyfi/vite-plugin-yaml";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), yaml()],
  test: {
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    coverage: {
      include: ["src/**/*"],
      reporter: ["text", "html", "json-summary", "json"],
    },
  },
});
