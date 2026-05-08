# CLAUDE.md — Arabic Boolean Query Builder

## Purpose of this document

This file tells you, the implementing model, exactly what to build. The product is a chip-based interactive query composer that helps Arabic speakers construct Google search queries using English-language operators (`site:`, `intitle:`, `OR`, `AROUND`, etc.) without forcing them to fight bidirectional text rendering or constantly switch keyboard layouts. The user's primary problem today is that mixing Arabic (right-to-left) terms with Latin (left-to-right) operators in a single text field causes the cursor to jump unpredictably and the visible character order to diverge from the logical order, making OSINT-style search work painful and error-prone.

The solution is a chip composer: each search term lives in its own chip (a single-script container — Arabic term inside an LTR operator prefix), each boolean and content operator is a UI control rather than typed text, and the assembled query string only appears in a read-only LTR-rendered preview at the bottom. The user never has to manually mix scripts.

## Hard constraints

These are non-negotiable. If you find yourself wanting to break one, stop and re-read this section.

The deliverable is a single self-contained HTML file: `dist/index.html`. The source lives under `src/` and compiles via Vite + `vite-plugin-singlefile` into one file with no runtime dependencies. The output must work when opened directly from the local filesystem with `file://` — no server, no fetches, no CDN. This matters because the intended user base includes researchers in adversarial environments, sometimes on offline laptops, sometimes on USB sticks. External runtime dependencies are a security and reliability liability.

The tool must persist nothing. No localStorage, no sessionStorage, no cookies, no IndexedDB, no service workers. State lives in memory only. Refreshing the page resets the tool to its blank initial state. This is a security requirement for the user base, not a bug. Do not add a "recent searches" feature, do not save form state across reloads, do not offer to remember anything. If a user wants to keep a query, they will copy it themselves.

The interface language is Arabic. All visible labels, buttons, tooltips, placeholders, helper text, and error messages are in Arabic. The document `dir` attribute is `rtl`. The `lang` attribute is `ar`. Latin-script content (operator names like `site:`, the assembled query preview, domain inputs) must be rendered in explicit LTR contexts using `dir="ltr"` on the relevant elements, but their *labels* are Arabic.

The tool must never silently change a user's input. Every transformation applied to user-typed text — quoting a phrase, adding a minus sign, normalizing Arabic characters, URL-encoding for the search button — must be visible in the live preview before the user takes any action. The preview is the contract between the tool and the user.

The build toolchain (Vite, npm devDependencies) is allowed because it produces a deliverable that satisfies all of the above. Do not add npm dependencies that ship to the user. The check is on the *output*, not the dev environment.

## User profile and design philosophy

The audience is Arabic-speaking journalists, researchers, OSINT analysts, citizen investigators, and curious newcomers. Digital literacy ranges from low (someone who uses Google but has never heard of a search operator) to medium (someone comfortable with web forms and basic search techniques) to high (an OSINT professional who writes operator-rich queries by hand). The tool must serve all three.

The dominant design constraint is that the default experience must work for the low-literacy user without overwhelming them, because that user is the one most likely to abandon the tool if the first impression is intimidating. A high-literacy user can endure a slightly verbose interface for thirty seconds and then switch to advanced mode; a low-literacy user who sees a wall of unfamiliar operators will close the tab and never return.

Therefore the tool ships in **Beginner mode** by default. Beginner mode is the friendly, guided, helper-rich experience: a welcome panel explains the tool (with a small `↩ إظهار الترحيب` link to re-open it after dismissal), the chip area's empty state renders three template cards as the obvious starting point, every chip shows operator-name badges, the composer offers a single primary commit button (`أضف`) plus the `+ إضافة` drawer trigger, a ghost-chip preview sits below the input mirroring what would commit on Enter, a row of operator-conversion pills lets the user pick `intitle:`/`site:`/etc. before commit, and contextual tips and gentle warnings appear as the user works. The user is led from top to bottom through a clear workflow: read the welcome, pick a template (or start typing), watch chips accumulate as they hit Enter, then copy or search.

A single prominent toggle in the header switches the tool to **Advanced mode**. Advanced mode is the dense, expert experience: welcome panel and templates are hidden, helper sentences disappear, the chip area packs tighter, and special chip types (proximity, number-range) are surfaced top-level in the `+ إضافة` drawer. Coaching warnings remain on in both modes because they catch mistakes that hurt experts and novices equally.

