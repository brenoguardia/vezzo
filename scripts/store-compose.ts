// Compõe uma imagem de loja (Google Play, 1080 × 1920): legenda + moldura de celular + captura do emulador.
// Uso: bun scripts/store-compose.ts <captura.png> <saida.png> "<legenda>" "<trecho em destaque>"
// Ex.: bun scripts/store-compose.ts /tmp/cap.png docs/loja/screenshots/pt-BR/07-presente.png "Uma meta," "um presente"
// A legenda é "<legenda> <destaque>" (o destaque sai na cor de destaque do app). Precisa do Google Chrome (headless).
// Captura: ver "Como refazer as capturas" em docs/12-publicacao.md.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CHROME = process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FONT = resolve(
  import.meta.dirname,
  "../node_modules/@expo-google-fonts/manrope/800ExtraBold/Manrope_800ExtraBold.ttf",
);

const [shot, out, caption, highlight] = process.argv.slice(2);
if (!shot || !out || !caption || !highlight) {
  console.error('Uso: bun scripts/store-compose.ts <captura.png> <saida.png> "<legenda>" "<destaque>"');
  process.exit(1);
}

const image = `data:image/png;base64,${readFileSync(resolve(shot)).toString("base64")}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Manrope; font-weight: 800; src: url("file://${FONT}"); }
html, body { margin: 0; width: 1080px; height: 1920px; background: #121413; overflow: hidden; }
body { position: relative; font-family: Manrope, sans-serif; }
.glow { position: absolute; inset: 0; background: radial-gradient(ellipse 620px 900px at 50% 1080px, rgba(185, 217, 76, 0.075), transparent 70%); }
h1 { position: absolute; top: 74px; left: 0; right: 0; margin: 0; text-align: center; font-weight: 800; font-size: 69px; line-height: 96px; letter-spacing: -2.1px; color: #f2f3ef; white-space: nowrap; }
h1 em { font-style: normal; color: #b9d94c; }
.phone { position: absolute; left: 174px; top: 268px; width: 720px; height: 1622px; border: 6px solid #2e332f; border-radius: 82px; overflow: hidden; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55); background: #121413; }
.phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
</style></head><body><div class="glow"></div>
<h1>${caption} <em>${highlight}</em></h1>
<div class="phone"><img src="${image}"></div></body></html>`;

const page = join(tmpdir(), `vezzo-store-${process.pid}.html`);
writeFileSync(page, html);
const result = spawnSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1080,1920",
    "--virtual-time-budget=4000",
    `--screenshot=${resolve(out)}`,
    `file://${page}`,
  ],
  { stdio: "ignore" },
);
if (result.status !== 0) {
  console.error("Chrome falhou (defina CHROME_BIN se ele estiver em outro caminho).");
  process.exit(1);
}
console.log(`Gerado: ${out}`);
