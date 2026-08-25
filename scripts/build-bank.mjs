// Z katalogu odvodí banku: vrstvu komponent a tokeny 23 kurátorovaných stylů.
//
// Katalog zůstává jediným zdrojem pravdy. Kdyby se banka psala ručně, do týdne
// se rozejde s tím, co je v katalogu vidět, a nikdo si toho nevšimne — proto se
// generuje. Ručně se sahá do mockup/ui-styly-katalog.html, ne sem.
//
//   node scripts/build-bank.mjs

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = join(ROOT, 'mockup', 'ui-styly-katalog.html');
const BANK = join(ROOT, 'bank');

const html = await readFile(CATALOG, 'utf8');
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];

// Oddíly jsou v katalogu vyznačené komentářem; dělí se podle nich, ne podle
// pořadí, aby vložení dalšího bloku nerozhodilo generátor.
const at = (needle) => {
  const i = style.indexOf(needle);
  if (i < 0) throw new Error(`v katalogu chybí značka oddílu: ${needle}`);
  return i;
};
// Značka oddílu leží uvnitř komentáře, takže řez začne v jeho půlce. Zbytek
// hlavičky se musí useknout, jinak visí na selektoru prvního pravidla a to se
// pak nepozná (ops-steel takhle z banky vypadl).
const cut = (s) => { const i = s.indexOf('*/'); return i < 0 ? s : s.slice(i + 2); };
const secTokens = cut(style.slice(at('2. TOKENY STYLŮ'), at('3. MAPOVÁNÍ')));
const secApp = cut(style.slice(at('3. MAPOVÁNÍ')));

// ---------------------------------------------------------------- rozklad CSS
//
// Plnohodnotný parser tu není potřeba: stačí umět projít pravidla a at-pravidla
// a nechat jejich obsah být.

function rules(css) {
  const out = [];
  let depth = 0, start = 0, selStart = 0, sel = '';
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const stop = end < 0 ? css.length : end + 2;
      // Komentář mezi pravidly se veze dál (vysvětlení jsou to nejcennější,
      // co v katalogu je), ale NESMÍ zůstat nalepený na selektoru dalšího
      // pravidla — jinak se `.preview[data-style="x"]` přestane poznat.
      if (depth === 0 && !css.slice(selStart, i).trim()) {
        out.push({ comment: css.slice(i, stop) });
        selStart = stop;
      }
      i = stop - 1;
      continue;
    }
    if (c === '{') {
      if (depth === 0) { sel = css.slice(selStart, i).trim(); start = i + 1; }
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) { out.push({ sel, body: css.slice(start, i) }); selStart = i + 1; }
    }
  }
  return out;
}

// `.preview` je v katalogu obal náhledu; v bance je to `.ui`. Holé selektory
// (`.p-table`, `.dim`) se musí zanořit, jinak by banka přebarvila celou stránku,
// do které se vloží.
function scope(sel) {
  return sel.split(',').map((s) => {
    const t = s.trim();
    if (!t) return t;
    if (t.includes('.preview')) return t.replace(/\.preview/g, '.ui');
    if (t.startsWith('.ui')) return t;
    return `.ui ${t}`;
  }).join(', ');
}

function render(list) {
  return list.map((r) => (r.comment ? r.comment : `${r.sel} {${r.body}}`)).join('\n');
}

function process(css) {
  return rules(css).map((r) => {
    if (r.comment) return r;
    const { sel, body } = r;
    if (sel.startsWith('@media') || sel.startsWith('@supports')) {
      return { sel, body: '\n' + render(rules(body).map((r) => ({ sel: '  ' + scope(r.sel), body: r.body }))) + '\n' };
    }
    if (sel.startsWith('@')) return { sel, body };
    return { sel: scope(sel), body };
  });
}

// ---------------------------------------------------------------- tokeny stylů

const HEAD = (what) => `/* ${what}
   GENEROVÁNO skriptem scripts/build-bank.mjs z mockup/ui-styly-katalog.html.
   Needitovat — změny se přepíšou. Uprav katalog a spusť generátor znovu. */

`;

await rm(join(BANK, 'tokens', 'style'), { recursive: true, force: true });
await mkdir(join(BANK, 'tokens', 'style'), { recursive: true });

