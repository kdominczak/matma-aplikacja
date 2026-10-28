"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Rozmyte symbole matematyczne unoszące się w tle ekranu głównego.
 * Głębia = paralaksa: bliższe symbole (większe `depth`) są większe, wyraźniejsze
 * i mocniej przesuwają się przy przewijaniu oraz za kursorem.
 *
 * Wydajność: unoszenie (`animate-float`) i paralaksa przy przewijaniu (`.scroll-parallax`,
 * animacja sterowana przewijaniem) są w czystym CSS i działają na kompozytorze – bez JS na każdą klatkę.
 * JS zostaje tylko dla podążania za kursorem, i to wyłącznie na urządzeniach z myszką.
 * Głębię daje przezroczystość zamiast `filter: blur` (filtr na 9 ruchomych warstwach był kosztowny).
 */
const SYMBOLS: { glyph: string; top: string; left: string; size: number; depth: number; duration: number; delay: number }[] = [
  { glyph: "π", top: "8%", left: "12%", size: 72, depth: 1, duration: 14, delay: 0 },
  { glyph: "∑", top: "18%", left: "78%", size: 96, depth: 0.6, duration: 18, delay: -4 },
  { glyph: "√", top: "42%", left: "6%", size: 56, depth: 0.35, duration: 16, delay: -9 },
  { glyph: "∫", top: "55%", left: "88%", size: 84, depth: 1, duration: 20, delay: -2 },
  { glyph: "∞", top: "72%", left: "22%", size: 64, depth: 0.6, duration: 15, delay: -7 },
  { glyph: "Δ", top: "32%", left: "48%", size: 48, depth: 0.35, duration: 22, delay: -12 },
  { glyph: "x²", top: "84%", left: "64%", size: 60, depth: 0.6, duration: 17, delay: -5 },
  { glyph: "÷", top: "64%", left: "46%", size: 44, depth: 0.35, duration: 19, delay: -14 },
  { glyph: "α", top: "4%", left: "52%", size: 52, depth: 0.6, duration: 21, delay: -10 },
];

export default function FloatingSymbols() {
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // pozycja kursora względem środka ekranu, w zakresie -1…1
    const onMove = (e: PointerEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mouseX, mouseY]);

  return (
    <>
      {SYMBOLS.map((s) => (
        <FloatingSymbol key={s.glyph} {...s} still={Boolean(reduce)} mouseX={springX} mouseY={springY} />
      ))}
    </>
  );
}

function FloatingSymbol({
  glyph,
  top,
  left,
  size,
  depth,
  duration,
  delay,
  still,
  mouseX,
  mouseY,
}: (typeof SYMBOLS)[number] & { still: boolean; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const x = useTransform(mouseX, (v) => (still ? 0 : v * -24 * depth));
  const y = useTransform(mouseY, (v) => (still ? 0 : v * -24 * depth));
  const px = size * (0.6 + depth * 0.4);

  return (
    // trzy warstwy, każda z jednym ruchem: przewijanie (CSS) → kursor (motion) → unoszenie (CSS)
    <div className="scroll-parallax absolute" style={{ top, left, "--depth": depth } as React.CSSProperties}>
      <motion.div style={{ x, y }}>
        <div
          className="animate-float text-brand motion-reduce:animate-none"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            // dalsze symbole bledsze – zamiast rozmycia
            opacity: `calc(var(--symbol-opacity) * ${0.45 + depth * 0.55})`,
          }}
        >
          <svg width={px} height={px} viewBox="0 0 100 100">
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="80" fontWeight="700" fill="currentColor">
              {glyph}
            </text>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
