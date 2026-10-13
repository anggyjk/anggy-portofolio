import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Nama raksasa outline yang bergeser mengikuti scroll — pemisah section sinematik.
 * reverse: arah gerak berlawanan.
 */
export default function NameTicker({ text = "ANZY KURNIAWAN", reverse = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reverse ? ["-28%", "4%"] : ["4%", "-28%"]);

  return (
    <section ref={ref} aria-hidden="true" style={{ overflow: "hidden", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "#0a0a0c", padding: "26px 0" }}>
      <motion.div
        style={{
          x: reduce ? 0 : x,
          display: "flex", gap: "5rem", width: "max-content", whiteSpace: "nowrap",
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "clamp(3.4rem, 11vw, 9rem)", lineHeight: 1, letterSpacing: "0.04em",
        }}
      >
        {[0, 1, 2].map((n) => (
          <span key={n} style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.16)" }}>
            {text} <span style={{ WebkitTextStroke: "0", color: "var(--accent)" }}>•</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
