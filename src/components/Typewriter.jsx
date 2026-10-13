import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

const LINE_1 = "ANZY";
const LINE_2 = "KURNIAWAN";
const TOTAL = LINE_1.length + LINE_2.length;
const START_DELAY = 700;
const HOLD_MS = 2400;
const RESTART_MS = 700;

/**
 * Efek mengetik LOOP selamanya: ketik → tahan → hapus → ketik lagi.
 * Tipografi cinematic split-screen:
 *  - Baris 1 "ANZY": putih tulang, glow hangat samar (tidak bloom berlebihan).
 *  - Baris 2 "KURNIAWAN": merah crimson, glow merah (menyatu dengan rim light 3D).
 * Kursor blok merah berkedip di ujung baris aktif.
 */
export default function Typewriter() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? TOTAL : 0);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    let n = 0;
    let mode = "typing";
    let t;
    const tick = () => {
      if (mode === "typing") {
        n += 1;
        setTyped(n);
        if (n >= TOTAL) {
          setDone(true);
          mode = "hold";
          t = setTimeout(() => { mode = "deleting"; setDone(false); tick(); }, HOLD_MS);
        } else {
          t = setTimeout(tick, n < LINE_1.length ? 120 : 75);
        }
      } else {
        n -= 1;
        setTyped(n);
        if (n <= 0) {
          mode = "typing";
          t = setTimeout(tick, RESTART_MS);
        } else {
          t = setTimeout(tick, 32);
        }
      }
    };
    t = setTimeout(tick, START_DELAY);
    return () => clearTimeout(t);
  }, [reduce]);

  const c1 = Math.min(typed, LINE_1.length);
  const c2 = Math.max(0, typed - LINE_1.length);
  const typingLine2 = typed >= LINE_1.length && !done;

  const caret = (key) => (
    <motion.span
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
      style={{
        display: "inline-block", width: "max(3px, 0.055em)", height: "0.78em",
        background: "var(--accent)", marginLeft: "0.08em", verticalAlign: "-0.04em",
        boxShadow: "0 0 18px rgba(255,43,43,0.9), 0 0 46px rgba(255,43,43,0.5)",
      }}
    />
  );

  return (
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE }}
      className="h-display hero-name"
      style={{
        margin: 0,
        fontFamily: "var(--font-hero)",
        fontWeight: 400,
        textAlign: "left",
        lineHeight: 0.88,
        letterSpacing: "0.005em",
      }}
      aria-label="Anzy Kurniawan"
    >
      <span
        aria-hidden="true"
        className="hero-line-1"
        style={{
          display: "block",
          minHeight: "0.9em",
          color: "#ffffff",
          textShadow:
            "0 0 18px rgba(255,240,214,0.55), 0 0 70px rgba(255,236,200,0.4), 0 4px 40px rgba(0,0,0,0.9)",
        }}
      >
        {LINE_1.slice(0, c1)}
        {!done && !typingLine2 && caret("c1")}
      </span>
      <span
        className="hero-line-2"
        aria-hidden="true"
        style={{
          display: "block",
          marginTop: "0.1em",
          minHeight: "1em",
          color: "#e8112d",
          textShadow:
            "0 0 24px rgba(232,17,45,0.6), 0 0 70px rgba(232,17,45,0.35), 0 4px 34px rgba(0,0,0,0.9)",
        }}
      >
        {LINE_2.slice(0, c2)}
        {(typingLine2 || done) && caret("c2")}
      </span>
    </motion.h1>
  );
}
