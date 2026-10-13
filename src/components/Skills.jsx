import { motion } from "framer-motion";
import { Code2, Palette, Braces, Atom, Coffee, PenTool, GitBranch, Smartphone } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import BloodDrips from "./BloodDrips";
import { skills } from "../data/site";

const EASE = [0.16, 1, 0.3, 1];

// Ikon per skill — monokrom + aksen merah, tanpa gambar eksternal.
const ICONS = {
  HTML: Code2,
  CSS: Palette,
  JavaScript: Braces,
  React: Atom,
  Java: Coffee,
  "UI/UX Design": PenTool,
  Git: GitBranch,
  Responsive: Smartphone,
};

/** Grid tipografi minimalis — tanpa progress bar palsu. */
export default function Skills() {
  return (
    <section id="skills" className="section-pad" style={{ scrollMarginTop: 40, background: "#0b0b0d", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div aria-hidden="true" className="section-aura" style={{ right: "-140px", bottom: "-100px" }} />
      <div className="container">
        <Reveal>
          <p className="eyebrow">03 — Skills</p>
          <SplitText text="Senjata Utama" accent="." mode="words" stagger={0.12} className="h-display" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", margin: "18px 0 12px" }} />
          <BloodDrips count={5} width={220} height={44} style={{ marginTop: 2 }} />
          <p className="text-muted" style={{ maxWidth: 520, lineHeight: 1.7 }}>Teknologi yang saya pakai setiap hari — tanpa klaim persentase.</p>
        </Reveal>

        <div className="skills-grid" style={{ display: "grid", gap: 14, marginTop: 52, gridTemplateColumns: "repeat(2, 1fr)" }}>
          {skills.map((s, i) => {
            const Icon = ICONS[s.name] ?? Code2;
            return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: EASE }}
              whileHover={{ y: -6 }}
              className="skill-card"
              style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "26px 24px", background: "var(--surface)", transition: "border-color 300ms, box-shadow 300ms", cursor: "default" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,43,43,0.5)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,43,43,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <motion.span
                whileHover={{ scale: 1.15, rotate: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                aria-hidden="true"
                style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, background: "rgba(255,43,43,0.1)", border: "1px solid rgba(255,43,43,0.3)", color: "var(--accent)" }}
              >
                <Icon size={22} />
              </motion.span>
              <p style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)" }}>
                <span className="text-accent" style={{ fontSize: "0.8em", marginRight: 10 }}>0{i + 1}</span>
                {s.name}
              </p>
              <p className="text-muted" style={{ margin: "8px 0 0", fontSize: 13 }}>{s.note}</p>
            </motion.div>
            );
          })}
        </div>
      </div>
      <style>{`@media (min-width: 900px) { .skills-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
    </section>
  );
}
