# Katalog vizuálních stylů

Otevři [`../mockup/ui-styly-katalog.html`](../mockup/ui-styly-katalog.html).

Táž aplikace vykreslená ve **čtrnácti stylech**. Markup je ve všech případech
identický — mění se výhradně sada tokenů. To je zároveň hlavní tvrzení celého
katalogu: vzhled je konfigurace, ne přepis aplikace.

Přepínat lze tři věci nezávisle na sobě: **styl**, **světelný režim** a
**obrazovku** (Tabulka / Grafy).

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
| `admin-common` | Běžný admin panel | 6 px | 40 px | **Kontrolní vzorek** — Ant Design default |
| `saas-modern` | Současný SaaS | 8 px | 44 px | **Kontrolní vzorek** — Tailwind / shadcn, stav jako pilulka |
| `vivid-gradient` | Fialový gradient | 12 px | 48 px | **Kontrolní vzorek** — fialovomodrý přechod, barevný stín |

Poslední tři jsou v katalogu schválně: jsou to vzhledy, které dnes vzniknou jako
výchozí volba, a mají sloužit k porovnání. Hlavní rozdíl není barva, ale hustota —
na stejné výšce okna zobrazí `vivid-gradient` deset řádků tam, kde `ledger-mono`
zobrazí dvaadvacet.

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

## Přidání stylu

1. Blok tokenů v oddílu 2 souboru katalogu (světlá i tmavá sada).
2. Záznam v poli `STYLES` v JavaScriptu — slug, název, popis, kdy použít, vzorky.
3. Nic víc. Markup se nemění.
