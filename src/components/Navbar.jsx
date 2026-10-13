import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, site } from "../data/site";
import BloodDrips from "./BloodDrips";

const EASE = [0.16, 1, 0.3, 1];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: tandai menu aktif sesuai section terlihat
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: "fixed", inset: "0 0 auto 0", zIndex: 80,
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          background: scrolled ? "rgba(8,8,8,0.78)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        <nav
          aria-label="Navigasi utama"
          className="container"
          style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: 92 }}
        >
          <span className="nav-left" style={{ fontSize: 13, letterSpacing: 3, color: "var(--muted)", whiteSpace: "nowrap" }}>
            PORTFOLIO — {site.year}
          </span>
          <a href="#home" style={{ textDecoration: "none", textAlign: "center", lineHeight: 1.15 }}>
            <span style={{ display: "block", fontSize: 11, letterSpacing: 4, color: "var(--muted)" }}>
              EST. 2023
            </span>
            <span
              className={active === "home" ? "nav-brand-bleed" : undefined}
              style={{
                display: "block",
                fontFamily: "var(--font-hero)",
                fontSize: 24,
                letterSpacing: 2,
                color: "#fff",
                marginTop: 5,
                whiteSpace: "nowrap",
              }}
            >
              ANZY KURNIAWAN
            </span>
          </a>
          <span style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <ul className="nav-desktop" style={{ display: "flex", gap: 30, listStyle: "none", margin: 0, padding: 0 }}>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={active === l.href.slice(1) ? "page" : undefined}
                    style={{
                      textDecoration: "none", fontSize: 15, fontWeight: 500,
                      color: active === l.href.slice(1) ? "#fff" : "var(--muted)",
                      transition: "color 200ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = active === l.href.slice(1) ? "#fff" : "var(--muted)")}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <button
              className="nav-burger"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              style={{ display: "none", background: "none", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, width: 42, height: 42, color: "#fff", cursor: "pointer" }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </span>
        </nav>
        {/* Darah menetes dari navbar — hanya saat di homepage */}
        <AnimatePresence>
          {active === "home" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              aria-hidden="true"
              style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
            >
              <BloodDrips count={5} width={190} height={42} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ position: "fixed", inset: "92px 0 auto 0", zIndex: 79, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <nav aria-label="Navigasi seluler" style={{ padding: "12px 24px 24px", display: "flex", flexDirection: "column" }}>
              {navLinks.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ease: EASE }}
                  style={{
                    padding: "14px 4px", textDecoration: "none", fontFamily: "var(--font-display)",
                    fontSize: 22, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.06)",
                    color: active === l.href.slice(1) ? "var(--accent)" : "#fff",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--faint)", marginRight: 12 }}>0{i + 1}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 899px) { .nav-left, .nav-desktop { display: none !important; } .nav-burger { display: grid !important; place-items: center; } }
        .nav-brand-bleed { animation: brandBleed 3.2s ease-in-out infinite; }
        @keyframes brandBleed { 0%, 100% { text-shadow: 0 0 0 rgba(255,43,43,0); } 50% { text-shadow: 0 0 24px rgba(255,43,43,0.7), 0 6px 18px rgba(180,10,20,0.5); } }
      `}</style>
    </>
  );
}
