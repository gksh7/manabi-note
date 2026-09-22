"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

const initialState: AuthState = {};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState);
  const [registerState, registerAction, registerPending] = useActionState(signUp, initialState);
  const searchParams = useSearchParams();
  const confirmError = searchParams.get("error") === "confirmation";
  const state = register ? registerState : loginState;
  const pending = register ? registerPending : loginPending;

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Logo />
        <div>
          <span className="eyebrow">YOUR LEARNING, IN ONE PLACE</span>
          <h1>学びをメモし、<br />知識を育てる。</h1>
          <p>気づきを残して整理する。仲間の学びに触れて、次の一歩につなげる。</p>
        </div>
        <small>© 2026 Manabi Note</small>
      </section>
      <section className="auth-panel">
        <form className="auth-form" action={register ? registerAction : loginAction}>
          <div>
            <h2>{register ? "アカウントを作成" : "おかえりなさい"}</h2>
            <p>{register ? "学びの記録を今日から始めましょう。" : "アカウントにログインして続けましょう。"}</p>
          </div>
          {register && <label>表示名<input name="displayName" required maxLength={50} autoComplete="name" />{state.errors?.displayName && <span className="form-error">{state.errors.displayName[0]}</span>}</label>}
          <label>メールアドレス<input name="email" required type="email" placeholder="you@example.com" autoComplete="email" />{state.errors?.email && <span className="form-error">{state.errors.email[0]}</span>}</label>
          <label>パスワード<span className="password-field"><input name="password" required type={showPassword ? "text" : "password"} minLength={8} maxLength={128} autoComplete={register ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{state.errors?.password && <span className="form-error">{state.errors.password[0]}</span>}</label>
          {!state.message && confirmError && <p className="form-error" aria-live="polite">確認リンクが無効か期限切れです。もう一度お試しください。</p>}
          {state.message && <p className={state.message.startsWith("確認メール") ? "form-success" : "form-error"} aria-live="polite">{state.message}</p>}
          <button className="button primary auth-submit" disabled={pending}>{pending ? "処理中..." : register ? "登録する" : "ログイン"}</button>
          <p className="auth-switch">{register ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}<button type="button" onClick={() => setRegister(!register)}>{register ? "ログイン" : "新規登録"}</button></p>
        </form>
      </section>
    </main>
  );
}
