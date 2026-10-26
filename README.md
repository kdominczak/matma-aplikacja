# Matma 📐

Gamifikowana aplikacja do matury z matematyki (Next.js + Capacitor).

## Start (każdy z nas, raz)

```bash
git clone https://github.com/kdominczak/matma-aplikacja.git
cd matma-aplikacja
npm install
npm run dev
```

Otwórz http://localhost:3000 → „Zacznij lekcję”.

## Aplikacja na Androida

Wymagane: [Android Studio](https://developer.android.com/studio) (z Android SDK).

```bash
npm run android   # build + sync + otwiera Android Studio
```

W Android Studio wybierz emulator lub podłączony telefon i kliknij ▶ Run.
Po każdej zmianie w kodzie webowym: `npm run mobile:sync` i ponownie ▶.

## iOS

Wymaga Maca z Xcode: `npx cap add ios`, potem `npm run ios`.

## Struktura

```
src/
├─ app/            # trasy (App Router)
├─ components/     # quiz/, ui/, gamification/
├─ data/           # przykładowe pytania
├─ lib/            # logika (haptyka, XP, serie…)
└─ types/
android/           # projekt natywny (generowany przez Capacitor, commitujemy)
```

Pytania mogą zawierać wzory LaTeX w `$...$`, np. `"Oblicz $\\sqrt{16}$"`.
