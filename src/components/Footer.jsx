import { site } from "../data/site";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", paddingTop: 30, paddingBottom: 30, textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: 3, fontSize: 15 }}>
          {site.name}<span className="text-accent">.</span>
        </p>
        <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
          © {site.year} {site.name} — Dibuat dengan ketelitian di Indonesia.
        </p>
      </div>
    </footer>
  );
}
