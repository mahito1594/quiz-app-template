import { expect, test } from "@playwright/test";

/**
 * クイズ中断・再開機能のE2Eテスト
 *
 * ユーザーストーリー: 「中断したクイズを後で続ける」
 * Issue #10: クイズ再開時の問題修正確認
 */
test.describe("Resume Quiz Journey", () => {
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
   * 1つのカテゴリでクイズを開始し、途中で中断して再開するフロー: 正解パターン
   *
   * フロー:
   * 1. ホーム画面でカテゴリ一覧を確認
   * 2. プログラミング基礎の「開始」ボタンをクリック
   * 3. 問題1でJavaScriptを選択して正解
   * 4. ホーム画面に戻る
   * 5. プログラミング基礎カテゴリの進捗状態を確認（進行中・続きから表示）
   * 6. 「続きから」ボタンをクリック
   * 7. 問題2を正解して結果画面に進み、ホームに戻る
   * 8. 完了状態を確認
   * 9. 「最初から」ボタンで最初から開始できることを確認
   */
  test("should resume quiz with correct answers and complete successfully", async ({
    page,
  }) => {
    // 1. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "未開始" })).toHaveCount(2);

    // 2. プログラミング基礎の「開始」ボタンをクリック
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();

    // 3. 問題1でJavaScriptを選択して正解し、ホーム画面に戻る
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("link", { name: "ホーム" }).click();

    // 4. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();

    // 5. プログラミング基礎カテゴリの進捗状態を確認（進行中）
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "進行中" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByText("1 / 2"),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByRole("link", { name: "続きから" }),
    ).toBeVisible();

    // 6. 「続きから」ボタンをクリックして問題2に進む
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "続きから" })
      .click();

    // 7. 問題2を正解して結果画面に進み、ホームに戻る
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 8. 完了状態を確認
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "完了" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByRole("link", { name: "最初から" }),
    ).toBeVisible();

    // 9. 「最初から」ボタンで最初から開始できることを確認
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "最初から" })
      .click();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(
      page.getByText("プログラミング言語として正しいものはどれ"),
    ).toBeVisible();
  });

  /**
   * 1つのカテゴリでクイズを開始し、途中で中断して再開するフロー: 不正解パターン
   *
   * フロー:
   * 1. ホーム画面でカテゴリ一覧を確認
   * 2. プログラミング基礎の「開始」ボタンをクリック
   * 3. 問題1でHTMLを選択して不正解
   * 4. ホーム画面に戻る
   * 5. プログラミング基礎カテゴリの進捗状態を確認（進行中・続きから表示）
   * 6. 「続きから」ボタンをクリック
   * 7. 問題2を正解して結果画面に進み、ホームに戻る
   * 8. 完了状態を確認
   * 9. 復習ボタンが表示されていることを確認
   */
  test("should resume quiz with incorrect answer and show review option", async ({
    page,
  }) => {
    // 1. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "未開始" })).toHaveCount(2);

    // 2. プログラミング基礎の「開始」ボタンをクリック
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();

    // 3. 問題1でHTMLを選択して不正解し、ホーム画面に戻る
    await page.getByLabel("HTML").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("link", { name: "ホーム" }).click();

    // 4. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();

    // 5. プログラミング基礎カテゴリの進捗状態を確認（進行中）
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "進行中" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByText("1 / 2"),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByRole("link", { name: "続きから" }),
    ).toBeVisible();

    // 6. 「続きから」ボタンをクリックして問題2に進む
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "続きから" })
      .click();

    // 7. 問題2を正解して結果画面に進み、ホームに戻る
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 8. 完了状態を確認
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "完了" }),
    ).toBeVisible();

    // 9. 復習ボタンが表示されていることを確認
    await expect(page.getByRole("link", { name: "復習する" })).toBeVisible();
  });

  /**
   * 複数カテゴリでの独立した進捗管理テスト
   *
   * フロー:
   * 1. ホーム画面でカテゴリ一覧を確認
   * 2. プログラミング基礎で問題1を正解してホームに戻る
   * 3. Web基礎で問題1を正解してホームに戻る
   * 4. 両カテゴリが進行中状態であることを確認
   * 5. プログラミング基礎を「続きから」で完了
   * 6. プログラミング基礎が完了、Web基礎が進行中であることを確認
   * 7. Web基礎を「続きから」で完了
   * 8. 両カテゴリが完了状態であることを確認
   */
  test("should manage independent progress for multiple categories", async ({
    page,
  }) => {
    // 1. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "未開始" })).toHaveCount(2);

    // 2. プログラミング基礎で問題1を正解してホームに戻る
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("link", { name: "ホーム" }).click();

    // 3. Web基礎で問題1を正解してホームに戻る
    await page
      .locator(".card-body", { hasText: "Web基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await page.getByLabel("ページが見つからない").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("link", { name: "ホーム" }).click();

    // 4. 両カテゴリが進行中状態であることを確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "進行中" })).toHaveCount(2);
    await expect(page.getByRole("link", { name: "続きから" })).toHaveCount(2);

    // 5. プログラミング基礎を「続きから」で完了
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "続きから" })
      .click();
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 6. プログラミング基礎が完了、Web基礎が進行中であることを確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "完了" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "Web基礎" })
        .locator(".badge", { hasText: "進行中" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "最初から" })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "続きから" })).toHaveCount(1);

    // 7. Web基礎を「続きから」で完了
    await page
      .locator(".card-body", { hasText: "Web基礎" })
      .getByRole("link", { name: "続きから" })
      .click();
    await page.getByLabel("`<section>`").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 8. 両カテゴリが完了状態であることを確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "完了" })).toHaveCount(2);
    await expect(page.getByRole("link", { name: "最初から" })).toHaveCount(2);
    await expect(page.getByRole("link", { name: "続きから" })).toHaveCount(0);
  });

  /**
   * ブラウザセッション間でのデータ保持テスト
   *
   * フロー:
   * 1. ホーム画面でカテゴリ一覧を確認
   * 2. プログラミング基礎で問題1を正解してホームに戻る
   * 3. ブラウザをリロードして新しいセッションをシミュレート
   * 4. 進捗が保持されていることを確認（進行中・続きから表示）
   * 5. 「続きから」で問題2から再開できる
   * 6. 問題2を正解して結果画面に進み、ホームに戻る
   * 7. 完了状態が正しく表示されていることを確認
   */
  test("should persist data across browser sessions", async ({ page }) => {
    // 1. ホーム画面でカテゴリ一覧を確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(page.locator(".badge", { hasText: "未開始" })).toHaveCount(2);

    // 2. プログラミング基礎で問題1を正解してホームに戻る
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "開始" })
      .click();
    await page.getByLabel("JavaScript").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("link", { name: "ホーム" }).click();

    // 3. ブラウザをリロードして新しいセッションをシミュレート
    await page.reload();

    // 4. 進捗が保持されていることを確認
    await expect(
      page.getByRole("heading", { name: "カテゴリ一覧" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "進行中" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByText("1 / 2"),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByRole("link", { name: "続きから" }),
    ).toBeVisible();

    // 5. 「続きから」で問題2から再開できる
    await page
      .locator(".card-body", { hasText: "プログラミング基礎" })
      .getByRole("link", { name: "続きから" })
      .click();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();

    // 6. 問題2を正解して完了し、ホームに戻る
    await page.getByLabel("React").click();
    await page.getByLabel("Vue.js").click();
    await page.getByRole("button", { name: "回答" }).click();
    await page.getByRole("button", { name: "結果を見る" }).click();
    await page.getByRole("link", { name: "ホームに戻る" }).click();

    // 7. 完了状態が正しく表示されていることを確認
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .locator(".badge", { hasText: "完了" }),
    ).toBeVisible();
    await expect(
      page
        .locator(".card-body", { hasText: "プログラミング基礎" })
        .getByRole("link", { name: "最初から" }),
    ).toBeVisible();
  });
});
