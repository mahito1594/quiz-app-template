# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

SolidJSベースの問題集アプリケーションテンプレート。"Parse, don't validate"アーキテクチャとTDDによる高品質なコードベースを提供。Hash routingによるSPA対応、YAML形式の問題データ管理、型安全なデータ処理を特徴とする。

## 開発コマンド

- `pnpm dev` - 開発サーバー起動 (localhost:5173、HMR対応)
- `pnpm build` - TypeScriptコンパイル + 本番ビルド
- `pnpm preview` - ビルド済み成果物のプレビュー
- `pnpm test:unit` - ユニットテスト実行（Vitest）
- `pnpm test:e2e` - E2Eテスト実行（Playwright）
- `pnpm check` - Biome 静的解析（lint + format check）

## アーキテクチャ

### ルーティング構造（Hash routing）

SPAデプロイメント対応のため Hash routing を採用（GitHub Pages は History API で 404 エラー）：
- `/#/` - カテゴリ一覧
- `/#/category/{categoryId}` - カテゴリ別問題一覧
- `/#/quiz/{categoryId}` - クイズ実行
- `/#/quiz/{categoryId}/result` - 結果画面
- `/#/review` - 復習モード

### データ層

- **型安全なデータパース**: Valibot による実行時バリデーション（`src/schema/quiz.ts`）
- **"Parse, don't validate"**: 外部データ（YAML）を `unknown` → `QuizData` に変換
- **構造化エラーハンドリング**: `QuizParseError` による詳細エラー情報

## 主要ファイル構成

### ドキュメント
- `docs/00_requirements.md` - 詳細な機能要件定義
- `docs/01_techstack.md` - 技術スタック詳細仕様
- `docs/02_e2e_user_journeys.md` - E2Eテストユーザージャーニー仕様

### 主要ソースファイル
- `src/schema/quiz.ts` - valibotによる型安全パーサー
- `src/lib/quiz-loader.ts` - YAML問題データのロード
- `src/context/QuizDataContext.tsx` - 問題データのプロバイダー
- `src/stores/quiz-store.ts` - LocalStorage永続化付き状態管理
- `src/components/` - メインコンポーネント群
- `src/components/quiz/` - クイズ関連サブコンポーネント

### テストファイル
- **ユニットテスト**: `test/` ディレクトリ配下（`*.test.ts(x)`）
- **統合テスト**: `test/` ディレクトリ配下（`*.integration.test.ts(x)`）
- **E2Eテスト**: `e2e/`ディレクトリ（Playwright）

## テスト方針

TDD採用。

- **vi.hoisted()**: モック変数の初期化順序制御に使用
- **vi.mock()**: ホイスティングによる制約に注意
- **統合テスト**: RouterWrapperによる実際のルーティング検証

## 技術的制約事項

### valibotの制約
- `check`関数のエラーメッセージ関数でデータアクセス不可（`undefined`が渡される）
- 早期バリデーション終了時の`undefined`アクセスエラー対策が必要
- エラーメッセージは汎用的なものにとどめる


## 既知の問題と解決策

### データ整合性
- **問題**: 進捗率100%超過、`currentQuestionIndex`と`answers`の非同期
- **解決**: 状態更新時の同期処理、Single Source of Truth原則の適用
- **実装例**: `Math.max(currentQuestionIndex, answers.length)`での同期

### アクセシビリティ
- **問題**: アイコンの視認性、テーマ色との相性
- **解決**: DaisyUIの`-content`系カラーの適切な使用
- **実装**: `text-success`→`text-success-content`への変更
