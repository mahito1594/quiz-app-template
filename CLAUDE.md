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
- **Valibot** v1.1.0 - スキーマバリデーション（"Parse, don't validate"アーキテクチャ）
- **Vitest** v3.2.4 - テストフレームワーク（TDD採用）
- **Biome** v2.1.2 - リンター/フォーマッター
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
- **型安全なデータパース**: valibot による実行時バリデーション（src/schema/quiz.ts）
- **"Parse, don't validate"**: 外部データの確実な型保証
- **包括的バリデーション**: 構造・ビジネスルール検証
- **構造化エラーハンドリング**: QuizParseError による詳細エラー情報
- YAML形式の問題データ管理
- Markdown解説文サポート
- GitHub Pages静的ホスティング対応

## 主要ファイル構成

### 実装済み
- `src/schema/quiz.ts` - クイズデータスキーマ・パーサー（TDD完了、18テスト成功）
- `test/types/quiz.test.ts` - 型システムテスト
- `test/fixtures/sample-quiz.yaml` - テストデータ
- `test/fixtures/invalid-quiz.yaml` - エラーテストデータ

### 基本構成
- `src/index.tsx` - アプリケーションエントリーポイント
- `src/App.tsx` - メインアプリコンポーネント
- `docs/00_requirements.md` - 詳細な機能要件定義
- `docs/01_techstack.md` - 技術スタック詳細仕様
- `docs/02_tasks.md` - タスク管理・進捗追跡
- `docs/03_implementation_phase1.md` - フェーズ1実装レポート
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

## 開発アプローチ

### Test-Driven Development (TDD)
- Red-Green-Refactorサイクル採用
- 現在のステータス: **Green達成**（全18テスト成功）
- テストカバレッジ100%のデータ層基盤完成

### 品質管理
- TypeScript厳密型チェック
- Biome静的解析（エラー・警告0）
- valibot実行時バリデーション
- 構造化エラーハンドリング

## 実装状況

### ✅ 完了フェーズ（2025-07-21）
- **フェーズ1.1-1.3**: 型定義・データパース基盤
  - valibot による type-safe parsing 実装
  - 包括的バリデーション（構造・ビジネスルール）
  - QuizParseError による構造化エラーハンドリング
  - TDD Green達成（18テスト全成功）

### 🔄 次回実装予定
- **フェーズ1.4**: データ層完成（YAML読み込み機能）
- **フェーズ1.5**: Hash routingシステム実装

## 実装で得られた技術的知見

### valibotの制約と対策
- **`check`関数のエラーメッセージ関数制限**: データにアクセスできず`undefined`が渡される
- **早期バリデーション終了対策**: `check`内での`undefined`アクセスエラー防止が必要
- **エラーメッセージの簡略化**: 詳細なメッセージより汎用的なメッセージが実用的

### TDDの効果
- **Greenフェーズの明確化**: 「全テスト成功」が確実な品質指標
- **リファクタリング安全性**: valibotの制約に対する安全なコード変更
- **仕様書としてのテスト**: 18テストケースがデータ層の完全な仕様書

### "Parse, don't validate"の実践
- **外部データの確実な型変換**: `unknown` → `QuizData`の保証
- **エラーハンドリングの構造化**: `QuizParseError`による詳細エラー情報
- **ビジネスルールバリデーション**: 正解インデックス範囲、ID重複等の高度な検証

## 重要な実装知見

### 現在の技術債務・制約事項
- valibot `check`関数のエラーメッセージ関数制限（データアクセス不可）
- 早期バリデーション終了時のundefinedアクセスエラー対策必須
- YAML plugin動的importの実装が未完了

### 次フェーズで留意すべき事項  
- Hash routingシステム実装時の@solidjs/router設定
- LocalStorageを使った状態永続化戦略
- モバイル最適化（3秒以内読み込み要件）のパフォーマンス検証