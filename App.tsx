import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { isConfigured } from "./lib/supabase";
import Backdrop from "./components/AfricaWatermark";
import { CursorMascot } from "./components/CloudMascot";
import AccessibilityTools from "./components/AccessibilityTools";
import { uiLanguageDirection, uiLanguageTag } from "./lib/uiTranslations";
import { logError } from "./lib/userErrors";

const Auth = lazy(() => import("./pages/Auth"));
const Preferences = lazy(() => import("./pages/Preferences"));
const Chat = lazy(() => import("./pages/Chat"));

export default function App() {
  const { session, profile, loading, error, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const theme = previewTheme ?? profile?.theme ?? "savanna";
  const language = previewLanguage ?? profile?.language ?? "en";
  useEffect(() => {
    document.documentElement.lang = uiLanguageTag(language);
    document.documentElement.dir = uiLanguageDirection(language);
  }, [language]);

  let body: React.ReactNode;
  if (!isConfigured) {
    body = (
      <main className="relative z-10 mx-auto max-w-lg p-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold">Almost ready ⚙️</h1>
          <p className="mt-2">Copy <code>.env.example</code> to <code>.env</code> and add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then restart the dev server. See the README.</p>
        </div>
      </main>
    );
  } else if (loading) {
    body = <div className="relative z-10 grid h-full place-items-center text-xl font-bold">Loading FundaAzu… 🌍</div>;
  } else if (error) {
    body = <main className="relative z-10 mx-auto max-w-lg p-8"><div className="card p-6">
      <h1 className="text-3xl font-bold">We couldn’t load your account</h1>
      <p role="alert" className="mt-2">{error}</p>
    </div></main>;
  } else if (!session) {
    body = <Auth />;
  } else if (!profile) {
    body = <div className="relative z-10 grid h-full place-items-center text-xl font-bold">Setting up your profile…</div>;
  } else if (!profile.onboarded || editing) {
    body = (
      <Preferences
        initial={profile}
        onPreview={setPreviewTheme}
        language={language}
        onPreviewLanguage={setPreviewLanguage}
        onCancel={profile.onboarded ? () => { setEditing(false); setPreviewTheme(null); setPreviewLanguage(null); } : undefined}
        onSave={async (p) => {
          setSaveError(null);
          try {
            await updateProfile({ ...p, onboarded: true });
            setEditing(false);
            setPreviewTheme(null);
            setPreviewLanguage(null);
          } catch (saveFailure) {
            setSaveError(logError("profile.savePreferences", saveFailure));
          }
        }}
      />
    );
  } else {
    body = <Chat onOpenPrefs={() => setEditing(true)} />;
  }

  const isChat = Boolean(session && profile?.onboarded && !editing);

  return (<><Backdrop themeId={theme} />{session && profile?.onboarded && <CursorMascot />}<div className="h-full overflow-y-auto">
    {saveError && <p role="alert" className="relative z-20 mx-auto mt-3 max-w-lg rounded-lg bg-clay/10 p-3 text-center font-bold text-clay">{saveError}</p>}
    <Suspense fallback={<div className="relative z-10 grid h-full place-items-center font-bold">Loading FundaAzu… 🌍</div>}>{body}</Suspense>
  </div>{!isChat && <AccessibilityTools language={language} />}</>);
}
