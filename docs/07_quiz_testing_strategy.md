# Quiz.tsx テスト戦略ドキュメント

## 作成日: 2025-08-06
## 作成者: Claude Code

---

## 1. 背景と課題

### 1.1 Quiz.tsxの特徴
Quiz.tsxは、クイズアプリケーションの中核コンポーネントであり、以下の複雑な機能を持っています：

- **ルーティング依存**: `useParams`でカテゴリIDを取得し、`useNavigate`で画面遷移を管理
- **YAMLデータ依存**: `quiz.yaml`ファイルを直接インポートし、問題データを読み込み
- **状態管理**: 9つの個別シグナルと`quizStateManager`（グローバル状態）の併用
- **ライフサイクル**: `onMount`での初期化処理
- **子コンポーネント**: QuestionCard, AnswerOptions, ImmediateFeedback の3つの子コンポーネントを使用

### 1.2 テスト作成の技術的課題

#### a) モジュール依存の複雑性
- ViteのYAMLプラグインによるインポート処理
- SolidJSのルーターフック
- LocalStorage永続化を含むストア

#### b) 非同期処理とライフサイクル
- `onMount`内での複雑な初期化ロジック
- 状態遷移に伴う副作用

#### c) インテグレーションポイントの多さ
- 3つの子コンポーネントとの連携
- グローバル状態との同期

## 2. テスト戦略

### 2.1 単体テスト（実装済み: test/components/Quiz.test.tsx）

#### 目的
- コンポーネントの基本的な動作検証
- エッジケースの処理確認
- 回帰テストとしての役割

#### アプローチ（実装完了）
1. **部分モック戦略**: 外部依存のみモック化、子コンポーネントは実物使用
   - YAMLデータ: `vi.mock()`で静的データを提供
   - ルーター: パラメータとナビゲーション関数をモック
   - ストア: 必要なメソッドのみモック
   - **子コンポーネント**: 実際のコンポーネントを使用（統合テスト風アプローチ）

2. **テストカバレッジ（14テスト完了）**
   - 初期化フロー（正常・エラー・完了済み・進行中）
   - 回答機能（単一選択・複数選択・正解・不正解）
   - ナビゲーション（次の問題・結果画面・ホーム）
   - エラーハンドリング
   - 表示状態（ローディング・エラー・通常）

#### 技術的成果
- **Kent C. Dodds原則適用**: 「ユーザーが使うようにテストする」
- **vi.hoisted()活用**: モック初期化順序問題の解決
- **実用性重視**: 子コンポーネントとの実際の連携検証
- **保守性向上**: 実装変更に対する耐性向上

### 2.2 統合テスト（未実装: test/components/Quiz.integration.test.tsx）

#### 目的
- 実際のデータフローの検証
- コンポーネント間の連携確認
- ユーザーシナリオの検証

#### 実装計画

##### 準備作業
1. **RouterWrapperの拡張**
```typescript
// test/helpers/router-wrapper-with-params.tsx
export const RouterWrapperWithParams = (props: {
  children: JSX.Element;
  initialEntries?: string[];
  params?: Record<string, string>;
}) => {
  return (
    <MemoryRouter initialEntries={props.initialEntries}>
      <Route 
        path="/quiz/:categoryId" 
        component={() => <>{props.children}</>} 
      />
    </MemoryRouter>
  );
};
```

2. **テスト用YAMLファイル**
```yaml
# test/fixtures/integration-quiz.yaml
metadata:
  title: "統合テスト用問題集"
  version: "1.0.0"
categories:
  - id: "integration-test"
    name: "統合テスト"
    questions:
      - id: "int-q1"
        text: "統合テスト問題1"
        type: "single"
        options: ["A", "B", "C"]
        correct: [0]
```

##### テストシナリオ

1. **フルフローテスト**
   - クイズ開始から完了までの一連の流れ
   - LocalStorage永続化の確認
   - 結果画面への遷移

2. **再開テスト**
   - 途中で中断したクイズの再開
   - 進捗データの正確な復元

3. **エラーリカバリーテスト**
   - 不正なデータでのエラーハンドリング
   - エラー後の復帰操作

4. **子コンポーネント連携テスト**
   - QuestionCardの表示内容
   - AnswerOptionsの選択動作
   - ImmediateFeedbackの表示切り替え

##### 実装時の注意事項
- 実際のYAMLファイルを使用
- quizStateManagerの実装を使用（または部分モック）
- 子コンポーネントは実際のものを使用

