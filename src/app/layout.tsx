import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import BackgroundServices from "@/components/layout/BackgroundServices";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

// Graphite Glass: Inter – treść i wzory obok tekstu (czytelny przy małych rozmiarach), Outfit – nagłówki i duże liczby
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Matma – matura z matematyki",
  description: "Krótkie, codzienne lekcje do matury z matematyki.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // pozwala używać env(safe-area-inset-*) przy notchu
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: klasę `dark` dokłada skrypt przed hydratacją
    <html lang="pl" className={`${inter.variable} ${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">
        <BackgroundServices />
        {children}
      </body>
    </html>
  );
}
