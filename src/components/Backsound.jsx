import { useCallback, useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";

const STORE_KEY = "anzy-backsound";
const AUDIO_URL = "/audio/backsound.mp3";
const VOLUME = 0.35;
const FADE_MS = 2000;

/**
 * Backsound MP3 (loop):
 * - Mulai otomatis setelah interaksi pertama (aturan autoplay browser).
 * - Fade-in/out halus, volume dibatasi agar tidak memekakkan.
 * - Tombol melayang kiri-bawah: equalizer beranimasi saat bunyi.
 * - Pilihan mute tersimpan di localStorage.
 */
export default function Backsound() {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(STORE_KEY) === "off";
    } catch {
      return false;
    }
  });
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);
  const fadeRaf = useRef(0);

  const fadeTo = useCallback((el, target, durMs) => {
    cancelAnimationFrame(fadeRaf.current);
    const from = el.volume;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min((t - t0) / durMs, 1);
      el.volume = from + (target - from) * k;
      if (k < 1) fadeRaf.current = requestAnimationFrame(step);
    };
    fadeRaf.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(() => {
    if (audio.current || muted) return false;
    try {
      const el = new Audio(AUDIO_URL);
      el.loop = true;
      el.preload = "auto";
      el.volume = 0;
      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          /* ditolak browser — tunggu gesture berikutnya */
          audio.current = null;
        });
      }
      audio.current = el;
      fadeTo(el, VOLUME, FADE_MS);
      setPlaying(true);
      return true;
    } catch {
      return false;
    }
  }, [muted, fadeTo]);

  // Interaksi pertama di mana saja = izin browser untuk bersuara.
  useEffect(() => {
    const kick = () => {
      if (start()) {
        window.removeEventListener("pointerdown", kick);
        window.removeEventListener("keydown", kick);
      }
    };
    window.addEventListener("pointerdown", kick);
    window.addEventListener("keydown", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, [start]);

  useEffect(
    () => () => {
      cancelAnimationFrame(fadeRaf.current);
      try {
        audio.current?.pause();
      } catch {
        /* abaikan */
      }
      audio.current = null;
    },
    []
  );

  const toggle = () => {
    if (muted) {
      try {
        localStorage.setItem(STORE_KEY, "on");
      } catch {
        /* abaikan */
      }
      setMuted(false);
      // Audio dibangun ulang via efek di bawah (klik = gesture valid).
    } else {
      try {
        localStorage.setItem(STORE_KEY, "off");
      } catch {
        /* abaikan */
      }
      setMuted(true);
      const el = audio.current;
      audio.current = null;
      if (el) {
        fadeTo(el, 0, 400);
        setTimeout(() => {
          try {
            el.pause();
          } catch {
            /* abaikan */
          }
        }, 450);
      }
      setPlaying(false);
    }
  };

  // Setelah unmute, putar lagi.
  useEffect(() => {
    if (!muted && !audio.current) start();
  }, [muted, start]);

  return (
    <>
      <button
        onClick={toggle}
        aria-label={muted ? "Nyalakan backsound" : "Matikan backsound"}
        aria-pressed={!muted}
        title={muted ? "Nyalakan backsound" : "Matikan backsound"}
        style={{
          position: "fixed", left: 22, bottom: 22, zIndex: 85,
          width: 56, height: 56, borderRadius: "50%", cursor: "pointer",
          background: "rgba(16,16,18,0.9)",
          border: muted
            ? "1px solid rgba(255,255,255,0.14)"
            : "1px solid rgba(255,43,43,0.55)",
          boxShadow: muted ? "none" : "0 0 22px rgba(255,43,43,0.35)",
          backdropFilter: "blur(8px)",
          display: "grid", placeItems: "center", color: "#fff",
          transition: "border-color 300ms, box-shadow 300ms, transform 200ms var(--ease)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
      >
        {muted || !playing ? (
          <VolumeX size={20} aria-hidden="true" style={{ color: "var(--muted)" }} />
        ) : (
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, height: 20 }}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="eq-bar"
                style={{
                  width: 3,
                  borderRadius: 2,
                  background: "var(--accent)",
                  boxShadow: "0 0 8px rgba(255,43,43,0.8)",
                  animation: `eqBounce 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </span>
        )}
      </button>
      <style>{`
        .eq-bar { height: 30%; }
        @keyframes eqBounce {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
      `}</style>
    </>
  );
}
