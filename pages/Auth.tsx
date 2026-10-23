import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [firstName, setFirst] = useState(""); const [surname, setSur] = useState("");
  const [email, setEmail] = useState(""); const [password, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const result = mode === "signup"
        ? await signUp({ firstName: firstName.trim(), surname: surname.trim(), email, password })
        : await signIn(email, password);
      if (result === "CHECK_EMAIL") setInfo("Almost there! Check your email to confirm your account, then sign in.");
      else if (result) setErr(result);
    } catch (failure) {
      setErr(failure instanceof Error ? failure.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page relative z-10 mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-10">
      <div className="auth-intro mb-6 text-center">
        <div className="auth-globe mx-auto grid h-24 w-24 place-items-center rounded-[2rem] text-6xl" aria-hidden>🌍</div>
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.3em] text-savanna">Your next big thing starts here</p>
        <h1 className="brand-wavy mt-1 text-5xl font-extrabold tracking-tight text-night">FundaAzu</h1>
        <p className="mt-1 text-lg font-extrabold text-clay">AZ-900 Study Buddy</p>
        <p className="mt-2 font-semibold text-night/80">Learn Azure in your language, your vibe.</p>
      </div>
      <form onSubmit={submit} className="auth-card card space-y-3 p-6">
        <div className="flex gap-2 rounded-full bg-night/5 p-1" role="tablist">
          {(["signup", "signin"] as const).map((m) => (
            <button type="button" key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              className={`auth-tab flex-1 rounded-full py-2 font-extrabold ${mode === m ? "bg-sun" : ""}`}>{m === "signup" ? "Create account" : "Sign in"}</button>
          ))}
        </div>
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-bold">Name
              <input className="input mt-1" required value={firstName} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" /></label>
            <label className="block text-sm font-bold">Surname
              <input className="input mt-1" required value={surname} onChange={(e) => setSur(e.target.value)} autoComplete="family-name" /></label>
          </div>
        )}
        <label className="block text-sm font-bold">Email
          <input className="input mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="block text-sm font-bold">Password
          <input className="input mt-1" type="password" required minLength={6} value={password} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
        {err && <p role="alert" className="rounded-lg bg-clay/10 p-2 text-sm font-bold text-clay">{err}</p>}
        {info && <p role="status" className="rounded-lg bg-savanna/10 p-2 text-sm font-bold text-savanna">{info}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "One moment…" : mode === "signup" ? "Start learning 🚀" : "Welcome back"}</button>
      </form>
      <p className="mt-4 text-center text-xs text-night/70">Unofficial study tool. Not affiliated with or endorsed by Microsoft.</p>
    </main>
  );
}
