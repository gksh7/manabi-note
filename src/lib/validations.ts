import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です").max(100),
  body: z.string().trim().min(1, "本文は必須です").max(10000),
  isPublic: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
});

export const commentSchema = z.object({
  noteId: z.string().uuid(),
  body: z.string().trim().min(1, "コメントを入力してください").max(1000),
});

export const profileSchema = z.object({ displayName: z.string().trim().min(1).max(50), bio: z.string().trim().max(160) });
