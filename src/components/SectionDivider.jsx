import { motion } from "framer-motion";
import BloodDrips from "./BloodDrips";

const EASE = [0.16, 1, 0.3, 1];

/** Pembatas antar-section: garis merah yang terlukis saat scroll + darah. */
export default function SectionDivider() {
  return (
    <div aria-hidden="true" style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, ease: EASE }}
          style={{
            width: "min(420px, 60vw)",
            height: 1,
            transformOrigin: "center",
            background: "linear-gradient(90deg, transparent, rgba(255,43,43,0.7), transparent)",
            boxShadow: "0 0 16px rgba(255,43,43,0.35)",
          }}
        />
        <BloodDrips count={4} width={150} height={36} />
      </div>
    </div>
  );
}