Within both modes, the tool *teaches* operators by letting users observe cause and effect in the live preview. The operator name (`site:`, `intitle:`, etc.) is always visible somewhere on every operator-bearing chip even in Beginner mode, so the user gradually learns the syntax and graduates to Advanced mode at their own pace.

## Information architecture and workflow

The page is a single vertical column at all viewport widths. From top to bottom:

1. **Header** — Arabic title, one-sentence subtitle, mode toggle (Beginner / Advanced), Arabic normalization toggle with info popover.
2. **Welcome panel** (Beginner only, collapsible) — three short paragraphs explaining what the tool does and how to use it.
3. **Templates row** (Beginner only) — three large buttons that pre-seed chips: site search, document search (filetype = PDF), date range (last 12 months).
4. **Chip section** — heading "ابنِ بحثك بإضافة كلمات", chip area showing committed chips. When the chip array is empty in Beginner mode the chip area renders as the templates picker (heading + 3 cards + "أو اكتب كلمة في الأسفل وابدأ من الصفر."). Once any chip exists, the chips replace the picker. Below the chip area: composer input with one primary commit button (`أضف`) and the `+ إضافة` drawer trigger. A ghost-chip preview sits between the input and commit buttons in Beginner mode showing what would commit on Enter, and below it a row of operator-conversion pills (`كلمة عادية`, `في الموقع`, `في عنوان الصفحة`, `في رابط الصفحة`, `في نص الصفحة`, `في الروابط الواردة`) so the user can pick the operator before commit.
5. **Warnings region** — coaching warnings appear here, dismissible per session.
6. **Tips region** — strategy tips appear here in Beginner mode only, single-tip queue, priority-ordered.
7. **Sticky preview** — the assembled query in a read-only LTR monospace box, sticking to the bottom of the viewport. Click the box to copy. Below it, three buttons: نسخ (copy), البحث في Google (search), مسح الكل (reset).

### Commit flow (the heart of the tool)

The composer has a single text input with one primary commit button (`أضف`) plus the `+ إضافة` drawer trigger. Boolean grammar is reached after commit, not at commit time, so a first-time user doesn't have to understand AND/OR/NOT before getting their first chip on screen.

- **Enter / `أضف`** ⇒ append a keyword chip with the operator chosen from the inline pills row (default `كلمة عادية` = no operator). Implicit AND between adjacent chips, matching Google's parser.
- **Shift+Enter** (still wired) ⇒ if the previous chip is a term, prepend an OR-connector chip and then append the new keyword chip; equivalent to clicking the per-chip `+أو` handle on the previous chip then typing.
- **Per-chip `+أو` handle** ⇒ on every keyword chip, a small leading-edge `+أو` pill inserts an or-connector + a fresh empty keyword chip after the current chip's OR run, then focuses the new chip. This is the discoverable path to OR groups; it replaces the standalone OR commit button that used to live in the commit row.
- **Leading `-` followed by space** at commit time ⇒ append a keyword chip with `negate: true`. The chip renders with a red border and a `−` glyph; in the query it becomes `-term`. NOT is also reachable post-commit via the chip's `−` toggle and via the bulk multi-select toolbar.

Space alone never auto-commits — Arabic phrases contain spaces, and auto-chipping on space would surprise users with names like "محمد علي". Empty Enter is a no-op; the commit button disables when the input is empty.

Backspace on an empty composer removes the most recent chip. No undo step — fluent typists expect this and the chip can be re-typed.

### Visual binding between chips and the preview

Each chip's contribution to the assembled query is wrapped in a `.preview-frag` span tagged with `data-chip-id` inside the sticky preview at the bottom. When a chip is added or focused, chip-area calls `preview.highlightChip(id)` which flashes that span's background for ~600ms. This is the only visual link between a chip and its substring; it teaches the chip→string mapping by observation.

### `+ إضافة` drawer

Clicking `+ إضافة` opens a popover anchored to the button. Two sections:

- **Keyword operators**: site, intitle, intext, inurl, inanchor. Selecting one adds an empty keyword chip with that operator pre-set; the user types the term into the chip's editable text zone.
- **Special chip types**: filetype, date-range. In Beginner mode these are top-level; proximity and number-range hide behind a "خيارات إضافية" disclosure.

