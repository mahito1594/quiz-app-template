/// <reference types="vitest" />

import yaml from "@modyfi/vite-plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [tailwindcss(), solid(), yaml()],
  optimizeDeps: {
    include: ["solid-markdown > micromark", "solid-markdown > unified"],
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    coverage: {
      include: ["src/**/*"],
      reporter: ["text", "html", "json-summary", "json"],
    },
  },
});
