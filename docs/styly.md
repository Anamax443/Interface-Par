# Katalog vizuálních stylů

Otevři [`../mockup/ui-styly-katalog.html`](../mockup/ui-styly-katalog.html).

Táž aplikace vykreslená ve **dvaceti třech stylech**. Markup je ve všech případech
identický — mění se výhradně sada tokenů. To je zároveň hlavní tvrzení celého
katalogu: vzhled je konfigurace, ne přepis aplikace.

Přepínat lze čtyři věci nezávisle na sobě: **styl**, **rozvržení**,
**světelný režim** a **obrazovku** (Tabulka / Grafy). Pod náhledem je navíc
**kontrola zobrazení**,
která změří vykreslenou stránku a řekne, jestli styl na tomhle stroji drží —
viz [Kontrola zobrazení](#kontrola-zobrazení).

## Styly

| Slug | Název | Rádius | Řádek | Čím se odlišuje |
|---|---|---|---|---|
| `ops-steel` | Správcovská konzole | 2 px | 26 px | WinBox. Nativní písmo, ohraničení místo stínů, ocelová modrá |
| `carbon-grid` | Enterprise datová mřížka | 0 px | 32 px | IBM Carbon. Tvrdá mřížka, větší písmo, bez zebry |
| `fluent-win` | Nativní Windows aplikace | 5 px | 32 px | Win11. Vrstvené šedé, jemný stín, položka menu jako pilulka |
| `console-dark` | Monitorovací konzole | 1 px | 24 px | Neproporcionální písmo i v menu, okrová, tmavá primárně |
| `paper-doc` | Tiskový výkaz | 0 px | 30 px | Cambria v nadpisech i číslech, vlasové linky, tlumená zelená |
| `ledger-mono` | Finanční terminál | 1 px | 22 px | Nejhustší. Hlavičky verzálkami, akcent ustupuje stavům |
| `blueprint-dense` | Datový terminál | 2 px | 28 px | Palantir Blueprint. Ve tmě modrošedý podklad místo černé |
| `swiss-rule` | Švýcarská mřížka | 0 px | 28 px | Černé strukturní linky, jediná červená, grotesk i v číslech |
| `nord-calm` | Tlumená arktická | 3 px | 27 px | Paleta Nord. Odbarvené modrošedé, nižší kontrast |
| `zinc-mute` | Bez akcentní barvy | 2 px | 26 px | Výběr je šedý. Barva výhradně ve stavovém sloupci |
| `contrast-a11y` | Vysoký kontrast | 0 px | 34 px | Ohraničení 2 px, písmo 15 px. Nejnižší hustota |
| `winbox-95` | Nástrojové okno Win32 | 0 px | 20 px | WinBox doslova. Plastické okraje, výběr celý řádek plnou modrou |
| `turbo-tui` | Textová konzole | 0 px | 22 px | Turbo Vision. Dvojité rámečky, mono všude, šestnáctibarevná paleta |
| `hmi-slate` | Velín | 0 px | 30 px | SCADA / HMI. Ohraničení 2 px, sytá signalizace, čitelné z dálky |
| `ticker-black` | Burzovní terminál | 0 px | 20 px | Čerň bez rámečků, jantarové hlavičky, sloupce dělí barva |
| `solar-parchment` | Teplá tlumená | 2 px | 27 px | Paleta Solarized. Pergamen místo bílé, teplý protipól Nordu |
| `mono-brutal` | Brutalistická | 0 px | 28 px | Linky 2 px, posunutý plný stín, invertovaná hlavička, žlutá |
| `gruvbox-warm` | Gruvbox | 2 px | 26 px | Převzatá paleta morhetz/gruvbox — retro teplé tóny |
| `catppuccin-soft` | Catppuccin | 6 px | 30 px | Převzatá paleta Latte + Mocha — levandulové neutrály, pastely |
| `tokyo-night` | Tokyo Night | 4 px | 27 px | Převzatá paleta Night + Day — modrofialová, chladné akcenty |
| `admin-common` | Běžný admin panel | 6 px | 40 px | **Kontrolní vzorek** — Ant Design default |
| `saas-modern` | Současný SaaS | 8 px | 44 px | **Kontrolní vzorek** — Tailwind / shadcn, stav jako pilulka |
| `vivid-gradient` | Fialový gradient | 12 px | 48 px | **Kontrolní vzorek** — fialovomodrý přechod, barevný stín |

Poslední tři jsou v katalogu schválně: jsou to vzhledy, které dnes vzniknou jako
výchozí volba, a mají sloužit k porovnání. Hlavní rozdíl není barva, ale hustota —
na stejné výšce okna zobrazí `vivid-gradient` deset řádků tam, kde `ticker-black`
zobrazí pětadvacet.

### Převzaté palety

`solar-parchment`, `gruvbox-warm`, `catppuccin-soft` a `tokyo-night` nejsou
vymyšlené — jsou to zveřejněné palety (Solarized, gruvbox, Catppuccin, Tokyo
Night) v jejich původních hodnotách. **Plochy jim odpovídají přesně**, ale role,
které nesou text a stavové značky, jsou posunuté na tmavší členy téže palety:
původní odstíny pro popisky mají na svém podkladu kontrast pod 3:1 a kontrola
zobrazení je právem shazovala. Je to vědomá odchylka — paleta jako zdroj barev,
ne jako závazné mapování na role.

## Rozvržení

Styl mění tokeny, **rozvržení mění kostru okna** — jsou to dvě nezávislé osy
a dají se kombinovat (23 × 5). Obsah je ve všech případech tentýž: vodorovné
menu se klonuje z bočního, detail i konzole jsou v markupu vždy a jen se
odkrývají. Neexistuje tedy druhý zdroj pravdy o položkách menu.

| Slug | Název | Kdy sáhnout |
|---|---|---|
| `side-nav` | Boční panel | Výchozí. Do ~12 položek menu, které je pořád vidět |
| `top-tabs` | Horní menu | **Bez bočního panelu.** Když je potřeba celá šířka na data — široké tabulky s hodně sloupci |
| `rail` | Úzká lišta | Kompromis: svislá navigace zůstane, ale vrátí ~140 px šířky. Popisek nese `title` |
| `master-detail` | Seznam + detail | Inventáře: vyber řádek → napravo je o něm všechno, bez otevírání dialogu |
| `split-console` | Mřížka + konzole | Úlohy, které běží: data nahoře, průběh dole. Sběrače, importy, měření |

### Kde má horní menu strop

`top-tabs` je pohodlný do zhruba **deseti až dvanácti položek**. Za tím se
záložky přestanou vejít na šířku a je potřeba se rozhodnout: posuvný pás,
sbalení do nabídek, nebo přechod na `rail` / `side-nav`. Samo se to nevyřeší —
bez ošetření se pás buď zalomí, nebo vytlačí ovládání na pravé straně lišty.

V katalogu je pás **posuvný** (`overflow-x: auto`) a řádek mřížky má výšku
`auto` s dolní mezí. To druhé není detail: posuvník si ukousne kus výšky, a
kdyby byla výška pevná, záložka by se do pásu přestala vejít. Kontrola
zobrazení to odhalila u **všech 23 stylů** naráz.

## Jak jsou styly postavené

Každý styl je jeden blok CSS proměnných se **světlou i tmavou sadou** naráz:

```css
.preview[data-style="ops-steel"] {
  --l-pane:#ffffff;  --d-pane:#1f2226;
  --l-accent:#31628c; --d-accent:#6a9cce;
  --radius:2px; --row-h:26px; --font-ui:"Segoe UI Variable Text",…;
}
```

Mapování na aktivní sadu je až o úroveň výš a je pro všechny styly společné:

```css
.preview                      { --pane: var(--l-pane); }
@media (prefers-color-scheme: dark) { .preview { --pane: var(--d-pane); } }
:root[data-theme="light"] .preview { --pane: var(--l-pane); }
:root[data-theme="dark"]  .preview { --pane: var(--d-pane); }
```

Díky tomu má každý styl **jediný** blok, ne čtyři, a přidání dalšího stylu je
jeden blok tokenů plus jeden záznam v poli `STYLES` v JavaScriptu.

## Barvy dat ≠ barvy rozhraní

Tohle je oddělené záměrně a je to důležitější než volba stylu:

- **Akcent je barva rozhraní.** Označuje výběr, focus a aktivní položku menu.
  Mění se se stylem.
- **Barva série je identita dat.** Nemění se nikdy — ani se stylem, ani
  s filtrem. Kdyby se překreslila, čtenář, který se naučil „uhrazeno je modré“,
  je uveden v omyl.

Proto jsou `--viz-1`, `--viz-2`, `--viz-pos` a `--viz-neg` definované jednou pro
celý katalog, mimo bloky stylů. Se světelným režimem se přebarvují (jiný podklad
vyžaduje jiný krok téže barvy), se stylem ne.

Použitá paleta je ověřená skriptem, ne odhadem — všech šest kontrol (pásmo
světlosti, práh sytosti, odstup pro barvoslepé, odstup pro běžné vidění, kontrast
proti podkladu) prošlo v obou režimech, a to na **nejhorších podkladech
z katalogu**: `#ffffff` ve světlém a `#2f343c` (blueprint) v tmavém.

| Role | Světlá | Tmavá |
|---|---|---|
| Série 1 (uhrazeno, náklady) | `#2a78d6` | `#3987e5` |
| Série 2 (předpis) | `#eb6834` | `#d95926` |
| Kladný pól (přeplatek) | `#2a78d6` | `#3987e5` |
| Záporný pól (nedoplatek) | `#e34948` | `#e66767` |

## Grafy

Na obrazovce **Vyúčtování** jsou tři grafy, každý ukazuje jinou práci barvy:

1. **Uhrazeno po měsících** — sloupce s referenční čárou předpisu. Dvě série,
   tedy legenda. Přímý popisek nese jediný sloupec, poslední; zbytek hodnot
   nese osa, bublina a tabulka.
2. **Náklady podle kategorie** — vodorovné sloupce. Jedna série znamená
   **jednu barvu pro všechny sloupce**; odstupňovat je podle velikosti by
   dvakrát zakódovalo tutéž informaci. Řazeno sestupně, bez legendy.
3. **Saldo podle osoby** — rozbíhavé sloupce kolem nuly. Modrá a červená jako
   protilehlé póly, symetrická osa, aby ramena byla souměrná.

Pravidla, která platí pro všechny tři:

- Sloupce nejvýš 24 px, **zaoblená datová hrana, hranatá pata**.
- Mřížka a osy vlasové a jednobarevné, nikdy čárkované.
- **Text nikdy nenese barvu dat.** Identitu nese barevná značka vedle popisku.
- Bublina hodnotu jen **doplňuje**. Každý graf má pod sebou tabulkové dvojče
  (`Zobrazit jako tabulku`), takže se k číslu dostane i ten, kdo na graf nedosáhne
  myší.
- Popisky výběrově. Číslo u každého bodu je chaos a nikdo ho nečte.

## Kontrola zobrazení

Nestandardní vzhled má jednu nevýhodu: rozbije se tiše. Písmo na cizím stroji
chybí, tlumený odstín se na jiném podkladu ztratí, hustý řádek nepobere text.
Katalog proto pod náhledem nese tlačítka **Zkontrolovat tento styl** /
**Zkontrolovat všechny styly**, která měří **skutečně vykreslenou stránku**
v tomhle prohlížeči — ne deklarované tokeny.

| Skupina | Co se měří |
|---|---|
| Písma | Jestli je první rodina ze stacku na stroji opravdu k dispozici. Když ne, řekne, co se vykreslí místo ní. Zjišťuje se měřením šířky textu, ne dotazem na systém. |
| Kontrast | Dvanáct dvojic popředí/pozadí odečtených z **živých prvků** (text řádku, poznámka, hlavička, titulek, stavový řádek, vybraná položka menu, vybraný řádek, stavové značky). Průhledné pozadí se skládá přes rodiče, počítá se i `opacity`. |
| Hustota | Poměr výšky řádku k velikosti písma dat a počet řádků na 500 px. |
| Rozměry | Přetečení prvků, které mají výšku danou tokenem — tam se text nemá kam podět a překryl by sousední řádek. Prvky s vlastním posuvníkem se přeskakují. |

Kontrola běží vždy proti **právě zvolenému rozvržení** a měří jen **viditelné**
prvky — v rozvržení bez bočního panelu je postranní menu `display:none` a
nemá smysl je měřit. Co v daném rozvržení není (nadpis sekce menu ve
vodorovné nabídce), se hlásí jako „netýká se", ne jako vada.

Prahy jsou dvojí: **požadavek** (WCAG AA, 4,5:1 na text a 3:1 na grafický
prvek) a **spodní mez**. Mezi nimi je výhrada, pod ní chyba. Nižší mez mají
jen položky, které nejsou souvislý text — poznámka za jménem, tlumené sloupce
s datem a VS, souhrn ve stavovém řádku.

Kontrola není dekorace — přinesla čtyři skutečné opravy:

- třída `.dim` sahala po roli `--faint` (doplňkové značky), i když nese
  běžný text; v **žádném** stylu neměla 4,5:1. Přepnuta na `--dim`.
- položka menu se při širším písmu zalomila na druhý řádek a **přetekla přes
  následující** — výška je daná tokenem. Popisek teď zůstává na jednom řádku
  a ořízne se, plné znění nese `title`.
- `turbo-tui` měl kvůli dvojitému rámečku o 3 px nižší lištu, než potřeboval,
  a ve světlém režimu bílý text na světlém výběru (1,5:1).
- `carbon-grid`, `nord-calm`, `winbox-95` a `blueprint-dense` měly bílý text
  na akcentu mezi 2,9 a 4,1:1.
- rozvržení `top-tabs` padalo u **všech 23 stylů**: na užším okně se objeví
  vodorovný posuvník, ukousne si výšku pásu a záložka se do něj přestane
  vejít. Řádek mřížky je proto `auto` s dolní mezí, ne pevná výška.

Zbylé nálezy jsou vědomé: kontrolní vzorky (`admin-common`, `saas-modern`,
`vivid-gradient`) neprocházejí schválně — je to součást jejich sdělení — a
`swiss-rule` hlásí náhradu Helvetiky Arialem, což je na Windows očekávané.

## Přidání stylu

1. Blok tokenů v oddílu 2 souboru katalogu (světlá i tmavá sada).
2. Záznam v poli `STYLES` v JavaScriptu — slug, název, popis, kdy použít, vzorky.
3. Spustit **Zkontrolovat všechny styly** a projít, co nový styl shodil.
4. Nic víc. Markup se nemění.

## Přidání rozvržení

1. Blok `\u005b data-layout="slug" \u005d` s mřížkou (`grid-template-*`) a s tím,
   co se odkrývá nebo skrývá.
2. Tlačítko v přepínači `#layoutswitch`.
3. Projet kontrolu **v tom novém rozvržení** — nálezy se liší podle kostry,
   ne podle stylu.
