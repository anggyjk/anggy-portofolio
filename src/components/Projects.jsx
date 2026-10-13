import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import BloodDrips from "./BloodDrips";
import { projects } from "../data/projects";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Layout editorial bervariasi:
 * kartu 0 & 3 lebar penuh-offset, kartu 1 & 2 setengah berdampingan.
 * Mobile: semua menumpuk.
 */
export default function Projects({ onSelect }) {
  return (
    <section id="works" className="section-pad" style={{ scrollMarginTop: 40 }}>
      <div aria-hidden="true" className="section-aura" style={{ left: "-160px", top: "20%" }} />
      <div className="container">
        <Reveal>
          <p className="eyebrow">02 — Selected Works</p>
          <SplitText text="Koleksi Terpilih" accent="." mode="chars" className="h-display" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", margin: "18px 0 12px" }} />
          <BloodDrips count={6} width={260} height={46} style={{ marginTop: 2 }} />
          <p className="text-muted" style={{ maxWidth: 520, lineHeight: 1.7 }}>Empat eksperimen pilihan — klik kartu untuk studi kasus lengkap.</p>
        </Reveal>

        <div className="works-grid" style={{ display: "grid", gap: 28, marginTop: 56 }}>
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, ease: EASE }}
              className={`work-card work-${i}`}
              style={{ position: "relative" }}
            >
              <button
                onClick={() => onSelect(p)}
                aria-label={`Lihat detail proyek ${p.title}`}
                style={{ all: "unset", display: "block", width: "100%", cursor: "pointer" }}
              >
                <div className="work-thumb" style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid var(--border)", aspectRatio: i % 3 === 0 ? "16/8" : "4/3" }}>
                  <img
                    src={p.thumb}
                    alt={`Mockup proyek ${p.title}`}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 700ms var(--ease), filter 500ms", filter: "grayscale(0.15)" }}
                  />
                  <span className="work-no" style={{ position: "absolute", top: 18, left: 20, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: 3, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)" }}>
                    {p.no}
                  </span>
                  {p.badge && (
                    <span style={{ position: "absolute", top: 18, right: 20, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#fff", background: "rgba(255,43,43,0.85)", padding: "6px 14px", borderRadius: 999 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} aria-hidden="true" />
                      {p.badge}
                    </span>
                  )}
                  <span className="work-cta" style={{ position: "absolute", right: 18, bottom: 18, display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#000", fontWeight: 600, fontSize: 14, padding: "10px 18px", borderRadius: 999, opacity: 0, transform: "translateY(10px)", transition: "opacity 350ms var(--ease), transform 350ms var(--ease)" }}>
                    Studi Kasus <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginTop: 18 }}>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.6vw, 2rem)", fontWeight: 700 }}>{p.title}</h3>
                  <p className="text-muted" style={{ margin: 0, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", textAlign: "right" }}>{p.category}</p>
                </div>
                <p className="text-muted" style={{ margin: "8px 0 0", lineHeight: 1.65 }}>{p.short}</p>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
      <style>{`
        .work-thumb img { will-change: transform; }
        .work-card button:hover .work-thumb img, .work-card button:focus-visible .work-thumb img { transform: scale(1.06) translateX(8px); filter: grayscale(0); }
        .work-card button:hover .work-cta, .work-card button:focus-visible .work-cta { opacity: 1 !important; transform: none !important; }
        @media (min-width: 900px) {
          .works-grid { grid-template-columns: 1fr 1fr; }
          .work-0, .work-3 { grid-column: 1 / -1; }
          .work-1 { transform: translateY(48px); }
        }
      `}</style>
    </section>
  );
}
