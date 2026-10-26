import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
});

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
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: klasę `dark` dokłada skrypt przed hydratacją
    <html lang="pl" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
