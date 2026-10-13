import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";

const R = 24;
const CIRC = 2 * Math.PI * R;

/** Tombol kembali ke atas dengan ring progres scroll. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const dash = useTransform(scrollYProgress, [0, 1], [CIRC, 0]);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 650);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          aria-label="Kembali ke atas"
          style={{
            position: "fixed", right: 22, bottom: 22, zIndex: 85,
            width: 56, height: 56, borderRadius: "50%", cursor: "pointer",
            background: "rgba(16,16,18,0.9)", border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)", display: "grid", placeItems: "center", color: "#fff",
          }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} aria-hidden="true">
            <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
            <motion.circle cx="28" cy="28" r={R} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" style={{ strokeDasharray: CIRC, strokeDashoffset: reduce ? 0 : dash }} />
          </svg>
          <ArrowUp size={20} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
