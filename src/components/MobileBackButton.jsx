import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { navLinks } from "../data/site";

/**
 * Tombol kembali khusus mobile: melompat ke section sebelumnya
 * (Home ← About ← Works ← Skills ← Contact). Muncul setelah scroll.
 */
export default function MobileBackButton() {
  const [enabled, setEnabled] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const updateEnabled = () => setEnabled(mq.matches);
    updateEnabled();
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    if (mq.addEventListener) mq.addEventListener("change", updateEnabled);
    else mq.addListener(updateEnabled);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", updateEnabled);
      else mq.removeListener(updateEnabled);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!enabled) return null;

  const goBack = () => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const y = window.scrollY + 140;
    let current = 0;
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + window.scrollY <= y) current = i;
    });
    const target = document.getElementById(ids[Math.max(current - 1, 0)]);
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
          onClick={goBack}
          aria-label="Kembali ke bagian sebelumnya"
          style={{
            position: "fixed", left: 16, top: 104, zIndex: 85,
            width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
            background: "rgba(16,16,18,0.9)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            display: "grid", placeItems: "center", color: "#fff",
          }}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
