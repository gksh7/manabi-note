import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/comment-section";
import { MarkdownPreview } from "@/components/markdown-preview";
import { formatDate, getComments, getNote } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const note = await getNote(supabase, id);
  if (!user || !note) notFound();
  const isOwner = note.userId === user.id;
  const comments = note.isPublic ? await getComments(supabase, note.id) : [];

  return <div className="article-wrap"><Link className="back-link" href={isOwner ? "/my-notes" : "/notes"}><ArrowLeft size={16} />一覧へ戻る</Link><article className="article"><header><div className="article-title-row"><div><div className="tag-list">{note.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><h1>{note.title}</h1></div>{isOwner && <Link className="icon-button outlined" aria-label="メモを編集" href={`/notes/${note.id}/edit`}><Pencil size={17} /></Link>}</div><div className="author-row"><span className="avatar small">{note.author[0]?.toUpperCase()}</span><span><strong>{note.author}</strong><small>更新 {formatDate(note.updatedAt)}</small></span><span className={`status ${note.isPublic ? "public" : "private"}`}>{note.isPublic ? "公開" : "非公開"}</span></div></header><MarkdownPreview>{note.body}</MarkdownPreview></article>{note.isPublic && <CommentSection noteId={note.id} comments={comments} />}</div>;
}
