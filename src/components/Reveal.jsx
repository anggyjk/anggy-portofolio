import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

const variants = {
  up: { hidden: { opacity: 0, y: 44 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -56 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 56 }, show: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(12px)" }, show: { opacity: 1, filter: "blur(0px)" } },
};

/** Reveal-on-scroll universal yang hormat pada prefers-reduced-motion. */
export default function Reveal({
  variant = "up",
  delay = 0,
  className,
  children,
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={variants[variant] ?? variants.up}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
