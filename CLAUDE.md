# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

SolidJSベースの問題集アプリケーションテンプレート。"Parse, don't validate"アーキテクチャとTDDによる高品質なコードベースを提供。Hash routingによるSPA対応、YAML形式の問題データ管理、型安全なデータ処理を特徴とする。

## 開発コマンド

### 基本コマンド
- `pnpm dev` - 開発サーバー起動 (localhost:5173、HMR対応)
- `pnpm build` - TypeScriptコンパイル + 本番ビルド
- `pnpm preview` - ビルド済み成果物のプレビュー

### リンティング/フォーマッティング
- **Biome**を使用 (ESLint/Prettier代替)
- IDE設定で自動保存時に実行される設定

## 技術スタック

- **SolidJS** - リアクティブUIフレームワーク
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Valibot** - スキーマバリデーション（"Parse, don't validate"アーキテクチャ）
- **Vitest** - テストフレームワーク（TDD採用）
- **Biome** - リンター/フォーマッター
- **@solidjs/router** - SolidJS専用ルーティング（Hash routing mode）
- **@modyfi/vite-plugin-yaml** - YAML問題データ読み込み用
- **@solid-primitives/storage** - LocalStorage永続化用
- **solid-markdown** - Markdown解説文レンダリング用
- **TailwindCSS + DaisyUI** - ユーティリティファーストCSS + UIコンポーネントライブラリ

## アーキテクチャ

### ルーティング構造（Hash routing）
SPAデプロイメント対応のため、Hash routingを採用：
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

## コーディング方針

### アーキテクチャパターン
- **"Parse, don't validate"**: 外部データを確実な型に変換（バリデーションではなくパース）
- **関数型プログラミング**: 純粋関数・不変性・明示的エラーハンドリング
- **Single Source of Truth**: 状態管理では真の情報源を一箇所に統一
- **依存性注入**: テスタブルな設計のための関数引数による依存注入

### リファクタリング指針
- **定数抽出**: マジックナンバー・文字列リテラルは定数化
- **関数分割**: 複雑なロジックは意味のある単位で分割
- **型安全性**: `any`を避け、適切な型定義を維持
- **JSDoc**: 複雑な関数には詳細なドキュメントを記載

## テスト方針

### テスト戦略
- **TDD (Test-Driven Development)**: Red-Green-Refactorサイクルの徹底
- **統合テスト風アプローチ**: 子コンポーネントをモックせず実際の連携を検証
- **Kent C. Dodds哲学**: 「ユーザーが使うようにテストする」

### テストタイプ別の判断基準
- **ユニットテスト優先**:
  - ビジネスロジック中心のコンポーネント
  - データ変換・バリデーション処理
  - 状態管理ロジック
- **E2Eテスト優先**:
  - 表示中心のコンポーネント
  - 複雑なUI状態遷移
  - ユーザーフロー全体

### Vitestの技術的ポイント
- **vi.hoisted()**: モック変数の初期化順序制御に使用
- **vi.mock()**: ホイスティングによる制約に注意
- **統合テスト**: RouterWrapperによる実際のルーティング検証

## 技術的制約事項

### valibotの制約
- `check`関数のエラーメッセージ関数でデータアクセス不可（`undefined`が渡される）
- 早期バリデーション終了時の`undefined`アクセスエラー対策が必要
- エラーメッセージは汎用的なものにとどめる

