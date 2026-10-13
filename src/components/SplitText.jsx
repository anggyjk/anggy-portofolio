import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Teks terbelah per kata / per huruf, naik stagger saat masuk viewport.
 * mode: "words" | "chars". Hormat pada prefers-reduced-motion.
 */
export default function SplitText({
  text,
  accent = "",
  as: Tag = "h2",
  className,
  style,
  delay = 0,
  stagger,
  mode = "words",
}) {
  const reduce = useReducedMotion();
  const gap = stagger ?? (mode === "chars" ? 0.022 : 0.09);
  const units = mode === "chars" ? text.split("") : text.split(" ");

  if (reduce) {
    return (
      <Tag className={className} style={style}>
        {text}
        {accent && <span className="text-accent">{accent}</span>}
      </Tag>
    );
  }

  const renderUnit = (u, d) => (
    <span
      aria-hidden="true"
      style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.1em", marginBottom: "-0.1em" }}
    >
      <motion.span
        style={{ display: "inline-block", willChange: "transform" }}
        initial={{ y: "115%", rotate: 4 }}
        whileInView={{ y: "0%", rotate: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75, delay: d, ease: EASE }}
      >
        {u === " " ? "\u00A0" : u}
      </motion.span>
    </span>
  );

  return (
    <Tag className={className} style={style} aria-label={`${text}${accent}`}>
      {units.map((u, i) => (
        <span key={i} aria-hidden="true">
          {renderUnit(u, delay + i * gap)}
          {mode === "words" && i < units.length - 1 ? "\u00A0" : null}
        </span>
      ))}
      {accent && (
        <span aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.1em", marginBottom: "-0.1em" }}>
          <motion.span
            className="text-accent"
            style={{ display: "inline-block" }}
            initial={{ y: "115%", scale: 0.4 }}
            whileInView={{ y: "0%", scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: delay + units.length * gap, ease: EASE }}
          >
            {accent}
          </motion.span>
        </span>
      )}
    </Tag>
  );
}
