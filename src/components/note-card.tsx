import { Globe2, Lock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, type Note } from "@/lib/data";

export function NoteCard({ note, owner = false }: { note: Note; owner?: boolean }) {
  const cleaned = note.body.replace(/[#>*-]/g, "").replace(/\n/g, " ");
  const excerpt = cleaned.slice(0, 108);
  return <article className="note-row"><div className="note-main"><Link href={`/notes/${note.id}`}><h2>{note.title}</h2></Link><p>{excerpt}{cleaned.length > 108 ? "..." : ""}</p><div className="tag-list">{note.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div></div><div className="note-meta"><span className={`status ${note.isPublic ? "public" : "private"}`}>{note.isPublic ? <Globe2 size={14} /> : <Lock size={14} />}{note.isPublic ? "公開" : "非公開"}</span><span>{owner ? "更新" : note.author} · {formatDate(note.updatedAt)}</span>{!owner && <span className="engagement"><MessageCircle size={14} />{note.commentCount}</span>}</div></article>;
}
