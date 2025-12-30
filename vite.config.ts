/// <reference types="vitest/config" />

import yaml from "@modyfi/vite-plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [tailwindcss(), solid(), yaml()],
  base: "/quiz-app-template/",
  optimizeDeps: {
    include: ["solid-markdown > micromark", "solid-markdown > unified"],
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    include: ["test/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    server: {
      deps: {
        inline: ["@solidjs/router", "solid-markdown"],
      },
    },
    coverage: {
      include: ["src/**/*"],
      reporter: ["text", "html", "json-summary", "json"],
    },
  },
});
