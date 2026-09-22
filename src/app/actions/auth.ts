"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { message?: string; errors?: { displayName?: string[]; email?: string[]; password?: string[] } };

const credentialsSchema = z.object({
  email: z.string().trim().email("正しいメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください").max(128),
});

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { message: "メールアドレスまたはパスワードを確認してください。" };
  redirect("/notes");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.extend({ displayName: z.string().trim().min(1, "表示名を入力してください").max(50) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"}/auth/confirm`,
    },
  });
  if (error) return { message: error.message.includes("registered") ? "このメールアドレスは登録済みです。" : "登録できませんでした。時間を置いて再度お試しください。" };
  return { message: "確認メールを送信しました。メール内のリンクを開いてください。" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
