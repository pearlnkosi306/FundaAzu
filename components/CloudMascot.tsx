import { useEffect, useState } from "react";

function CloudIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 130" role="img" aria-label="Azu the full-body cloud mascot wearing a scarf">
      <path d="M36 62q14-9 28 0l9 32q-21 13-47 0Z" fill="#fff" stroke="#36305f" strokeLinejoin="round" strokeWidth="3" />
      <path d="M39 91 36 112m26-21 4 21" fill="none" stroke="#36305f" strokeLinecap="round" strokeWidth="5" />
      <path d="m27 111 12 1-2 7H24q-2-5 3-8Zm35 1 11-1 7 8H64Z" fill="#d2452b" stroke="#36305f" strokeLinejoin="round" strokeWidth="2" />
      <path d="M22 61a17 17 0 0 1-2-34 25 25 0 0 1 48-5 20 20 0 0 1 12 39H22Z" fill="#fff" stroke="#36305f" strokeWidth="3" />
      <ellipse cx="40" cy="43" rx="2.5" ry="3.5" fill="#16132b" />
      <ellipse cx="61" cy="43" rx="2.5" ry="3.5" fill="#16132b" />
      <path d="M44 51q6 7 13 0" fill="none" stroke="#16132b" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M29 59q21 8 43 0l4 8q-24 11-51 0Z" fill="#0b6b3a" stroke="#36305f" strokeLinejoin="round" strokeWidth="2" />
      <path d="M32 63q18 6 37 0l1.5 4q-20 7-40 0Z" fill="#f5b700" />
      <path d="M35 68 30 88l9 2 7-20Zm28 0 8 18 8-4-5-19Z" fill="#d2452b" stroke="#36305f" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function WelcomeMascot({ name }: { name: string }) {
  return (
    <div className="welcome-mascot card flex shrink-0 items-center gap-2 px-3 py-1 sm:gap-3">
      <CloudIllustration className="h-12 w-10 shrink-0 sm:h-14 sm:w-11" />
      <div className="min-w-0">
        <p className="font-display text-base font-bold leading-tight sm:text-lg">Hey {name || "friend"}! ✨</p>
        <p className="truncate text-xs font-extrabold leading-snug text-night/75 sm:text-sm">I’m Azu, your study sidekick. Ready to level up?</p>
      </div>
    </div>
  );
}

export function CursorMascot() {
  const [following, setFollowing] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 80,
    y: window.innerHeight - 100,
  }));

  useEffect(() => {
    let idleTimer: number | undefined;
    const followPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      window.clearTimeout(idleTimer);
      setFollowing(true);
      idleTimer = window.setTimeout(() => setFollowing(false), 30_000);
      setPosition({
        x: Math.max(8, Math.min(event.clientX + 20, window.innerWidth - 72)),
        y: Math.max(8, Math.min(event.clientY + 20, window.innerHeight - 92)),
      });
    };
    const returnToWelcome = () => {
      window.clearTimeout(idleTimer);
      setFollowing(false);
    };

    window.addEventListener("pointermove", followPointer);
    window.addEventListener("pointerleave", returnToWelcome);
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("pointerleave", returnToWelcome);
    };
  }, []);

  return (
    <div className={`cursor-mascot ${following ? "cursor-mascot-following" : ""}`} style={{ left: position.x, top: position.y }} aria-hidden="true">
      <CloudIllustration className="h-full w-full" />
    </div>
  );
}
