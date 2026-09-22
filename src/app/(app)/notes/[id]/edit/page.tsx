import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/note-editor";
import { getNote } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const note = await getNote(supabase, id);
  if (!user || !note || note.userId !== user.id) notFound();
  return <NoteEditor note={note} allowDelete />;
}
