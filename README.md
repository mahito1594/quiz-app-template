# quiz-app-template
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![Renovate: enable](https://img.shields.io/badge/renovate-enabled-brightgreen)](https://www.mend.io/renovate/)
[![GitHub Release Date](https://img.shields.io/github/release-date/mahito1594/quiz-app-template?label=release%2Fdeploy)](https://github.com/mahito1594/quiz-app-template/releases)


## 概要

問題集 Web アプリケーションを構築するためのテンプレートリポジトリです。

### 特徴

本アプリは以下の技術を採用しています。

- **TypeScript**
- **[SolidJS](https://docs.solidjs.com)**
- **[Solid Router](https://docs.solidjs.com/solid-router/)**
- **TailwindCSS + DaisyUI**

また、問題データを YAML ファイルで管理できるような実装とし、問題集アプリのテンプレートとして活用できるようにしています。
アプリでの学習状況は LocalStorage に保持します。

## 使い方

### セットアップ

このテンプレートを利用して新しいプロジェクトを作成する方法：

#### 方法 1: GitHub テンプレート機能を使用

1. GitHub 上でこのリポジトリの「Use this template」ボタンをクリック
2. 新しいリポジトリ名を入力して作成
3. 作成されたリポジトリをローカルにクローン

#### 方法 2: Fork して利用

GitHub 上でリポジトリを Fork してから利用

#### 方法 3: [giget](https://github.com/unjs/giget) を使用

```bash
npx giget@latest gh:mahito1594/quiz-app-template [target]
```

#### 方法 4: [gitpick](https://github.com/nrjdalal/gitpick) を使用

```bash
npx gitpick@latest mahito1594/quiz-app-template [target]
```

#### 共通セットアップ手順

```bash
# 依存関係をインストール
pnpm install --frozen-lockfile

# 開発サーバーを起動
pnpm dev
```

> [!NOTE]
> `pnpm install` 時にエラーが発生する際は事前に `git init` するか、
> [`package.json`](./package.json) 内の `scripts.postinstall` の業を削除してください。

開発サーバーが起動したら `http://localhost:5173` でアプリケーションにアクセスできます。

### 問題データのカスタマイズ

問題データは [`src/data/quiz.yaml`](./src/data/quiz.yaml) で管理されています。
作成したい問題集アプリに応じて、問題データを編集してください。

#### YAML ファイルの基本構造

```yaml
metadata:                      # クイズ全体のメタデータ（必須）
  version: "1.0.0"            # バージョン番号
  title: "問題集のタイトル"       # 問題集の名称
  lastUpdated: "2025-01-15"   # 最終更新日（YYYY-MM-DD 形式）
  description: "説明文"        # 問題集の説明（オプション）

categories:                    # 問題カテゴリの配列（最低1つ必要）
  - id: "category-id"         # カテゴリ ID（英数字・ハイフンのみ、必須）
    name: "カテゴリ名"          # 表示用カテゴリ名（必須）
    description: "説明文"       # カテゴリ説明（必須）
    order: 1                   # 表示順序（数値、必須）
    questions:                 # 問題配列（必須）
      - type: "single"         # 問題タイプ（必須）
        question: |            # 問題文（必須、Markdown 対応）
          問題文をここに記述
        options:               # 選択肢配列（最低2つ必要）
          - "選択肢1"
          - "選択肢2"
        correct: [0]           # 正解インデックス配列（0始まり、必須）
        explanation: |         # 解説文（必須、Markdown 対応）
          解説をここに記述
```

#### 各フィールドの詳細説明

**メタデータ (`metadata`):**
- `version`: 問題集のバージョン番号（文字列）
- `title`: 問題集のタイトル（文字列）
- `lastUpdated`: 最終更新日（`YYYY-MM-DD` 形式の文字列）
- `description`: 問題集の説明（文字列、オプション）

**カテゴリ (`categories`):**
- `id`: URL 対応の識別子（英数字とハイフンのみ、必須）
- `name`: ユーザー表示用の名前（必須）
- `description`: カテゴリの説明（必須）
- `order`: 表示順序を決める数値（必須）
- `questions`: このカテゴリの問題配列（必須）

**問題 (`questions`):**
- `type`: 問題タイプ（`"single"` = 単一選択、`"multiple"` = 複数選択、必須）
- `question`: 問題文（必須、Markdown 記法対応）
- `options`: 選択肢の配列（最低2つ必要、必須）
- `correct`: 正解選択肢のインデックス配列（0始まり、必須）
- `explanation`: 解説文（必須、Markdown 記法に対応しています）

#### Markdown 記法の活用

`question` と `explanation` フィールドでは Markdown 記法が使用できます：

````yaml
explanation: |
  **太字**で重要なポイントを強調できます。

  リスト表記も可能：
  - ポイント1：基本的な説明
  - ポイント2：*斜体*での補足

  インラインコード：`let variable = "value"`

  外部リンクも追加可能：
  [詳しくはこちら](https://example.com)

  コードブロックも使用できます：

  ```javascript
  const answer = "correct";
  ```
````

#### 実際の設定例

```yaml
metadata:
  version: "1.0.0"
  title: "JavaScript 基礎問題集"
  lastUpdated: "2025-01-15"
  description: "JavaScript の基本文法を学ぶ問題集"

categories:
  - id: "js-variables"
    name: "変数と宣言"
    description: "JavaScript の変数宣言に関する問題"
    order: 1
    questions:
      - type: "single"
        question: |
          JavaScript で**再代入可能**なブロックスコープ変数を宣言するキーワードは？
        options:
          - "var"
          - "let"
          - "const"
          - "function"
        correct: [1]
        explanation: |
          **正解: `let`**

          JavaScript の変数宣言キーワード：
          - **`let`**: 再代入可能なブロックスコープ変数
          - **`const`**: 再代入不可なブロックスコープ変数
          - **`var`**: 関数スコープ変数（ES6 以降は非推奨）

          参考：[MDN - let 文](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/let)

      - type: "multiple"
        question: |
          以下のうち、ES6 で導入された変数宣言キーワードを**すべて**選択してください。
        options:
          - "var"
          - "let"
          - "const"
          - "function"
        correct: [1, 2]
        explanation: |
          **正解: `let` と `const`**

          ES6（ES2015）で新たに追加された変数宣言：
          - **`let`**: ブロックスコープ、再代入可能
          - **`const`**: ブロックスコープ、再代入不可

          既存のキーワード：
          - `var`: ES6 以前から存在（関数スコープ）
          - `function`: 関数宣言用（変数宣言ではない）
```

### 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 本番ビルドのプレビュー
pnpm preview

# 静的解析・フォーマット確認
pnpm check

# 静的型検査
pnpm typecheck

# 単体テスト実行
pnpm test:unit

# E2E テスト実行
pnpm test:e2e
```


### カスタマイズ（オプション）

利用目的に合わないファイルは削除してください:

- **Claude Code 関連**: [`CLAUDE.md`](./CLAUDE.md), [`docs/`](./docs/) ディレクトリ（Claude Code を使わない場合）
- **GitHub Actions**: [`.github/workflows/`](./.github/workflows/) ディレクトリ（CI/CD が不要な場合）
- **Renovate**: [`renovate.json`](./renovate.json)（依存関係自動更新が不要な場合）
- **E2E テスト**: [`e2e/`](./e2e/) ディレクトリ、[`playwright.config.ts`](./playwright.config.ts)（E2E テストが不要な場合）

## デプロイ方法

静的ホスティングサービスへのデプロイが可能です。

### 例: GitHub Pages での配信

1. **リポジトリ設定で Pages 機能を有効化**
   - Settings > Pages > Source を「GitHub Actions」に設定

2. **ビルド設定の調整**（必要に応じて）
   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: '/your-repo-name/', // リポジトリ名に合わせて変更
     // ...他の設定
   })
   ```

3. 手動または GitHub Actions によるデプロイ

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。
