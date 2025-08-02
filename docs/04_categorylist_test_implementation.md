# CategoryListコンポーネントのテスト実装指示書

## 背景
CategoryList.test.tsxはSolidJSルーター依存により実装が複雑で削除された。しかし、CategoryListは重要なコンポーネントであり、適切なテスト戦略が必要。

## 現在の状況
- **実装済み**: ビジネスロジック層のテスト（quiz-store: 49テスト、schema: 18テスト）
- **削除済み**: CategoryList.test.tsx（ルーター依存により複雑化）
- **課題**: CategoryListの統合テストが未実装

## 推奨実装戦略：3層テスト戦略

### 1. CategoryCardコンポーネントの分離とテスト実装

#### 1-1. コンポーネント分離
**ファイル**: `src/components/CategoryCard.tsx`

**目的**: ルーター・状態管理依存を排除し、純粋なUIコンポーネントとして分離

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
  onStartQuiz: (categoryId: string) => void;
  onViewQuestions: (categoryId: string) => void;
};
```

**重要**: 
- `<A>`タグを`<button>`に変更し、コールバック関数で処理
- `quizStateManager`への直接依存を排除
- 進捗データをプロパティとして受け取る

#### 1-2. CategoryList.tsxの修正
- CategoryCardをimportして使用
- navigate関数でルーティング処理
- getCategoryProgress関数でデータを渡す

#### 1-3. CategoryCard.test.tsxの実装
**テスト対象**:
- 未開始状態の表示（「未開始」バッジ、「開始」ボタン）
- 進行中状態の表示（進捗情報、「続きから」ボタン、「問題一覧」ボタン）
- 完了状態の表示（「完了」バッジ、「再挑戦」ボタン）
- ボタンクリック時のコールバック呼び出し
- カテゴリ情報の正確な表示

**期待テスト数**: 10-15テスト

### 2. E2E統合テストの実装（オプション・推奨）

#### 2-1. Playwrightセットアップ
**ファイル**: `playwright.config.ts`, `tests/e2e/`

#### 2-2. CategoryList E2Eテスト実装
**テスト対象**:
- データ読み込み～カテゴリ表示の統合フロー
- ルーティング動作（開始・問題一覧・復習リンク）
- エラーハンドリング
- 復習機能の表示制御

**期待テスト数**: 5-8テスト

### 3. 既存テストの維持

#### 3-1. 継続すべきテスト
- `test/schema/quiz.test.ts` (18テスト) - データパース機能
- `test/stores/quiz-store.test.ts` (49テスト) - 状態管理ロジック
- その他コンポーネントテスト (67テスト)

## 実装優先順位

### 必須（Priority 1）
1. CategoryCardコンポーネントの分離
2. CategoryCard.test.tsxの実装
3. CategoryList.tsxの修正

### 推奨（Priority 2）
1. Playwright E2Eテストのセットアップ
2. CategoryList E2Eテストの実装

## 品質基準

### 必須要件
- `pnpm typecheck` エラーなし
- `pnpm check` Biomeエラーなし
- CategoryCard.test.tsx 全テスト成功

### 推奨要件
- E2Eテスト全成功
- テストカバレッジ維持

## 技術的制約

### 遵守事項
- Questionにidフィールドは不要（配列インデックス使用）
- SolidJS + TypeScript + Vitest + Testing Library構成
- 既存のコード規約・命名規則に従う

### 禁止事項
- CategoryListテストでの複雑なルーターモック
- 既存のビジネスロジックテストの変更
- idフィールドの追加

## 期待される成果

### 完了時の状態
- CategoryCardの独立テスト: 10-15テスト成功
- CategoryListの機能を適切にカバー
- テストコードの保守性向上
- コンポーネントの再利用性向上

### 長期的メリット
- ルーター依存テストの複雑性解決
- コンポーネント設計の改善
- 将来的な機能追加時のテスト容易性

## 注意事項
- 実装前に現在のテスト状況を確認（87テスト成功状態の維持）
- コンポーネント分離時のインポートパス調整
- 既存の動作を変更しないよう注意

この指示書に従って実装することで、CategoryListの適切なテストカバレッジを実現しつつ、テストコードの複雑性を解決できます。

## 履歴
- 2025-08-02: 初版作成
- 作成者: Claude Code レビュー対応セッション