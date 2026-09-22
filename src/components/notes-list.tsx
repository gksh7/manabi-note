"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Note } from "@/lib/data";
import { NoteCard } from "./note-card";

export function NotesList({ notes, tags }: { notes: Note[]; tags: string[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("すべて");
  const visible = useMemo(() => notes.filter((note) => {
    const matchesTag = tag === "すべて" || note.tags.includes(tag);
    const text = `${note.title} ${note.body} ${note.tags.join(" ")}`.toLocaleLowerCase("ja-JP");
    return matchesTag && text.includes(query.toLocaleLowerCase("ja-JP"));
  }), [notes, query, tag]);

  return <div className="page-wrap">
    <div className="page-heading"><div><span className="eyebrow">COMMUNITY NOTES</span><h1>みんなのメモ</h1><p>誰かの学びが、次の発見につながります。</p></div><Link className="button primary" href="/notes/new">新しいメモ</Link></div>
    <div className="toolbar"><label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="キーワードで検索" /></label><button className="icon-button outlined" aria-label="絞り込み" type="button"><SlidersHorizontal size={17} /></button></div>
    <div className="filter-tabs">{["すべて", ...tags].map((value) => <button key={value} type="button" className={tag === value ? "selected" : ""} onClick={() => setTag(value)}>{value}</button>)}</div>
    <section className="note-list">{visible.map((note) => <NoteCard key={note.id} note={note} />)}{!visible.length && <div className="empty-state"><h2>メモが見つかりません</h2><p>検索条件を変えてみてください。</p></div>}</section>
  </div>;
}
