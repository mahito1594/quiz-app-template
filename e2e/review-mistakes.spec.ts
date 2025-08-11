import { expect, test } from "@playwright/test";

/**
 * 復習機能のE2Eテスト
 *
 * ユーザーストーリー: 「間違えた問題を復習して理解を深める」
 */
test.describe("Review Mistakes Journey", () => {
  /**
   * テストの前準備を実装
   *
   * 1. LocalStorageをクリア
   * 2. プログラミング基礎カテゴリにアクセス
   * 3. 問題1でHTMLを選択（間違い）→ 復習対象に追加される
   * 4. 問題2でReactとVue.jsを選択（正解）→ 復習対象に追加されない
   * 5. 結果画面からホーム画面に戻る
   */
  test.beforeEach(async ({ page }) => {
    // 1. LocalStorageをクリア
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // 2. プログラミング基礎カテゴリにアクセス
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();

    // 3. 問題1でHTMLを選択（間違い）→ 復習対象に追加される
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "次の問題" }).click();

    // 4. 問題2でReactとVue.jsを選択（正解）→ 復習対象に追加されない
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 5. 結果画面からホーム画面に戻る
    await page.getByRole("link", { name: "ホームに戻る" }).click();
  });

  /**
   * 復習モードを実行し、間違えた問題を復習する (正解)
   *
   * フロー:
   * 1. ホーム画面で「復習する」ボタンを確認・クリック
   * 2. 復習モード画面の統計情報とカテゴリを確認
   * 3. 「復習を開始する」ボタンをクリック
   * 4. JavaScript を選択し正解フィードバックを確認
   * 5. 「結果を見る」ボタンをクリック
   * 6. 復習完了メッセージと統計情報を確認
   * 7. ホームに戻り「復習する」ボタンが非表示であることを確認
   */
  test("should complete review journey with correct answer", async ({
    page,
  }) => {
    // 1. ホーム画面で「復習する」ボタンと「要復習」バッジを確認・クリック
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "復習する" })).toBeVisible();

    // プログラミング基礎カテゴリに「要復習」バッジが表示されていることを確認
    const categoryCard = page.locator(".card-body", {
      hasText: "プログラミング基礎",
    });
    await expect(categoryCard.getByText("要復習")).toBeVisible();

    await page.getByRole("link", { name: "復習する" }).click();

    // 2. 復習モード画面の統計情報とカテゴリを確認
    await expect(
      page.getByRole("heading", { name: "復習モード" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("復習対象問題", { exact: true }),
        })
        .getByText("1"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("カテゴリ数", { exact: true }),
        })
        .getByText("1"),
    ).toBeVisible();
    await expect(page.getByText("プログラミング基礎")).toBeVisible();

    // 3. 「復習を開始する」ボタンをクリック
    await page.getByRole("button", { name: "復習を開始する" }).click();

    // 4. JavaScript を選択し正解フィードバックを確認
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText("プログラミング言語として正しいものはどれ"),
    ).toBeVisible();
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await expect(
      page.getByRole("heading", { name: "正解です！" }),
    ).toBeVisible();
    await expect(page.getByText("よくできました！")).toBeVisible();
    await expect(page.getByRole("heading", { name: "解説" })).toBeVisible();
    await expect(
      page.getByText("JavaScriptはプログラミング言語です"),
    ).toBeVisible();

    // 5. 「結果を見る」ボタンをクリック
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 6. 復習完了メッセージと統計情報を確認
    await expect(
      page.getByRole("heading", { name: "復習モード" }),
    ).toBeVisible();
    await expect(
      page.getByText("素晴らしい！復習対象の問題はありません。"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("復習対象問題", { exact: true }),
        })
        .getByText("0"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("カテゴリ数", { exact: true }),
        })
        .getByText("0"),
    ).toBeVisible();

    // 7. ホームに戻り「復習する」ボタンが非表示であることを確認
    await page.getByRole("link", { name: "ホームに戻る" }).first().click();
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "復習する" })).toHaveCount(0);
  });

  /**
   * 復習モードを実行し、間違えた問題を復習する (不正解)
   *
   * フロー:
   * 1. ホーム画面で「復習する」ボタンを確認・クリック
   * 2. 復習モード画面の統計情報とカテゴリを確認
   * 3. 「復習を開始する」ボタンをクリック
   * 4. HTML を選択し不正解フィードバックを確認
   * 5. 「結果を見る」ボタンをクリック
   * 6. 復習対象がまだ残っていることを確認（間違い回数増加）
   * 7. ホームに戻り「復習する」ボタンが表示されていることを確認
   */
  test("should complete review journey with incorrect answer", async ({
    page,
  }) => {
    // 1. ホーム画面で「復習する」ボタンと「要復習」バッジを確認・クリック
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "復習する" })).toBeVisible();

    const categoryCard = page.locator(".card-body", {
      hasText: "プログラミング基礎",
    });
    await expect(categoryCard.getByText("要復習")).toBeVisible();

    await page.getByRole("link", { name: "復習する" }).click();

    // 2. 復習モード画面の統計情報とカテゴリを確認
    await expect(
      page.getByRole("heading", { name: "復習モード" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("復習対象問題", { exact: true }),
        })
        .getByText("1"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("カテゴリ数", { exact: true }),
        })
        .getByText("1"),
    ).toBeVisible();
    await expect(page.getByText("プログラミング基礎")).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByText("1回間違い"),
    ).toBeVisible();

    // 3. 「復習を開始する」ボタンをクリック
    await page.getByRole("button", { name: "復習を開始する" }).click();

    // 4. HTML を選択し不正解フィードバックを確認
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText("プログラミング言語として正しいものはどれ"),
    ).toBeVisible();
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();
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

    // 5. 「結果を見る」ボタンをクリック
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 6. 復習対象がまだ残っていることを確認（間違い回数増加）
    await expect(
      page.getByRole("heading", { name: "復習モード" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("復習対象問題", { exact: true }),
        })
        .getByText("1"),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat", {
          has: page.getByText("カテゴリ数", { exact: true }),
        })
        .getByText("1"),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByText("2回間違い"),
    ).toBeVisible();

    // 7. ホームに戻り「復習する」ボタンが表示されていることを確認
    await page.getByRole("link", { name: "ホームに戻る" }).first().click();
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "復習する" })).toBeVisible();
  });
});
