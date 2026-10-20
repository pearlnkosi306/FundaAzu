import { getTheme } from "../lib/modes";

export default function AfricaWatermark({ themeId }: { themeId: string }) {
  const theme = getTheme(themeId);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: theme.bg }}>
      <div className="africa-watermark" style={{ color: theme.accent }} />
      <span className="floater left-[12%] text-2xl" style={{ animationDuration: "24s" }} aria-hidden>✨</span>
      <span className="floater left-[78%] text-xl" style={{ animationDuration: "30s", animationDelay: "-12s" }} aria-hidden>🌟</span>
    </div>
  );
}
