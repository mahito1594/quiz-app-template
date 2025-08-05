# 問題集アプリ実装タスクリスト

## プロジェクト概要
社内勉強会用の問題集WebアプリケーションのSolidJSテンプレート実装。TDD（Test-Driven Development）アプローチによる開発。

## 実装フェーズ

### フェーズ1: 基盤構築（高優先度）

#### ✅ 1. 依存関係追加
- [x] @solidjs/router をdevDependenciesに追加
- [x] @modyfi/vite-plugin-yaml（既存確認済み）

#### ✅ 2. 型定義作成（TDD）
**目標**: YAML仕様に基づくTypeScript型を先にテスト駆動で定義
**場所**: `src/schema/quiz.ts`
**テストファイル**: `test/schema/quiz.test.ts`
**完了日**: 2025-07-21

**実装内容**:
- [x] QuizData、Category、Question、Metadata型の定義
- [x] 単一選択・複数選択問題の区別
- [x] valibot使用による「Parse, don't validate」アーキテクチャ実装
- [x] parseQuestion、parseQuizData関数とエラーハンドリング
- [x] 18個の包括的テストケース（全て成功）

#### ✅ 3. テストデータ準備
**目標**: 開発・テスト用のYAMLファイル作成
**場所**: `test/fixtures/`
**完了日**: 2025-07-21

**ファイル**:
- [x] `sample-quiz.yaml` - 基本テスト用（プログラミング・Web基礎カテゴリ）
- [x] `invalid-quiz.yaml` - エラーハンドリングテスト用
- [ ] `large-quiz.yaml` - パフォーマンステスト用（次フェーズで実装）

#### ✅ 4. データ層実装（TDD）
**目標**: 問題データ読み込み・パース機能をテスト駆動で実装
**場所**: `src/lib/quiz-loader.ts`
**テストファイル**: `test/lib/quiz-loader.test.ts`, `test/lib/quiz-loader.integration.test.ts`
**完了日**: 2025-07-27

**実装済み**:
- [x] 型安全なデータパース機能（valibot使用、`src/schema/quiz.ts`）
- [x] 包括的データバリデーション
- [x] 構造化エラーハンドリング（QuizParseError、QuizLoadError）
- [x] TypeScript型安全性確保
- [x] ビジネスルールバリデーション（正解インデックス範囲チェック、重複ID検査等）
- [x] YAML読み込み機能（Vite YAML plugin使用）
- [x] 動的インポートによるクイズデータ読み込み
- [x] ファイル読み込みエラーハンドリング
- [x] 関数型プログラミングによる依存性注入実装
- [x] Result型による明示的エラーハンドリング
- [x] 包括的テストカバレッジ（16件）：ユニット・統合テスト

#### 5. ルーティング構築（TDD）
**目標**: Hash routingシステムをテスト駆動で実装
**場所**: `src/App.tsx`
**実装状況**: ✅ 完了（@solidjs/routerを直接使用）

**URL仕様**:
```
/#/ - カテゴリ一覧
/#/category/{categoryId} - カテゴリ別問題一覧  
/#/quiz/{categoryId} - クイズ実行
/#/quiz/{categoryId}/result - 結果画面
/#/question/{categoryId}/{questionIndex} - 問題シェア
/#/review - 復習モード
```

### フェーズ2: コア機能実装（中優先度）✅ 完了（2025-07-28〜2025-08-02）

#### ✅ 6. 状態管理（TDD）
**目標**: クイズ進捗・LocalStorage永続化をテスト駆動で実装
**場所**: `src/stores/quiz-store.ts`
**テストファイル**: `test/stores/quiz-store.test.ts`

**実装済み**:
- [x] @solid-primitives/storage使用のLocalStorage永続化
- [x] クイズ進捗状態管理（QuizProgress型）
- [x] 回答履歴管理（Answer型）
- [x] 復習対象問題管理（ReviewQuestion型）
- [x] 15テストケース全成功

#### ✅ 7. カテゴリ一覧コンポーネント
**目標**: メイン画面のコンポーネント実装
**場所**: `src/components/CategoryList.tsx`, `src/components/CategoryCard.tsx`
**テストファイル**: `test/components/CategoryCard.test.tsx`, `test/components/CategoryList.integration.test.tsx`

**実装済み**:
- [x] カテゴリ一覧表示
- [x] 進捗バー表示（各カテゴリの完了率）
- [x] YAMLデータ統合
- [x] **CategoryCardコンポーネント分離**（2025-08-05）
- [x] **包括的テスト実装**（2025-08-05）
  - CategoryCard単体テスト: 17テスト
  - CategoryList統合テスト: 6テスト
  - プロダクションコード品質維持（`<A>`タグ保持）

