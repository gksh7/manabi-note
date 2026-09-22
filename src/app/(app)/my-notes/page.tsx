import { MyNotesList } from "@/components/my-notes-list";
import { getOwnNotes } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function MyNotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const notes = await getOwnNotes(supabase, user.id);
  return <MyNotesList notes={notes} />;
}
