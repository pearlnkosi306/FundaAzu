import { useEffect, useState } from "react";
import { Accessibility, Volume2, X } from "lucide-react";
import { uiLanguageTag, uiText } from "../lib/uiTranslations";

type TextSize = "default" | "large" | "larger";
type Contrast = "standard" | "high" | "comfort";

interface AccessibilitySettings {
  readableFont: boolean;
  textSize: TextSize;
  contrast: Contrast;
}

const STORAGE_KEY = "fundaazu-accessibility";
const defaults: AccessibilitySettings = { readableFont: false, textSize: "default", contrast: "standard" };

function loadSettings(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return defaults;
    const value = parsed as Partial<AccessibilitySettings>;
    return {
      readableFont: value.readableFont === true,
      textSize: value.textSize === "large" || value.textSize === "larger" ? value.textSize : "default",
      contrast: value.contrast === "high" || value.contrast === "comfort" ? value.contrast : "standard",
    };
  } catch {
    return defaults;
  }
}

export default function AccessibilityTools({ language, placement = "floating" }: { language: string; placement?: "floating" | "composer" }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-readable-font", settings.readableFont);
    root.classList.toggle("a11y-text-large", settings.textSize === "large");
    root.classList.toggle("a11y-text-larger", settings.textSize === "larger");
    root.classList.toggle("a11y-high-contrast", settings.contrast === "high");
    root.classList.toggle("a11y-eye-comfort", settings.contrast === "comfort");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      setMessage("Accessibility settings could not be saved on this device.");
    }
  }, [settings]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const update = (patch: Partial<AccessibilitySettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    setMessage("Accessibility setting updated.");
  };

  const readPage = () => {
    if (!("speechSynthesis" in window)) {
      setMessage("Read aloud is not supported by this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setMessage("Reading stopped.");
      return;
    }

    const content = document.querySelector(".dashboard-page, main");
    const text = content?.textContent?.replace(/\s+/g, " ").trim();
    if (!text) {
      setMessage("There is no page text available to read.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = uiLanguageTag(language);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setMessage("The browser could not read this page aloud.");
    };
    setMessage("Reading page aloud.");
    setSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const wrapperClass = placement === "composer"
    ? "accessibility-tools relative z-20 shrink-0"
    : "accessibility-tools fixed bottom-4 right-4 z-50";
  const panelPositionClass = placement === "composer"
    ? "absolute bottom-full right-0 mb-3"
    : "mb-3";

  return (
    <div className={wrapperClass}>
      {open && (
        <section id="accessibility-panel" className={`accessibility-panel card ${panelPositionClass} w-[min(21rem,calc(100vw-2rem))] p-4`} aria-labelledby="accessibility-title">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="accessibility-title" className="text-xl font-bold">{uiText(language, "accessibility")}</h2>
            <button className="btn btn-ghost !p-2" onClick={() => setOpen(false)} aria-label={uiText(language, "close")}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-extrabold">{uiText(language, "readingFont")}</p>
              <button className="chip chip-off w-full text-sm font-bold" aria-pressed={settings.readableFont}
                onClick={() => update({ readableFont: !settings.readableFont })}>
                {uiText(language, "readableFont")}{settings.readableFont ? ": on" : ""}
              </button>
            </div>

            <div>
              <p className="mb-2 text-sm font-extrabold">{uiText(language, "textSize")}</p>
              <div className="flex gap-2" role="group" aria-label="Text size">
                {([
                  ["default", "A", "Default text size"],
                  ["large", "A+", "Larger text"],
                  ["larger", "A++", "Largest text"],
                ] as const).map(([size, label, accessibleLabel]) => (
                  <button key={size} className={`chip flex-1 text-center font-extrabold ${settings.textSize === size ? "chip-on" : "chip-off"}`}
                    aria-label={accessibleLabel} aria-pressed={settings.textSize === size}
                    onClick={() => update({ textSize: size })}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-extrabold">{uiText(language, "contrast")}</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Contrast setting">
                {([
                  ["standard", uiText(language, "normal")],
                  ["high", uiText(language, "highContrast")],
                  ["comfort", uiText(language, "eyeComfort")],
                ] as const).map(([contrast, label]) => (
                  <button key={contrast} className={`chip px-2 text-center text-xs font-extrabold ${settings.contrast === contrast ? "chip-on" : "chip-off"}`}
                    aria-pressed={settings.contrast === contrast}
                    onClick={() => update({ contrast })}>{label}</button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={readPage}>
              <Volume2 size={18} aria-hidden />{speaking ? uiText(language, "stopReading") : uiText(language, "readAloud")}
            </button>
            <p className="text-xs leading-relaxed text-night/70">{uiText(language, "voiceHint")}</p>
            <p role="status" aria-live="polite" className="min-h-4 text-xs font-bold">{message}</p>
          </div>
        </section>
      )}
      <button className={`accessibility-trigger btn btn-primary !h-12 !w-12 !p-0 shadow-lg ${placement === "floating" ? "ml-auto" : ""}`} onClick={() => setOpen((value) => !value)}
        aria-label={open ? uiText(language, "close") : uiText(language, "accessibility")} aria-expanded={open} aria-controls="accessibility-panel">
        <Accessibility size={26} aria-hidden />
      </button>
    </div>
  );
}
