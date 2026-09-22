import { NotesList } from "@/components/notes-list";
import { getPublicNotes } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function NotesPage() {
  const supabase = await createClient();
  const notes = await getPublicNotes(supabase);
  const tags = [...new Set(notes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b, "ja"));
  return <NotesList notes={notes} tags={tags} />;
}
