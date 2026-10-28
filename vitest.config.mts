import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        // logika aplikacji – z atrapą localStorage i `window` (tests/setup.ts)
        resolve: { alias },
        test: { name: "app", include: ["tests/**/*.test.ts"], exclude: ["tests/db/**"], environment: "node", setupFiles: ["tests/setup.ts"] },
      },
      {
        // migracje Supabase w PGlite – bez atrapy przeglądarki (PGlite wybiera po niej sposób ładowania)
        resolve: { alias },
        test: { name: "db", include: ["tests/db/**/*.test.ts"], environment: "node", testTimeout: 30_000, hookTimeout: 60_000 },
      },
    ],
  },
});