### solid-markdownの既知の問題
- v2.0.14でサーバーサイドバンドル問題が発生していた（現在は解決済み）
- `debug`モジュールエラーの回避策あり
- 参考: [GitHub Issue #33](https://github.com/andi23rosca/solid-markdown/issues/33)

### GitHub Pages制約
- Hash routing必須（History APIは404エラー）
- 静的ビルドのみ対応
- サーバーサイド処理不可

## 既知の問題と解決策

### データ整合性
- **問題**: 進捗率100%超過、`currentQuestionIndex`と`answers`の非同期
- **解決**: 状態更新時の同期処理、Single Source of Truth原則の適用
- **実装例**: `Math.max(currentQuestionIndex, answers.length)`での同期

### UI/UX一貫性
- **問題**: 回答前アイコンの視認性問題
- **解決**: 回答前アイコン削除、背景色による選択状態表現
- **原則**: アクセシビリティと視認性を両立するUI設計

### アクセシビリティ
- **問題**: アイコンの視認性、テーマ色との相性
- **解決**: DaisyUIの`-content`系カラーの適切な使用
- **実装**: `text-success`→`text-success-content`への変更

## 主要ファイル構成

### ドキュメント
- `docs/00_requirements.md` - 詳細な機能要件定義
- `docs/01_techstack.md` - 技術スタック詳細仕様
- `docs/02_e2e_user_journeys.md` - E2Eテストユーザージャーニー仕様

### 実装済みコンポーネント
- **データ層**: `src/schema/quiz.ts` - valibotによる型安全パーサー
- **状態管理**: `src/stores/quiz-store.ts` - LocalStorage永続化付き
- **メインコンポーネント**: CategoryList, Quiz, QuizResult, Review
- **子コンポーネント**: QuestionCard, AnswerOptions, ImmediateFeedback

### テストファイル
- **ユニットテスト**: 各コンポーネントの`.test.tsx`ファイル
- **統合テスト**: `.integration.test.tsx`ファイル
- **E2Eテスト**: `e2e/`ディレクトリ（Playwright）

## デプロイメント

### GitHub Pages設定
- Hash routingによりSPA対応（追加設定不要）
- 静的サイト生成によるシンプルなデプロイメント


## 開発アプローチ

### Test-Driven Development (TDD)
- Red-Green-Refactorサイクル採用
- 現在のステータス: **Refactor完了**（全18テスト成功維持）
- テストカバレッジ100%のデータ層基盤完成
- リファクタリングによる保守性・可読性の大幅向上

### 品質管理
- TypeScript厳密型チェック
- Biome静的解析（エラー・警告0）
- valibot実行時バリデーション
- 構造化エラーハンドリング

## 実装状況

### プロジェクト完成 🎯
- **全機能実装済み**: 問題表示・回答・採点・復習・永続化
- **品質保証**: 130テスト全成功、TypeScript型チェック、Biome解析クリア
- **ユーザー体験**: レビュー指摘事項すべて解決済み
- **本番対応**: GitHub Pages向けビルド成功、Hash routing完全動作

### 主要マイルストーン
- **2025-07-27**: 基盤構築完了（型定義、データパース、ルーティング）
- **2025-07-28**: コア機能実装完了（全UIコンポーネント、状態管理）
- **2025-08-05**: ユーザーレビュー課題解決（UX改善、データ整合性）
- **2025-08-06**: テストカバレッジ完成（統合テスト風アプローチ採用）
- **2025-08-09**: Issue #10修正（クイズ再開時のバグ）
- **2025-08-10**: UIアクセシビリティ改善（アイコンコントラスト）

## 重要な技術的発見

### 開発手法の効果
- **TDD (Test-Driven Development)**: 品質指標の明確化、安全なリファクタリング、仕様書としてのテストの価値
- **"Parse, don't validate"**: 外部データ（`unknown` → `QuizData`）の確実な型変換と構造化エラーハンドリング
- **統合テスト風アプローチ**: 子コンポーネントモック削除による実用的テストの実現

### バグパターンと対策
- **データ整合性**: 複数の状態変数同期（例: `currentQuestionIndex`と`answers`）
- **UI/UX一貫性**: コンポーネント間の表記統一（A,B,Cラベル問題）
- **アクセシビリティ**: DaisyUI `text-*-content`系カラーによるコントラスト問題解決

### テスト設計の学習
- **Kent C. Dodds哲学**: 「ユーザーが使うようにテストする」の実践価値
- **テスト判断基準**: ユニットテスト vs E2Eテストの保守性・ROI観点での選択
- **Vitestモック**: `vi.hoisted()`による初期化順序制御の重要性

