// Stáhne do projektu to, co se nedá napsat: písma a hotová barevná schémata.
//
// Proč vendorovat a ne linkovat CDN: aplikace běží ve vnitřní síti, kde se ven
// nemusí dostat, a písmo, které se nenačte, mění metriku celého rozhraní —
// řádek přestane sedět na výšku. Stažené soubory jsou součástí projektu.
//
// Bez závislostí. Node 18+ (fetch je vestavěný).
//
//   node scripts/fetch-vendor.mjs           vše
//   node scripts/fetch-vendor.mjs fonts     jen písma
//   node scripts/fetch-vendor.mjs schemes   jen schémata

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'vendor');

// Písma se berou z balíčků @fontsource, protože ty publikují rovnou .woff2 po
// podmnožinách. Oficiální release jsou .zip s TTF — rozbalovat archiv bez
// závislosti nemá cenu, když existuje přímý soubor.
//
// latin-ext NENÍ volitelný: bez něj nemá písmo ř, ě, š, č, ů a prohlížeč je
// dokreslí náhradním písmem uprostřed slova.
const FONTS = [
  ['cascadia-mono-latin-400-normal.woff2', '@fontsource/cascadia-mono/files/cascadia-mono-latin-400-normal.woff2'],
  ['cascadia-mono-latin-700-normal.woff2', '@fontsource/cascadia-mono/files/cascadia-mono-latin-700-normal.woff2'],
  ['cascadia-mono-latin-ext-400-normal.woff2', '@fontsource/cascadia-mono/files/cascadia-mono-latin-ext-400-normal.woff2'],
  ['cascadia-mono-latin-ext-700-normal.woff2', '@fontsource/cascadia-mono/files/cascadia-mono-latin-ext-700-normal.woff2'],
  ['inter-latin-400-normal.woff2', '@fontsource/inter/files/inter-latin-400-normal.woff2'],
  ['inter-latin-600-normal.woff2', '@fontsource/inter/files/inter-latin-600-normal.woff2'],
  ['inter-latin-ext-400-normal.woff2', '@fontsource/inter/files/inter-latin-ext-400-normal.woff2'],
  ['inter-latin-ext-600-normal.woff2', '@fontsource/inter/files/inter-latin-ext-600-normal.woff2'],
];

const JSDELIVR = 'https://cdn.jsdelivr.net/npm/';

// tinted-theming/schemes — 337 base16 + 196 base24 palet v jednom formátu.
// Větev spec-0.11, ne main; main v tomhle repozitáři neexistuje.
const SCHEMES_REPO = 'tinted-theming/schemes';
const SCHEMES_REF = 'spec-0.11';

async function get(url, asText) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return asText ? res.text() : Buffer.from(await res.arrayBuffer());
}

async function fetchFonts() {
  const dir = join(VENDOR, 'fonts');
  await mkdir(dir, { recursive: true });
  let bytes = 0;
  for (const [name, path] of FONTS) {
    const target = join(dir, name);
    if (existsSync(target)) { console.log(`  = ${name} (už je)`); continue; }
    const buf = await get(JSDELIVR + path, false);
    await writeFile(target, buf);
    bytes += buf.length;
    console.log(`  + ${name} (${(buf.length / 1024).toFixed(0)} kB)`);
  }
  await writeFile(join(dir, 'LICENSE.md'),
    '# Licence vendorovaných písem\n\n' +
    '- **Cascadia Mono** — Microsoft, SIL Open Font License 1.1.\n' +
    '  https://github.com/microsoft/cascadia-code\n' +
    '- **Inter** — Rasmus Andersson, SIL Open Font License 1.1.\n' +
    '  https://github.com/rsms/inter\n\n' +
    'OFL 1.1 dovoluje šíření i vložení do produktu. Soubory se sem stahují\n' +
    'skriptem `scripts/fetch-vendor.mjs` z balíčků @fontsource.\n');
  console.log(`  písma: ${(bytes / 1024).toFixed(0)} kB staženo`);
}

async function fetchSchemes() {
  const dir = join(VENDOR, 'schemes');
  await mkdir(dir, { recursive: true });

  const tree = JSON.parse(await get(
    `https://api.github.com/repos/${SCHEMES_REPO}/git/trees/${SCHEMES_REF}?recursive=1`, true));
  if (tree.truncated) console.warn('  ! výpis stromu je zkrácený, něco chybí');

  const files = tree.tree
    .filter((t) => /^base(16|24)\/.+\.yaml$/.test(t.path))
    .map((t) => t.path);
  console.log(`  ${files.length} schémat v ${SCHEMES_REPO}@${SCHEMES_REF}`);

  // Po dávkách, ať se neotevře pět set spojení naráz.
  const BATCH = 12;
  let done = 0;
  for (let i = 0; i < files.length; i += BATCH) {
    const chunk = files.slice(i, i + BATCH);
    await Promise.all(chunk.map(async (path) => {
      const target = join(dir, path.replace('/', '-'));
      if (existsSync(target)) return;
      const txt = await get(
        `https://raw.githubusercontent.com/${SCHEMES_REPO}/${SCHEMES_REF}/${path}`, true);
      await writeFile(target, txt, 'utf8');
    }));
    done += chunk.length;
    process.stdout.write(`\r  staženo ${done}/${files.length}`);
  }
  process.stdout.write('\n');

  await writeFile(join(dir, 'SOURCE.md'),
    `# Zdroj barevných schémat\n\n` +
    `Repozitář **${SCHEMES_REPO}**, větev \`${SCHEMES_REF}\` — ${files.length} palet\n` +
    `ve formátu base16 / base24 (MIT).\n\n` +
    `Stahuje \`scripts/fetch-vendor.mjs\`, na tokeny je převádí\n` +
    `\`scripts/build-tokens.mjs\`. Ručně se sem nesahá.\n`);
}

const what = process.argv[2] || 'all';
try {
  if (what === 'all' || what === 'fonts') { console.log('Písma:'); await fetchFonts(); }
  if (what === 'all' || what === 'schemes') { console.log('Schémata:'); await fetchSchemes(); }
  console.log('Hotovo. Dál: node scripts/build-tokens.mjs');
} catch (e) {
  console.error('CHYBA:', e.message);
  process.exit(1);
}
