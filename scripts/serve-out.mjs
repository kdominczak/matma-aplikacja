// Prosty serwer zbudowanej aplikacji (folder out/ – ten sam, który pakuje Capacitor) do zrzutów ekranu i testów E2E.
// Użycie: node scripts/serve-out.mjs [port]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = join(import.meta.dirname, "..", "out");
const PORT = Number(process.argv[2] ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function resolve(url) {
  const path = normalize(decodeURIComponent(url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  else if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  return existsSync(file) ? file : null;
}

createServer((req, res) => {
  const file = resolve(req.url ?? "/");
  if (!file) {
    const notFound = join(ROOT, "404.html");
    res.writeHead(404, { "content-type": TYPES[".html"] });
    if (existsSync(notFound)) createReadStream(notFound).pipe(res);
    else res.end("404");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`out/ na http://localhost:${PORT}`));
