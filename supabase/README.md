# Supabase セットアップ

1. Supabaseで新しいプロジェクトを作成する。
2. SQL Editorで `migrations/202609220001_initial_schema.sql` を実行する。
3. Project Settings > API のURLと公開用キーを `.env.local` に設定する。
4. Authentication > URL Configuration にローカルURLと本番URLを登録する。

管理者用の `service_role` キーは、このアプリでは使用しません。
