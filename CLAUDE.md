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

- **SolidJS** v1.9 - リアクティブUIフレームワーク
- **TypeScript** v5.8 - 型安全性
- **Vite** v7 - 高速ビルドツール
- **Valibot** v1.1 - スキーマバリデーション（"Parse, don't validate"アーキテクチャ）
- **Vitest** v3 - テストフレームワーク（TDD採用）
- **Biome** v2.1 - リンター/フォーマッター
- **@solidjs/router** - SolidJS専用ルーティング（Hash routing mode）
- **@modyfi/vite-plugin-yaml** - YAML問題データ読み込み用
- **@solid-primitives/storage** - LocalStorage永続化用
- **solid-markdown** v2.0.13 - Markdown解説文レンダリング用（注：バージョン固定）
- **TailwindCSS** v4 + **DaisyUI** v5 - ユーティリティファーストCSS + UIコンポーネントライブラリ

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
- 現在のステータス: **Refactor完了**（全18テスト成功維持）
- テストカバレッジ100%のデータ層基盤完成
- リファクタリングによる保守性・可読性の大幅向上

### 品質管理
- TypeScript厳密型チェック
- Biome静的解析（エラー・警告0）
- valibot実行時バリデーション
- 構造化エラーハンドリング

## 実装状況

### ✅ 完了フェーズ（2025-07-27）
- **フェーズ1.1-1.4**: 型定義・データパース基盤完成（2025-07-24）
  - valibot による type-safe parsing 実装
  - 包括的バリデーション（構造・ビジネスルール）
  - QuizParseError による構造化エラーハンドリング
  - TDD Green達成（18テスト全成功）
  - **リファクタリング完了**: 保守性・可読性の大幅向上
    - 定数抽出: エラーメッセージ・バリデーション値の一元管理
    - ヘルパー関数分割: 6個の専用関数による複雑ロジック分離
    - JSDoc完備: 19箇所の詳細ドキュメント追加
    - 型安全性向上: valibotとの正確な型統合

- **フェーズ1.5**: YAML読み込み機能完成（2025-07-27）
  - **依存性注入パターン**: 関数型プログラミング原則に基づく設計
  - **Result型システム**: `src/util/types.ts`での共通型定義
  - **実際のYAMLファイル読み込み**: Vite YAMLプラグイン統合
  - **包括的テスト**: 34テスト（ユニット + インテグレーション）
  - **関数型設計**: 純粋関数・不変性・明示的エラーハンドリング

- **フェーズ1.6**: Hash routingシステム実装（2025-07-27完了）
  - **@solidjs/router統合**: 6つのルート完全対応
  - **TailwindCSS + DaisyUI**: モダンUIデザインシステム導入
  - **レスポンシブ対応**: モバイル最適化とデザイン統一
  - **E2Eテスト**: Playwrightによる動作確認
  - **コードクリーンアップ**: 未使用ファイル削除・TODOコメント追加

### ✅ 完了フェーズ（2025-07-28）
- **フェーズ2**: コア機能実装完了
  - 状態管理システム（@solid-primitives/storage使用）
  - 全UIコンポーネント実装（CategoryList, Quiz, QuizResult, Review）
  - 子コンポーネント実装（QuestionCard, AnswerOptions, ImmediateFeedback）
  - YAMLデータ統合・LocalStorage永続化
  - Markdownレンダリング（solid-markdown 2.0.13使用）
  - Hash routingシステム完全動作
  - E2E動作確認完了（49テスト全成功）

### ✅ 完了フェーズ（2025-08-05）
- **CategoryListテスト実装**: プロダクション品質維持優先アプローチ
  - CategoryCardコンポーネント分離による責務明確化
  - `<A>`タグ保持によるアクセシビリティ・SEO・UX維持
  - RouterWrapperテストヘルパー実装
  - 包括的テストカバレッジ（94→117テスト、+23テスト）
  - 静的解析・型チェック・全テスト成功

