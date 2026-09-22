"use client";

import { Check, UserRound } from "lucide-react";
import { useActionState } from "react";
import { updateProfile, type FormState } from "@/app/actions/notes";

const initialState: FormState = {};

export function ProfileForm({ email, displayName, bio }: { email: string; displayName: string; bio: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  return <form className="profile-form" action={formAction}><div className="profile-avatar"><span className="avatar large"><UserRound /></span></div><label>表示名<input name="displayName" defaultValue={displayName} required maxLength={50} />{state.errors?.displayName && <span className="form-error">{state.errors.displayName[0]}</span>}</label><label>メールアドレス<input type="email" value={email} disabled /></label><label>自己紹介<textarea name="bio" defaultValue={bio} maxLength={160} />{state.errors?.bio && <span className="form-error">{state.errors.bio[0]}</span>}</label>{state.message && <p className={state.success ? "form-success" : "form-error"} aria-live="polite">{state.message}</p>}<button className="button primary save-profile" disabled={pending}>{state.success && <Check size={16} />}{pending ? "保存中..." : "保存する"}</button></form>;
}
