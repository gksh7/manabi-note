import { expect, test } from "@playwright/test";

test("ログイン画面からモックへ移動できる", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "おかえりなさい" })).toBeVisible();
  await page.getByRole("link", { name: "モック画面を見る" }).click();
  await expect(page.getByRole("heading", { name: "みんなのメモ" })).toBeVisible();
});

test("公開メモを検索して詳細を開ける", async ({ page }) => {
  await page.goto("/notes");
  await page.getByPlaceholder("キーワードで検索").fill("React");
  await expect(page.getByRole("heading", { name: "Reactの基礎まとめ" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "読書メモ：人を動かす" })).toBeHidden();
  await page.getByRole("heading", { name: "Reactの基礎まとめ" }).click();
  await expect(page.getByText("宣言的にUIを記述できる")).toBeVisible();
});

test("Markdownを編集してプレビューできる", async ({ page }) => {
  await page.goto("/notes/new");
  const editor = page.getByLabel("Markdown本文");
  await editor.fill("# テスト見出し\n\n- 項目A");
  await page.getByRole("button", { name: "プレビュー" }).click();
  await expect(page.getByRole("heading", { name: "テスト見出し" })).toBeVisible();
  await expect(page.getByText("項目A")).toBeVisible();
});

test("公開メモにコメントできる", async ({ page }) => {
  await page.goto("/notes/react-basics");
  await page.getByPlaceholder("コメントを入力").fill("テストコメントです");
  await page.getByRole("button", { name: "送信" }).click();
  await expect(page.getByText("テストコメントです")).toBeVisible();
  await expect(page.getByText("たった今")).toBeVisible();
});

test("モバイルでメニューを開ける", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "モバイル専用");
  await page.goto("/notes");
  await page.getByRole("button", { name: "メニュー" }).click();
  await expect(page.getByRole("link", { name: "マイメモ" })).toBeVisible();
});
