// Środowisko przeglądarki w minimalnej wersji: Capacitor Preferences na webie zapisuje do localStorage,
// a moduły sprawdzają `window` (np. przed wołaniem Supabase). Każdy plik testów ma własny, pusty magazyn.

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

const g = globalThis as Record<string, unknown>;
g.localStorage = new MemoryStorage();
g.sessionStorage = new MemoryStorage();
g.window ??= globalThis;
