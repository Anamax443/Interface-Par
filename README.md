# Interface-Par

Návrh vzhledu rozhraní pro interní správcovské aplikace — hustý „IT-ops" layout
inspirovaný MikroTik WinBoxem, místo vzdušných Material/Bootstrap šablon.

Repozitář je **záznam rozhodnutí**, ne knihovna. Obsahuje funkční mockupy
a rozbor, kdy se vyplatí sáhnout po komponentové knihovně a kdy ne.

## Obsah

| Cesta | Co to je |
|---|---|
| [`mockup/ui-styly-katalog.html`](mockup/ui-styly-katalog.html) | **Katalog 23 vizuálních stylů.** Táž aplikace, přepínatelný styl, světelný režim a obrazovka (tabulka / grafy). Vestavěná **kontrola zobrazení** změří písma, kontrast a hustotu na tvém stroji. Začni tady. |
| [`mockup/git-nastenka-shell.html`](mockup/git-nastenka-shell.html) | Původní mockup kostry — sidebar, toolbar, hustý grid, stavový řádek. |
| [`docs/styly.md`](docs/styly.md) | Popis všech stylů, jak jsou postavené, pravidla pro grafy a barvy dat. |
| [`docs/rozhovor.md`](docs/rozhovor.md) | Průběh návrhu: zadání, zvažované varianty, rozbor React + MUI, doporučení. |

Obojí jsou samostatné soubory bez závislostí a bez build kroku — otevři je
v prohlížeči, nebo je naservíruj jak jsou.

## K čemu to je

Vybrat jeden styl, zapsat jeho slug do zakládaného projektu jako `ui.style`
a mít od začátku jasno, jak bude aplikace vypadat — místo aby se vzhled
dolaďoval dodatečně u každé zvlášť.

Styly jsou pojmenované (`ops-steel`, `winbox-95`, `ticker-black`, …), takže
volba je zapsatelná a přenositelná. Přehled je v [`docs/styly.md`](docs/styly.md).

## Nestandardní vzhled se musí umět zkontrolovat

Čím dál je styl od výchozí šablony, tím spíš se rozbije tiše — chybí písmo,
tlumený odstín zmizí, hustý řádek nepobere text. Katalog proto umí sám sebe
změřit: tlačítko **Zkontrolovat všechny styly** projde všech 23 a u každého
ověří dostupnost písem, kontrast podle WCAG na **skutečně vykreslených
prvcích**, poměr výšky řádku k písmu a přetečení prvků s pevnou výškou.

Volba nestandardního vzhledu tak není sázka — je to měřitelný stav. Podrobnosti
v [`docs/styly.md`](docs/styly.md#kontrola-zobrazení).

## Vizuální pravidla

Konkrétní rozhodnutí za výchozím stylem `ops-steel`:

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

Barvy dat se řídí vlastními pravidly a jsou na stylu **nezávislé** — viz
[`docs/styly.md`](docs/styly.md#barvy-dat--barvy-rozhraní).

## Použití

Otevři katalog v prohlížeči a projdi styly. Tokeny i markup jsou určené
ke zkopírování do konkrétní aplikace — začni blokem odpovídajícího stylu
v `<style>`, tam je celá paleta i rozměry.

Ukázková data ve všech mockupech jsou smyšlená.
