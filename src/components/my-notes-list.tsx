"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Note } from "@/lib/data";
import { NoteCard } from "./note-card";

export function MyNotesList({ notes }: { notes: Note[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("すべて");
  const visible = useMemo(() => notes.filter((note) => {
    const matchesStatus = status === "すべて" || (status === "公開" ? note.isPublic : !note.isPublic);
    return matchesStatus && `${note.title} ${note.body}`.toLocaleLowerCase("ja-JP").includes(query.toLocaleLowerCase("ja-JP"));
  }), [notes, query, status]);

  return <div className="page-wrap">
    <div className="page-heading"><div><span className="eyebrow">MY LIBRARY</span><h1>マイメモ</h1><p>考えたこと、覚えておきたいことを整理します。</p></div><Link className="button primary" href="/notes/new">新しいメモ</Link></div>
    <div className="toolbar"><label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="自分のメモを検索" /></label></div>
    <div className="filter-tabs">{["すべて", "公開", "非公開"].map((value) => <button key={value} type="button" className={status === value ? "selected" : ""} onClick={() => setStatus(value)}>{value}</button>)}</div>
    <section className="note-list">{visible.map((note) => <NoteCard owner key={note.id} note={note} />)}{!visible.length && <div className="empty-state"><h2>メモが見つかりません</h2><p>新しいメモを作成してみましょう。</p></div>}</section>
  </div>;
}
