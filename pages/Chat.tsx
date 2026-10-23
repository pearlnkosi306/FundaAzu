import { FormEvent, useEffect, useRef, useState } from "react";
import { Headphones, LogOut, Mic, SendHorizonal, Settings, Trash2, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { useAmbientMusic } from "../hooks/useAmbientMusic";
import { supabase } from "../lib/supabase";
import { streamStudyBuddy, ChatMsg } from "../lib/stream";
import { languageName, LANGUAGES } from "../lib/languages";
import { getMode, MODES } from "../lib/modes";
import { AZ900_CHAPTERS } from "../lib/topics";
import MessageBubble from "../components/MessageBubble";
import { WelcomeMascot } from "../components/CloudMascot";
import AccessibilityTools from "../components/AccessibilityTools";
import { uiLanguageTag, uiText } from "../lib/uiTranslations";
import { USER_FACING_ERROR, logError } from "../lib/userErrors";

export default function Chat({ onOpenPrefs }: { onOpenPrefs: () => void }) {
  const { profile, session, signOut, updateProfile } = useAuth();
  const p = profile!;
  const music = useAmbientMusic();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState(AZ900_CHAPTERS[0].id);
  const [replyModeId, setReplyModeId] = useState(p.mode);
  const [replyVariantId, setReplyVariantId] = useState(p.mode_variant ?? "");
  const [replyLanguage, setReplyLanguage] = useState(p.language);
  const [replyVisuals, setReplyVisuals] = useState(p.visuals);
  const [sceneGuidance, setSceneGuidance] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pendingTokensRef = useRef("");
  const tokenFlushTimerRef = useRef<number | null>(null);
  const replyMode = getMode(replyModeId);
  const replyVariant = replyMode.variants?.find((item) => item.id === replyVariantId);
  const replyLanguageOption = LANGUAGES.find((item) => item.id === replyLanguage);
  const selectedChapter = AZ900_CHAPTERS.find((chapter) => chapter.id === selectedChapterId) ?? AZ900_CHAPTERS[0];

  useEffect(() => {
    if (!session) return;
    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase.from("chat_messages")
          .select("role,content,style_label")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(60);
        if (!active) return;
        if (loadError) setError(logError("chat.load", loadError));
        else setMessages(((data as Array<ChatMsg & { style_label: string | null }> | null) ?? []).reverse().map(({ role, content, style_label }) => ({
          role,
          content,
          styleLabel: style_label,
        })));
      } catch (failure) {
        if (active) setError(logError("chat.load", failure));
      }
    })();
    return () => { active = false; };
  }, [session]);
  useEffect(() => {
    setReplyModeId(p.mode);
    setReplyVariantId(p.mode_variant ?? "");
    setReplyLanguage(p.language);
    setReplyVisuals(p.visuals);
  }, [p.mode, p.mode_variant, p.language, p.visuals]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => {
    abortRef.current?.abort();
    if (tokenFlushTimerRef.current !== null) window.clearTimeout(tokenFlushTimerRef.current);
  }, []);

  const persist = async (role: "user" | "assistant", content: string, styleLabel?: string) => {
    if (!session) throw new Error("Your sign-in has expired. Please sign in again.");
    const { error: saveError } = await supabase.from("chat_messages").insert({
      user_id: session.user.id,
      role,
      content,
      style_label: role === "assistant" ? styleLabel ?? null : null,
    });
    if (saveError) throw new Error(saveError.message);
  };

  const flushStreamedTokens = () => {
    if (tokenFlushTimerRef.current !== null) {
      window.clearTimeout(tokenFlushTimerRef.current);
      tokenFlushTimerRef.current = null;
    }
    const pending = pendingTokensRef.current;
    pendingTokensRef.current = "";
    if (pending) {
      setMessages((current) => {
        const next = [...current];
        const last = next[next.length - 1];
        if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + pending };
        return next;
      });
    }
  };

  const queueStreamedToken = (token: string) => {
    pendingTokensRef.current += token;
    if (tokenFlushTimerRef.current === null) {
      tokenFlushTimerRef.current = window.setTimeout(flushStreamedTokens, 50);
    }
  };

  const selectSuggestedQuestion = (question: string) => {
    setInput(question);
    setBrowseOpen(false);
    setCustomizationOpen(false);
    questionInputRef.current?.focus();
    questionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const responseMode = getMode(replyModeId);
    const responseVariant = responseMode.variants?.find((item) => item.id === replyVariantId);
    const styleLabel = [responseMode.label, responseVariant?.label].filter(Boolean).join(" · ");
    setBrowseOpen(false);
    setCustomizationOpen(false);
    setError(null); setInput(""); setBusy(true);
    const history: ChatMsg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "", styleLabel }]);
    abortRef.current = new AbortController();
    try {
      const saveUserMessage = persist("user", content).catch((failure: unknown) => {
        abortRef.current?.abort();
        throw failure;
      });
      const aiResponse = streamStudyBuddy(history.slice(-16), {
        firstName: p.first_name, languageName: languageName(replyLanguage), modeLabel: responseMode.label,
        variantLabel: responseVariant?.label, visuals: replyVisuals, visualTheme: p.theme, sceneGuidance,
      }, queueStreamedToken, abortRef.current.signal);
      const [saveResult, responseResult] = await Promise.allSettled([saveUserMessage, aiResponse]);
      if (saveResult.status === "rejected") throw saveResult.reason;
      if (responseResult.status === "rejected") throw responseResult.reason;
      flushStreamedTokens();
      const full = responseResult.value;
      if (full) await persist("assistant", full, styleLabel);
    } catch (e) {
      flushStreamedTokens();
      if (!(e instanceof Error && e.name === "AbortError")) setError(logError("chat.send", e));
      setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)));
    } finally {
      flushStreamedTokens();
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const requestClear = () => {
    if (!session || !confirm("Are you sure you want to clear this conversation?")) return;
    setDeleteConfirmationOpen(true);
  };

  const confirmClear = async () => {
    if (!session || deletingHistory) return;
    setDeleteConfirmationOpen(false);
    setDeletingHistory(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from("chat_messages").delete().eq("user_id", session.user.id);
      if (deleteError) throw new Error(deleteError.message);
      setMessages([]);
    } catch (failure) {
      setError(logError("chat.clear", failure));
    } finally {
      setDeletingHistory(false);
    }
  };

  const toggleMusic = async () => {
    const nextPlaying = !music.playing;
    music.toggle();
    try {
      await updateProfile({ music: nextPlaying });
    } catch (failure) {
      setError(logError("chat.musicPreference", failure));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (failure) {
      setError(logError("auth.signOut", failure));
    }
  };

  const dictate = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("We're working on it. Voice input isn't available in this browser—please type your question instead."); return; }
    const r = new SR(); r.lang = uiLanguageTag(replyLanguage);
    r.onresult = (ev: any) => setInput(ev.results[0][0].transcript);
    r.onerror = () => setError("We're working on it. Voice input didn't work this time—please try again or type your question.");
    r.start();
  };

  return (
    <div className="dashboard-page relative z-10 mx-auto flex h-full min-h-0 max-w-4xl flex-col px-2 sm:px-3">
      <header className="card my-1 flex shrink-0 items-center gap-1 px-2 py-1 sm:gap-2 sm:px-3">
        <div className="text-2xl" aria-hidden>{replyMode.emoji}</div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight sm:text-xl">Hi {p.first_name || "friend"} 👋</h1>
          <p className="truncate text-xs font-extrabold text-savanna">FundaAzu · {replyMode.label}{replyVariant ? ` · ${replyVariant.label}` : ""} · {replyLanguageOption?.native}</p>
        </div>
        <button className="btn btn-ghost !px-2 !py-2" onClick={toggleMusic} aria-pressed={music.playing} aria-label={uiText(p.language, music.playing ? "pauseMusic" : "playMusic")}>
          <Headphones size={16} />{music.playing ? "On" : ""}
        </button>
        {music.playing && (
          <label className="hidden items-center gap-1 sm:flex"><Volume2 size={16} aria-hidden />
            <input type="range" min={0} max={1} step={0.05} value={music.volume} onChange={(e) => music.setVolume(+e.target.value)} aria-label="Music volume" />
          </label>
        )}
        <button className="btn btn-ghost !px-2 !py-2" onClick={onOpenPrefs} aria-label={uiText(p.language, "settings")}><Settings size={16} /></button>
        <button className="btn btn-ghost !px-2 !py-2" onClick={requestClear} aria-label={uiText(p.language, "clear")}><Trash2 size={16} /></button>
        <button className="btn btn-ghost !px-2 !py-2" onClick={handleSignOut} aria-label={uiText(p.language, "signOut")}><LogOut size={16} /></button>
      </header>

      <div className="kente rounded-full" aria-hidden />
      <WelcomeMascot name={p.first_name || "friend"} />
      {music.error && <p role="alert" className="mt-2 rounded-lg bg-clay/10 p-2 text-sm font-bold text-clay">{USER_FACING_ERROR}</p>}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-2 sm:py-3" aria-live="polite">
        {messages.length === 0 && (
          <motion.div className="card space-y-3 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Choose an AZ-900 chapter</h2>
            <p className="text-base leading-relaxed sm:text-lg">Start with an exam topic, then choose a standard question. Your {replyMode.label.toLowerCase()} style and {replyLanguageOption?.native} language are ready.</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {AZ900_CHAPTERS.map((chapter) => (
                <button key={chapter.id} className={`chip ${selectedChapterId === chapter.id ? "chip-on" : "chip-off"}`} aria-pressed={selectedChapterId === chapter.id} onClick={() => setSelectedChapterId(chapter.id)}>
                  <span className="block font-extrabold">{chapter.title}</span>
                  <span className="mt-1 block text-xs font-bold text-savanna">Exam weighting: {chapter.examWeight}</span>
                  <span className="mt-1 block text-xs text-night/70">{chapter.description}</span>
                </button>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold">Standard questions · {selectedChapter.title}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedChapter.questions.map((question) => <button key={question} className="btn btn-gold !px-3 !py-2 text-left text-sm sm:text-base" onClick={() => selectSuggestedQuestion(question)}>{question}</button>)}
              </div>
            </div>
          </motion.div>
        )}
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <MessageBubble role={m.role} content={m.content} styleLabel={m.styleLabel} streaming={busy && i === messages.length - 1} />
          </motion.div>
        ))}
        {error && <p role="alert" className="rounded-xl bg-clay/10 p-3 text-sm font-bold text-clay">{error}</p>}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && (
        <section className="card mb-1 shrink-0 px-3 py-2">
          <button type="button" className="w-full cursor-pointer text-left text-sm font-extrabold" aria-expanded={browseOpen} aria-controls="az900-question-browser"
            onClick={() => { setBrowseOpen((open) => !open); setCustomizationOpen(false); }}>
            Browse AZ-900 chapters and standard questions
          </button>
          {browseOpen && <div id="az900-question-browser" className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {AZ900_CHAPTERS.map((chapter) => (
                <button key={chapter.id} className={`chip ${selectedChapterId === chapter.id ? "chip-on" : "chip-off"}`} aria-pressed={selectedChapterId === chapter.id} onClick={() => setSelectedChapterId(chapter.id)}>
                  {chapter.title} <span className="text-xs">· {chapter.examWeight}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedChapter.questions.map((question) => <button key={question} className="btn btn-gold !px-3 !py-2 text-left text-sm" onClick={() => selectSuggestedQuestion(question)}>{question}</button>)}
            </div>
          </div>}
        </section>
      )}

      {messages.length > 0 && !busy && (
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-1">
          {["Explain it simpler", "Give me an African example", "Quiz me on this", "Show a diagram"].map((q) =>
            <button key={q} className="btn btn-ghost !px-3 !py-1.5 whitespace-nowrap text-xs sm:text-sm" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}

      <section className="card mb-1 shrink-0 px-3 py-2">
        <button type="button" className="w-full cursor-pointer text-left text-sm font-extrabold" aria-expanded={customizationOpen} aria-controls="reply-customization"
          onClick={() => { setCustomizationOpen((open) => !open); setBrowseOpen(false); }}>
          Customize this reply <span className="font-semibold text-night/70">(optional · saved preferences)</span>
        </button>
        {customizationOpen && <div id="reply-customization" className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className="text-xs font-bold">Teaching style
              <select className="input mt-1 w-full" value={replyModeId} disabled={busy} onChange={(event) => {
                const nextMode = getMode(event.target.value);
                setReplyModeId(nextMode.id);
                setReplyVariantId(nextMode.variants?.[0]?.id ?? "");
              }}>
                {MODES.map((item) => <option key={item.id} value={item.id}>{item.emoji} {item.label}</option>)}
              </select>
            </label>
            {replyMode.variants && <label className="text-xs font-bold">Style
              <select className="input mt-1 w-full" value={replyVariantId} disabled={busy} onChange={(event) => setReplyVariantId(event.target.value)}>
                {replyMode.variants.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>}
            <label className="text-xs font-bold">Reply language
              <select className="input mt-1 w-full" value={replyLanguage} disabled={busy} onChange={(event) => setReplyLanguage(event.target.value)}>
                {LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.native}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={replyVisuals} disabled={busy} onChange={(event) => setReplyVisuals(event.target.checked)} />
            Include diagrams when useful
          </label>
          <label className="block text-xs font-bold">Example setting for this reply (optional)
            <input className="input mt-1 w-full" maxLength={300} value={sceneGuidance} disabled={busy}
              placeholder="e.g. an original pirate crew planning a voyage"
              onChange={(event) => setSceneGuidance(event.target.value)} />
          </label>
        </div>}
      </section>

      <form onSubmit={onSubmit} className="card mb-1 flex shrink-0 items-end gap-2 p-1.5">
        <textarea ref={questionInputRef} className="input max-h-32 min-h-[48px] flex-1 resize-none border-0 text-base sm:text-lg" rows={1} value={input} placeholder={uiText(replyLanguage, "ask")}
          aria-label="Your question" onChange={(e) => setInput(e.target.value)}
          onFocus={() => setCustomizationOpen(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
        <AccessibilityTools language={replyLanguage} placement="composer" />
        <button type="button" className="btn btn-ghost !px-3" onClick={dictate} aria-label={uiText(replyLanguage, "speak")}><Mic size={18} /></button>
        <button className="btn btn-primary !px-4" disabled={busy || !input.trim()} aria-label={uiText(replyLanguage, "send")}><SendHorizonal size={18} /></button>
      </form>
      <p className="shrink-0 pb-1 text-center text-[10px] text-night/70">Unofficial study aid, not affiliated with Microsoft. Always double-check with Microsoft Learn.</p>
      {deleteConfirmationOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-night/60 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-history-title"
            aria-describedby="delete-history-description"
            className="card w-full max-w-md space-y-4 p-6 shadow-2xl"
          >
            <h2 id="delete-history-title" className="text-xl font-extrabold">Delete chat history?</h2>
            <p id="delete-history-description" className="text-sm leading-relaxed">
              Chat history will be deleted permanently. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteConfirmationOpen(false)}>
                No
              </button>
              <button type="button" className="btn btn-primary" disabled={deletingHistory} onClick={() => void confirmClear()}>
                Yes, delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
