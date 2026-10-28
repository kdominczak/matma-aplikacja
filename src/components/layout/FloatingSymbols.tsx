"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Rozmyte symbole matematyczne unoszące się w tle ekranu głównego.
 * Głębia = paralaksa: bliższe symbole (większe `depth`) są większe, ostrzejsze
 * i mocniej przesuwają się przy przewijaniu oraz za kursorem.
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
  const { scrollY } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
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
        <FloatingSymbol key={s.glyph} {...s} still={Boolean(reduce)} scrollY={scrollY} mouseX={springX} mouseY={springY} />
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
  scrollY,
  mouseX,
  mouseY,
}: (typeof SYMBOLS)[number] & { still: boolean; scrollY: MotionValue<number>; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const x = useTransform(mouseX, (v) => (still ? 0 : v * -24 * depth));
  const y = useTransform([scrollY, mouseY], ([scroll, my]: number[]) => (still ? 0 : -scroll * 0.25 * depth + my * -24 * depth));

  return (
    <motion.div className="absolute" style={{ top, left, x, y }}>
      <div
        className="animate-float text-brand opacity-[0.07] motion-reduce:animate-none dark:opacity-[0.14]"
        style={{
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          filter: `blur(${(1.2 - depth) * 3}px)`,
        }}
      >
        <svg width={size * (0.6 + depth * 0.4)} height={size * (0.6 + depth * 0.4)} viewBox="0 0 100 100">
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="80" fontWeight="700" fill="currentColor">
            {glyph}
          </text>
        </svg>
      </div>
    </motion.div>
  );
}
