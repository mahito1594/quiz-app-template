import { expect, test } from "@playwright/test";

/**
 * 復習リスト更新機能のE2Eテスト
 *
 * Issue #31: クイズ再挑戦後も復習推奨問題が残存するバグの修正確認
 */
test.describe("Review List Update Journey", () => {
  /**
   * テストの前準備を実装
   *
   * 1. LocalStorageをクリア
   * 2. ホーム画面にアクセス
   */
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  /**
   * クイズを再挑戦して全問正解した場合、復習リストがクリアされることを確認
   *
   * フロー:
   * 1. 最初のクイズで1問目を不正解、2問目を正解
   * 2. ホーム画面で「復習推奨問題があります」が表示されることを確認
   * 3. 「最初から」ボタンでクイズを再挑戦
   * 4. 今度は両問題とも正解
   * 5. ホーム画面で復習推奨問題が消えていることを確認
   */
  test("should clear review list after retaking quiz with all correct answers", async ({
    page,
  }) => {
    // 1. 最初のクイズで1問目を不正解、2問目を正解
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();

    // 問題1: HTMLを選択（不正解）
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();
    await expect(page.getByText("不正解です")).toBeVisible();
    await page.getByRole("button", { name: "次の問題" }).click();

    // 問題2: ReactとVue.jsを選択（正解）
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await expect(page.getByText("正解です！")).toBeVisible();
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 結果画面で50%の正答率を確認
    await expect(page.getByText("50.0%")).toBeVisible();
    await expect(page.getByText("復習が必要です")).toBeVisible();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 2. ホーム画面で「復習推奨問題があります」が表示されることを確認
    await expect(
      page.getByRole("heading", { name: "復習推奨問題があります" }),
    ).toBeVisible();
    await expect(page.getByText("間違えた問題が 1 問あります")).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "要復習" }),
    ).toBeVisible();

    // 3. 「最初から」ボタンでクイズを再挑戦
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "最初から" })
      .click();

    // 4. 今度は両問題とも正解
    // 問題1: JavaScriptを選択（正解）
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await expect(page.getByText("正解です！")).toBeVisible();
    await page.getByRole("button", { name: "次の問題" }).click();

    // 問題2: ReactとVue.jsを選択（正解）
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await expect(page.getByText("正解です！")).toBeVisible();
    await page.getByRole("button", { name: "結果を見る" }).click();

    // 結果画面で100%の正答率を確認
    await expect(page.getByText("100.0%")).toBeVisible();
    await expect(page.getByText("素晴らしい！")).toBeVisible();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 5. ホーム画面で復習推奨問題が消えていることを確認
    await expect(
      page.getByRole("heading", { name: "復習推奨問題があります" }),
    ).not.toBeVisible();
    await expect(
      page.getByText("間違えた問題が 1 問あります"),
    ).not.toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "要復習" }),
    ).not.toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "完了" }),
    ).toBeVisible();
  });

  /**
   * クイズを再挑戦して新たに不正解があった場合、復習リストが更新されることを確認
   *
   * フロー:
   * 1. 最初のクイズで1問目を不正解、2問目を正解
   * 2. ホーム画面で復習推奨問題が表示されることを確認
   * 3. 「最初から」ボタンでクイズを再挑戦
   * 4. 今度は1問目を正解、2問目を不正解
   * 5. ホーム画面で復習推奨問題が更新されていることを確認
   */
  test("should update review list with new incorrect answers after retaking quiz", async ({
    page,
  }) => {
    // 1. 最初のクイズで1問目を不正解、2問目を正解
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();

    // 問題1: HTMLを選択（不正解）
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "次の問題" }).click();

    // 問題2: ReactとVue.jsを選択（正解）
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 2. ホーム画面で復習推奨問題が表示されることを確認
    await expect(
      page.getByRole("heading", { name: "復習推奨問題があります" }),
    ).toBeVisible();

    // 3. 「最初から」ボタンでクイズを再挑戦
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "最初から" })
      .click();

    // 4. 今度は1問目を正解、2問目を不正解
    // 問題1: JavaScriptを選択（正解）
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "次の問題" }).click();

    // 問題2: Node.jsのみを選択（不正解）
    await page.getByLabel("Node.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 5. ホーム画面で復習推奨問題が更新されていることを確認
    // まだ復習推奨問題は表示されているが、内容が更新されている
    await expect(
      page.getByRole("heading", { name: "復習推奨問題があります" }),
    ).toBeVisible();
    await expect(page.getByText("間違えた問題が 1 問あります")).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "要復習" }),
    ).toBeVisible();

    // 復習画面で問題2（新しい不正解）が表示されることを確認
    await page.getByRole("link", { name: "復習する" }).click();
    await expect(page.getByText("フロントエンド")).toBeVisible();
    await expect(page.getByText("すべて")).toBeVisible();
  });

  /**
   * 他のカテゴリの復習リストには影響しないことを確認
   *
   * フロー:
   * 1. プログラミング基礎とWeb基礎の両方で不正解を作る
   * 2. 両カテゴリで復習推奨が表示されることを確認
   * 3. プログラミング基礎を再挑戦して全問正解
   * 4. プログラミング基礎の復習推奨は消えるが、Web基礎の復習推奨は残ることを確認
   */
  test("should not affect other category review lists when retaking one category", async ({
    page,
  }) => {
    // 1. プログラミング基礎で不正解を作る
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "次の問題" }).click();
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // Web基礎でも不正解を作る
    await page
      .locator(".card-body", { hasText: "Web基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await page.getByLabel("サーバーエラー").click(); // 不正解を選択
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "次の問題" }).click();
    await page.getByLabel("`<section>`").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 2. 両カテゴリで復習推奨が表示されることを確認
    await expect(
      page.getByRole("heading", { name: "復習推奨問題があります" }),
    ).toBeVisible();
    await expect(page.getByText("間違えた問題が 2 問あります")).toBeVisible();
    await expect(page.locator(".badge", { hasText: "要復習" })).toHaveCount(2);

    // 3. プログラミング基礎を再挑戦して全問正解
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "最初から" })
      .click();
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "次の問題" }).click();
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 4. プログラミング基礎の復習推奨は消えるが、Web基礎の復習推奨は残ることを確認
    await expect(
      page.getByRole("heading", { name: "復習推奨問題があります" }),
    ).toBeVisible();
    await expect(page.getByText("間違えた問題が 1 問あります")).toBeVisible();
    await expect(page.locator(".badge", { hasText: "要復習" })).toHaveCount(1);
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "要復習" }),
    ).not.toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "Web基礎" })
        .locator(".badge", { hasText: "要復習" }),
    ).toBeVisible();
  });
});
