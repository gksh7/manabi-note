"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { commentSchema, noteSchema, profileSchema } from "@/lib/validations";

export type FormState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
};

const noteIdSchema = z.string().uuid();

function parseTags(value: FormDataEntryValue | null) {
  return [...new Map(
    String(value ?? "")
      .split(/[\n,]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => [tag.toLocaleLowerCase("ja-JP"), tag]),
  ).values()];
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です。");
  return { supabase, user };
}

export async function saveNote(_: FormState, formData: FormData): Promise<FormState> {
  const noteId = formData.get("noteId");
  const isPublic = formData.get("intent") === "public";
  const parsed = noteSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isPublic,
    tags: parseTags(formData.get("tags")),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  if (noteId && !noteIdSchema.safeParse(noteId).success) return { message: "メモが見つかりません。" };

  const { supabase } = await requireUser();
  const params = {
    p_title: parsed.data.title,
    p_body: parsed.data.body,
    p_is_public: parsed.data.isPublic,
    p_tags: parsed.data.tags,
  };
  const result = noteId
    ? await supabase.rpc("update_note_with_tags", { p_note_id: noteId as string, ...params })
    : await supabase.rpc("create_note_with_tags", params);

  if (result.error) return { message: "保存できませんでした。時間を置いて再度お試しください。" };
  const targetId = noteId || result.data;
  revalidatePath("/notes");
  revalidatePath("/my-notes");
  revalidatePath("/profile");
  redirect(parsed.data.isPublic && targetId ? `/notes/${targetId}` : "/my-notes");
}

export async function deleteNote(formData: FormData) {
  const noteId = noteIdSchema.safeParse(formData.get("noteId"));
  if (!noteId.success) throw new Error("メモが見つかりません。");
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data) throw new Error("メモを削除できませんでした。");
  revalidatePath("/notes");
  revalidatePath("/my-notes");
  redirect("/my-notes");
}

export async function addComment(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = commentSchema.safeParse({ noteId: formData.get("noteId"), body: formData.get("body") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("comments").insert({
    note_id: parsed.data.noteId,
    user_id: user.id,
    body: parsed.data.body,
  });
  if (error) return { message: "コメントを投稿できませんでした。" };
  revalidatePath(`/notes/${parsed.data.noteId}`);
  return { success: true };
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse({ displayName: formData.get("displayName"), bio: formData.get("bio") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, bio: parsed.data.bio })
    .eq("id", user.id);
  if (error) return { message: "プロフィールを保存できませんでした。" };
  revalidatePath("/profile");
  return { success: true, message: "プロフィールを保存しました。" };
}
