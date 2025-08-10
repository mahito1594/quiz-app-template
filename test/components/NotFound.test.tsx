import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import NotFound from "../../src/components/NotFound.js";
import { RouterWrapper } from "../helpers/router-wrapper.js";

describe("NotFound", () => {
  /**
   * 基本的な要素の表示テスト
   */
  describe("Basic rendering", () => {
    it("should render 404 title", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      expect(screen.getByText("404")).toBeInTheDocument();
    });

    it("should render not found message", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
    });

    it("should render description text", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      expect(
        screen.getByText(
          "お探しのページは存在しないか、削除された可能性があります。",
        ),
      ).toBeInTheDocument();
    });
  });

  /**
   * ナビゲーションリンクのテスト
   */
  describe("Navigation links", () => {
    it("should render available pages section", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      expect(screen.getByText("利用可能なページ")).toBeInTheDocument();
    });

    it("should render home link", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      const homeLink = screen.getByText("🏠 ホーム - カテゴリ一覧");
      expect(homeLink).toBeInTheDocument();
      expect(homeLink.closest("a")).toHaveAttribute("href", "/");
    });

    it("should render review link", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      const reviewLink = screen.getByText("📚 復習モード");
      expect(reviewLink).toBeInTheDocument();
      expect(reviewLink.closest("a")).toHaveAttribute("href", "/review");
    });

    it("should render main home button", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      const homeButton = screen.getByText("ホームに戻る");
      expect(homeButton).toBeInTheDocument();
      expect(homeButton.closest("a")).toHaveAttribute("href", "/");
    });
  });

  /**
   * アクセシビリティ・構造テスト
   */
  describe("Accessibility and structure", () => {
    it("should have proper heading hierarchy", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      // h1, h2, h3 の順序で見出しが存在することを確認
      const h1 = screen.getByRole("heading", { level: 1, name: "404" });
      const h2 = screen.getByRole("heading", {
        level: 2,
        name: "ページが見つかりません",
      });
      const h3 = screen.getByRole("heading", {
        level: 3,
        name: "利用可能なページ",
      });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it("should have accessible navigation links", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      // すべてのリンクが適切なrole属性を持っていることを確認
      const homeLinks = screen.getAllByRole("link");
      expect(homeLinks).toHaveLength(3); // 2つのホームリンク + 1つの復習リンク

      // それぞれのリンクがhref属性を持っていることを確認
      homeLinks.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });

    it("should use proper CSS classes for styling", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      // DaisyUI クラスが適切に使用されていることを確認
      const cardElement = screen.getByText("利用可能なページ").closest(".card");
      expect(cardElement).toHaveClass("card", "bg-base-200", "shadow-lg");

      const homeButton = screen.getByText("ホームに戻る");
      expect(homeButton).toHaveClass("btn", "btn-primary", "btn-lg");
    });
  });

  /**
   * コンポーネント構造テスト
   */
  describe("Component structure", () => {
    it("should render without crashing", () => {
      expect(() => {
        render(() => (
          <RouterWrapper>
            <NotFound />
          </RouterWrapper>
        ));
      }).not.toThrow();
    });

    it("should contain all expected text content", () => {
      render(() => (
        <RouterWrapper>
          <NotFound />
        </RouterWrapper>
      ));

      // 重要なテキストコンテンツがすべて表示されていることを確認
      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
      expect(screen.getByText("利用可能なページ")).toBeInTheDocument();
      expect(screen.getByText("🏠 ホーム - カテゴリ一覧")).toBeInTheDocument();
      expect(screen.getByText("📚 復習モード")).toBeInTheDocument();
      expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
    });
  });
});
