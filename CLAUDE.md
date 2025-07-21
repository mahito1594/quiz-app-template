# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

社内勉強会用の問題集WebアプリケーションのSolidJSベーステンプレート。GitHub Pagesでホスティングし、Organization内部アクセス限定。モバイル（iPhone Safari）での利用を主要ターゲット。

## 開発コマンド

### 基本コマンド
- `pnpm dev` - 開発サーバー起動 (localhost:5173、HMR対応)
- `pnpm build` - TypeScriptコンパイル + 本番ビルド
- `pnpm preview` - ビルド済み成果物のプレビュー

### リンティング/フォーマッティング
- **Biome**を使用 (ESLint/Prettier代替)
- IDE設定で自動保存時に実行される設定

## 技術スタック

- **SolidJS** v1.9.7 - リアクティブUIフレームワーク
- **TypeScript** v5.8.3 - 型安全性
- **Vite** v7.0.4 - 高速ビルドツール
- **@solidjs/router** - SolidJS専用ルーティング（Hash routing mode）
- **@modyfi/vite-plugin-yaml** - YAML問題データ読み込み用
- **solid-markdown** - Markdown解説文レンダリング用

## アーキテクチャ

### ルーティング構造（Hash routing）
GitHub Pages SPAデプロイメント対応のため、Hash routingを採用：
- `/#/` - カテゴリ一覧
- `/#/category/{categoryId}` - カテゴリ別問題一覧  
- `/#/quiz/{categoryId}` - クイズ実行
- `/#/quiz/{categoryId}/result` - 結果画面
- `/#/question/{categoryId}/{questionIndex}` - 問題シェア
- `/#/review` - 復習モード

### 状態管理
- SolidJSのリアクティブシステム（`createSignal`, `createStore`等）を使用
- ローカルストレージで進捗永続化

### データ層
- YAML形式の問題データ管理
- Markdown解説文サポート
- GitHub Pages静的ホスティング対応

## 主要ファイル構成

- `src/index.tsx` - アプリケーションエントリーポイント
- `src/App.tsx` - メインアプリコンポーネント
- `docs/00_requirements.md` - 詳細な機能要件定義
- `docs/01_techstack.md` - 技術スタック詳細仕様
- `biome.json` - リンター/フォーマッター設定

## デプロイメント

### GitHub Pages設定
- Hash routingによりSPA対応（追加設定不要）
- Organization内部アクセス限定
- 静的サイト生成によるシンプルなデプロイメント

## パフォーマンス要件

- モバイル端末での3秒以内読み込み
- iPhone Safariでの快適な操作性
- 効率的な問題データ読み込み