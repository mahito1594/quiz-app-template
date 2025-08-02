/// <reference types="vite/client" />

// YAML ファイルのimportサポート
declare module "*.yaml" {
  const content: unknown;
  export default content;
}

declare module "*.yml" {
  const content: unknown;
  export default content;
}
