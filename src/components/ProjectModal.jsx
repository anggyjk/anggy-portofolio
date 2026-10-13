import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github, ImageOff } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/** Modal studi kasus proyek: deskripsi, tech, galeri, link (disembunyikan bila null). */
export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Detail proyek ${project.title}`}
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 880, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, overflow: "hidden" }}
          >
            <div style={{ position: "relative" }}>
              <img src={project.thumb} alt={`Galeri utama ${project.title}`} style={{ width: "100%", maxHeight: 380, objectFit: "cover" }} />
              <button onClick={onClose} aria-label="Tutup detail" style={{ position: "absolute", top: 16, right: 16, width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <X size={20} />
              </button>
              <span style={{ position: "absolute", left: 20, bottom: 16, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 3, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.16)", padding: "6px 14px", borderRadius: 999 }}>{project.no} — {project.year}</span>
            </div>

            <div style={{ padding: "28px 28px 32px" }}>
              <p className="text-accent" style={{ margin: 0, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600 }}>{project.category}</p>
              {project.badge && (
                <p role="status" style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "12px 0 0", fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 999, background: "rgba(255,43,43,0.14)", border: "1px solid rgba(255,43,43,0.5)", color: "#ff6b6b" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px rgba(255,43,43,0.9)" }} aria-hidden="true" />
                  {project.badge} — progress menyusul
                </p>
              )}
              <h3 className="h-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "10px 0 14px" }}>{project.title}</h3>
              <p style={{ lineHeight: 1.8, color: "#d6d6db", margin: 0 }}>{project.description}</p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
                {project.tech.map((t) => (
                  <span key={t} style={{ fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)" }}>{t}</span>
                ))}
              </div>

              {/* Galeri: crop berbeda dari thumbnail yang sama */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 22 }}>
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "16/10" }}>
                  <img src={project.thumb} alt={`Detail tampilan ${project.title} 1`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center", transform: "scale(1.4)" }} />
                </div>
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "16/10" }}>
                  <img src={project.thumb} alt={`Detail tampilan ${project.title} 2`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center", transform: "scale(1.4)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
                {project.demoUrl ? (
                  <a className="btn btn-accent" href={project.demoUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={17} aria-hidden="true" /> Live Demo
                  </a>
                ) : null}
                {project.sourceUrl ? (
                  <a className="btn btn-ghost" href={project.sourceUrl} target="_blank" rel="noreferrer">
                    <Github size={17} aria-hidden="true" /> Source Code
                  </a>
                ) : null}
                {!project.demoUrl && !project.sourceUrl && (
                  <p role="status" style={{ display: "inline-flex", alignItems: "center", gap: 10, margin: 0, padding: "12px 20px", borderRadius: 999, border: "1px dashed rgba(255,255,255,0.22)", color: "var(--muted)", fontSize: 14 }}>
                    <ImageOff size={16} aria-hidden="true" /> Demo &amp; source belum dipublikasikan
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
