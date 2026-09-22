# Manabi Note

学習メモを Markdown で記録し、共通タグで整理・共有できる Web アプリです。公開メモはログイン済みユーザー同士で共有でき、コメントを通じて学びを深められます。

## 技術スタック

- Next.js (App Router / TypeScript)
- Tailwind CSS
- Supabase (Auth / PostgreSQL / Row Level Security)
- Playwright

## ローカルでの起動

Node.js 20 以降を使用します。

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 環境変数

`.env.example` を `.env.local` にコピーし、Supabase プロジェクトの値を設定します。`.env.local` は Git の管理対象外です。

## ドキュメント

- [開発計画](./PROJECT_PLAN.md)
- デザイン資料: `docs/design/`（ステップ1で作成）

## E2E テスト

`SUPABASE_TEST_EMAIL` と `SUPABASE_TEST_PASSWORD` に専用テストアカウントを設定してから、次を実行します。

```bash
npm run test:e2e
```

テストは公開メモを作成し、コメント・編集を確認した後に削除します。
