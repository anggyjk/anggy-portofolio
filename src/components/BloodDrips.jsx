import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

/* Pseudo-random deterministik agar SSR/render konsisten. */
function pseudo(i, salt) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Tetesan darah realistis (murni CSS): untaian memanjang perlahan dari tepi
 * basah → tetes menggelembung di ujung → lepas & jatuh dipercepat gravitasi
 * sambil melar → merekah (splash) saat mendarat. Loop dengan durasi acak
 * per tetes agar tidak sinkron. Hormat pada prefers-reduced-motion.
 */
export default function BloodDrips({
  count = 6,
  width = 240,
  height = 56,
  color = "#e8112d",
  dark = "#6e0a12",
  hi = "#ff9aa2",
  style,
}) {
  const reduce = useReducedMotion();
  const drips = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const w = 3.5 + pseudo(i, 2) * 4.5;
        const len = 14 + pseudo(i, 3) * 20;
        return {
          left: `${(pseudo(i, 1) * 94 + 3).toFixed(2)}%`,
          w,
          len,
          dw: w * 1.6, // diameter tetes
          fall: Math.max(height - len - 12, 22),
          dur: 3.2 + pseudo(i, 4) * 2.6,
          delay: -(pseudo(i, 5) * 6),
        };
      }),
    [count, height]
  );

  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", width, height, overflow: "visible", ...style }}
    >
      {/* Tepi basah di atas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${color} 18%, ${dark} 82%, transparent)`,
          boxShadow: `0 0 14px rgba(232,17,45,0.55)`,
        }}
      />
      {drips.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.left,
            top: 3,
            width: d.w,
            "--fall": `${d.fall}px`,
          }}
        >
          {/* Untaian: memanjang perlahan → menahan → menyentak pendek (recoil) */}
          <div
            style={{
              width: "100%",
              height: d.len,
              borderRadius: 999,
              // Kilau silinder: gelap — merah — highlight — merah — gelap
              background: `linear-gradient(90deg, ${dark} 0%, ${color} 28%, ${hi} 50%, ${color} 72%, ${dark} 100%)`,
              boxShadow: `0 0 10px rgba(232,17,45,0.5)`,
              transformOrigin: "top center",
              animation: reduce
                ? "none"
                : `strandCycle ${d.dur}s linear ${d.delay}s infinite`,
            }}
          />
          {/* Tetes: menggelembung di ujung → lepas → jatuh + melar */}
          {!reduce && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: d.len - d.dw * 0.55,
                width: d.dw,
                height: d.dw,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 28%, ${hi} 0%, ${color} 42%, ${dark} 85%)`,
                boxShadow: `0 0 12px rgba(232,17,45,0.65)`,
                animation: `dropCycle ${d.dur}s linear ${d.delay}s infinite`,
              }}
            />
          )}
          {/* Rekahan saat tetes mendarat */}
          {!reduce && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: d.len + d.fall - 3,
                width: d.w * 2.4,
                height: 5,
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${color} 0%, ${dark} 60%, transparent 75%)`,
                animation: `splashCycle ${d.dur}s linear ${d.delay}s infinite`,
              }}
            />
          )}
        </div>
      ))}
      <style>{`
        @keyframes strandCycle {
          0% { transform: scaleY(0.12); animation-timing-function: ease-in-out; }
          45% { transform: scaleY(1); }
          58% { transform: scaleY(1); animation-timing-function: cubic-bezier(0.6, 0, 0.9, 0.4); }
          64% { transform: scaleY(0.3); animation-timing-function: ease-in-out; }
          100% { transform: scaleY(0.12); }
        }
        @keyframes dropCycle {
          0%, 40% { transform: translate(-50%, 0) scale(0); opacity: 0; }
          52% { transform: translate(-50%, 0) scale(1); opacity: 1; animation-timing-function: ease-out; }
          58% { transform: translate(-50%, 0) scale(1); opacity: 1; animation-timing-function: cubic-bezier(0.55, 0.06, 0.75, 0.4); }
          92% { transform: translate(-50%, var(--fall)) scale(0.75, 1.45); opacity: 1; }
          100% { transform: translate(-50%, calc(var(--fall) + 6px)) scale(0.9, 1.1); opacity: 0; }
        }
        @keyframes splashCycle {
          0%, 84% { transform: translateX(-50%) scale(0); opacity: 0; }
          92% { transform: translateX(-50%) scale(1); opacity: 0.8; }
          100% { transform: translateX(-50%) scale(1.5, 0.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
