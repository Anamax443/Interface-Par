// Převede stažená base16 / base24 schémata na sadu tokenů banky a KAŽDÉ z nich
// změří. Paleta pro editor a paleta pro tabulku nejsou totéž: v editoru je
// komentář schválně nevýrazný, v mřížce je to sloupec, který někdo čte.
//
// Výstup: bank/tokens/scheme/<slug>.css + bank/tokens/index.json
//
// Bez závislostí. YAML se tu nečte obecně — schémata mají plochý tvar
// `klíč: "hodnota"` a jednu vnořenou mapu `palette:`, na což stačí pár řádků;
// přidávat kvůli tomu YAML knihovnu by bylo dražší než užitečné.
//
//   node scripts/build-tokens.mjs            jen ta, co projdou měřením
//   node scripts/build-tokens.mjs --all      všechna, i propadlá

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'vendor', 'schemes');
const OUT = join(ROOT, 'bank', 'tokens', 'scheme');

// ---------------------------------------------------------------- barvy

const hex = (h) => {
  const s = h.replace('#', '').trim();
  const v = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
const lum = (rgb) => {
  const s = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// ---------------------------------------------------------------- YAML

function parseScheme(text) {
  const out = { palette: {} };
  let inPalette = false;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (/^palette:/.test(raw)) { inPalette = true; continue; }
    // Hodnota bývá v uvozovkách a je to hex — komentář za ní se smí utnout až
    // za zavírací uvozovkou, jinak by '#' v '#1d2021' vypadalo jako komentář.
    const m = raw.match(/^(\s*)([A-Za-z0-9_-]+):\s*(?:"([^"]*)"|'([^']*)'|([^#]*?))\s*(?:#.*)?$/);
    if (!m) continue;
    const [, indent, key] = m;
    const val = (m[3] ?? m[4] ?? m[5] ?? '').trim();
    if (inPalette && indent.length > 0) out.palette[key] = val;
    else { inPalette = false; out[key] = val; }
  }
  return out;
}

// ---------------------------------------------------------------- mapování
//
// base16 je definované tak, že base00→base07 jde od pozadí k popředí bez
// ohledu na to, jestli je schéma světlé nebo tmavé. Jedno mapování proto
// stačí na obě varianty.
//
//   base00 plocha        base04 tlumený text    base08 červená  base0C azurová
//   base01 lišta         base05 text            base09 oranžová base0D modrá
//   base02 výběr         base06 světlejší text  base0A žlutá    base0E purpurová
//   base03 nejtlumenější base07 nejsvětlejší    base0B zelená   base0F hnědá

// Přímé mapování projde jen u hrstky schémat. Nepadá to na barvách, ale na
// rolích: base03 je barva komentáře — schválně nevýrazná — a base02 je pozadí
// výběru v editoru, kde na něm nikdo nečte celý sloupec.
//
// Oprava zůstává UVNITŘ palety: role, která neprojde, se posune po vlastní
// rampě schématu (base03 → base07) na první člen, který stačí. Žádná barva se
// nedopočítává, jen se sáhne o stupeň vedle. base16 má rampu orientovanou od
// pozadí k popředí i u světlých schémat, takže vyšší index vždy znamená větší
// kontrast proti ploše — jedno pravidlo platí pro obě varianty.
function pickFromRamp(p, startIdx, against, need) {
  const ramp = ['base03', 'base04', 'base05', 'base06', 'base07'];
  for (let i = startIdx; i < ramp.length; i++) {
    const c = p[ramp[i]];
    if (c && ratio(c, against) >= need) return { color: c, slot: ramp[i], moved: i !== startIdx };
  }
  const last = p.base07 || p.base05;
  return { color: last, slot: 'base07', moved: true };
}

function toTokens(p) {
  const pane = p.base00;
  const chrome = p.base01 || p.base00;
  // Hlavička je pruh, na kterém leží tlumený text; ze dvou kandidátů se bere
  // ten, na kterém je čitelnější.
  const head = (ratio(p.base04, p.base01 || p.base00) >= ratio(p.base04, p.base02 || p.base00))
    ? (p.base01 || p.base00) : (p.base02 || p.base00);

  const dim = pickFromRamp(p, 1, pane, 4.5);      // base04 a výš
  const faint = pickFromRamp(p, 0, chrome, 3.0);  // base03 a výš
  const dimOnHead = ratio(dim.color, head) >= 4.0 ? dim : pickFromRamp(p, 1, head, 4.5);

  // Výběr: base02 je editorové pozadí výběru. Když na něm text neprojde,
  // zkusí se lišta (base01), která je ploše blíž.
  const accsoft = ratio(p.base05, p.base02 || p.base01) >= 4.5 ? (p.base02 || p.base01) : chrome;
  // Text na akcentu: z obou konců rampy se bere ten kontrastnější.
  const accfg = ratio(p.base00, p.base0D) >= ratio(p.base07 || p.base05, p.base0D)
    ? p.base00 : (p.base07 || p.base05);

  return {
    tokens: {
      pane, chrome, chromehi: pane, head,
      zebra: chrome, hover: p.base02 || chrome, border: p.base03, bordersoft: p.base02 || chrome,
      text: p.base05, dim: dimOnHead.color, faint: faint.color,
      accent: p.base0D, accsoft, accfg,
      ok: p.base0B, warn: p.base0A, crit: p.base08,
    },
    moved: [
      dimOnHead.moved || dim.moved ? `tlumený text → ${dimOnHead.slot}` : null,
      faint.moved ? `doplňkový text → ${faint.slot}` : null,
      accsoft !== (p.base02 || p.base01) ? 'výběr → base01' : null,
      accfg !== p.base00 ? 'text na akcentu → base07' : null,
    ].filter(Boolean),
  };
}

// Stejné prahy jako kontrola v katalogu. Požadavek / spodní mez.
const CHECKS = [
  ['text v tabulce', (t) => ratio(t.text, t.pane), 4.5, 4.5],
  ['tlumené sloupce', (t) => ratio(t.dim, t.pane), 4.5, 4.0],
  ['doplňkový text', (t) => ratio(t.faint, t.chrome), 3.0, 3.0],
  ['hlavička tabulky', (t) => ratio(t.dim, t.head), 4.5, 4.0],
  ['text na liště', (t) => ratio(t.text, t.chrome), 4.5, 4.0],
  ['text na akcentu', (t) => ratio(t.accfg, t.accent), 4.5, 4.5],
  ['text ve výběru', (t) => ratio(t.text, t.accsoft), 4.5, 4.5],
  ['značka v pořádku', (t) => ratio(t.ok, t.pane), 3.0, 3.0],
  ['značka varování', (t) => ratio(t.warn, t.pane), 3.0, 3.0],
  ['značka kritické', (t) => ratio(t.crit, t.pane), 3.0, 3.0],
];

function audit(t) {
  const rows = CHECKS.map(([label, fn, req, floor]) => {
    const r = fn(t);
    return { label, ratio: Math.round(r * 100) / 100, req, floor,
      verdict: r >= req ? 'pass' : r >= floor ? 'warn' : 'fail' };
  });
  return {
    rows,
    worst: rows.some((r) => r.verdict === 'fail') ? 'fail'
      : rows.some((r) => r.verdict === 'warn') ? 'warn' : 'pass',
  };
}

// ---------------------------------------------------------------- výstup

const esc = (s) => String(s ?? '').replace(/\*\//g, '*\\/');

function css(slug, meta, t, verdict, moved) {
  const line = (k) => `  --l-${k}:${t[k]}; --d-${k}:${t[k]};`;
  return `/* ${esc(meta.name)} — ${esc(meta.system)} ${esc(meta.variant)}
   Autor: ${esc(meta.author)}
   Generováno z vendor/schemes — needitovat, změny přepíše build-tokens.mjs.
   Kontrast: ${verdict}${moved.length ? `
   Posunuté role (uvnitř palety): ${esc(moved.join(', '))}` : ''}

   Schéma nese JEDNU variantu, takže světlá i tmavá sada jsou tu shodné:
   při přepnutí režimu se paleta nemá čím vystřídat. Pokud chceš pár
   světlá/tmavá, vezmi dvě schémata a slep --l-* z jednoho a --d-* z druhého. */
.ui[data-style="${slug}"], :root {
${['pane', 'chrome', 'chromehi', 'head', 'zebra', 'hover', 'border', 'bordersoft',
    'text', 'dim', 'faint', 'accent', 'accsoft', 'accfg', 'ok', 'warn', 'crit'].map(line).join('\n')}

  --radius:2px; --nav-radius:2px; --sel-bar:3px;
  --row-h:26px; --title-h:33px; --tb-h:30px; --panehead-h:26px; --status-h:23px;
  --font-ui:"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif;
  --font-display:var(--font-ui);
  --font-data:"Cascadia Mono",Consolas,monospace;
  --fs-ui:12.5px; --fs-data:12px; --fs-th:11.5px;
  --th-transform:none; --th-ls:0; --th-weight:600;
  --nav-h:27px; --pane-shadow:none; --dot-radius:50%;
}
`;
}

// ---------------------------------------------------------------- běh

if (!existsSync(SRC)) {
  console.error('Chybí vendor/schemes — spusť nejdřív: node scripts/fetch-vendor.mjs');
  process.exit(1);
}

const keepAll = process.argv.includes('--all');
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.yaml'));
const index = [];
let written = 0;
const tally = { pass: 0, warn: 0, fail: 0 };

for (const file of files) {
  const meta = parseScheme(await readFile(join(SRC, file), 'utf8'));
  const p = meta.palette;
  if (!p.base00 || !p.base05 || !p.base0D) { console.warn(`  ! ${file}: neúplná paleta`); continue; }

  const slug = file.replace(/\.yaml$/, '');
  const { tokens: t, moved } = toTokens(p);
  const a = audit(t);
  tally[a.worst]++;

  index.push({
    slug, name: meta.name || slug, author: meta.author || '',
    system: meta.system || '', variant: meta.variant || '',
    verdict: a.worst,
    repaired: moved,
    problems: a.rows.filter((r) => r.verdict !== 'pass').map((r) => `${r.label} ${r.ratio}:1`),
  });

  if (a.worst === 'fail' && !keepAll) continue;
  await writeFile(join(OUT, `${slug}.css`), css(slug, meta, t, a.worst, moved), 'utf8');
  written++;
}

index.sort((x, y) => x.slug.localeCompare(y.slug));
await writeFile(join(ROOT, 'bank', 'tokens', 'index.json'),
  JSON.stringify({
    generated: 'scripts/build-tokens.mjs',
    source: 'vendor/schemes (tinted-theming/schemes@spec-0.11)',
    counts: { total: index.length, ...tally, written },
    note: 'verdict = nejhorší z deseti kontrastních dvojic; fail se nezapisuje, ' +
          'pokud build neběžel s --all',
    schemes: index,
  }, null, 2), 'utf8');

console.log(`Schémat: ${index.length}`);
console.log(`  bez připomínky ${tally.pass} · s výhradou ${tally.warn} · propadlo ${tally.fail}`);
console.log(`Zapsáno ${written} souborů do bank/tokens/scheme/`);
console.log('Přehled i s důvody: bank/tokens/index.json');
