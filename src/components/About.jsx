import { useEffect, useState } from "react";
import { FileDown, FileX2 } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import BloodDrips from "./BloodDrips";
import { site } from "../data/site";

/** Tombol CV: tampil hanya jika file benar-benar ada (cek via HEAD request). */
function CvButton() {
  const [exists, setExists] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(site.cvFile, { method: "HEAD" })
      .then((r) => alive && setExists(r.ok))
      .catch(() => alive && setExists(false));
    return () => { alive = false; };
  }, []);

  if (exists === null) return null;
  if (!exists) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 999, border: "1px dashed rgba(255,255,255,0.2)", color: "var(--muted)", fontSize: 15 }}>
        <FileX2 size={18} aria-hidden="true" /> CV segera hadir
      </span>
    );
  }
  return (
    <a className="btn btn-primary" href={site.cvFile} download>
      <FileDown size={18} aria-hidden="true" /> Download CV
    </a>
  );
}

export default function About() {
  return (
    <section id="about" className="section-pad" style={{ scrollMarginTop: 60 }}>
      <div aria-hidden="true" className="section-aura" style={{ right: "-140px", top: "-60px" }} />
      <div className="container about-grid" style={{ display: "grid", gap: 48 }}>
        <Reveal variant="left">
          <p className="eyebrow">01 — About</p>
          <SplitText text="About Me" accent="." mode="words" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", marginTop: 18 }} className="h-display" />
          <BloodDrips count={5} width={210} height={44} style={{ marginTop: 6 }} />
          <div aria-hidden="true" style={{ marginTop: 28, width: 120, height: 1, background: "linear-gradient(90deg, var(--accent), transparent)" }} />
          <p className="text-muted" style={{ marginTop: 20, fontSize: 14, letterSpacing: 2 }}>INFORMATIKA — MALANG, ID</p>
        </Reveal>

        <Reveal variant="right" delay={0.12}>
          <div style={{ fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.85, color: "#d6d6db" }}>
            <p style={{ marginTop: 0 }}>
              Saya <strong>Anzy</strong> — mahasiswa Informatika di{" "}
              <strong>Universitas Muhammadiyah Malang</strong>, peminat{" "}
              <strong>Rekayasa Perangkat Lunak</strong> khususnya{" "}
              <strong>pengembangan web</strong>. Saya membangun antarmuka yang
              terasa <em>hidup</em>: transisi sinematik, tipografi berkarakter,
              dan interaksi yang menghargai perhatian pengguna.
            </p>
            <p>
              Minat utama saya: <strong>web development</strong> (React, JavaScript modern),{" "}
              <strong>UI/UX</strong> (dari wireframe sampai hi-fi), serta{" "}
              <strong>teknologi &amp; desain digital</strong> — bagaimana keduanya bertemu
              membentuk pengalaman yang tak terlupakan.
            </p>
            <p className="text-muted" style={{ fontSize: "0.95em" }}>
              Di luar kode: mengoleksi referensi visual anime, mengulik micro-interaction,
              dan mendokumentasikan eksperimen di arsip digital pribadi.
            </p>
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <CvButton />
            <a className="btn btn-ghost" href="#works">Lihat Karya</a>
          </div>
        </Reveal>
      </div>
      <style>{`@media (min-width: 900px) { .about-grid { grid-template-columns: 1fr 1.4fr; gap: 72px !important; align-items: start; } }`}</style>
    </section>
  );
}
