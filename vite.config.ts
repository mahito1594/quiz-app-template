import yaml from "@modyfi/vite-plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

/**
 * @modyfi/vite-plugin-yaml の transform フックに moduleType: 'js' を付与するラッパー。
 * Vite 8 (Rolldown) はファイル拡張子からモジュールタイプを自動検出するため、
 * .yaml を JS に変換するプラグインは明示的に moduleType を指定する必要がある。
 */
function yamlWithModuleType(): Plugin {
  const inner = yaml();
  const innerTransform =
    typeof inner.transform === "function"
      ? inner.transform
      : inner.transform?.handler;
  return {
    ...inner,
    name: "yaml-with-module-type",
    async transform(code, id) {
      const result = await innerTransform?.call(this, code, id);
      if (result && typeof result === "object" && "code" in result) {
        return { ...result, moduleType: "js" };
      }
      return result;
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), solid(), yamlWithModuleType()],
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
