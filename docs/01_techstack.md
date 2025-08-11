# 技術スタック仕様書

## 1. 概要

本文書では、問題集Webアプリケーションテンプレートの技術スタック選定理由と詳細仕様を記載します。

## 2. 技術選定の基本方針

### 2.1 選定基準
- **パフォーマンス最優先**: モバイル端末での3秒以内読み込み要件
- **開発効率**: 迅速な実装と保守性
- **デプロイメント簡素化**: GitHub Pages静的ホスティング対応
- **学習コスト最小化**: チーム内での習得容易性

### 2.2 制約条件
- GitHub Pages限定（サーバーサイド処理不可）
- Organization内部アクセス限定
- iPhone Safari最適化必須

## 3. フロントエンド技術スタック

### 3.1 UIフレームワーク

**採用: SolidJS**

**選定理由:**
- **高パフォーマンス**: Virtual DOM不使用、コンパイル時最適化
- **小容量**: バンドルサイズが小さく、モバイル最適
- **リアクティブシステム**: 状態管理が直感的
- **React類似API**: 学習コストが低い

**代替案検討:**
- React: バンドルサイズ大、パフォーマンス劣る
- Vue.js: 機能過多、複雑性不要
- Vanilla JS: 開発効率低、保守困難

### 3.2 TypeScript

**採用: TypeScript**

**選定理由:**
- 型安全性による品質向上
- IDEサポート充実
- リファクタリング容易性
- チーム開発での可読性

### 3.3 ビルドツール

**採用: Vite**

**選定理由:**
- **超高速開発サーバー**: HMR対応
- **最適化されたビルド**: GitHub Pages対応
- **SolidJS統合**: 公式プラグインサポート
- **設定最小化**: ゼロコンフィグ思想

## 4. ルーティングライブラリ

### 4.1 比較検討結果

#### @solidjs/router（採用）

**採用理由:**
- **SolidJS専用設計**: ネイティブサポート、最適パフォーマンス
- **軽量**: 必要最小限の機能、小容量
- **Hash routing対応**: GitHub Pages SPAに最適
- **学習コスト低**: 直感的API、豊富なドキュメント

**技術仕様:**
```typescript
import { HashRouter, Route } from '@solidjs/router'

// Hash routingでGitHub Pages SPA対応
<HashRouter>
  <Route path="/" component={CategoryList} />
  <Route path="/quiz/:categoryId" component={Quiz} />
</HashRouter>
```

#### TanStack Router（不採用）

**不採用理由:**
- **機能過多**: 大規模アプリ向け、この案件には過剰
- **学習コスト高**: 複雑な型システム、設定が煩雑  
- **SolidJS対応**: 実験的段階、安定性に懸念
- **バンドルサイズ大**: モバイルパフォーマンスに悪影響

### 4.2 Hash Routing採用理由

**GitHub Pages制約対応:**
- History API使用時: 404エラー（サーバー設定不可）
- Hash routing使用時: クライアントサイドで完全解決

**URL仕様:**
```
従来仕様: /quiz/category1
Hash版: /#/quiz/category1
```

**メリット:**
- 追加設定不要
- 確実な動作保証
- デバッグ容易性

## 5. データ処理・バリデーション

### 5.1 スキーマバリデーション

**採用: Valibot**

**選定理由:**
- **"Parse, don't validate"アーキテクチャ**: 外部データを確実な型に変換
- **軽量性**: Zodより小さいバンドルサイズ、モバイル最適
- **TypeScript統合**: 完全な型推論サポート
- **実行時安全性**: コンパイル時 + ランタイム型保証の両立
- **モジュラー設計**: 必要な機能のみ選択可能

**代替案検討:**
- Zod: 機能豊富だがバンドルサイズ大、モバイルパフォーマンス影響
- Yup: 古い設計思想、TypeScript統合が不十分
- 手動バリデーション: 開発効率低、型安全性なし

**実装上の発見:**
- `check`関数のエラーメッセージ関数でのデータアクセス制限
- 早期バリデーション終了時の`undefined`対策が必要

### 5.2 テストフレームワーク

**採用: Vitest**

**選定理由:**
- **Vite統合**: 設定不要、高速実行
- **Jest互換API**: 学習コストなし
- **ESM対応**: モダンJavaScript環境
- **TypeScript統合**: 型チェック付きテスト
- **TDD最適**: 高速フィードバックサイクル

### 5.3 問題データ処理

