import { useEffect, useRef } from "react";

/** Glow merah halus mengikuti kursor — desktop + tanpa reduced-motion saja. */
export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !ref.current) return;
    const el = ref.current;
    let x = -500, y = -500, cx = x, cy = y, raf = 0;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      cx += (x - cx) * 0.1;
      cy += (y - cy) * 0.1;
      el.style.transform = `translate(${cx - 180}px, ${cy - 180}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed", left: 0, top: 0, zIndex: 1,
        width: 360, height: 360, borderRadius: "50%",
        pointerEvents: "none", opacity: 0.1, filter: "blur(90px)",
        background: "radial-gradient(circle, #ff2b2b, transparent 65%)",
      }}
    />
  );
}
