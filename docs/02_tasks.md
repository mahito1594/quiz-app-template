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
**場所**: `src/types/quiz.ts`
**テストファイル**: `test/types/quiz.test.ts`
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

#### 🔄 4. データ層実装（TDD）
**目標**: 問題データ読み込み・パース機能をテスト駆動で実装
**場所**: `src/lib/quiz-loader.ts` (予定)
**テストファイル**: `test/lib/quiz-loader.test.ts` (予定)
**ステータス**: パース機能のみ完了、YAML読み込み未実装

**実装済み**:
- [x] 型安全なデータパース機能（valibot使用、`src/types/quiz.ts`）
- [x] 包括的データバリデーション
- [x] 構造化エラーハンドリング（QuizParseError）
- [x] TypeScript型安全性確保
- [x] ビジネスルールバリデーション（正解インデックス範囲チェック、重複ID検査等）

**未実装**:
- [ ] YAML読み込み機能
- [ ] 動的インポートによるクイズデータ読み込み
- [ ] ファイル読み込みエラーハンドリング

#### 5. ルーティング構築（TDD）
**目標**: Hash routingシステムをテスト駆動で実装
**場所**: `src/lib/router.ts`, `src/App.tsx`
**テストファイル**: `test/lib/router.test.ts`

**URL仕様**:
```
/#/ - カテゴリ一覧
/#/category/{categoryId} - カテゴリ別問題一覧  
/#/quiz/{categoryId} - クイズ実行
/#/quiz/{categoryId}/result - 結果画面
/#/question/{categoryId}/{questionIndex} - 問題シェア
/#/review - 復習モード
```

### フェーズ2: コア機能実装（中優先度）

#### 6. 状態管理（TDD）
**目標**: クイズ進捗・LocalStorage永続化をテスト駆動で実装
**場所**: `src/stores/quiz-store.ts`
**テストファイル**: `test/stores/quiz-store.test.ts`

**実装内容**:
- クイズ進捗状態管理
- 回答履歴管理
- LocalStorage永続化
- 復習対象問題管理

#### 7. カテゴリ一覧コンポーネント
**目標**: メイン画面のコンポーネント実装
**場所**: `src/components/CategoryList.tsx`
**テストファイル**: `test/components/CategoryList.test.tsx`

#### 8. クイズ実行フロー
**目標**: 問題表示→回答→即時フィードバック機能
**場所**: `src/components/Quiz/`
**コンポーネント**:
- `QuizContainer.tsx` - メインコンテナ
- `QuestionCard.tsx` - 問題表示
- `AnswerOptions.tsx` - 選択肢
- `ImmediateFeedback.tsx` - 即時フィードバック

#### 9. 結果画面
**目標**: 総合結果表示と復習案内
**場所**: `src/components/Result.tsx`

#### 10. 復習機能
**目標**: 間違えた問題のフィルタリング・再挑戦
**場所**: `src/components/Review.tsx`

#### 11. 問題シェア機能
**目標**: URL生成・個別問題アクセス
**場所**: `src/lib/share-utils.ts`, `src/components/QuestionShare.tsx`

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
- [ ] 実際のYAMLファイル読み込み機能
- [ ] Markdown形式の解説文レンダリング

### 基本機能
- [ ] カテゴリ一覧から特定カテゴリを選択できる
- [ ] 問題文と選択肢が読みやすく表示される
- [ ] 単一選択・複数選択問題への対応
- [ ] 回答選択と同時に正解・不正解が表示される
- [ ] 解説文が即座に表示される

### 進捗管理
- [ ] 回答途中でブラウザを閉じても進捗が保存される
- [ ] 再度アクセス時に続きから開始できる
- [ ] 過去に間違えた問題が記録される
- [ ] 「復習モード」で間違えた問題のみが表示される

### 共有機能
- [ ] 各問題に一意のURLが生成される
- [ ] 共有URLから直接その問題にアクセスできる

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
│   ├── Quiz/
│   ├── Result.tsx
│   ├── Review.tsx
│   └── common/
├── lib/                # ビジネスロジック
│   ├── quiz-loader.ts
│   ├── router.ts
│   └── share-utils.ts
├── stores/             # 状態管理
│   └── quiz-store.ts
├── types/              # 型定義
│   └── quiz.ts
├── styles/             # スタイル
└── assets/             # 静的ファイル

test/
├── components/
├── lib/
├── stores/
├── types/
└── fixtures/           # テストデータ
```

## 進捗管理

### 完了タスク
- ✅ **フェーズ1.1-1.4**: 型定義・データ層基盤（2025-07-21）
  - TDD Green達成：全18テストケース成功
  - valibot による type-safe parsing 実装
  - 包括的エラーハンドリング
  - Biome静的解析全問題解消

### 次回実装予定
- 🔄 **フェーズ1.5**: Hash routingシステム実装
- 🔄 **実際のYAML読み込み機能**

- 各タスクの完了時にこのドキュメントを更新
- 問題・改善点があればIssuesセクションに記録
- セッション跨ぎの場合は最新の進捗状況を確認

## Issues / 改善点

### 解決済み
- ✅ valibotのcheck関数でのエラーメッセージ関数制限（データにアクセスできない問題）
- ✅ 早期バリデーション失敗時のundefinedアクセスエラー対策
- ✅ テストケースのvalibotエラーメッセージ形式適合

### 今後検討事項
- YAML plugin（@modyfi/vite-plugin-yaml）の動的import対応
- 大規模データのパフォーマンス最適化
- エラーメッセージの多言語対応