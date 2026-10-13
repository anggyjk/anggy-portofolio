import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import { stats } from "../data/site";

function Counter({ to, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, reduce]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}

export default function Statistics() {
  return (
    <section aria-label="Statistik pencapaian" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "#0b0b0d" }}>
      <div className="container stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "var(--border)", padding: 0 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ background: "#0b0b0d", padding: "44px 28px", textAlign: "center" }}>
            <Reveal variant="scale" delay={i * 0.08}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.4rem)", color: i === 0 ? "var(--accent)" : "#fff" }}>
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-muted" style={{ margin: "10px 0 0", fontSize: 13, letterSpacing: 3, textTransform: "uppercase" }}>{s.label}</p>
            </Reveal>
          </div>
        ))}
      </div>
      <p className="container text-muted" style={{ fontSize: 12, paddingTop: 14, paddingBottom: 14, marginTop: 0, marginBottom: 0 }}>
        * Angka contoh — perbarui di <code>src/data/site.js</code> dengan pencapaian asli Anda.
      </p>
      <style>{`@media (min-width: 900px) { .stats-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
    </section>
  );
}
