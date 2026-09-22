import { ProfileForm } from "@/components/profile-form";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await getProfile(supabase, user.id);
  return <div className="page-wrap narrow"><div className="page-heading"><div><span className="eyebrow">ACCOUNT</span><h1>プロフィール設定</h1><p>公開メモやコメントに表示される情報です。</p></div></div><ProfileForm email={user.email ?? ""} displayName={profile?.display_name ?? ""} bio={profile?.bio ?? ""} /></div>;
}
