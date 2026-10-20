import { FormEvent, useEffect, useRef, useState } from "react";
import { Headphones, LogOut, Mic, SendHorizonal, Settings, Trash2, Volume2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAmbientMusic } from "../hooks/useAmbientMusic";
import { supabase } from "../lib/supabase";
import { streamStudyBuddy, ChatMsg } from "../lib/stream";
import { languageName, LANGUAGES } from "../lib/languages";
import { getMode } from "../lib/modes";
import { TOPICS } from "../lib/topics";
import MessageBubble from "../components/MessageBubble";

export default function Chat({ onOpenPrefs }: { onOpenPrefs: () => void }) {
  const { profile, session, signOut, updateProfile } = useAuth();
  const p = profile!;
  const mode = getMode(p.mode);
  const variant = mode.variants?.find((v) => v.id === p.mode_variant);
  const music = useAmbientMusic();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase.from("chat_messages")
          .select("role,content")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true })
          .limit(60);
        if (!active) return;
        if (loadError) setError(loadError.message);
        else setMessages((data as ChatMsg[]) ?? []);
      } catch (failure) {
        if (active) setError(failure instanceof Error ? failure.message : "Could not load your conversation.");
      }
    })();
    return () => { active = false; };
  }, [session]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const persist = async (role: "user" | "assistant", content: string) => {
    if (!session) throw new Error("Your sign-in has expired. Please sign in again.");
    const { error: saveError } = await supabase.from("chat_messages").insert({ user_id: session.user.id, role, content });
    if (saveError) throw new Error(saveError.message);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setError(null); setInput(""); setBusy(true);
    const history: ChatMsg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    abortRef.current = new AbortController();
    try {
      await persist("user", content);
      const full = await streamStudyBuddy(history, {
        firstName: p.first_name, languageName: languageName(p.language), modeLabel: mode.label,
        variantLabel: variant?.label, modeStyle: `${mode.style} ${variant?.style ?? ""}`.trim(), visuals: p.visuals,
      }, (t) => setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: c[c.length - 1].content + t }; return c; }), abortRef.current.signal);
      if (full) await persist("assistant", full);
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError")) setError(e instanceof Error ? e.message : "Could not send your message.");
      setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)));
    } finally { setBusy(false); }
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const clear = async () => {
    if (!session || !confirm("Clear this conversation?")) return;
    setError(null);
    try {
      const { error: deleteError } = await supabase.from("chat_messages").delete().eq("user_id", session.user.id);
      if (deleteError) throw new Error(deleteError.message);
      setMessages([]);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not clear your conversation.");
    }
  };

  const toggleMusic = async () => {
    const nextPlaying = !music.playing;
    music.toggle();
    try {
      await updateProfile({ music: nextPlaying });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save your music preference.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not sign out.");
    }
  };

  const dictate = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice input isn't supported in this browser."); return; }
    const r = new SR(); r.lang = p.language === "pcm" ? "en-NG" : p.language;
    r.onresult = (ev: any) => setInput(ev.results[0][0].transcript);
    r.onerror = () => setError("Couldn't hear you. Try again or type your question.");
    r.start();
  };

  const lang = LANGUAGES.find((l) => l.id === p.language);

  return (
    <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col px-3">
      <header className="card my-3 flex items-center gap-2 px-4 py-2">
        <div className="text-3xl" aria-hidden>{mode.emoji}</div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight">Hi {p.first_name || "friend"} 👋</h1>
          <p className="truncate text-xs font-bold text-night/70">{mode.label}{variant ? ` · ${variant.label}` : ""} · {lang?.native}</p>
        </div>
        <button className="btn btn-ghost !px-3" onClick={toggleMusic} aria-pressed={music.playing} aria-label={music.playing ? "Pause music" : "Play focus music"}>
          <Headphones size={18} />{music.playing ? "On" : ""}
        </button>
        {music.playing && (
          <label className="hidden items-center gap-1 sm:flex"><Volume2 size={16} aria-hidden />
            <input type="range" min={0} max={1} step={0.05} value={music.volume} onChange={(e) => music.setVolume(+e.target.value)} aria-label="Music volume" />
          </label>
        )}
        <button className="btn btn-ghost !px-3" onClick={onOpenPrefs} aria-label="Change mode, language and theme"><Settings size={18} /></button>
        <button className="btn btn-ghost !px-3" onClick={clear} aria-label="Clear conversation"><Trash2 size={18} /></button>
        <button className="btn btn-ghost !px-3" onClick={handleSignOut} aria-label="Sign out"><LogOut size={18} /></button>
      </header>

      <div className="kente rounded-full" aria-hidden />

      <div className="flex-1 space-y-3 overflow-y-auto py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="card space-y-3 p-5">
            <h2 className="text-2xl font-bold">What do you want to learn today?</h2>
            <p>Tap a topic or ask anything about Azure fundamentals. I'll teach it in <b>{mode.label}</b> style, in <b>{lang?.name}</b>.</p>
            {TOPICS.map((t) => (
              <div key={t.group}>
                <p className="mb-1 text-sm font-extrabold">{t.emoji} {t.group}</p>
                <div className="flex flex-wrap gap-2">
                  {t.prompts.map((q) => <button key={q} className="btn btn-gold !px-3 !py-1.5 text-sm" onClick={() => send(`Teach me: ${q}`)}>{q}</button>)}
                </div>
              </div>
            ))}
          </div>
        )}
        {messages.map((m, i) => <MessageBubble key={i} role={m.role} content={m.content} streaming={busy && i === messages.length - 1} />)}
        {error && <p role="alert" className="rounded-xl bg-clay/10 p-3 text-sm font-bold text-clay">{error}</p>}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && !busy && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["Explain it simpler", "Give me an African example", "Quiz me on this", "Show a diagram"].map((q) =>
            <button key={q} className="btn btn-ghost !py-1.5 whitespace-nowrap text-sm" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}

      <form onSubmit={onSubmit} className="card mb-3 flex items-end gap-2 p-2">
        <textarea className="input max-h-32 min-h-[48px] flex-1 resize-none border-0" rows={1} value={input} placeholder="Ask about Azure…"
          aria-label="Your question" onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
        <button type="button" className="btn btn-ghost !px-3" onClick={dictate} aria-label="Speak your question"><Mic size={18} /></button>
        <button className="btn btn-primary !px-4" disabled={busy || !input.trim()} aria-label="Send"><SendHorizonal size={18} /></button>
      </form>
      <p className="pb-2 text-center text-[11px] text-night/70">Unofficial study aid, not affiliated with Microsoft. Always double-check with Microsoft Learn.</p>
    </div>
  );
}
