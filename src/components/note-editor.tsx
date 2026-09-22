"use client";

import { Eye, FileText, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { saveNote, type FormState } from "@/app/actions/notes";
import { DeleteNoteButton } from "./delete-note-button";
import { MarkdownPreview } from "./markdown-preview";

const sample = "# 学びは、未来をつくる\n\n## はじめに\n今日学んだことを、自分の言葉で残します。\n\n- 小さく始める\n- 毎日続ける\n- アウトプットする";
const initialState: FormState = {};

type NoteEditorProps = {
  note?: { id: string; title: string; body: string; isPublic: boolean; tags: string[] };
  allowDelete?: boolean;
};

export function NoteEditor({ note, allowDelete = false }: NoteEditorProps) {
  const [body, setBody] = useState(note?.body ?? sample);
  const [tab, setTab] = useState("edit");
  const [state, formAction, pending] = useActionState(saveNote, initialState);

  return <form className="editor-page" action={formAction}>
    {note && <input type="hidden" name="noteId" value={note.id} />}
    <div className="editor-header"><div><span className="eyebrow">NOTE EDITOR</span><h1>{note ? "メモを編集" : "新しいメモ"}</h1></div><div className="editor-actions">{allowDelete && note && <DeleteNoteButton />}<button className="button secondary" type="submit" name="intent" value="draft" disabled={pending}><Save size={16} />{pending ? "保存中..." : "非公開で保存"}</button><button className="button primary" type="submit" name="intent" value="public" disabled={pending}>{pending ? "保存中..." : "公開して保存"}</button></div></div>
    <div className="editor-fields"><label>タイトル<input name="title" defaultValue={note?.title} placeholder="メモのタイトルを入力" required maxLength={100} />{state.errors?.title && <span className="form-error">{state.errors.title[0]}</span>}</label><label>タグ<input name="tags" defaultValue={note?.tags.join(", ")} placeholder="タグをカンマ区切りで入力" maxLength={309} />{state.errors?.tags && <span className="form-error">{state.errors.tags[0]}</span>}</label></div>
    <div className="editor-tabs"><button type="button" className={tab === "edit" ? "active" : ""} onClick={() => setTab("edit")}><FileText size={16} />Markdown</button><button type="button" className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}><Eye size={16} />プレビュー</button></div>
    <div className={`editor-surface ${tab}`}><textarea name="body" aria-label="Markdown本文" value={body} onChange={(event) => setBody(event.target.value)} required maxLength={10000} /><div className="preview-pane"><MarkdownPreview>{body}</MarkdownPreview></div></div>
    {state.message && <p className="form-error" aria-live="polite">{state.message}</p>}
  </form>;
}
