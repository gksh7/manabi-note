import { expect, test } from "@playwright/test";

const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;
const skipAuthTests = process.env.SKIP_AUTH_TESTS === "1";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

test("未ログインでは公開メモ一覧を閲覧できない", async ({ page }) => {
  await page.goto("/notes");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "おかえりなさい" })).toBeVisible();
});

test.describe("認証済みのメモ操作", () => {
  test.skip(skipAuthTests, "SKIP_AUTH_TESTS=1 が設定されているためスキップします。");

  if (!skipAuthTests && (!email || !password)) {
    test("SUPABASE_TEST_EMAIL / SUPABASE_TEST_PASSWORD が未設定です", () => {
      throw new Error(
        "認証済みメモ操作のテストには SUPABASE_TEST_EMAIL と SUPABASE_TEST_PASSWORD の設定が必要です。" +
          "意図的にスキップする場合は SKIP_AUTH_TESTS=1 を設定してください。",
      );
    });
    return;
  }

  test("公開メモを作成・編集・コメント・削除できる", async ({ page }) => {
    const suffix = Date.now();
    const title = `Playwright CRUD ${suffix}`;
    const updatedTitle = `${title} 更新`;

    await signIn(page);
    await page.goto("/notes/new");
    await page.getByLabel("タイトル").fill(title);
    await page.getByLabel("タグ").fill("Playwright, CRUD");
    await page.getByLabel("Markdown本文").fill("# Playwright\n\n- 作成\n- 更新");
    await page.getByRole("button", { name: "公開して保存" }).click();
    await expect(page).toHaveURL(/\/notes\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("作成")).toBeVisible();

    await page.getByPlaceholder("コメントを入力").fill("Playwright からのコメント");
    await page.getByRole("button", { name: "送信" }).click();
    await expect(page.getByText("Playwright からのコメント")).toBeVisible();

    await page.getByRole("link", { name: "メモを編集" }).click();
    await page.getByLabel("タイトル").fill(updatedTitle);
    await page.getByRole("button", { name: "公開して保存" }).click();
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();

    await page.getByRole("link", { name: "メモを編集" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page).toHaveURL(/\/my-notes$/);
    await expect(page.getByText(updatedTitle)).toHaveCount(0);
  });
});
