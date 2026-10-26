import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