### 🔄 次のステップ  
- **フェーズ3**: ユーザーレビュー対応
  - ユーザーが発見したバグの修正対応
  - レビューフィードバックの実装
  - パフォーマンス最適化
  - 追加機能実装（必要に応じて）

## 実装で得られた技術的知見

### valibotの制約と対策
- **`check`関数のエラーメッセージ関数制限**: データにアクセスできず`undefined`が渡される
- **早期バリデーション終了対策**: `check`内での`undefined`アクセスエラー防止が必要
- **エラーメッセージの簡略化**: 詳細なメッセージより汎用的なメッセージが実用的

### TDDの効果
- **Greenフェーズの明確化**: 「全テスト成功」が確実な品質指標
- **リファクタリング安全性**: valibotの制約に対する安全なコード変更
- **仕様書としてのテスト**: 18テストケースがデータ層の完全な仕様書
- **Red-Green-Refactorサイクル完遂**: 機能実装 → テスト成功 → コード改善の完全実践

### "Parse, don't validate"の実践
- **外部データの確実な型変換**: `unknown` → `QuizData`の保証
- **エラーハンドリングの構造化**: `QuizParseError`による詳細エラー情報
- **ビジネスルールバリデーション**: 正解インデックス範囲、ID重複等の高度な検証

### リファクタリングで得られた知見
- **定数抽出の効果**: マジックナンバー・文字列リテラル排除による保守性向上
- **関数分割の威力**: 複雑なバリデーションロジックの意味明確化
- **型安全性の段階的向上**: `any` → 構造化型 → 正確なvalibot型の変遷
- **JSDocによる自己文書化**: コード自体が完全な仕様書として機能
- **テスト駆動リファクタリング**: 全機能保証下での安全なコード改善

## 重要な実装知見

### 現在の技術債務・制約事項
- valibot `check`関数のエラーメッセージ関数制限（データアクセス不可）
- 早期バリデーション終了時のundefinedアクセスエラー対策必須

### フェーズ2で解決した技術課題

#### solid-markdownバージョン問題（2025-07-28解決）
- **問題**: solid-markdown 2.0.14でサーバーサイドバンドル問題が発生
- **現象**: `pnpm dev`で白い画面、`debug`モジュールエラー
- **解決策**: バージョン2.0.13にダウングレード
- **参考**: [GitHub Issue #40](https://github.com/andi23rosca/solid-markdown/issues/40)
- **学習**: 依存関係のバージョン管理の重要性

#### 開発・本番環境の一元化
- **達成**: `pnpm dev`と`pnpm preview`で同一機能提供
- **技術**: @solid-primitives/storage + solid-markdown 2.0.13
- **効果**: 開発体験の大幅向上

### フェーズ3に向けた準備状況（2025-08-05現在）

#### 実装完了済み機能一覧
- **状態管理**: @solid-primitives/storage による LocalStorage 永続化
- **コンポーネント**: 全8コンポーネント実装完了
  - CategoryList, CategoryCard, Quiz, QuizResult, Review（メインコンポーネント）
  - QuestionCard, AnswerOptions, ImmediateFeedback（子コンポーネント）
- **データ統合**: YAMLファイル読み込み・valibotバリデーション統合
- **Markdown**: solid-markdown によるリッチテキスト表示
- **ルーティング**: Hash routing による完全な画面遷移
- **テスト**: 117テスト全成功（ユニット+統合+コンポーネント）

#### ユーザーレビューで検証予定の項目
- 実際の問題データでの動作確認
- モバイル端末（iPhone Safari）での操作性
- LocalStorage永続化の動作確認
- Markdown表示の正確性
- ルーティング・画面遷移の安定性
- パフォーマンス（3秒以内読み込み要件）

#### バグ報告受け入れ準備
- 現在のコード状態: 全機能実装済み、テスト全成功
- 技術債務: 現在なし（solid-markdown問題解決済み）
- 開発環境: `pnpm dev` と `pnpm preview` 両方で正常動作
- デバッグ体制: TypeScript厳密チェック + Biome + Vitest完備

## 備忘録

### 追加タスク
- docs 配下の Markdown 文書を読み込んでアプリの仕様を把握すること