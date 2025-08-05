# CategoryListコンポーネントのテスト実装指示書

## 背景
CategoryList.test.tsxはSolidJSルーター依存により実装が複雑で削除された。しかし、CategoryListは重要なコンポーネントであり、適切なテスト戦略が必要。

## 基本方針
**プロダクションコードの品質を維持しつつ、適切なテストカバレッジを実現する**
- テストのためにプロダクションコードの品質を犠牲にしない
- アクセシビリティ、SEO、UXを保持
- 標準的なWeb機能（リンクの右クリックメニュー等）を維持

## 現在の状況
- **実装済み**: ビジネスロジック層のテスト（quiz-store: 15テスト、schema: 18テスト）
- **削除済み**: CategoryList.test.tsx（ルーター依存により複雑化）
- **課題**: CategoryListの統合テストが未実装
- **現在のテスト数**: 94テスト成功

## 推奨実装戦略：ルーター対応テスト戦略

### 1. CategoryCardコンポーネントの分離とテスト実装

#### 1-1. コンポーネント分離
**ファイル**: `src/components/CategoryCard.tsx`

**目的**: 責務の分離とテスト容易性の向上（ルーティング機能は維持）

**分離内容**:
```tsx
export type CategoryCardProps = {
  category: Category;
  progress: {
    hasProgress: boolean;
    isCompleted: boolean;
    currentQuestion: number;
    totalAnswered: number;
    accuracy: number;
  };
};
```

**重要**: 
- `<A>`タグはそのまま維持（ルーティング機能を保持）
- `quizStateManager`への直接依存を排除
- 進捗データをプロパティとして受け取る

#### 1-2. CategoryList.tsxの修正
- CategoryCardをimportして使用
- getCategoryProgress関数でデータを渡す
- コード構造の改善のみ（機能変更なし）

#### 1-3. CategoryCard.test.tsxの実装
**テスト戦略**: `@solidjs/testing-library`の`location`オプションを使用

```tsx
// テスト例
render(() => <CategoryCard {...props} />, { 
  location: "/" // ルーターコンテキストを提供
});
```

**テスト対象**:
- 未開始状態の表示（「未開始」バッジ、「開始」リンク）
- 進行中状態の表示（進捗情報、「続きから」リンク、「問題一覧」リンク）
- 完了状態の表示（「完了」バッジ、「再挑戦」リンク）
- リンクのhref属性の正確性
- カテゴリ情報の正確な表示

**期待テスト数**: 12-15テスト

### 2. 統合テストの実装

#### 2-1. CategoryList統合テスト
**ファイル**: `test/components/CategoryList.integration.test.tsx`

**アプローチ**: MemoryRouterを使用した統合テスト
```tsx
render(() => (
  <MemoryRouter>
    <CategoryList />
  </MemoryRouter>
));
```

**テスト対象**:
- YAMLデータ読み込み成功時のカテゴリ表示
- エラーハンドリング
- 復習リンクの表示制御
- メタデータの表示

**期待テスト数**: 5-8テスト

#### 2-2. E2E統合テスト（将来的な検討事項）
**ファイル**: `playwright.config.ts`, `tests/e2e/`

**テスト対象**:
- データ読み込み～カテゴリ表示の統合フロー
- ルーティング動作（開始・問題一覧・復習リンク）
- エラーハンドリング
- 復習機能の表示制御

**期待テスト数**: 5-8テスト

### 3. 既存テストの維持

#### 3-1. 継続すべきテスト
- `test/schema/quiz.test.ts` (18テスト) - データパース機能
- `test/stores/quiz-store.test.ts` (15テスト) - 状態管理ロジック
- その他コンポーネントテスト（AnswerOptions: 13, QuestionCard: 16, ImmediateFeedback: 16, quiz-loader: 16）

## 実装優先順位

### 必須（Priority 1）
1. CategoryCardコンポーネントの分離
2. CategoryCard.test.tsxの実装
3. CategoryList.tsxの修正

### 推奨（Priority 2）
1. CategoryList統合テストの実装
2. E2Eテストのセットアップ（将来的な検討）

## 品質基準

### 必須要件
- `pnpm typecheck` エラーなし
- `pnpm check` Biomeエラーなし
- CategoryCard.test.tsx 全テスト成功
- 既存94テストの成功維持

### 推奨要件
- 統合テスト全成功
- テストカバレッジ維持

## 技術的制約

### 遵守事項
- Questionにidフィールドは不要（配列インデックス使用）
- SolidJS + TypeScript + Vitest + Testing Library構成
- 既存のコード規約・命名規則に従う
- **プロダクションコードの品質を優先**

### 禁止事項
- CategoryListテストでの複雑なルーターモック
- 既存のビジネスロジックテストの変更
- idフィールドの追加
- **テストのためのプロダクションコード品質の低下**

## 期待される成果

### 完了時の状態
- CategoryCardの独立テスト: 12-15テスト成功
- CategoryList統合テスト: 5-8テスト成功
- プロダクションコードの品質維持
- コンポーネントの再利用性向上

### 長期的メリット
- ルーター依存テストの複雑性を適切に管理
- コンポーネント設計の改善
- 将来的な機能追加時のテスト容易性
- アクセシビリティとUXの維持

## 注意事項
- 実装前に現在のテスト状況を確認（94テスト成功状態の維持）
- コンポーネント分離時のインポートパス調整
- 既存の動作を変更しないよう注意
- `<A>`タグの機能性を完全に保持

この指示書に従って実装することで、CategoryListの適切なテストカバレッジを実現しつつ、プロダクションコードの品質を維持できます。

## 履歴
- 2025-08-02: 初版作成
- 2025-08-05: プロダクションコード品質優先の方針に改訂
- 作成者: Claude Code レビュー対応セッション