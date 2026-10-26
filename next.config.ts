import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor pakuje statyczne pliki z folderu `out/` – bez serwera Node.js.
  // Dlatego: brak Server Actions, API Routes, cookies() itp. Backend = Supabase.
  output: "export",
  trailingSlash: true, // /quiz → quiz/index.html (pewniejsze w WebView)
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