const tokenRules = rules(secTokens);
const bySlug = new Map();
for (const r of tokenRules) {
  if (r.comment) continue;
  const m = r.sel.match(/^\.preview\[data-style="([a-z0-9-]+)"\]\s*$/);
  if (m) { bySlug.set(m[1], { tokens: r, extra: [] }); continue; }
  // Strukturální odchylky stylu patří k jeho tokenům, ne do sdílené vrstvy.
  const m2 = r.sel.match(/\.preview\[data-style="([a-z0-9-]+)"\]/);
  if (m2 && bySlug.has(m2[1])) bySlug.get(m2[1]).extra.push(r);
}

for (const [slug, { tokens, extra }] of bySlug) {
  const body = [
    HEAD(`Tokeny stylu ${slug}`),
    `.ui[data-style="${slug}"], .ui {${tokens.body}}`,
    extra.length ? '\n\n/* strukturální odchylky tohoto stylu */\n' + render(process(render(extra))) : '',
  ].join('');
  await writeFile(join(BANK, 'tokens', 'style', `${slug}.css`), body, 'utf8');
}

// ---------------------------------------------------------------- vrstva komponent

const app = render(process(secApp));
await writeFile(join(BANK, 'ui.css'),
  HEAD('Vrstva komponent banky — skořápka, tabulka, menu, rozvržení, grafy') +
  '/* Všechno je zanořené pod .ui, takže se to nemíchá se stylem stránky,\n' +
  '   do které se banka vloží. Tokeny nesou soubory v tokens/. */\n\n' + app + '\n',
  'utf8');

// ---------------------------------------------------------------- písma

await writeFile(join(BANK, 'fonts.css'), `/* Vendorovaná písma — soubory stahuje scripts/fetch-vendor.mjs do vendor/fonts.

   Proč vůbec: Cascadia Mono na běžné stanici není (chodí s Terminálem a VS Code)
   a Inter na Windows taky ne. Bez vlastní kopie se vykreslí náhrada, což změní
   metriku a řádek přestane sedět na výšku, kterou má z tokenu.

   latin-ext není volitelný — bez něj chybí ř, ě, š, č, ů a prohlížeč je dokreslí
   jiným písmem uprostřed slova.

   Cesta počítá s tím, že vendor/ je vedle bank/. Když to tak nemáš, přepiš url(). */

@font-face {
  font-family: "Cascadia Mono"; font-style: normal; font-weight: 400; font-display: swap;
  src: url("../vendor/fonts/cascadia-mono-latin-400-normal.woff2") format("woff2");
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: "Cascadia Mono"; font-style: normal; font-weight: 400; font-display: swap;
  src: url("../vendor/fonts/cascadia-mono-latin-ext-400-normal.woff2") format("woff2");
  unicode-range: U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face {
  font-family: "Cascadia Mono"; font-style: normal; font-weight: 700; font-display: swap;
  src: url("../vendor/fonts/cascadia-mono-latin-700-normal.woff2") format("woff2");
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: "Cascadia Mono"; font-style: normal; font-weight: 700; font-display: swap;
  src: url("../vendor/fonts/cascadia-mono-latin-ext-700-normal.woff2") format("woff2");
  unicode-range: U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face {
  font-family: "Inter"; font-style: normal; font-weight: 400; font-display: swap;
  src: url("../vendor/fonts/inter-latin-400-normal.woff2") format("woff2");
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: "Inter"; font-style: normal; font-weight: 400; font-display: swap;
  src: url("../vendor/fonts/inter-latin-ext-400-normal.woff2") format("woff2");
  unicode-range: U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face {
  font-family: "Inter"; font-style: normal; font-weight: 600; font-display: swap;
  src: url("../vendor/fonts/inter-latin-600-normal.woff2") format("woff2");
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: "Inter"; font-style: normal; font-weight: 600; font-display: swap;
  src: url("../vendor/fonts/inter-latin-ext-600-normal.woff2") format("woff2");
  unicode-range: U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
`, 'utf8');

console.log(`bank/ui.css            ${(app.length / 1024).toFixed(0)} kB`);
console.log(`bank/fonts.css         8 rodin/řezů`);
console.log(`bank/tokens/style/     ${bySlug.size} kurátorovaných stylů`);
console.log('Palety ze schémat generuje samostatně scripts/build-tokens.mjs.');
