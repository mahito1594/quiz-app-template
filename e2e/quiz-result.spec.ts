import { expect, test } from "@playwright/test";

/**
 * QuizResult.tsx の E2E テスト
 *
 * 実際のユーザーフローに基づいた真のE2Eテスト：
 * ホーム画面 → クイズ選択 → 問題回答 → 結果画面
 */

test.describe("Quiz Result", () => {
  /**
   * 実際のクイズフローで全問正解して結果画面を確認
   */
  test("should display excellent performance result after completing quiz with all correct answers", async ({
    page,
  }) => {
    // ホーム画面に移動
    await page.goto("/");

    // Web基礎カテゴリの「開始」ボタンをクリック
    await page.getByRole("link", { name: "開始" }).nth(1).click();

    // クイズ画面が表示されることを確認
    await expect(page.getByRole("heading", { name: "Web基礎" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "問題文" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "選択肢" })).toBeVisible();

    // 問題1: HTTPステータスコード404の意味
    await expect(page.getByText("HTTPステータスコード404の意味")).toBeVisible();

    // 正解「ページが見つからない」を選択
    await page.getByRole("button", { name: "ページが見つからない" }).click();

    // 回答するボタンをクリック
    await page.getByRole("button", { name: "回答する" }).click();

    // 正解フィードバックが表示されることを確認
    await expect(page.getByText("正解です！")).toBeVisible();

    // 次の問題に進む
    await page.getByRole("button", { name: "次の問題" }).click();

    // 問題2: HTML5セマンティック要素
    await expect(
      page.getByText("HTML5の新しいセマンティック要素"),
    ).toBeVisible();

    // 正解「<section>」を選択
    await page.getByRole("button", { name: "`<section>`" }).click();

    // 回答するボタンをクリック
    await page.getByRole("button", { name: "回答する" }).click();

    // 正解フィードバックが表示されることを確認
    await expect(page.getByText("正解です！")).toBeVisible();

    // 結果を見るボタンをクリック
    await page.getByRole("button", { name: "結果を見る" }).click();

    // === ここからが結果画面のテスト ===

    await expect(page).toHaveURL("/#/quiz/web-basics/result");

    // 結果画面の基本表示確認
    await expect(
      page.getByRole("heading", { name: "クイズ結果" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Web基礎" })).toBeVisible();

    // パフォーマンス評価（100%正解 = excellent）
    await expect(page.getByRole("heading", { name: "100.0%" })).toBeVisible();
    await expect(page.getByText("素晴らしい！")).toBeVisible();

    // アイコン表示確認（IconConfetti）
    await expect(page.locator('[aria-label="素晴らしい"]')).toBeVisible();

    // 統計情報確認
    const statsSection = page.locator(".stats");
    await expect(
      statsSection.getByText("正解数", { exact: true }),
    ).toBeVisible();
    await expect(statsSection.getByText("2").first()).toBeVisible(); // 正解数の値
    await expect(
      statsSection.getByText("不正解数", { exact: true }),
    ).toBeVisible();
    await expect(statsSection.getByText("総問題数")).toBeVisible();

    // 正解数 2 と総問題数 2 で、2回 `2` が表示される
    await expect(statsSection.getByText("2")).toHaveCount(2);
    // 不正回数 0 で、1回 `0` が表示される
    await expect(statsSection.getByText("0")).toHaveCount(1);

    // 復習推奨アラートが表示されないことを確認（全問正解なので）
    await expect(
      page.getByText("復習リストに追加されているので"),
    ).not.toBeVisible();

    // アクションボタン確認
    await expect(page.getByRole("button", { name: "再挑戦" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "ホームに戻る" }),
    ).toBeVisible();
    // 不正解なしなので復習ボタンは表示されない
    await expect(
      page.getByRole("link", { name: "復習する" }),
    ).not.toBeVisible();

    // 問題別結果表示確認
    await expect(
      page.getByRole("heading", { name: "問題別結果" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "問題 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "問題 2" })).toBeVisible();

    // 正解バッジの確認（問題別結果内の各問題のバッジ）
    const badges = page.locator(".badge");
    await expect(badges).toHaveCount(2);
    await expect(badges).toHaveText(["正解", "正解"]);

    // 回答結果の詳細確認
    await expect(page.getByText("あなたの回答:")).toHaveCount(2);
    await expect(page.getByText("正解:", { exact: false })).toHaveCount(2);
  });
});
