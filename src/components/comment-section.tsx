"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { addComment, type FormState } from "@/app/actions/notes";
import { formatDate, type Comment } from "@/lib/data";

const initialState: FormState = {};

export function CommentSection({ noteId, comments }: { noteId: string; comments: Comment[] }) {
  const [state, formAction, pending] = useActionState(addComment, initialState);

  return <section className="comments"><h2>コメント <span>{comments.length}</span></h2><form action={formAction}><input type="hidden" name="noteId" value={noteId} /><input name="body" placeholder="コメントを入力" maxLength={1000} required /><button className="button primary" disabled={pending}><Send size={16} />{pending ? "送信中..." : "送信"}</button></form>{state.message && <p className="form-error" aria-live="polite">{state.message}</p>}<div className="comment-list">{comments.map((comment) => <article key={comment.id}><div className="avatar small">{comment.author[0]?.toUpperCase()}</div><div><div className="comment-meta"><strong>{comment.author}</strong><span>{formatDate(comment.createdAt)}</span></div><p>{comment.body}</p></div></article>)}</div></section>;
}