#### ✅ 8. クイズ実行フロー
**目標**: 問題表示→回答→即時フィードバック機能
**場所**: `src/components/quiz/`
**コンポーネント**:
- [x] `Quiz.tsx` - メインコンテナ（src/components/）
- [x] `QuestionCard.tsx` - 問題表示
- [x] `AnswerOptions.tsx` - 選択肢（Switch/Match使用）
- [x] `ImmediateFeedback.tsx` - 即時フィードバック

**テスト実装**:
- [x] QuestionCard.test.tsx - 16テスト
- [x] AnswerOptions.test.tsx - 13テスト
- [x] ImmediateFeedback.test.tsx - 16テスト

#### ✅ 9. 結果画面
**目標**: 総合結果表示と復習案内
**場所**: `src/components/QuizResult.tsx`

**実装済み**:
- [x] 正答率・スコア表示
- [x] 問題別結果一覧
- [x] 復習モードへの誘導
- [x] カテゴリ一覧への戻り

#### ✅ 10. 復習機能
**目標**: 間違えた問題のフィルタリング・再挑戦
**場所**: `src/components/Review.tsx`

**実装済み**:
- [x] 復習対象問題の表示
- [x] カテゴリ別グループ化
- [x] 復習モード用Quiz画面への遷移
- [x] 空の復習リスト時のメッセージ

#### ✅ 11. 問題表示機能
**目標**: 個別問題の表示（URLシェア対応）
**場所**: `src/components/QuestionView.tsx`

**実装済み**:
- [x] URLパラメータ（categoryId, questionIndex）対応
- [x] Markdown問題文・解説表示
- [x] 正解表示
- [x] クイズへの誘導リンク

### フェーズ3: UI・UX最適化（低優先度）  

#### 12. モバイルUI最適化
**目標**: iPhone Safari最適化スタイリング
**場所**: `src/styles/`, CSS Modules使用

#### 13. エラーハンドリング
**目標**: 404ページ・バリデーションエラー対応
**場所**: `src/components/ErrorBoundary.tsx`, `src/components/NotFound.tsx`

#### 14. パフォーマンス最適化
**目標**: 遅延ローディング等
**実装内容**:
- Code Splitting
- Lazy Loading
- Bundle最適化

## TDD実装サイクル

各機能実装時のサイクル：

1. **Red**: 失敗するテストを先に書く
2. **Green**: 最小限のコードでテストを通す
3. **Refactor**: コードを改善・整理

## 受入条件チェックリスト

### システム要件
- [ ] GitHub Pages上でアプリケーションが正常に動作する
- [ ] iPhone Safariでレスポンシブ表示が適切に動作する

### データ要件  
- [x] YAML形式問題データの型定義・パース機能
- [x] データバリデーション（構造・ビジネスルール）
- [x] 実際のYAMLファイル読み込み機能
- [x] Markdown形式の解説文レンダリング（solid-markdown 2.0.13使用）

### 基本機能
- [x] カテゴリ一覧から特定カテゴリを選択できる
- [x] 問題文と選択肢が読みやすく表示される
- [x] 単一選択・複数選択問題への対応
- [x] 回答選択と同時に正解・不正解が表示される
- [x] 解説文が即座に表示される

### 進捗管理
- [x] 回答途中でブラウザを閉じても進捗が保存される
- [x] 再度アクセス時に続きから開始できる
- [x] 過去に間違えた問題が記録される
- [x] 「復習モード」で間違えた問題のみが表示される

### 共有機能
- [x] 各問題に一意のURLが生成される（array index使用）
- [x] 共有URLから直接その問題にアクセスできる

### 非機能要件
- [ ] 問題ページの読み込みが3秒以内に完了する
- [ ] タッチ操作で誤操作なく回答できる

## 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# テスト実行
pnpm test

# テスト（ウォッチモード）
pnpm test --watch

# ビルド
pnpm build

# リント
pnpm lint

# プレビュー
pnpm preview
```

## ファイル構成

```
src/
├── components/          # UIコンポーネント
│   ├── CategoryList.tsx
│   ├── Quiz.tsx
│   ├── QuizResult.tsx
│   ├── QuestionView.tsx
│   ├── Review.tsx
│   ├── NotFound.tsx
│   └── common/
├── lib/                # ビジネスロジック
│   ├── quiz-loader.ts  # YAML読み込み・バリデーション
│   └── share-utils.ts
├── stores/             # 状態管理
│   └── quiz-store.ts
├── schema/             # スキーマ定義・パース機能
│   └── quiz.ts
├── util/               # 共通ユーティリティ
│   └── types.ts        # Result型等
├── styles/             # スタイル
└── assets/             # 静的ファイル

