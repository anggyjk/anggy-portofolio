import { useEffect, useRef, useState } from "react";

/**
 * Kursor pedang khusus desktop (mouse presisi saja).
 * - Pedang mengikuti kursor dengan lerp halus, poros di ujung bilah.
 * - Klik = tebasan: pedang berputar + busur merah.
 * - Hover link/tombol = pedang membara.
 * - Mobile/sentuh: tidak aktif, kursor bawaan tetap dipakai.
 */
export default function SwordCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [slashing, setSlashing] = useState(false);
  const [slashKey, setSlashKey] = useState(0);
  const ref = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const wasHover = useRef(false);
  const slashTimer = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("sword-cursor");

    let raf = 0;
    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      const h = !!e.target.closest?.("a, button, [role='button'], input, textarea, select, .work-card");
      if (h !== wasHover.current) {
        wasHover.current = h;
        setHovering(h);
      }
    };
    const onDown = () => {
      setSlashing(true);
      setSlashKey((k) => k + 1);
      clearTimeout(slashTimer.current);
      slashTimer.current = setTimeout(() => setSlashing(false), 300);
    };
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.24;
      pos.current.y += (target.current.y - pos.current.y) * 0.24;
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(slashTimer.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.body.classList.remove("sword-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", left: 0, top: 0, zIndex: 400, pointerEvents: "none" }}>
      <div ref={ref} style={{ willChange: "transform" }}>
        <div
          style={{
            transform: `translate(-18px, -2px) rotate(${-45 + (slashing ? -70 : 0)}deg) scale(${hovering ? 1.18 : 1})`,
            transformOrigin: "18px 2px",
            transition: "transform 180ms ease-out",
            filter: hovering || slashing
              ? "drop-shadow(0 0 10px rgba(255,43,43,0.9))"
              : "drop-shadow(0 2px 6px rgba(0,0,0,0.7))",
          }}
        >
          <svg width="36" height="52" viewBox="0 0 36 52">
            <defs>
              <linearGradient id="swordblade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6a6a75" />
                <stop offset="0.5" stopColor="#f2f2f7" />
                <stop offset="1" stopColor="#6a6a75" />
              </linearGradient>
            </defs>
            <path d="M18 1 L22 7 L20 27 L18 31 L16 27 L14 7 Z" fill="url(#swordblade)" stroke="#2a2a30" strokeWidth="1" />
            <line x1="18" y1="8" x2="18" y2="26" stroke="#9a9aa5" strokeWidth="1.2" />
            <rect x="9" y="31" width="18" height="5" rx="2" fill="#c9a06a" stroke="#7a5a2e" strokeWidth="1" />
            <rect x="15.5" y="36" width="5" height="10" rx="2" fill="#7a0d16" />
            <circle cx="18" cy="48" r="3" fill="#c9a06a" stroke="#7a5a2e" strokeWidth="1" />
          </svg>
          {slashing && <span key={slashKey} className="slash-arc" />}
        </div>
      </div>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          body.sword-cursor, body.sword-cursor *:not(input):not(textarea):not(select) { cursor: none !important; }
        }
        .slash-arc {
          position: absolute; left: -34px; top: -34px; width: 72px; height: 72px;
          border-radius: 50%; border: 3px solid transparent;
          border-top-color: rgba(255, 43, 43, 0.9);
          filter: drop-shadow(0 0 8px rgba(255, 43, 43, 0.8));
          animation: slashSpin 0.28s ease-out forwards;
          pointer-events: none;
        }
        @keyframes slashSpin {
          from { transform: rotate(-40deg) scale(0.6); opacity: 1; }
          to { transform: rotate(80deg) scale(1.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
