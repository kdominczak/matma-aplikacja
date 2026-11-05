import { describe, expect, it } from "vitest";
import { decideBack } from "@/lib/back-button";

describe("przycisk „wstecz” na Androidzie", () => {
  it("najpierw zamyka nakładkę – także na ekranie głównym", () => {
    expect(decideBack({ overlays: 1, path: "/zadania/ciagi/", canGoBack: true })).toBe("overlay");
    expect(decideBack({ overlays: 2, path: "/", canGoBack: false })).toBe("overlay");
  });

  it("wraca do poprzedniego ekranu, a bez historii – na ekran główny", () => {
    expect(decideBack({ overlays: 0, path: "/profil/", canGoBack: true })).toBe("history");
    expect(decideBack({ overlays: 0, path: "/profil/", canGoBack: false })).toBe("home");
  });

  it("zamyka aplikację dopiero na ekranie głównym", () => {
    expect(decideBack({ overlays: 0, path: "/", canGoBack: true })).toBe("exit");
    expect(decideBack({ overlays: 0, path: "/index.html", canGoBack: false })).toBe("exit");
  });
});