In Advanced mode the disclosure is gone — all special types are top-level.

## Chip types

Every chip type lives in `src/chips/<slug>.js` and exports:

```js
export const type = '<slug>';
export const label = '<Arabic display name>';
export function defaultProps(): object;
export function assemble(chip, ctx): string;
export function render(chip, handlers): HTMLElement;
```

Adding a new chip type means writing one new file plus adding it to `src/chips/_registry.js`.

The current chip types and their query output:

| Slug | Visual | Output |
|---|---|---|
| `keyword` | text + optional NOT/quote tools + operator dropdown | `<text>`, `<op>:<text>`, or quoted/negated variant |
| `or-connector` | "أو" pill between two term chips | (no direct output — the chip-state walker handles OR grouping) |
| `filetype` | dropdown of PDF/Word/Excel/etc. | `filetype:<value>` |
| `date-range` | two date pickers | `after:YYYY-MM-DD` and/or `before:YYYY-MM-DD` |
| `proximity` | term + distance + term | `"term1" AROUND(N) "term2"` |
| `number-range` | low + high + optional prefix | `LOW..HIGH` or `PREFIX_LOW..PREFIX_HIGH` |

The keyword chip's `operator` property (one of `none`, `site`, `intitle`, `inurl`, `intext`, `inanchor`) governs both visual and behavior:
- `site` and `inurl` are Latin-only (LTR text, no Arabic normalization); a warning fires if Arabic chars appear.
- `intitle`, `intext`, `inanchor` are Arabic-aware (RTL text, normalization on); the per-chip quote toggle controls whether the value is wrapped in quotes.
- `none` (the default) is a plain keyword: emits the bare text, optionally quoted, optionally negated.

## Boolean grammar

