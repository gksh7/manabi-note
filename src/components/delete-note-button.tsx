"use client";

import { Trash2 } from "lucide-react";
import { deleteNote } from "@/app/actions/notes";

export function DeleteNoteButton() {
  return <button className="button secondary" type="submit" formAction={deleteNote} onClick={(event) => { if (!window.confirm("このメモを削除します。元に戻せません。")) event.preventDefault(); }}><Trash2 size={16} />削除</button>;
}
