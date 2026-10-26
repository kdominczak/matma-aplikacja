// Proste ikony liniowe 24×24 (bez zewnętrznej biblioteki – mniejszy bundle w aplikacji).
const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  book: "M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z",
  chart: "M3 21h18M6 17V11M11 17V5M16 17v-8M21 17v-4",
  close: "M18 6 6 18M6 6l12 12",
  back: "M15 18l-6-6 6-6",
  chevron: "M9 18l6-6-6-6",
  arrow: "M5 12h14M13 6l6 6-6 6",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z",
  pencil: "M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5zM15 5l4 4",
  eraser: "M7 21h13M5.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 19H8.5z",
  undo: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9z",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 12l3 3 5-6",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  bulb: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 7v5l3 2",
  target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  layers: "M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  sun: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  monitor: "M3 4h18v12H3zM8 20h8M12 16v4",
  crown: "M2 18h20M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5z",
  medal: "M7.2 2h9.6L14 8.5M9.8 8.5 7.2 2M12 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14v4",
  calendar: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  grid: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18",
  square: "M4 4h16v16H4z",
  axes: "M12 3v18M3 12h18M12 3l-2 2M12 3l2 2M21 12l-2-2M21 12l-2 2",
  ruler: "M2 12h20M5 9v6M9 10v4M12 8v8M15 10v4M19 9v6",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
} as const;

export type IconName = keyof typeof PATHS;

type Props = {
  name: IconName;
  className?: string;
  /** Wypełniona wersja (np. gwiazdka, serce). */
  filled?: boolean;
};

export default function Icon({ name, className = "h-5 w-5", filled = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
