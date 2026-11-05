// Ikona i ekran startowy Androida z jednego wzoru: złote Σ na graficie (tokeny „Graphite Glass”).
// Użycie: node scripts/android-assets.mjs. Ikona adaptacyjna i ekran startowy Androida 12+ to wektory w res/ (ten sam kształt Σ);
// ten skrypt generuje PNG-i dla starszych Androidów: ic_launcher (API 24–25) i splash (API < 31).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const RES = "android/app/src/main/res";
/** Σ w układzie 108×108 (jak ikona adaptacyjna; bezpieczne pole to środkowe 66×66). */
const SIGMA = "M37,32 H71 V43 H66.5 L65,38.5 H48 L60,54 L48,69.5 H65 L66.5,65 H71 V76 H37 V72 L51,54 L37,36 Z";
const GRAPHITE = "#0b0f19";

const sigma = (id) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3dc8a"/>
      <stop offset="0.55" stop-color="#d4af37"/>
      <stop offset="1" stop-color="#a98520"/>
    </linearGradient>
  </defs>
  <path d="${SIGMA}" fill="url(#${id})"/>`;

const glow = `
  <defs>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#232b3b"/>
      <stop offset="1" stop-color="${GRAPHITE}"/>
    </radialGradient>
  </defs>`;

/** Ikona 108×108 przycięta do kształtu: `radius` w jednostkach układu (54 = koło). */
const iconSvg = (size, radius) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="9 9 90 90">
    ${glow}
    <rect x="9" y="9" width="90" height="90" rx="${radius}" fill="url(#glow)"/>
    ${sigma("gold")}
  </svg>`;

/** Ekran startowy: grafit, Σ na środku (wielkość zależna od krótszego boku). */
const splashSvg = (width, height) => {
  const scale = (Math.min(width, height) * 0.3) / 44;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${GRAPHITE}"/>
    <g transform="translate(${width / 2 - 54 * scale} ${height / 2 - 54 * scale}) scale(${scale})">${sigma("gold")}</g>
  </svg>`;
};

const ICONS = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const SPLASH = {
  drawable: [480, 320],
  "drawable-land-mdpi": [480, 320],
  "drawable-land-hdpi": [800, 480],
  "drawable-land-xhdpi": [1280, 720],
  "drawable-land-xxhdpi": [1600, 960],
  "drawable-land-xxxhdpi": [1920, 1280],
  "drawable-port-mdpi": [320, 480],
  "drawable-port-hdpi": [480, 800],
  "drawable-port-xhdpi": [720, 1280],
  "drawable-port-xxhdpi": [960, 1600],
  "drawable-port-xxxhdpi": [1280, 1920],
};

const browser = await chromium.launch();
const page = await browser.newPage();

async function render(svg, width, height, path) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await page.screenshot({ path, omitBackground: true, clip: { x: 0, y: 0, width, height } });
}

for (const [density, size] of Object.entries(ICONS)) {
  mkdirSync(`${RES}/mipmap-${density}`, { recursive: true });
  await render(iconSvg(size, 20), size, size, `${RES}/mipmap-${density}/ic_launcher.png`);
  await render(iconSvg(size, 45), size, size, `${RES}/mipmap-${density}/ic_launcher_round.png`);
}
for (const [dir, [width, height]] of Object.entries(SPLASH)) {
  await render(splashSvg(width, height), width, height, `${RES}/${dir}/splash.png`);
}

await browser.close();
console.log("Ikona i ekran startowy wygenerowane w", RES);
