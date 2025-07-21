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

**採用: SolidJS v1.9.7**

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

**採用: TypeScript v5.8.3**

**選定理由:**
- 型安全性による品質向上
- IDEサポート充実
- リファクタリング容易性
- チーム開発での可読性

### 3.3 ビルドツール

**採用: Vite v7.0.4**

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

## 5. データ処理・UI関連

### 5.1 問題データ処理

**採用: @modyfi/vite-plugin-yaml v1.1.1**

**選定理由:**
- YAML形式問題データの直接インポート
- Viteビルド時最適化
- TypeScript型生成対応

### 5.2 Markdown処理

**採用: solid-markdown v2.0.14**

**選定理由:**
- SolidJS専用実装
- 解説文レンダリングに最適
- セキュリティ考慮済み

## 6. 開発ツール

### 6.1 リンター・フォーマッター

**採用: Biome v2.1.2**

**選定理由:**
- **超高速**: ESLint/Prettierより10倍高速
- **統合機能**: リンター+フォーマッター一体型
- **設定最小**: ゼロコンフィグ対応
- **Git統合**: コミット時自動実行

### 6.2 パッケージマネージャー

**採用: PNPM v10.13.1**

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

### 11.1 必要な依存関係

```json
{
  "dependencies": {
    "solid-js": "^1.9.7",
    "@solidjs/router": "^0.15.x",
    "solid-markdown": "^2.0.14"
  },
  "devDependencies": {
    "@biomejs/biome": "2.1.2",
    "@modyfi/vite-plugin-yaml": "^1.1.1",
    "typescript": "~5.8.3",
    "vite": "^7.0.4",
    "vite-plugin-solid": "^2.11.7"
  }
}
```

### 11.2 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# プレビュー
pnpm preview
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

## 13. まとめ

本技術スタックは以下の要件を満たす最適解として選定されました：

1. **パフォーマンス**: モバイル端末での高速動作
2. **開発効率**: 迅速な実装と容易な保守
3. **デプロイメント**: GitHub Pagesでの確実な動作
4. **学習コスト**: チーム内での習得容易性

特にSolidJS + Hash routingの組み合わせは、GitHub Pages制約下での最適な選択肢です。