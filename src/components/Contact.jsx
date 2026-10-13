import { Mail, Github, Instagram, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import BloodDrips from "./BloodDrips";
import { site } from "../data/site";

/** Link sosial: value tampil otomatis dari URL di data/site.js. */
export default function Contact() {
  const short = (href) => href.replace(/^https?:\/\/(www\.)?/, "");
  const socials = [
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: Github, label: "GitHub", value: short(site.github), href: site.github },
    { icon: Instagram, label: "Instagram", value: short(site.instagram), href: site.instagram },
  ];

  return (
    <section id="contact" className="section-pad" style={{ scrollMarginTop: 40, position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: -180, width: 640, height: 420, transform: "translateX(-50%)", background: "radial-gradient(ellipse, rgba(255,43,43,0.12), transparent 65%)", filter: "blur(20px)", pointerEvents: "none" }} />
      <div aria-hidden="true" className="section-aura" style={{ left: "-160px", top: "-40px" }} />
      <div className="container" style={{ textAlign: "center", position: "relative" }}>
        <Reveal variant="blur">
          <p className="eyebrow" style={{ justifyContent: "center" }}>04 — Contact</p>
          <SplitText text="Let's Work" mode="words" className="h-display" style={{ fontSize: "clamp(2.8rem, 9vw, 6.5rem)", margin: "20px 0 0" }} />
          <SplitText text="Together" accent="." mode="words" delay={0.25} className="h-display" style={{ fontSize: "clamp(2.8rem, 9vw, 6.5rem)", margin: "0 0 16px" }} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BloodDrips count={6} width={260} height={46} />
          </div>
          <p className="text-muted" style={{ maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Punya ide proyek, kolaborasi, atau sekadar ingin menyapa? Kotak masuk saya selalu terbuka.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{ marginTop: 36 }}>
            <a className="btn btn-accent" href={`mailto:${site.email}?subject=Kolaborasi%20dengan%20Anggy`} style={{ fontSize: 17, padding: "18px 44px" }}>
              <Mail size={19} aria-hidden="true" /> Kirim Email
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <ul style={{ listStyle: "none", margin: "48px auto 0", padding: 0, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 720 }}>
            {socials.map((s) => (
              <li key={s.label} style={{ flex: "1 1 200px", maxWidth: 230 }}>
                <a
                  href={s.href}
                  {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)", textDecoration: "none", transition: "border-color 250ms, transform 200ms var(--ease)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,43,43,0.55)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}
                >
                  <s.icon size={20} aria-hidden="true" style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ textAlign: "left", minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 12, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>{s.label}</span>
                    <span style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</span>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" style={{ marginLeft: "auto", color: "var(--faint)", flexShrink: 0 }} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
