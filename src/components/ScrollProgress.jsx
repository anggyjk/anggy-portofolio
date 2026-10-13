import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Bilah progres scroll merah di tepi atas — mati saat reduced-motion. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 120,
        transformOrigin: "0 50%", scaleX,
        background: "linear-gradient(90deg, #ff2b2b, #ff6a00)",
        boxShadow: "0 0 14px rgba(255,43,43,0.65)",
      }}
    />
  );
}