### 2.3 E2Eテスト（既存: e2e/quiz.spec.ts）

#### 現状
- Playwrightによる基本的な動作確認は実装済み
- ユーザー視点での全体的な動作を検証

#### 今後の拡張案
- より詳細なシナリオテスト
- パフォーマンステスト
- アクセシビリティテスト

## 3. モック戦略詳細

### 3.1 YAMLファイルのモック

#### 単体テストでのアプローチ
```typescript
vi.mock("../../src/data/quiz.yaml", () => ({
  default: mockQuizData
}))
```

#### 統合テストでのアプローチ
- 実際のYAMLローダーを使用
- テスト専用のYAMLファイルを用意

### 3.2 ルーターのモック

#### 単体テスト
```typescript
vi.mock("@solidjs/router", () => ({
  useParams: () => ({ categoryId: "test-category" }),
  useNavigate: () => mockNavigate
}))
```

#### 統合テスト
- MemoryRouterを使用した実際のルーティング
- パラメータ付きのルート定義

### 3.3 ストアのモック

#### 単体テスト
- 必要最小限のメソッドをモック
- 戻り値を制御して様々な状態を再現

#### 統合テスト
- 実際のストア実装を使用
- 必要に応じてspyOnで監視

## 4. 今後の実装優先順位

### Phase 1: 基本テスト（✅ 完了 - 2025-08-06）
- [x] Quiz.test.tsx - 統合テスト風アプローチによる14テスト実装完了
- [x] Kent C. Dodds哲学の実践（子コンポーネントモック削除）
- [x] vi.hoisted()による技術的課題解決

### Phase 2: 統合テスト（優先度低下）
- [ ] RouterWrapperWithParamsの実装（必要性再検討）
- [ ] Quiz.integration.test.tsx - 統合テスト（Phase 1で実質的に達成）
- [ ] テスト用YAMLファイルの準備（既存モックデータで充分）

**注記**: Phase 1で統合テスト風アプローチを採用したため、Phase 2の必要性は大幅に低下しました。

### Phase 3: カバレッジ向上
- [ ] エッジケースの追加テスト
- [ ] パフォーマンステスト
- [ ] アクセシビリティテスト

## 5. テスト実行とメンテナンス

### 実行コマンド
```bash
# 単体テストのみ
pnpm test test/components/Quiz.test.tsx

# 統合テストのみ（実装後）
pnpm test test/components/Quiz.integration.test.tsx

# すべてのテスト
pnpm test

# カバレッジレポート
pnpm test:coverage
```

### メンテナンス指針
1. **機能変更時**: 単体テストを先に修正
2. **データ構造変更時**: モックデータとYAMLファイルを更新
3. **UI変更時**: 子コンポーネントのモックを更新
4. **新機能追加時**: 単体テスト → 統合テスト → E2Eテストの順で追加

## 6. 既知の問題と回避策

### 6.1 vi.mockのホイスティング
- 問題: `vi.mock`はファイル先頭に自動移動される
- 回避策: 動的インポートやvi.doMockを使用

### 6.2 onMountのテスト
- 問題: 初期化ロジックが複雑
- 回避策: waitForを使用した非同期テスト

### 6.3 複数シグナルの管理
- 問題: 9つのシグナルの状態管理が複雑
- 回避策: テストケースごとに必要な状態のみ検証

## 7. 参考資料

### ドキュメント
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking)
- [SolidJS Testing Library](https://github.com/solidjs/solid-testing-library)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

### 関連ファイル
- src/components/Quiz.tsx - テスト対象コンポーネント
- test/components/Quiz.test.tsx - 単体テスト（実装済み）
- test/components/Quiz.integration.test.tsx - 統合テスト（未実装）
- test/helpers/router-wrapper.tsx - ルーターヘルパー

## 8. 連絡事項

このドキュメントは、Quiz.tsxのテスト実装における方針と背景を記録したものです。
統合テストの実装時には、このドキュメントを参照して作業を進めてください。

質問や不明点がある場合は、以下を確認してください：
1. 既存のテストコード（CategoryList.integration.test.tsxなど）
2. プロジェクトのCLAUDE.md
3. Vitestの公式ドキュメント

---

最終更新: 2025-08-06
実装完了: Quiz.tsxの包括的テストカバレッジ達成（14テスト成功）
次回アクション: 他のコンポーネントでの同様アプローチの適用検討