test/
├── components/
├── lib/                # quiz-loader.test.ts, quiz-loader.integration.test.ts
├── stores/
├── schema/             # quiz.test.ts
└── fixtures/           # sample-quiz.yaml, invalid-quiz.yaml, malformed.yaml
```

## 進捗管理

### 完了タスク
- ✅ **フェーズ1.1-1.4**: 型定義・データ層基盤完成（2025-07-21 〜 2025-07-24）
  - TDD Red-Green-Refactor完全達成：全18テストケース成功
  - valibot による type-safe parsing 実装
  - 包括的エラーハンドリング
  - Biome静的解析全問題解消
  - **リファクタリング成果**（2025-07-24）：
    - 定数抽出：エラーメッセージ・バリデーション値の一元管理
    - ヘルパー関数分割：6個の専用関数による複雑ロジック分離
    - JSDoc完備：19箇所の詳細ドキュメント追加
    - 型安全性向上：`any`型完全排除、構造化型への置き換え
    - 保守性・可読性の大幅向上（+269/-106行の改善）

- ✅ **フェーズ1.5**: 実際のYAML読み込み機能（2025-07-27完了）
  - 関数型プログラミングによる依存性注入設計
  - Result型を使った明示的エラーハンドリング
  - Vite YAML plugin統合完了
  - ユニットテスト・統合テストの完全実装（16テスト）

- ✅ **フェーズ1.6**: Hash routingシステム実装（2025-07-27完了）
  - @solidjs/routerによる6つのルート完全対応
  - DaisyUIによるモダンUIデザイン実装
  - TailwindCSS完全移行とスタイル統一
  - Playwrightによる動作確認・E2Eテスト
  - 未使用ファイル削除とコードクリーンアップ

- ✅ **フェーズ2**: コア機能実装（2025-07-28〜2025-08-02完了）
  - 状態管理システム（@solid-primitives/storage）完成
  - 全UIコンポーネント実装（7コンポーネント）
  - YAMLデータとの完全統合
  - LocalStorage永続化実装
  - Markdownレンダリング（solid-markdown 2.0.13）
  - E2E動作確認（49テスト全成功）
  - コンポーネントテスト実装（45テスト追加）

- ✅ **CategoryListテスト実装**（2025-08-05完了）
  - CategoryCardコンポーネント分離によるテスト容易性向上
  - プロダクションコード品質維持（`<A>`タグ保持）
  - RouterWrapperテストヘルパー作成
  - 包括的テストカバレッジ実現（94→117テスト）
  - 静的解析・型チェック・テスト全成功

### 次回実装予定
- 🔄 **フェーズ3**: ユーザーレビュー対応
  - バグ修正・改善対応
  - パフォーマンス最適化
  - 追加機能実装（必要に応じて）

- 各タスクの完了時にこのドキュメントを更新
- 問題・改善点があればIssuesセクションに記録
- セッション跨ぎの場合は最新の進捗状況を確認

## Issues / 改善点

### 解決済み
- ✅ valibotのcheck関数でのエラーメッセージ関数制限（データにアクセスできない問題）
- ✅ 早期バリデーション失敗時のundefinedアクセスエラー対策
- ✅ テストケースのvalibotエラーメッセージ形式適合
- ✅ **リファクタリングで解決した課題**（2025-07-24）：
  - マジックナンバー・文字列リテラルの散在 → 定数による一元管理
  - 複雑なバリデーションロジックの可読性 → 意味明確な関数名への分割
  - ドキュメント不足 → 19箇所の包括的JSDoc追加
  - 型安全性の不十分さ → `any`型完全排除・構造化型への移行
  - コード保守の困難さ → ヘルパー関数による責務分離・再利用性向上
- ✅ **solid-markdownバージョン問題**（2025-07-28）：
  - v2.0.14でサーバーサイドバンドル問題発生 → v2.0.13へダウングレード
- ✅ **問題ID仕様の明確化**（2025-08-02）：
  - 問題には明示的なIDを付与せず、配列インデックスを使用
  - 手動ID管理の保守コスト削減のための設計決定

### 今後検討事項
- YAML plugin（@modyfi/vite-plugin-yaml）の動的import対応
- 大規模データのパフォーマンス最適化
- エラーメッセージの多言語対応
- ✅ **CategoryListコンポーネントのテスト戦略（解決済み）**（2025-08-05）
  - RouterWrapperヘルパーによるルーター依存テスト実現
  - プロダクションコード品質を維持しつつテストカバレッジ向上