Adjacent chips in the chip array imply AND (matching Google's default). An OR connector chip between two term chips groups them: a run `[term, OR, term, OR, term]` becomes `(a OR b OR c)`. NOT is a per-chip property (`negate: true`), not a connector — it emits a leading `-` on the chip's query fragment.

The user's path to creating an OR group is the per-chip `+أو` handle on every keyword chip. Clicking it splices an or-connector + fresh empty keyword chip after the LAST member of the run that contains the clicked chip, and focuses the new chip. The chip-area's render walker detects contiguous OR runs and wraps them in a `.chip-or-group` container with a leading `أيٌ مما يلي:` label so the user reads the run as one logical clause rather than five floating chips.

Stale OR connectors (no longer between two terms) are auto-removed when chips are deleted, so the chip array always represents a syntactically valid query.

## Query assembly

`src/core/chip-state.js` registers a single segment with `ctx.registerSegment(...)`. On every assembly pass the segment walks the chip array and emits the assembled query string by calling each chip type's `assemble(chip, ctx)`. The result feeds `core/preview.js` via `assembleQuery()` and becomes the text in the sticky preview box. Empty results are dropped; whitespace is collapsed.

The 15 canonical query segments from the original spec all map to chip output:

| # | Segment | Chip representation |
|---|---|---|
| 1 | keywords | keyword chip, operator=`none`, optional quote |
| 2 | exact phrase | keyword chip, operator=`none`, quoted=true |
| 3 | excluded words | keyword chip with `negate: true` (one chip per excluded word) |
| 4 | `site:` | keyword chip, operator=`site` |
| 5 | `intitle:` | keyword chip, operator=`intitle` |
| 6 | `inurl:` | keyword chip, operator=`inurl` |
| 7 | `intext:` | keyword chip, operator=`intext` |
| 8 | `inanchor:` | keyword chip, operator=`inanchor` |
| 9 | `filetype:` | filetype chip |
| 10 | `before:` | date-range chip's `before` field |
| 11 | `after:` | date-range chip's `after` field |
| 12 | proximity (`AROUND`) | proximity chip |
| 13 | wildcard | keyword chip with literal `*` in text (Google parses `*` literally) |
| 14 | number range | number-range chip |
| 15 | OR groups | adjacent term chips connected by or-connector chips |

## Global controls

The header contains two controls.

The **mode toggle** is a segmented control with two options: وضع المبتدئ (Beginner, default) and وضع المتقدم (Advanced). The active mode is visually highlighted. Switching modes preserves all chips entered so far; only the presentation changes. The mode toggle is the single most important meta-control on the page and must be unambiguously visible at all times.

The **Arabic normalization toggle** is a small control labeled توحيد الأحرف العربية, off by default, with a small info icon that reveals an Arabic explanation on click or focus. When on, every Arabic-content field on every chip is passed through a normalization function before being inserted into the query string. The preview reflects the normalized form so the user can see exactly what is being sent.

The normalization function does these substitutions, in order:

1. Strip Arabic diacritics (tashkeel): `ً-ْ` plus `ٰ` (superscript alef) and `ـ` (tatweel).
2. Unify alef variants: `أ ` (U+0623), `إ` (U+0625), `آ` (U+0622), `ٱ` (U+0671) → `ا` (U+0627).
3. Unify ya variants: `ى` (U+0649) → `ي` (U+064A).
4. Convert ta marbuta to ha: `ة` (U+0629) → `ه` (U+0647). The most aggressive substitution; the strongest argument for opt-in rather than default.

Applies only to chip props that are flagged Arabic-aware. `site`, `inurl`, filetype values, dates, and number ranges pass through untouched.

## Warnings and tips

Warnings flag objective construction errors that degrade search quality regardless of skill level — they are visible in both modes. Tips suggest OSINT best practices and are Beginner-only.

Each warning and tip lives in its own file under `src/warnings/<slug>.js` or `src/tips/<slug>.js` and exports `register(ctx, deps)` where `deps = { previewBox, chipState }`. Modules return `{ onRender }` if they need to recompute on every preview pass.

Banner warnings are reserved for *aggregate or cross-cutting* concerns (the whole query is too long, too many restrictions across all chips, an operator value contains the wrong script). Issues that are *local to a single chip* (multi-word `intitle:` without quoting, an inverted date range, a single quoted word) are surfaced as a per-chip warning glyph (`⚠`/`ℹ`) with a one-tap fix in the popover — see `src/chips/keyword.js` and `src/chips/date-range.js`'s `validate()` exports. The two surfaces never duplicate the same signal.

Implemented:

| File | Fires when |
|---|---|
| `warnings/query-too-long.js` | The assembled query exceeds 32 words (Google often returns nothing). |
| `warnings/over-restricted.js` | More than 4 operator-bearing chips are active (highly restricted queries often return zero results). |
| `warnings/operator-arabic-chars.js` | A `site` or `inurl` chip contains Arabic characters (Google can't match Arabic in URLs). |
| (per-chip glyph, not banner) | A keyword chip with operator `intitle`/`intext`/`inanchor` has multi-word text without quoting → glyph offers `فعّل الاقتباس` fix. |
| (per-chip glyph, not banner) | A date-range chip's `after` is later than its `before` → glyph offers `بدّل التاريخين` fix. |
| (per-chip glyph, not banner) | A keyword chip quotes a single word → glyph offers `إلغاء الاقتباس` fix. |
| `tips/filetype-pdf.js` | A filetype chip is set to PDF (suggest combining with a site restriction). |
| `tips/keyword-name-variants.js` | A quoted multi-word plain keyword chip exists (suggest enabling Arabic normalization for name spelling variants). |
| `tips/proximity-usage.js` | A proximity chip has both terms filled (OSINT distance-tuning guidance). |
| `tips/date-range-both.js` | A date-range chip has both `after` and `before` set (combine with intitle). |
| `tips/keywords-no-restrictions.js` | All chips are plain keywords with no operators (suggest narrowing). |

## Visual style

The tool ships with one visual treatment per mode, sharing the same color palette, typography, and accessibility primitives.

System font stack that supports Arabic well: `"Segoe UI", Tahoma, "Geeza Pro", "Arabic Typesetting", system-ui, sans-serif`. Do not load web fonts because they fail offline and add a network dependency.

Color palette: light theme with neutral grays for backgrounds and borders, a single calm accent color for primary actions (`#2563eb`), amber/orange for coaching warnings (red is reserved for true destructive actions, of which the tool has none). Provide a `prefers-color-scheme: dark` media query that flips the palette to a dark theme; do not add a manual dark-mode toggle.

The sticky preview at the bottom must be visually distinct from chips: a different background tint, a thin top border, monospace font, slightly larger text than chip labels. It is the most important element on the page and should look like it.

The two action-row buttons (Copy / Search) are visually equivalent in weight (both primary-styled).

Coaching warnings use the warning color and a caution icon. They appear above the preview, never as overlays or modals. They must be visible enough to catch the user's eye but never aggressive enough to feel alarming.

### Mode-specific differences

**Beginner mode**: welcome panel (with re-open link after collapse), templates rendered inline as the chip-area's empty state, helper sentences, chip section heading, ghost-chip preview, operator-conversion pills under the ghost, composer hint about Enter and Backspace. Strategy tips queue (one at a time). The `+ إضافة` drawer items have user-language labels with one-line descriptions and trailing operator badges, and hides proximity/number-range behind a disclosure.

**Advanced mode**: welcome / templates / helper / heading / ghost / hint hidden. Chip area visually denser. Tips suppressed (warnings remain). Drawer surfaces all specials top-level.

State (the chip array) is preserved across mode switches.

## Accessibility

Standard accessibility (screen readers, keyboard navigation, contrast):
- Every form control has an associated label.
- Mode toggles use `aria-pressed`. Drawer trigger uses `aria-expanded`. Tip dismiss buttons have explicit Arabic `aria-label`.
- The chip area is `aria-live="polite"` so screen readers announce additions and removals.
- Tab order follows visual RTL order. Visible focus indicators meet WCAG contrast requirements.

Cognitive accessibility (the lower-literacy half of the audience):
- Plain Arabic vocabulary; second-person informal register.
- Per-chip × delete buttons let the user undo a single chip without resetting everything.
- Global reset uses a two-tap inline confirmation (label changes to تأكيد المسح for 3 seconds; second click within that window commits).
- Touch targets ≥ 44 px in Beginner mode (≥ 32 px allowed for tightly-clustered chip-internal tools).
- No hover-only interactions anywhere.
- Beginner mode shows at most one strategy tip at a time.
- Field labels and helper text remain visible at all times in Beginner mode (don't hide the label once the field has content).
- Welcome panel is expanded by default and visually prominent — not hidden behind a "?" icon.

## What not to build

Do not add a free-form raw-query textarea where users can type a mix of Arabic and Latin. The whole point of the tool is to avoid that field.

Do not add accounts, login, syncing, sharing, or any backend.

Do not add analytics, telemetry, or any network calls beyond the Google search the user explicitly triggers via the search button. No fonts, no CDN scripts, no external CSS, no third-party tracking. Treat any non-essential network call as a privacy violation and refuse to add it.

Do not add a "share this query" feature that generates a shareable URL — that would encode the user's investigation into a link that could be intercepted, logged, or shoulder-surfed.

Do not add language detection or auto-switching. The tool is in Arabic. If a future version needs to support other languages, that is a separate project.

Do not add support for Bing, DuckDuckGo, or other search engines in v1.

Do not add the deprecated operators (`link:`, `info:`, `~` synonym, `+` verbatim, `related:`, `filetype:csv`, `filetype:mp3`).

Do not add a third mode beyond Beginner and Advanced. The cognitive cost of additional meta-decisions outweighs flexibility.

Do not hide the mode toggle behind a settings menu, kebab icon, or secondary screen.

Do not add a guided interactive tour with arrows pointing at chips, a multi-step onboarding wizard, full-page tutorials, or a help-center FAQ accordion. The helper system specified above (welcome panel, ghost-chip preview, contextual tips, coaching warnings) is sufficient and intentional.

## Acceptance criteria

The implementing model should consider the work done when all of the following hold true.

The `dist/index.html` file opens correctly via `file://` on Chrome, Firefox, and Safari. Typing Arabic text into the composer produces no cursor jumps and no visible character reordering. Pressing Enter commits a keyword chip; the input clears; focus stays on the composer. Pressing Shift+Enter creates an OR group with the previous chip. Typing `-word` and pressing Enter creates a NOT-flagged chip. Pressing Backspace with an empty composer removes the most recent chip. The ghost-chip preview updates on every keystroke and mirrors what would commit. The leading `-` shortcut shows the ghost in red-border negate styling.

The `+ إضافة` drawer opens and closes on click, dismisses on outside click and Escape, and contains all six keyword operators plus four specialized chip types (with proximity and number-range hidden behind a disclosure in Beginner mode). Clicking a drawer item adds the corresponding chip to the chip array.

The sticky preview at the bottom updates on every chip mutation. Clicking the preview box copies the query to the clipboard and shows visible confirmation. The Google-search button URL-encodes the query and opens it in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.

The Arabic normalization toggle, when enabled, transforms the preview to use bare alef and dotted ya forms and strips diacritics — only on chip props flagged Arabic-aware.

Refreshing the page resets all chip state. No network requests are made except the Google search the user explicitly triggers.

All three template buttons in Beginner mode pre-fill chips (not form fields) and focus the composer.

The mode toggle is visible in the header at all times in both modes. Switching from Beginner to Advanced preserves the chip array; switching back also preserves them. In Beginner mode, the welcome panel, the empty-state templates picker, the ghost-chip preview, the operator-conversion pills, and the composer hint are visible. In Advanced mode they are hidden.

Strategy tips appear in Beginner mode when their triggering conditions are met and only one is visible at a time. Coaching warnings appear in both modes and disappear automatically when the condition resolves.

Every chip has a × delete button. The global reset uses the two-tap inline confirmation. All interactive elements meet a minimum touch target size of 44 px in Beginner mode. No interactions in either mode require hover.

Build: `npm run build` produces `dist/index.html` with no runtime dependencies, no CDN imports, and no fetches at runtime.

## Source attribution

The operator definitions and quirks documented in this spec are derived from Daniel M. Russell's "Advanced Search Operators" reference dated February 8, 2024. When in doubt about an operator's exact behavior, consult that document.

## Implementation status

Repository: https://github.com/bhngyn/search-maker

The deliverable is `dist/index.html` — a single self-contained file built from `src/` via Vite + `vite-plugin-singlefile`. No runtime dependencies, no network calls beyond user-triggered Google searches, no persistence.

**Architecture (under `src/`)**:

```
src/
  index.html              shell with mount points
  main.js                 bootstrap: builds ctx, wires UI, iterates registries
  styles/
    tokens.css            :root custom properties + dark-mode media query
    base.css              global non-chip styles
    chips.css             chip pills, composer, sticky preview, drawer
  core/
    ctx.js                the integration seam; passed to every register*
    assemble.js           segment-ordered query string builder
    normalize.js          Arabic char normalization (factory + getEnabled)
    warnings.js           multi-warning slug-keyed coaching system
    tips.js               Beginner-only single-tip priority queue
    mode.js               Beginner/Advanced toggle + listener fan-out
    preview.js            live render, copy, search, two-tap reset
    chip-state.js         the canonical chip array + segment producer
  chips/
    _registry.js          chip-type map (one entry per file)
    keyword.js, or-connector.js, filetype.js, date-range.js,
    proximity.js, number-range.js
  ui/
    welcome.js, templates.js, normalize-toggle.js,
    composer.js, chip-area.js, drawer.js
  warnings/
    _registry.js + 6 modules (see Warnings table above)
  tips/
    _registry.js + 5 modules (see Tips table above)
```

**Build commands**:
- `npm install` — one-time install of Vite + `vite-plugin-singlefile`.
- `npm run dev` — Vite dev server with HMR, port 5173, source under `src/`.
- `npm run build` — produces `dist/index.html`, single self-contained file.
- `npm run preview` — serves `dist/` locally, port 4173, for verifying production output.

**How to verify**:
Open `dist/index.html` directly via `file://` in Chrome, Firefox, or Safari. No server or network connection required.

**Deviations from the original draft of this spec**:
- The original draft described a 14-field form. The current implementation replaces it with a chip composer that produces all 15 query segments via 6 chip types. The form-based fields/, fields.css, more-options disclosure, and `merge.js`/`validate.js` fragment-merging tooling have been deleted; the file-based per-module convention has replaced the JSON-fragment contract.
- Template button #2 label is "بحث في الوثائق" (neutral framing) rather than "بحث عن وثائق مسربة" — editorial decision agreed before implementation began.
- Touch targets in Beginner mode are ≥ 36 px for secondary chip-internal tools and ≥ 44 px for primary action buttons, rather than a uniform 44 px everywhere — secondary controls are visually subordinate and the relaxed minimum was applied deliberately.
