import { useState } from "react";
import { LANGUAGES } from "../lib/languages";
import { MODES, THEMES, getMode } from "../lib/modes";
import type { Profile } from "../hooks/useAuth";

type Prefs = Pick<Profile, "mode" | "mode_variant" | "language" | "music" | "visuals" | "theme">;

export default function Preferences({ initial, onSave, onCancel, onPreview }: {
  initial: Prefs; onSave: (p: Prefs) => void; onCancel?: () => void; onPreview?: (themeId: string) => void;
}) {
  const [p, setP] = useState<Prefs>(initial);
  const mode = getMode(p.mode);
  const set = (patch: Partial<Prefs>) => setP((x) => ({ ...x, ...patch }));

  const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <section className="card p-5">
      <h2 className="mb-3 text-2xl font-bold"><span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full bg-sun text-base">{n}</span>{title}</h2>
      {children}
    </section>
  );
  const chip = (on: boolean) => `chip ${on ? "chip-on" : "chip-off"}`;

  return (
    <main className="relative z-10 mx-auto max-w-3xl space-y-4 px-4 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold">Set up your Study Buddy</h1>
        <p className="font-semibold text-night/80">Pick how you want to learn. You can change this anytime.</p>
      </header>

      <Section n={1} title="How should I teach you?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {MODES.map((m) => (
            <button key={m.id} className={chip(p.mode === m.id)} aria-pressed={p.mode === m.id}
              onClick={() => set({ mode: m.id, mode_variant: m.variants?.[0].id ?? null })}>
              <div className="text-3xl" aria-hidden>{m.emoji}</div>
              <div className="font-extrabold leading-tight">{m.label}</div>
              <div className="text-xs text-night/70">{m.blurb}</div>
            </button>
          ))}
        </div>
        {mode.variants && (
          <div className="mt-4">
            <p className="mb-2 font-bold">Which {mode.label.toLowerCase()} one?</p>
            <div className="flex flex-wrap gap-2">
              {mode.variants.map((v) => (
                <button key={v.id} className={`${chip(p.mode_variant === v.id)} font-bold`} aria-pressed={p.mode_variant === v.id}
                  onClick={() => set({ mode_variant: v.id })}>{v.label}</button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section n={2} title="Which language?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((l) => (
            <button key={l.id} className={chip(p.language === l.id)} aria-pressed={p.language === l.id} onClick={() => set({ language: l.id })}>
              <div className="font-extrabold">{l.native}</div>
              <div className="text-xs text-night/70">{l.name} · {l.region}</div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-night/70">Azure service names stay in English so they match the exam, with explanations in your language.</p>
      </Section>

      <Section n={3} title="Focus music & visuals">
        <div className="grid gap-3 sm:grid-cols-2">
          <button className={chip(p.music)} aria-pressed={p.music} onClick={() => set({ music: !p.music })}>
            <div className="text-2xl" aria-hidden>🎧</div>
            <div className="font-extrabold">Calm instrumental music: {p.music ? "ON" : "OFF"}</div>
            <div className="text-xs text-night/70">Soft, vocal-free focus music generated live in your browser.</div>
          </button>
          <button className={chip(p.visuals)} aria-pressed={p.visuals} onClick={() => set({ visuals: !p.visuals })}>
            <div className="text-2xl" aria-hidden>📊</div>
            <div className="font-extrabold">Diagrams & visuals: {p.visuals ? "ON" : "OFF"}</div>
            <div className="text-xs text-night/70">Little diagrams that show how Azure pieces fit together.</div>
          </button>
        </div>
      </Section>

      <Section n={4} title="Pick your background">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {THEMES.map((t) => (
            <button key={t.id} className={chip(p.theme === t.id)} aria-pressed={p.theme === t.id}
              onClick={() => { set({ theme: t.id }); onPreview?.(t.id); }}>
              <div className="h-12 rounded-lg" style={{ background: t.bg }} />
              <div className="mt-1 text-sm font-extrabold">{t.emoji} {t.label}</div>
            </button>
          ))}
        </div>
      </Section>

      <div className="flex justify-center gap-3 pb-8">
        {onCancel && <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn btn-primary text-lg" onClick={() => onSave(p)}>Let's go! 🚀</button>
      </div>
    </main>
  );
}
