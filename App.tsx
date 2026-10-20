import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { isConfigured } from "./lib/supabase";
import Backdrop from "./components/AfricaWatermark";
import Auth from "./pages/Auth";
import Preferences from "./pages/Preferences";
import Chat from "./pages/Chat";

export default function App() {
  const { session, profile, loading, error, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const theme = previewTheme ?? profile?.theme ?? "savanna";

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
    body = <div className="relative z-10 grid h-full place-items-center text-xl font-bold">Loading your Study Buddy… 🌍</div>;
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
        onCancel={profile.onboarded ? () => { setEditing(false); setPreviewTheme(null); } : undefined}
        onSave={async (p) => {
          setSaveError(null);
          try {
            await updateProfile({ ...p, onboarded: true });
            setEditing(false);
            setPreviewTheme(null);
          } catch (saveFailure) {
            setSaveError(saveFailure instanceof Error ? saveFailure.message : "Could not save your preferences.");
          }
        }}
      />
    );
  } else {
    body = <Chat onOpenPrefs={() => setEditing(true)} />;
  }

  return (<><Backdrop themeId={theme} /><div className="h-full overflow-y-auto">
    {saveError && <p role="alert" className="relative z-20 mx-auto mt-3 max-w-lg rounded-lg bg-clay/10 p-3 text-center font-bold text-clay">{saveError}</p>}
    {body}
  </div></>);
}
