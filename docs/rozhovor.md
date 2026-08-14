# Průběh návrhu

Záznam rozhovoru, ze kterého vznikl mockup v [`../mockup/git-nastenka-shell.html`](../mockup/git-nastenka-shell.html).
Datum: 14. 8. 2026.

---

## 1. Výchozí otázka: k čemu je Material UI

Podnětem byla stránka [MUI — Getting Started / Usage](https://mui.com/material-ui/getting-started/usage/).
Ta ukazuje minimální příklad, jak v Reactu vykreslit MUI komponentu, nastavit
`CssBaseline` a viewport meta. Je to quick-start pro **React** aplikaci.

Proč to na stávající projekty nesedí:

- MUI je React knihovna. Vyžaduje React a bundler. Aplikace běžící jako
  Cloudflare Worker, který servíruje HTML string bez build kroku, MUI přes
  `<script>` tag nepřipojí.
- Existující interní nástroje běží na Node/TS s vlastním frontendem, nebo
  na Blazoru — ani jedno není React.
- Na vzhled už existuje vlastní standard v IT-ops stylu. MUI by ho přebilo
  Material Designem.

Smysl by to mělo, kdyby nová aplikace vznikala jako React SPA — pak přijdou
zadarmo tabulky s tříděním, dialogy, formuláře a přístupnost.

## 2. Cíl: rozhraní jako WinBox

Referencí se stal správcovský nástroj MikroTik WinBox: boční menu s ikonami
a rozbalovacím podmenu, toolbar s tlačítky, hustá tabulka s checkboxy
a tříditelnými sloupci.

**Zjištění, které rozhodlo o dalším postupu:** na tom rozhraní je z drtivé
většiny obyčejné CSS. Levý sloupec je seznam s ikonami, horní lišta je řádek
tlačítek, zbytek je tabulka s hustými řádky. Žádný exotický widget.

Komponentová knihovna se začne vyplácet až tam, kde je potřeba:

- virtualizovaná tabulka (tisíce řádků, plynulý scroll),
- resize a přeuspořádání sloupců myší,
- inline editace buněk,
- plovoucí okna a rozdělené panely.

Dokud tohle není v zadání, je knihovna zátěž navíc.

## 3. Požadavek na vzhled

Zadání znělo: profesionální vzhled, ze kterého nebude hned koukat AI.

Přeloženo do konkrétních zákazů — fialové gradienty, `rounded-2xl` karty se
stíny, emoji v nadpisech, řada čtyř „stat tiles" nahoře, font Inter,
vycentrovaný obsah.

A do konkrétních příkazů — hustý grid, systémový font, ohraničení místo stínů,
akcent jen na výběru a focusu, monospace na identifikátory a časy, stavový
řádek dole, data vypadající jako z reálného provozu. Úplný seznam pravidel je
v [README](../README.md).

## 4. Volby

| Rozhodnutí | Volba | Proč |
|---|---|---|
| Ukázková data | git-nástěnka (repozitáře, autoři, stav) | Reálně vypadající sloupce prodají dojem víc než cokoli jiného. |
| Akcentní barva | ocelově modrá `#31628C` | Klasika síťových a správcovských nástrojů. Tichá, funguje v obou režimech. |

Zvažované a nevybrané akcenty: jen šedá s červenou na alarmy (nejstřídmější),
grafit s měděnou (industriální), petrolejová (terminálový nádech).

## 5. Rozbor: React SPA s MUI

Kdyby se do toho šlo přes React, funguje to a MUI má komponenty na všechno.

### Mapování na části rozhraní

| Část UI | MUI komponenta |
|---|---|
| Levý sloupec | `Drawer variant="permanent"` + `List` / `ListItemButton` |
| Rozbalovací podmenu | `Popover` ukotvené na položku — ne `Menu`, ta si vynucuje vlastní klávesovou logiku |
| Horní lišta a toolbar | `AppBar position="static"` + `Toolbar variant="dense"` |
| Tabulka | `DataGrid` z MUI X — MIT verze zdarma; třídění, resize a reorder sloupců, výběr řádků, virtualizace |
| Stavový řádek | vlastní `Box`, MUI na to nic nemá |

### Architektura

Vite + React + TypeScript, build do `dist/`, který stávající backend servíruje
jako statiku vedle `/api/*`. Jedna služba, žádné CORS, konfigurace služby
se nemění.

### Theme — bez tohohle to vypadá jako každý druhý Material web

```ts
const theme = createTheme({
  palette: { primary: { main: '#31628C' } },
  shape: { borderRadius: 2 },                       // ne 4, ne 8
  typography: {
    fontSize: 12.5,
    fontFamily: '"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true, disableRipple: true },
      styleOverrides: { root: { textTransform: 'none', minHeight: 24, padding: '2px 8px' } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },   // zabije overlay v tmavém režimu
    },
    MuiDataGrid: {
      defaultProps: { density: 'compact', rowHeight: 26, columnHeaderHeight: 28 },
    },
  },
})
```

Čtyři věci v tom seznamu jsou přesně to, podle čeho se Material pozná na první
pohled: **ripple efekt** při kliknutí, **velká písmena** v tlačítkách,
**stíny místo ohraničení** a v tmavém režimu **zesvětlování papíru podle
elevace**. Po jejich vypnutí MUI přestane být poznat.

### Cena

Bundle zhruba 380 kB gzip včetně `DataGrid`. Po lokální síti se to nepozná.

## 6. Doporučení

Pro nástěnku s jednou hlavní tabulkou a několika sty repozitáři **není React
ani MUI potřeba**. Mockup je jeden soubor bez závislostí a bez build kroku.

MUI má smysl vytáhnout ve chvíli, kdy přijde požadavek na resize a přeuspořádání
sloupců myší, inline editaci buňky a virtualizovaný scroll přes tisíce řádků.
Na těch třech věcech se vlastní implementace zasekne a `DataGrid` je má hotové.

CSS vrstva zůstává stejná v obou případech. Krok, který se proto nezahodí:
zapsat tenhle shell do standardu vzhledu jako druhý layout („desktop/ops")
vedle stávajícího a odtud ho brát do konkrétních aplikací.
