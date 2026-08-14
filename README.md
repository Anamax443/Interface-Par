# Interface-Par

Návrh vzhledu rozhraní pro interní správcovské aplikace — hustý „IT-ops" layout
inspirovaný MikroTik WinBoxem, místo vzdušných Material/Bootstrap šablon.

Repozitář je **záznam rozhodnutí**, ne knihovna. Obsahuje funkční mockup
a rozbor, kdy se vyplatí sáhnout po komponentové knihovně a kdy ne.

## Obsah

| Cesta | Co to je |
|---|---|
| [`mockup/git-nastenka-shell.html`](mockup/git-nastenka-shell.html) | Funkční mockup, jeden soubor, bez závislostí a bez build kroku. Otevři v prohlížeči. |
| [`docs/rozhovor.md`](docs/rozhovor.md) | Průběh návrhu: zadání, zvažované varianty, rozbor React + MUI, doporučení. |

## Mockup

Kostra o čtyřech pásmech: titulní lišta → boční menu s rozbalovacím flyoutem →
toolbar → hustý grid → stavový řádek.

Živé je v něm: výběr řádků (Ctrl+klik = vícenásobný), třídění klikem na hlavičku
sloupce, textový filtr, flyout podmenu a toolbar tlačítka, která jsou neaktivní,
dokud není nic vybráno. Světlý i tmavý režim podle nastavení systému.

Ukázková data jsou smyšlená.

## Vizuální pravidla

Konkrétní rozhodnutí, ze kterých ten vzhled plyne:

- **Hustota** — řádek 26 px, písmo 12,5 px v UI a 12 px v tabulce.
- **Nativní font** — `Segoe UI Variable Text`, ne webfont. Aplikace má vypadat
  jako součást systému, ne jako stránka.
- **Ohraničení místo stínů** — panely dělí linky. Stín má jediný prvek: flyout menu.
- **Rádius 2 px**, nikde ne víc.
- **Jeden akcent** `#31628C` (v tmavém režimu `#6A9CCE`) — výhradně na výběr,
  focus a aktivní položku menu. Nikdy jako dekorace.
- **Barva jako informace** — stav projektu nese malý čtvereček, ne barevná pilulka.
  Sémantické barvy (v pořádku / varování / kritické) jsou oddělené od akcentu.
- **Monospace na data** — identifikátory, časy a počty; číselné sloupce
  s `tabular-nums`, aby lícovaly.
- **Žádná emoji**, žádné gradienty, žádné karty se zaoblenými rohy.

## Použití

Otevři mockup v prohlížeči. Tokeny i markup jsou určené ke zkopírování do
konkrétní aplikace — začni blokem `:root` v `<style>`, tam je celá paleta.
