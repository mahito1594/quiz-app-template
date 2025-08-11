import { expect, test } from "@playwright/test";

/**
 * 完全なクイズ体験のE2Eテスト
 *
 * ユーザーストーリー: 「クイズを選んで最後まで解いて結果を見る」
 * メインのユーザーフローを包括的にテスト
 */
test.describe("Complete Quiz Journey", () => {
  /**
   * テストの前準備
   *
   * 1. LocalStorageをクリア（クリーンな状態で開始）
   * 2. ホーム画面にアクセス
   */
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  /**
   * カテゴリ選択から新規にクイズを開始し、クイズ完了までの完全フロー: すべて正解パターン
   *
   * フロー:
   * 1. ホーム画面でカテゴリ一覧を確認
   * 2. Web基礎の「開始」ボタンをクリック
   * 3. 問題1: HTTPステータスコード → 「ページが見つからない」を選択 (正解)
   * 4. 正解フィードバックと解説を確認
   * 5. 「次の問題」をクリック
   * 6. 問題2: HTML5セマンティック要素 → 「`<section>`」を選択 (正解)
   * 7. 正解フィードバックと解説を確認
   * 8. 「結果を見る」をクリック
   * 9. 結果画面で100%の成績と「素晴らしい！」メッセージを確認
   * 10. 統計情報 (正解数2、不正解数0、総問題数2) を確認
   * 11. 問題別結果で各問題の詳細を確認
   * 12. 「復習する」ボタンが表示されないことを確認
   */
  test("should complete full quiz journey with all correct answers", async ({
    page,
  }) => {
    // 1. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "未開始" })).toHaveCount(2);

    // 2. Web基礎の「開始」ボタンをクリックし、問題画面を確認
    await page
      .locator(".card-body", { hasText: "Web基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText("HTTPステータスコード404の意味は何ですか？"),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "選択肢" })).toBeVisible();
    await expect(page.locator(".badge", { hasText: "単一選択" })).toBeVisible();

    // 3. 問題1: HTTPステータスコード → 「ページが見つからない」を選択 (正解)
    await page.getByLabel("ページが見つからない").click();
    await page.getByRole("button", { name: "回答" }).click();

    // 4. 正解フィードバックと解説を確認
    await expect(
      page.getByRole("heading", { name: "正解です！" }),
    ).toBeVisible();
    await expect(page.getByText("よくできました！")).toBeVisible();
    await expect(page.getByRole("heading", { name: "解説" })).toBeVisible();
    await expect(
      page.getByText("HTTPステータスコード404は「Not Found」を意味し"),
    ).toBeVisible();

    // 5. 「次の問題」をクリックし、問題2を確認
    await page.getByRole("button", { name: "次の問題" }).click();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText(
        "HTML5の新しいセマンティック要素として正しいものはどれですか？",
      ),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "選択肢" })).toBeVisible();
    await expect(page.locator(".badge", { hasText: "単一選択" })).toBeVisible();

    // 6. 問題2: HTML5セマンティック要素 → 「`<section>`」を選択 (正解)
    await page.getByLabel("`<section>`").click();
    await page.getByRole("button", { name: "回答" }).click();

    // 7. 正解フィードバックと解説を確認
    await expect(
      page.getByRole("heading", { name: "正解です！" }),
    ).toBeVisible();
    await expect(page.getByText("よくできました！")).toBeVisible();
    await expect(page.getByRole("heading", { name: "解説" })).toBeVisible();
    await expect(
      page.getByText("<section>はHTML5で追加されたセマンティック要素です"),
    ).toBeVisible();

    // 8. 「結果を見る」をクリック
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 9. 結果画面で100%の成績と「素晴らしい！」メッセージを確認
    await expect(
      page.getByRole("heading", { name: "クイズ結果" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "100.0%" })).toBeVisible();
    await expect(page.getByText("素晴らしい！")).toBeVisible();

    // 10. 統計情報 (正解数2、不正解数0、総問題数2) を確認
    await expect(
      page
        .locator(".stat", { has: page.getByText("正解数", { exact: true }) })
        .getByText("2"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", { has: page.getByText("不正解数", { exact: true }) })
        .getByText("0"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", { has: page.getByText("総問題数", { exact: true }) })
        .getByText("2"),
    ).toBeVisible();

    // 11. 問題別結果で各問題の詳細を確認
    await expect(
      page
        .locator(".card-body", { hasText: "問題 1" })
        .getByText("正解", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "問題 2" })
        .getByText("正解", { exact: true }),
    ).toBeVisible();

    // 12. 「復習する」ボタンが表示されないことと、「再挑戦」・「ホームに戻る」ボタンを確認
    await expect(page.getByRole("link", { name: "復習する" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "再挑戦" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "ホームに戻る" }),
    ).toBeVisible();
  });

  /**
   * カテゴリ選択から新規にクイズを開始し、クイズ完了までの完全フロー: 正解と不正解の混在パターン
   *
   * フロー:
   * 1. ホーム画面でカテゴリ一覧を確認
   * 2. プログラミング基礎の「開始」ボタンをクリック
   * 3. 問題1: JavaScript を選択してから HTML を再選択 (単一選択問題・不正解)
   * 4. 不正解フィードバックと解説を確認
   * 5. 「次の問題」をクリック
   * 6. 問題2: React と Vue.js を選択 (正解)
   * 7. 正解フィードバックと解説を確認
   * 8. 「結果を見る」をクリック
   * 9. 結果画面で50%の成績と「復習が必要です」メッセージを確認
   * 10. 統計情報 (正解数1、不正解数1、総問題数2) を確認
   * 11. 問題別結果で各問題の詳細を確認
   * 12. 「復習する」ボタンが表示されることを確認
   */
  test("should complete full quiz journey with mixed correct/incorrect answers", async ({
    page,
  }) => {
    // 1. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "未開始" })).toHaveCount(2);

    // 2. プログラミング基礎の「開始」ボタンをクリックし、問題画面を確認
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText("プログラミング言語として正しいものはどれ"),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "選択肢" })).toBeVisible();
    await expect(page.locator(".badge", { hasText: "単一選択" })).toBeVisible();

    // 3. 問題1: JavaScript を選択してから HTML を再選択 (単一選択問題・不正解)
    await page.getByLabel("JavaScript").click();
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();

    // 4. 不正解フィードバックと解説を確認
    await expect(
      page.getByRole("heading", { name: "不正解です" }),
    ).toBeVisible();
    await expect(
      page.getByText("惜しい！解説を確認しましょう。"),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "解説" })).toBeVisible();
    await expect(
      page.getByText("JavaScriptはプログラミング言語です"),
    ).toBeVisible();
    await expect(
      page.getByText("間違えた問題は復習リストに追加"),
    ).toBeVisible();

    // 5. 「次の問題」をクリックし、問題2を確認
    await page.getByRole("button", { name: "次の問題" }).click();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText("フロントエンド技術として分類されるものをすべて選択"),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "選択肢" })).toBeVisible();
    await expect(page.locator(".badge", { hasText: "複数選択" })).toBeVisible();

    // 6. 問題2: React と Vue.js を選択 (正解)
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();

    // 7. 正解フィードバックと解説を確認
    await expect(
      page.getByRole("heading", { name: "正解です！" }),
    ).toBeVisible();
    await expect(page.getByText("よくできました！")).toBeVisible();
    await expect(page.getByRole("heading", { name: "解説" })).toBeVisible();
    await expect(page.getByText("フロントエンド技術の正解")).toBeVisible();

    // 8. 「結果を見る」をクリック
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 9. 結果画面で50%の成績と「復習が必要です」メッセージを確認
    await expect(
      page.getByRole("heading", { name: "クイズ結果" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "50.0%" })).toBeVisible();
    await expect(page.getByText("復習が必要です")).toBeVisible();

    // 10. 統計情報 (正解数1、不正解数1、総問題数2) を確認
    await expect(
      page
        .locator(".stat", { has: page.getByText("正解数", { exact: true }) })
        .getByText("1"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", { has: page.getByText("不正解数", { exact: true }) })
        .getByText("1"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", { has: page.getByText("総問題数", { exact: true }) })
        .getByText("2"),
    ).toBeVisible();

    // 11. 問題別結果で各問題の詳細を確認
    await expect(
      page
        .locator(".card-body", { hasText: "問題 1" })
        .getByText("不正解", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "問題 2" })
        .getByText("正解", { exact: true }),
    ).toBeVisible();

    // 12. 「復習する」ボタンが表示されることと、「再挑戦」・「ホームに戻る」ボタンを確認
    await expect(page.getByRole("link", { name: "復習する" })).toHaveCount(2);
    await expect(page.getByRole("button", { name: "再挑戦" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "ホームに戻る" }),
    ).toBeVisible();
  });
});