**採用: @modyfi/vite-plugin-yaml**

**選定理由:**
- YAML形式問題データの直接インポート
- Viteビルド時最適化
- TypeScript型生成対応

### 5.4 Markdown処理

**採用: solid-markdown（最新版）**

**選定理由:**
- SolidJS専用実装
- 解説文レンダリングに最適
- セキュリティ考慮済み

**バージョン管理詳細:**
- v2.0.14でサーバーサイドバンドル問題が発生していた（`debug`モジュールエラー）
- 回避策の発見により最新版使用が可能に
- 参考: [GitHub Issue #33](https://github.com/andi23rosca/solid-markdown/issues/33#issuecomment-2612454745)

### 5.5 Markdownタイポグラフィスタイリング

**採用: @tailwindcss/typography**

**選定理由:**
- **美しいタイポグラフィ**: Markdownコンテンツの自動的な美しいスタイリング
- **リンクスタイリング**: 下線・色・ホバー効果の自動適用でユーザビリティ向上
- **TailwindCSS統合**: 既存のproseクラスとシームレス統合
- **DaisyUIとの共存**: テーマカラーとの適切な協調動作
- **軽量性**: 必要なスタイルのみ生成、バンドルサイズ最適化

**実装詳細:**
```css
@import "tailwindcss";
@plugin "daisyui";
@plugin "@tailwindcss/typography";
```

**適用箇所:**
- 問題解説文（ImmediateFeedback.tsx）
- 問題文（QuestionCard.tsx）
- YAML内のMarkdown記法（リンク、見出し、リスト等）

**効果:**
- リンクが視認しやすいスタイリングで表示
- 見出し、リスト、コードブロックの統一的な美しいレンダリング

## 6. 開発ツール

### 6.1 リンター・フォーマッター

**採用: Biome**

**選定理由:**
- **超高速**: ESLint/Prettierより10倍高速
- **統合機能**: リンター+フォーマッター一体型
- **設定最小**: ゼロコンフィグ対応
- **Git統合**: コミット時自動実行

### 6.2 パッケージマネージャー

**採用: PNPM**

**選定理由:**
- ディスク使用量削減
- 高速インストール
- 厳密な依存関係管理

## 7. 状態管理アーキテクチャ

### 7.1 SolidJSネイティブ状態管理

**使用API:**
```typescript
import { createSignal, createStore } from 'solid-js'

// リアクティブ状態
const [currentQuestion, setCurrentQuestion] = createSignal(0)

// 複雑な状態
const [quizState, setQuizState] = createStore({
  answers: [],
  score: 0,
  completedCategories: []
})
```

### 7.2 永続化戦略

**localStorage使用:**
- 進捗データ保存
- 復習対象問題管理
- ユーザー設定保存

**実装方針:**
```typescript
// 進捗自動保存
createEffect(() => {
  localStorage.setItem('quiz-progress', JSON.stringify(quizState))
})
```

## 8. パフォーマンス最適化

### 8.1 モバイル最適化

**戦略:**
- SolidJS軽量性活用
- 遅延ローディング（Lazy Loading）
- 画像最適化（WebP対応）
- Code Splitting

### 8.2 読み込み時間最適化

**目標: 3秒以内**

**施策:**
- バンドルサイズ最小化
- CDN活用（GitHub Pages）
- キャッシュ戦略最適化

## 9. デプロイメント戦略

### 9.1 GitHub Pages設定

**構成:**
```
Repository: quiz-app-template
Branch: main
Directory: dist/ (build output)
```

**Hash routing対応:**
- 追加設定不要
- SPA動作保証

### 9.2 CI/CD

**GitHub Actions活用:**
- 自動ビルド・デプロイ
- TypeScriptコンパイル確認
- Biomeリント実行

## 10. セキュリティ考慮事項

### 10.1 Organization限定アクセス

**GitHub Pages設定:**
- Repository visibility: Internal
- Pages visibility: Private

### 10.2 XSS対策

**Markdown処理:**
- solid-markdownのサニタイズ機能活用
- 外部リンク安全性確認

## 11. 開発環境セットアップ

### 11.1 開発方法論

**採用: Test-Driven Development (TDD)**

**選定理由:**
- **品質担保**: テスト先行による確実な動作保証
- **設計改善**: テスタブルなコード構造の強制
- **リファクタリング安全性**: 変更時の回帰防止
- **ドキュメント効果**: テストが仕様書として機能
- **開発速度**: 長期的な開発効率向上

**実装成果:**
- Red-Green-Refactorサイクル採用
- 18テストケース、100%成功率達成
- 型システム完全カバレッジ

### 11.2 アーキテクチャパターン

**採用: "Parse, don't validate"**

**選定理由:**
- **型安全性**: 外部データの確実な型変換
- **エラー早期発見**: 境界での厳密チェック
- **保守性**: 型変更時の影響範囲明確化
- **実行時安全性**: ランタイムエラーの大幅削減

**実装詳細:**
```typescript
// × Validate: 型が保証されない
function validateQuiz(data: any): boolean { /* ... */ }

// ○ Parse: 確実な型変換
function parseQuiz(data: unknown): QuizData { /* ... */ }
```

## 12. 今後の拡張性

### 12.1 スケーラビリティ

**現在の技術スタックでの対応可能範囲:**
- 問題数: ~1000問程度
- カテゴリ数: ~20カテゴリ程度
- 同時ユーザー: GitHub Pagesの制限内

### 12.2 将来的な技術移行

**大規模化時の選択肢:**
- TanStack Router への移行検討
- サーバーサイド機能追加時のフレームワーク選択
- データベース連携時のアーキテクチャ変更

## 13. 技術選定の核心的判断

### 13.1 パフォーマンス vs 開発効率のバランス

**SolidJS + Valibot + TDD**の組み合わせを選択した理由：

1. **SolidJS**: 最小バンドル + 最大パフォーマンス
2. **Valibot**: 軽量 + 型安全性の両立
3. **TDD**: 短期開発負荷 < 長期品質・保守性

### 13.2 制約条件下での最適化

**GitHub Pages制約:**
- Hash routing必須 → @solidjs/router最適解
- 静的ビルド必須 → Vite最適解
- Bundle size制約 → SolidJS + Valibot最適解

### 13.3 チーム開発への配慮

**学習コスト vs 生産性:**
- SolidJS: React類似API、習得容易
- TypeScript: 型安全性によるチーム協働向上
- TDD: 初期学習コスト高だが、長期品質担保

## 14. テスト戦略

### 14.1 Test-Driven Development (TDD)
**採用理由:**
- **品質担保**: テスト先行による確実な動作保証
- **リファクタリング安全性**: 変更時の回帰防止
- **仕様書効果**: テストが実行可能な仕様書として機能

**実践成果:**
- Red-Green-Refactorサイクル完全採用
- 130テスト全成功、100%品質保証
- valibotの制約に対する安全なコード変更

### 14.2 統合テスト風アプローチ
**Kent C. Dodds哲学の採用:**
- **原則**: 「ユーザーが使うようにテストする」
- **実装**: 子コンポーネントモック削除
- **効果**: テスト実用性・保守性の向上

**技術的成果:**
- vi.hoisted()によるVitestモック初期化問題解決
- 複雑依存関係（YAML・ルーター・状態管理）の完全カバー
- リファクタリング耐性の強いテストスイート

### 14.3 テストタイプ選択基準
**ユニットテスト優先:**
- ビジネスロジック中心コンポーネント
- データ変換・バリデーション処理

**E2Eテスト優先:**
- 表示中心コンポーネント（保守性・ROI重視）
- ユーザーフロー全体の検証

## 15. 技術的制約と解決策

### 15.1 valibotの制約事項
- **制約**: `check`関数のエラーメッセージ関数でデータアクセス不可
- **対策**: 汎用的エラーメッセージの使用
- **回避**: 早期バリデーション終了時のundefined対策

### 15.2 solid-markdownの課題
- **課題**: v2.0.14でサーバーサイドバンドル問題
- **解決**: コミュニティ回避策の発見・適用
- **学習**: バージョン管理の柔軟性の重要性

## 16. まとめ

本技術スタックは**制約条件下でのパフォーマンス最優先**という方針のもと選定：

1. **GitHub Pages制約** → Hash routing + 静的ビルド最適化
2. **モバイル性能要件** → 軽量フレームワーク + バンドル最小化  
3. **品質担保要件** → TDD + 型安全性 + 実行時バリデーション
4. **開発効率要件** → モダンツール + 統合開発環境

**valibot採用による"Parse, don't validate"アーキテクチャ**は、外部データ（YAML）を扱うこのアプリケーションの核心要件を満たす最適解です。

---

※ 各技術スタックの正確なバージョン情報は `package.json` を参照してください。