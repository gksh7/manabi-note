import type { SupabaseClient } from "@supabase/supabase-js";

export type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  commentCount: number;
};

export type Comment = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
  author: string;
};

type NoteRow = Omit<Note, "userId" | "isPublic" | "createdAt" | "updatedAt" | "author" | "tags" | "commentCount"> & {
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type ProfileRow = { id: string; display_name: string; bio: string };
type TagLinkRow = { note_id: string; tag_id: string };
type TagRow = { id: string; name: string };
type CommentRow = { id: string; note_id: string; user_id: string; body: string; created_at: string };

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(new Date(value));
}

async function enrichNotes(supabase: SupabaseClient, rows: NoteRow[]): Promise<Note[]> {
  if (!rows.length) return [];

  const noteIds = rows.map((note) => note.id);
  const userIds = [...new Set(rows.map((note) => note.user_id))];
  const [{ data: profiles }, { data: tagLinks }, { data: commentRows }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, bio").in("id", userIds),
    supabase.from("note_tags").select("note_id, tag_id").in("note_id", noteIds),
    supabase.from("comments").select("note_id").in("note_id", noteIds),
  ]);

  const links = (tagLinks ?? []) as TagLinkRow[];
  const tagIds = [...new Set(links.map((link) => link.tag_id))];
  const { data: tagRows } = tagIds.length
    ? await supabase.from("tags").select("id, name").in("id", tagIds)
    : { data: [] as TagRow[] };

  const profileById = new Map(((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
  const tagById = new Map(((tagRows ?? []) as TagRow[]).map((tag) => [tag.id, tag.name]));
  const tagsByNoteId = new Map<string, string[]>();
  for (const link of links) {
    const tag = tagById.get(link.tag_id);
    if (tag) tagsByNoteId.set(link.note_id, [...(tagsByNoteId.get(link.note_id) ?? []), tag]);
  }

  const commentCountByNoteId = new Map<string, number>();
  for (const comment of (commentRows ?? []) as Pick<CommentRow, "note_id">[]) {
    commentCountByNoteId.set(comment.note_id, (commentCountByNoteId.get(comment.note_id) ?? 0) + 1);
  }

  return rows.map((note) => ({
    id: note.id,
    userId: note.user_id,
    title: note.title,
    body: note.body,
    isPublic: note.is_public,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    author: profileById.get(note.user_id)?.display_name ?? "ユーザー",
    tags: tagsByNoteId.get(note.id) ?? [],
    commentCount: commentCountByNoteId.get(note.id) ?? 0,
  }));
}

export async function getPublicNotes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("notes")
    .select("id, user_id, title, body, is_public, created_at, updated_at")
    .eq("is_public", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return enrichNotes(supabase, (data ?? []) as NoteRow[]);
}

export async function getOwnNotes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("id, user_id, title, body, is_public, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return enrichNotes(supabase, (data ?? []) as NoteRow[]);
}

export async function getNote(supabase: SupabaseClient, noteId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("id, user_id, title, body, is_public, created_at, updated_at")
    .eq("id", noteId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return (await enrichNotes(supabase, [data as NoteRow]))[0] ?? null;
}

export async function getComments(supabase: SupabaseClient, noteId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, note_id, user_id, body, created_at")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const comments = (data ?? []) as CommentRow[];
  if (!comments.length) return [];
  const userIds = [...new Set(comments.map((comment) => comment.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, display_name, bio").in("id", userIds);
  const profileById = new Map(((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile.display_name]));

  return comments.map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    body: comment.body,
    createdAt: comment.created_at,
    author: profileById.get(comment.user_id) ?? "ユーザー",
  }));
}

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, bio")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}
