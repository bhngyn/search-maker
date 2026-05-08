# CLAUDE.md — Arabic Boolean Query Builder

## Purpose of this document

This file tells you, the implementing model, exactly what to build. The product is an interactive query composer that helps Arabic speakers construct advanced search queries across multiple engines (Google, X / Twitter, Facebook) using their respective English-language operators and filter conventions, without forcing them to fight bidirectional text rendering or constantly switch keyboard layouts. The user's primary problem today is that mixing Arabic (right-to-left) terms with Latin (left-to-right) operators in a single text field causes the cursor to jump unpredictably and the visible character order to diverge from the logical order, making OSINT-style search work painful and error-prone.

The default solution is a **chip composer** for engines whose query language is a string of operators (Google, X / Twitter): each search term lives in its own chip (a single-script container — Arabic term inside an LTR operator prefix), each boolean and content operator is a UI control rather than typed text, and the assembled query string only appears in a read-only LTR-rendered preview at the bottom. The user never has to manually mix scripts.

For engines that don't expose a query language (Facebook, where filters are a base64'd JSON blob in the URL), the tool drops the chip metaphor and substitutes a category-aware **form** in the same shell. The header, normalization toggle, mode toggle, and sticky preview/copy/search row stay common; only the input surface swaps. See "Search engines" below.

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

## Search engines

The header carries an engine toggle (`Google` / `X / تويتر` / `Facebook`) — a segmented control next to the Beginner/Advanced toggle. Engine state lives in memory only; refreshing the page resets to the default (Google), matching the no-persistence security constraint. Switching engines preserves all chip state for the chip-based engines (Google ↔ X), so a user who built up a chip query on Google can flip to X and see the same chips re-rendered against X's operator catalogue. The Facebook engine has its own form state, kept independent.

The engine controller (`src/core/engine.js`) holds the active engine and fans changes out to subscribers (composer, drawer, chip-area, preview, paste parser). Each engine is a descriptor object exported from `src/engines/<id>.js`; see the engine.js docblock for the locked descriptor shape. Adding an engine = one new file + entries in main.js, the HTML toggle, and the body-class CSS list.

### Chip-based engines (Google, X)

These share the entire chip composer, drawer, OR-group machinery, paste parser, warnings/tips infrastructure, and sticky preview. The descriptor supplies what differs: keyword operator catalogue, composer pills, drawer items + grouping, templates, search URL + button label, date-range op names (`before`/`after` for Google vs `since`/`until` for X), addable chip types, Arabic-forbidden operators (e.g. `site:`/`inurl:` on Google, all Latin-only operators on X), the multi-word warning set, and paste-parser keyword + prefix operators (`@`/`#`/`$` on X).

The Google surface is the original spec body of this document. The X surface is documented separately in `CLAUDE-X.md` — operator catalogue, canonical assembly order, X-specific coaching warnings (time-only query, reversed `since`/`until`, `source:` casing transformation, `filter:nativeretweets` time window), and X-specific strategy tips. When working on X, read CLAUDE-X.md as the authoritative source for that engine's operator quirks.

### Form-based engine (Facebook)

Facebook search isn't a query language — the URL carries a required free-text `q=` parameter plus a `filters=` parameter that decodes to a base64'd JSON blob. Filter keys vary by category (`/search/top/`, `/search/posts/`, `/search/people/`, `/search/photos/`, `/search/videos/`, `/search/pages/`); filters within a section are mutually exclusive; many filters need an opaque numeric ID (page ID, group ID, location ID, school ID, employer ID, user ID).

A chip metaphor doesn't fit. So the Facebook engine ships a **category-aware form** that takes its place when the engine is active. The form lives in `src/ui/facebook-form.js`, mounts in `<section id="facebook-form">`, and is shown/hidden by `body.engine-facebook` CSS toggles. When active, the chip section, welcome panel, warnings region, tips region, and `+ إضافة` drawer are all hidden via `display: none !important` (CSS in `src/styles/facebook.css`).

Form layout (top to bottom):

1. **Category cards** — six tiles (`الأعلى`, `المنشورات`, `الأشخاص`, `الصور`, `الفيديو`, `الصفحات`) in a responsive grid. The active card is highlighted with an inset accent ring + tinted fill.
2. **Required keyword input** — Facebook rejects empty `q=`. The field is labeled with a hint that explains the requirement; the keyword is sent verbatim (URL-encoded only) to preserve the user's exact input.
3. **Per-category filter sections** — radio groups for "كاتب المنشور" (Posts From), "نوع المنشور" (Post Type), "ضمن مجموعة" (Posted In Group), "في موقع" (Tagged Location), "الترتيب" (Sort By for `/search/top/`), "نوع الصور" (Photo Type for photos), "مصدر الفيديو" (Video Source for videos), and the people-only/pages-only sections (City, Education, Work, Mutual Friends, Verified, Page Category). Options that need an ID expose a mono-font ID input inline next to the selected option, with a placeholder example ID as a hint.
4. **Date range** — two HTML5 date pickers wired to the `rp_creation_time` filter. The form re-emits Facebook's preferred un-padded date strings (`2019-1-1`, not `2019-01-01`) and the triple-nested JSON Facebook expects.

URL assembly: the engine descriptor exposes `buildUrl(state)` that walks the active category's section list, collects `[outerKey, JSON.stringify({ name, args })]` pairs, builds the outer JSON object, runs UTF-8-safe base64 (`btoa(unescape(encodeURIComponent(json)))`), strips the trailing `=` per the WhoPostedWhat doc, and returns the full `https://www.facebook.com/search/{category}/?q=ENCODED&epa=FILTERS&filters=BASE64` URL. The bootstrap's engine-aware `assembleQuery` calls `buildUrl(formState)` directly when the active engine is Facebook, bypassing the chip-state segment entirely; the engine's `searchUrl(q)` is the identity function so the search button opens the URL verbatim.

The Arabic normalization toggle is a no-op for Facebook — keyword text passes through untouched. The mode toggle (Beginner/Advanced) currently has no effect on the Facebook form; the form is the same in both modes.

Source attribution: Facebook filter values, JSON keys, and encoding sequence are derived from the WhoPostedWhat reference (`whopostedwhat.com`). When in doubt about a filter's exact `name` / `args` / `outerKey` mapping, that document is authoritative.

## Information architecture and workflow

The page is a single vertical column at all viewport widths. From top to bottom:

1. **Header** — Arabic title, one-sentence subtitle (engine-driven), engine toggle (Google / X / Facebook), mode toggle (Beginner / Advanced), Arabic normalization toggle with info popover.
2. **Welcome panel** (Beginner only, collapsible) — a single-line in-flow blurb at the top of `main` that names the tool and points at the Enter-to-commit flow, with an inline `إخفاء` link at its trailing edge. Once dismissed, a small `↩ إظهار الترحيب` link appears in its place so the user can re-open without losing chip state to a refresh. The blurb is intentionally lightweight so the chip section is the visual anchor on first paint.
3. **Chip section** — heading "ابنِ بحثك بإضافة كلمات", chip area. When the chip array is empty in Beginner mode the chip area itself renders as the templates picker (heading "ابدأ من قالب جاهز:" + three template cards with descriptions + "أو اكتب كلمة في الأسفل وابدأ من الصفر."). Once any chip exists, chips replace the picker. The standalone templates row that used to live above the chip section has been retired. Below the chip area: composer input with one primary commit button (`أضف`) and the `+ إضافة` drawer trigger. A ghost-chip preview sits between the input and commit buttons in Beginner mode showing what would commit on Enter, below it a row of operator-conversion pills (`كلمة عادية`, `في الموقع`, `في عنوان الصفحة`, `في رابط الصفحة`, `في نص الصفحة`, `في الروابط الواردة`) so the user can pick the operator before commit, and below the pills a `اقتباس حرفي` toggle that pre-marks the term as a literal phrase. The toggle disables when the chosen operator is non-quotable (`site:`, `inurl:`) and resets after each commit, like the operator selection.
4. **Bulk-actions toolbar** (Advanced only, visible when ≥1 chip is selected) — appears below the chip area with the selection count, a shared-operator dropdown, a bulk negate toggle, a bulk delete, and a clear-selection button.
5. **Warnings region** — coaching warnings appear here, dismissible per session. Banner warnings cover only aggregate concerns (query too long, too many restrictions, Latin-only operator with Arabic chars). Issues local to a single chip live as per-chip glyphs on the chip itself.
6. **Tips region** — strategy tips appear here in Beginner mode only, single-tip queue, priority-ordered.
7. **Sticky preview** — the assembled query (or, for Facebook, the assembled URL) in a read-only LTR monospace box, sticking to the bottom of the viewport. For chip-based engines each chip's contribution is wrapped in a `.preview-frag[data-chip-id]` span so the chip-area can flash the matching fragment when a chip is added or focused; for Facebook the box holds the full URL with `word-break: break-all` and a slightly smaller font. Click the box to copy. Below it, three buttons: نسخ (copy), engine-driven search button (`البحث في Google` / `البحث في X` / `البحث في Facebook`), مسح الكل (reset).

### Commit flow (the heart of the tool)

The composer has a single text input with one primary commit button (`أضف`) plus the `+ إضافة` drawer trigger. Boolean grammar is reached after commit, not at commit time, so a first-time user doesn't have to understand AND/OR/NOT before getting their first chip on screen.

- **Enter / `أضف`** ⇒ append a keyword chip with the operator chosen from the inline pills row (default `كلمة عادية` = no operator) and the quoted state from the `اقتباس حرفي` toggle. Implicit AND between adjacent chips, matching Google's parser.
- **Shift+Enter** (still wired) ⇒ if the previous chip is a term, prepend an OR-connector chip and then append the new keyword chip; equivalent to clicking the per-chip `+أو` handle on the previous chip then typing.
- **Per-chip `+أو` handle** ⇒ on every keyword chip *outside* an OR group, a small leading-edge `+أو` pill inserts an or-connector + a fresh empty keyword chip after the current chip's OR run, then focuses the new chip. Once a chip is part of a group, the handle is suppressed on every member; the group's single trailing `+ بديل آخر` button (see Boolean grammar) takes over as the add-affordance.
- **Leading `-` followed by space** at commit time ⇒ append a keyword chip with `negate: true`. The chip renders with a red border and a `−` glyph; in the query it becomes `-term`. NOT is also reachable post-commit via the chip's `−` toggle and via the bulk multi-select toolbar.
- **Leading-and-trailing `"` shortcut** at commit time ⇒ if the input starts and ends with `"` (e.g. `"phrase"` or `"محمد علي"`), the wrapping quotes are stripped and the chip commits with `quoted: true` for quotable operators. Mirrors the leading-`-` shortcut for negate. The ghost-chip preview reflects this immediately while typing. The shortcut works in both modes and is the keyboard-fluent path to literal-match.

Space alone never auto-commits — Arabic phrases contain spaces, and auto-chipping on space would surprise users with names like "محمد علي". Empty Enter is a no-op; the commit button disables when the input is empty.

Backspace on an empty composer removes the most recent chip. No undo step — fluent typists expect this and the chip can be re-typed.

### Paste-parsing

Pasting text into the composer routes through `core/parse-query.js`. If the pasted text contains structural markers — operators (`site:`, `intitle:`, `filetype:`, `before:`, `after:`), quoted phrases, the uppercase `OR` keyword, parens, `AROUND(N)`, `..` ranges, or leading `-` negation — the parser tokenizes and emits a list of chip descriptors that get committed in one pass and the input is cleared. A toast at the bottom reads `أُضيفت N كلمة من اللصق — تراجع` with the trailing word as a clickable button; clicking تراجع removes those exact chips via `chipState.removeMany(addedIds)`. The toast auto-clears after 1.5s.

Plain-text pastes (no structural markers) fall through to the browser's default paste so the input fills with the text. In Beginner mode a transient hint appears below the ghost row explaining that the paste will become a single chip on Enter and that wrapping in quotes would have produced separate fragments. The hint fades after ~4s.

### Per-chip controls and Advanced-mode interactions

Beyond the operator dropdown, NOT toggle, and quote toggle on each keyword chip:
- **Per-chip warning glyph (`⚠` / `ℹ`)** appears when the chip's `validate()` exports issues. Clicking opens a popover with the issue text and (when applicable) a one-tap fix button (e.g., `فعّل الاقتباس`, `بدّل التاريخين`, `إلغاء الاقتباس`). Popover positioning auto-flips above the glyph if the default below-anchor placement would overflow the viewport bottom; the leading edge is clamped to ≥ 8px from each viewport edge. See `src/ui/chip-popover.js`.
- **Per-chip `+أو` handle** (covered above) is the discoverable path to OR groups.
- **Drag-to-reorder** (Advanced mode only) is wired by `src/ui/chip-area.js`. Each chip becomes `draggable=true` with a soft drop-indicator on the leading or trailing edge of the hover target. Editable widgets inside chips suppress dragstart so typing can't accidentally start a drag.
- **Alt + ArrowLeft / Alt + ArrowRight** on a focused chip (Advanced mode only) reorders the chip in the array by ±1 and refocuses it after the re-render. Plain arrows stay free for cursor movement inside the chip's contenteditable text.
- **Shift + Click** (Advanced mode only) toggles the chip's selection. A plain click with an active selection clears it. Esc clears the selection globally. The bulk-actions toolbar (see IA section above) appears when the selection is non-empty.

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

| Slug | Visual | Output | Engines |
|---|---|---|---|
| `keyword` | text + leading-edge `+أو` handle + optional NOT/quote tools + operator dropdown + optional warning glyph | `<text>`, `<op>:<text>`, prefix-style (`@user`, `#tag`, `$AAPL`), or quoted/negated variant | both |
| `or-connector` | "أو" pill between two term chips (rendered as a small clear pill inside the `.chip-or-group` container — visually subordinate to the term chips it joins, but readable as a connector) | (no direct output — the chip-state walker handles OR grouping) | both |
| `filetype` | dropdown of PDF/Word/Excel/etc. | `filetype:<value>` | Google |
| `date-range` | two date pickers | `after:YYYY-MM-DD`/`before:YYYY-MM-DD` (Google) or `since:YYYY-MM-DD`/`until:YYYY-MM-DD` (X) | both |
| `proximity` | term + distance + term | `"term1" AROUND(N) "term2"` | Google |
| `number-range` | low + high + optional prefix | `LOW..HIGH` or `PREFIX_LOW..PREFIX_HIGH` | Google |
| `filter` | dropdown of Twitter `filter:*` flags + per-chip negate toggle | `filter:<value>`, `-filter:<value>`, or `include:nativeretweets` | X |
| `engagement` | metric (`min_faves`/`min_replies`/`min_retweets`) + min/max direction + numeric threshold | `min_<metric>:N` (min) or `-min_<metric>:N` (max) | X |

The keyword chip's operator catalogue is **engine-driven** — see `src/engines/<id>.js` `keywordOperators`. Google currently exposes `none`, `site`, `intitle`, `inurl`, `intext`, `inanchor`. X exposes `none`, `from`, `to`, `mention` (`@user`), `hashtag` (`#tag`), `cashtag` (`$AAPL`), `url`, `list`, `lang`, `near`, `source`, `conversation_id`, `quoted_tweet_id`. Each operator descriptor declares: `dir` (rtl/ltr), `normalizes` (whether Arabic normalization applies), `quotable` (whether the exact-phrase toggle wraps the value in quotes), `acceptsArabic` (false ⇒ surface a warning if Arabic chars appear), an optional `format(value)` hook (used by `@user`/`#tag`/`$AAPL` to prepend a glyph instead of `op:`), and an optional `badge` override for the LTR mono prefix shown on the chip.

## Boolean grammar

Adjacent chips in the chip array imply AND (matching Google's default). An OR connector chip between two term chips groups them: a run `[term, OR, term, OR, term]` becomes `(a OR b OR c)`. NOT is a per-chip property (`negate: true`), not a connector — it emits a leading `-` on the chip's query fragment.

The user's path to creating an OR group starts with the per-chip `+أو` handle on a standalone keyword chip. Clicking it splices an or-connector + fresh empty keyword chip after the LAST member of the run that contains the clicked chip, and focuses the new chip. Once a group exists, the handle is suppressed on every member; the group ends with a single trailing `+ بديل آخر` button that calls the same splice operation, so a member chip is never cluttered with both an in-group divider and an add-affordance. Shift+Enter from the composer is still wired and produces the same group structure.

The chip-area's render walker detects contiguous OR runs and wraps them in a filled, tinted `.chip-or-group` container with a real-DOM header (`⫦ أيٌ مما يلي` label + a Beginner-only helper subtitle "تطابق أيّ كلمة من هذه الكلمات.") on its leading edge. Inside the group the OR connector renders as a small clear pill, not a near-invisible muted divider, so the alternation reads at a glance. Hovering or focusing any member lifts the whole container so the sibling relationship is visible by direct feedback.

Implicit AND is made visible in Beginner mode by a faint `<span class="chip-and-seam">و</span>` rendered between non-grouped adjacent renderable units (i.e., between two standalone chips, between a standalone chip and an OR group, or between two OR groups). The seam is chrome-only — it changes nothing about the assembled query — and is hidden in Advanced via `body.mode-advanced .chip-and-seam { display: none; }`. The goal is to teach the boolean grammar by observation without forcing the low-literacy user to read documentation.

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

The header contains three controls.

The **engine toggle** is a segmented control labeled محرك البحث with options Google, X / تويتر, and (in-progress) Facebook. The active engine drives every part of the surface that varies by search engine: the subtitle, the search-button label, the URL the search button opens, the keyword chip's operator catalogue, the composer's operator pills, the `+ إضافة` drawer's items and grouping, the templates picker, the date-range chip's emitted operator names (`before`/`after` on Google → `since`/`until` on X), and which chip types are addable (filetype/proximity/number-range are Google-only; filter/engagement are X-only). Switching engines preserves the chip array — chips with operators that don't exist on the new engine fall back to plain keywords visually, so the user's data is never destroyed by a switch. The engine descriptor lives in `src/engines/<id>.js`; the controller lives in `src/core/engine.js`. Refresh resets to Google (no persistence).

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

Color palette: dark theme always — slate-blue backgrounds (`#0f172a` / `#1e293b`), light slate text (`#f1f5f9`), a single calm accent color for primary actions (`#2563eb`), amber/orange for coaching warnings (red is reserved for true destructive actions, of which the tool has none). The dark palette is the only palette; `html` declares `color-scheme: dark` so native form controls (date pickers, checkboxes, scrollbars) render in dark UA chrome. Do not provide a light theme or a manual theme toggle.

The sticky preview at the bottom must be visually distinct from chips: a different background tint, a thin top border, monospace font, slightly larger text than chip labels. It is the most important element on the page and should look like it.

The two action-row buttons (Copy / Search) are visually equivalent in weight (both primary-styled).

Coaching warnings use the warning color and a caution icon. They appear above the preview, never as overlays or modals. They must be visible enough to catch the user's eye but never aggressive enough to feel alarming.

### Mode-specific differences

**Beginner mode**: welcome blurb (with re-open link after dismissal), templates rendered inline as the chip-area's empty state, helper sentences, chip section heading, ghost-chip preview, operator-conversion pills under the ghost, `اقتباس حرفي` toggle below the pills, composer hint about Enter and Backspace, faint `و` AND-seam between non-grouped adjacent chip units, OR-group helper subtitle ("تطابق أيّ كلمة من هذه الكلمات."). Strategy tips queue (one at a time). The `+ إضافة` drawer items have user-language labels with one-line descriptions and trailing operator badges, and hides proximity/number-range behind a disclosure.

**Advanced mode**: welcome / templates / helper / heading / ghost / hint / quote-toggle / AND-seam / OR-group helper subtitle hidden. Chip area visually denser. Tips suppressed (warnings remain). Drawer surfaces all specials top-level. Literal-match is reachable only via the leading-and-trailing `"` shortcut and the in-chip `"` button.

State (the chip array) is preserved across mode switches.

## Accessibility

Standard accessibility (screen readers, keyboard navigation, contrast):
- Every form control has an associated label.
- Mode toggles use `aria-pressed`. Drawer trigger uses `aria-expanded`. Tip dismiss buttons have explicit Arabic `aria-label`. Operator pills under the ghost row use `aria-pressed` for the active selection. The bulk-actions toolbar is `aria-hidden`-aware (only rendered when the selection is non-empty).
- The chip area is `aria-live="polite"` so screen readers announce additions and removals. The OR-group container uses `role="group"` with `aria-label="مجموعة \"أو\""`.
- Tab order follows visual RTL order. Visible focus indicators meet WCAG contrast requirements.
- **Keyboard reorder (Advanced mode)**: Alt + ArrowLeft / Alt + ArrowRight on a focused chip moves it ±1 in the array. The keyboard alternative for drag-and-drop. The chip's `title` attribute carries the hint `اضغط Alt+سهم لتحريك الكلمة` so screen readers and hover users discover it.
- Per-chip warning glyph popovers close on outside click, Esc, and `window.resize`.

Cognitive accessibility (the lower-literacy half of the audience):
- Plain Arabic vocabulary; second-person informal register.
- Per-chip × delete buttons let the user undo a single chip without resetting everything.
- Global reset uses a two-tap inline confirmation (label changes to تأكيد المسح for 3 seconds; second click within that window commits).
- Touch targets ≥ 44 px in Beginner mode (≥ 32 px allowed for tightly-clustered chip-internal tools).
- No hover-only interactions anywhere.
- Beginner mode shows at most one strategy tip at a time.
- Field labels and helper text remain visible at all times in Beginner mode (don't hide the label once the field has content).
- Welcome blurb is shown by default — not hidden behind a "?" icon — but rendered as a lightweight in-flow line so it informs without competing with the chip section for attention.

## What not to build

Do not add a free-form raw-query textarea where users can type a mix of Arabic and Latin. The whole point of the tool is to avoid that field.

Do not add accounts, login, syncing, sharing, or any backend.

Do not add analytics, telemetry, or any network calls beyond the search the user explicitly triggers via the search button (Google, X, or Facebook). No fonts, no CDN scripts, no external CSS, no third-party tracking. Treat any non-essential network call as a privacy violation and refuse to add it.

Do not add a "share this query" feature that generates a shareable URL — that would encode the user's investigation into a link that could be intercepted, logged, or shoulder-surfed.

Do not add language detection or auto-switching. The tool is in Arabic. If a future version needs to support other languages, that is a separate project.

Do not add support for Bing, DuckDuckGo, LinkedIn, TikTok, Instagram, Reddit, or other search engines beyond the three currently shipped (Google, X, Facebook). Adding a fourth engine is a deliberate scope decision, not an incremental ask — discuss before implementing.

Do not add the deprecated operators (`link:`, `info:`, `~` synonym, `+` verbatim, `related:`, `filetype:csv`, `filetype:mp3`).

Do not add a third mode beyond Beginner and Advanced. The cognitive cost of additional meta-decisions outweighs flexibility.

Do not hide the mode toggle behind a settings menu, kebab icon, or secondary screen.

Do not add a guided interactive tour with arrows pointing at chips, a multi-step onboarding wizard, full-page tutorials, or a help-center FAQ accordion. The helper system specified above (welcome panel, ghost-chip preview, contextual tips, coaching warnings) is sufficient and intentional.

## Acceptance criteria

The implementing model should consider the work done when all of the following hold true.

The `dist/index.html` file opens correctly via `file://` on Chrome, Firefox, and Safari. Typing Arabic text into the composer produces no cursor jumps and no visible character reordering. Pressing Enter commits a keyword chip with the operator chosen from the inline pills row (defaults to `كلمة عادية` = no operator); the input clears; the pills reset; focus stays on the composer. Clicking a pill before Enter changes the ghost-chip preview to show the operator-prefixed form. The leading `-` shortcut shows the ghost in red-border negate styling and commits a NOT-flagged chip on Enter. Pressing Backspace with an empty composer removes the most recent chip.

Clicking the per-chip `+أو` handle on a *standalone* keyword chip splices an or-connector + a fresh empty keyword chip after the LAST member of that chip's OR run, focuses the new chip, and wraps the run in a filled tinted `.chip-or-group` container with a real-DOM `⫦ أيٌ مما يلي` header (plus a Beginner-only helper subtitle) and a single trailing `+ بديل آخر` button. Member chips inside that group must not show the per-chip `+أو` handle — clicking the trailing `+ بديل آخر` button is the only add-affordance from then on, and it splices in the same way. Shift+Enter from the composer is still wired and produces the same OR-group structure. Deleting a chip auto-removes any stale or-connectors so the chip array stays well-formed. In Beginner mode a faint `و` seam appears between non-grouped adjacent renderable units (standalone chip ↔ standalone chip, standalone chip ↔ OR group, OR group ↔ OR group); the seam is chrome-only and never appears in the assembled query string.

The `اقتباس حرفي` toggle in the composer (Beginner only) wraps the ghost chip in `"…"` when pressed and commits a keyword chip with `quoted: true` for quotable operators; it disables when the chosen operator is not quotable (`site:`, `inurl:`) and resets to off after each commit. Typing a leading-and-trailing `"` in the composer (e.g. `"phrase"`) achieves the same outcome via the keyboard, in both modes; the wrapping quotes are stripped from `text` and the chip commits with `quoted: true`. A quoted keyword chip renders with an accent-tinted fill (not just a hairline border swap) so the literal-match state reads at a glance, and the existing in-chip `"` toggle button continues to work as the post-commit toggle.

Pasting a Google-style query into the composer (e.g., `"محمد" OR "علي" site:bbc.com`) produces multiple chips in one pass and shows a `أُضيفت N كلمة من اللصق — تراجع` toast; clicking تراجع removes those exact chips. Pasting plain text falls through to default paste with a transient hint in Beginner mode.

The `+ إضافة` drawer opens and closes on click, dismisses on outside click and Escape, and contains all six keyword operators plus four specialized chip types (with proximity and number-range hidden behind a disclosure in Beginner mode). Each item shows a user-language Arabic primary label, a one-line description, and a small mono operator badge on the trailing edge. Beginner mode reorders for frequency-of-use (date-range, filetype, site first); Advanced keeps the operators-then-specials grouping. Clicking a drawer item adds the corresponding chip.

The sticky preview at the bottom updates on every chip mutation. Each chip's contribution is wrapped in a `.preview-frag[data-chip-id]` span; when a chip is added or focused, that span flashes accent-tinted for ~600ms. Clicking the preview box copies the query to the clipboard and shows visible confirmation. The search button URL-encodes the query and opens the engine-specific search URL in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.

The Arabic normalization toggle, when enabled, transforms the preview to use bare alef and dotted ya forms and strips diacritics — only on chip props flagged Arabic-aware. (Facebook is unaffected; the keyword field passes through verbatim.)

Refreshing the page resets all chip state, the Facebook form state, and the active-engine selection (back to Google). No network requests are made except the search the user explicitly triggers.

The engine toggle in the header switches between Google, X / Twitter, and Facebook. Switching Google ↔ X preserves the chip array. Switching to Facebook hides the chip section, welcome panel, warnings region, and tips region; the Facebook form replaces them. The preview box shows the assembled `https://www.facebook.com/search/{category}/?q=…&epa=FILTERS&filters={base64}` URL on every form change. The Facebook form's category cards switch the visible filter sections; switching categories resets the within-category filter selections (since section lists vary). The required keyword field is passed verbatim (URL-encoded only). Combining "Posts From a Page" (with a numeric page ID) and "Posts You've Seen" produces a `filters=` parameter whose base64 decodes to the WhoPostedWhat reference's exact JSON: `{"rp_author":"{\"name\":\"author\",\"args\":\"<id>\"}","interacted_posts":"{\"name\":\"interacted_posts\",\"args\":\"\"}"}`. The "Date Posted" range emits Facebook's nested-args form with un-padded month/day strings (`2019-1-1`, not `2019-01-01`).

In Beginner mode, the empty chip-area renders three template cards as the start-here affordance. Clicking a card pre-seeds chips and moves focus to the composer.

The mode toggle is visible in the header at all times in both modes. Switching from Beginner to Advanced preserves the chip array; switching back also preserves them. In Beginner mode the welcome panel (with `↩ إظهار الترحيب` re-open link after collapse), the empty-state templates picker, the ghost-chip preview, the operator-conversion pills, and the composer hint are visible. In Advanced mode all of those are hidden, and three additional interactions become available: drag-to-reorder, Alt+Arrow keyboard reorder, and Shift+Click multi-select with the bulk-actions toolbar.

Strategy tips (5 modules registered) appear in Beginner mode when their triggering conditions are met and only one is visible at a time. Coaching banner warnings (3 modules) appear in both modes for aggregate concerns. Per-chip warning glyphs cover chip-local issues with one-tap fixes and auto-flip above the anchor when the popover would overflow the viewport bottom.

Every chip has a × delete button. The global reset uses the two-tap inline confirmation. All interactive elements meet a minimum touch target size of 44 px in Beginner mode. No interactions in either mode require hover.

Build: `npm run build` produces `dist/index.html` with no runtime dependencies, no CDN imports, and no fetches at runtime.

## Source attribution

Google operator definitions and quirks are derived from Daniel M. Russell's "Advanced Search Operators" reference dated February 8, 2024. X / Twitter operators are sourced from Igor Brigadir's `twitter-advanced-search` reference (see CLAUDE-X.md). Facebook filter encoding is derived from the WhoPostedWhat reference (`whopostedwhat.com`). When in doubt about a specific operator or filter's exact behavior, consult the matching upstream document.

## Implementation status

Repository: https://github.com/bhngyn/search-maker

The deliverable is `dist/index.html` — a single self-contained file built from `src/` via Vite + `vite-plugin-singlefile`. No runtime dependencies, no network calls beyond the search the user explicitly triggers (Google, X, or Facebook), no persistence.

**Architecture (under `src/`)**:

```
src/
  index.html              shell with mount points (chip section + Facebook form section)
  main.js                 bootstrap: builds engine controller, ctx, wires UI, iterates registries; engine-aware assembleQuery
  styles/
    tokens.css            :root custom properties (dark palette only; --page-max-width caps the centered column)
    base.css              global non-chip styles
    chips.css             chip pills, composer, sticky preview, drawer, popover, OR-group, empty-state, etc.
    facebook.css          Facebook form + show/hide rules keyed off body.engine-facebook
  core/
    ctx.js                the integration seam; passed to every register*
    assemble.js           segment-ordered query string builder
    normalize.js          Arabic char normalization (factory + getEnabled)
    warnings.js           slug-keyed coaching banner system
    tips.js               Beginner-only single-tip priority queue
    mode.js               Beginner/Advanced toggle + listener fan-out
    engine.js             active-engine controller (Google/X/Facebook) + getActiveEngine() module-level accessor
    preview.js            live render with .preview-frag spans + setEmptyMessage; copy, search (engine-driven URL), two-tap reset, highlightChip
    chip-state.js         canonical chip array; add/addAfter/remove/removeMany/update/reorder/getQueryFragments
    parse-query.js        tokenize + walk pasted query strings into chip descriptors (engine-aware: keyword ops, prefix ops, date ops)
  engines/
    google.js             Google descriptor (keyword ops, drawer, templates, search URL)
    x.js                  X / Twitter descriptor (keyword ops incl. prefix-style @/#/$, drawer, templates, search URL)
    facebook.js           Facebook descriptor: form-based (formBased: true), categories[], categorySections{}, buildUrl(state) — base64'd JSON filter encoder
  chips/
    _registry.js          chip-type map (one entry per file)
    keyword.js, or-connector.js, filetype.js, date-range.js,
    proximity.js, number-range.js, filter.js, engagement.js
  ui/
    welcome.js            close + re-open link wiring
    templates.js          template definitions exported as TEMPLATES + applyTemplate
    normalize-toggle.js   header normalization checkbox + info popover
    composer.js           input, ghost preview, operator pills, اقتباس حرفي toggle + leading-trailing-`"` shortcut, paste handler + undo toast
    chip-area.js          chip rendering, OR-group walker (filled container + real-DOM header + trailing add button), AND-seam between non-grouped units, empty-state templates picker, drag, Alt+Arrow, multi-select, focus→preview highlight
    chip-toolbar.js       Advanced-mode bulk-actions toolbar (operator change, negate, delete, clear)
    chip-popover.js       per-chip warning glyph + viewport-clamped popover
    drawer.js             + إضافة popover; user-language items + descriptions + operator badges
    facebook-form.js      Facebook form: category cards, required keyword input, per-category radio sections, ID inputs, date pickers; owns its own state, requestUpdate-driven
  warnings/
    _registry.js + 3 modules (banner-only; chip-local issues live as glyphs in chip types)
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
- The composer's commit row is two buttons (`أضف` + `+ إضافة`), not the original three (`أضف (و)`, `أو`, `ليس (−)`) + drawer. OR is reached via the per-chip `+أو` handle and Shift+Enter; NOT via leading `-` and the per-chip `−` toggle. The commit row stayed two-button to keep boolean grammar from blocking a first-time user.
- The Beginner-mode templates row was retired in favor of an empty-state templates picker rendered inside the chip area itself. Same three templates, same focus-after-apply behavior; one less competing affordance to scan.
- The drawer items show user-language Arabic primary labels with one-line descriptions and trailing mono operator badges, rather than icon-plus-jargon items. Beginner orders by frequency-of-use; Advanced keeps the original two-section grouping.
- Chip-local issues (intitle multi-word without quoting, inverted date range, single-word quoting) ship as per-chip warning glyphs with one-tap fixes — there is no banner duplicate. Banner warnings are reserved for aggregate / cross-cutting concerns.
- The Advanced-mode-only interactions (drag-to-reorder, Shift+Click multi-select with bulk toolbar, Alt+Arrow keyboard reorder, paste-parsing of Google-style queries with paste-undo) were added incrementally on top of the original chip-only spec. None of them appear in Beginner mode, where the surface stays minimal.
- `chipState.addAfter()` deliberately does NOT call `cleanupConnectors()` mid-mutation — the OR-branch flow makes two consecutive `addAfter` calls (or-connector then keyword), and intermediate cleanup would prune the connector before its trailing term landed. The mutating ops that *can* leave stale connectors (`remove`, `reorder`) still cleanup themselves.
- The OR-group container was upgraded from a thin dashed rectangle with a 10px `::before` pseudo-label to a filled tinted block with a real-DOM `⫦ أيٌ مما يلي` header (plus a Beginner-only helper subtitle), a single trailing `+ بديل آخر` add-button per group, and a small clear `أو` pill divider inside. The per-chip `+أو` handle is suppressed on members of an existing group; the trailing button is the single add-affordance once a group exists. Beginner mode also renders a faint `و` AND-seam between non-grouped adjacent renderable units to make implicit AND visible without changing semantics.
- Quoting gained three discoverable entry points on top of the in-chip `"` toggle that already existed: a `اقتباس حرفي` toggle in the composer (Beginner only, sits below the operator pills), a leading-and-trailing-`"` shortcut (typing `"phrase"` commits a quoted chip with the inner text — mirrors the leading-`-` negate shortcut), and a stronger `.chip-quoted` visual (accent-tinted fill, not just a hairline border swap). The model side is unchanged; the `quoted` boolean and `OPERATORS[op].quotable` gating already lived on the keyword chip.
- The welcome panel was demoted from a card-weight component (h2 + three paragraphs) to a single-line in-flow blurb with an inline `إخفاء` link at its trailing edge. The chip section is the visual anchor on first paint; the welcome stays informational rather than commanding the page.
- The original draft was a Google-only tool. The current implementation is multi-engine: Google (the original), X / Twitter (added on the chip composer; see CLAUDE-X.md), and Facebook (added as a category-aware form because Facebook's filter blob isn't a query language). The engine controller (`src/core/engine.js`) and per-engine descriptors (`src/engines/<id>.js`) keep the Google experience byte-identical while the surface across engines stays unified.
- The Facebook engine is form-based, not chip-based. When `body.engine-facebook` is on, the chip section, welcome panel, warnings region, tips region, and `+ إضافة` drawer are hidden; `<section id="facebook-form">` shows in their place. The bootstrap's `assembleQuery` calls `facebookEngine.buildUrl(formState)` directly when Facebook is active and bypasses the chip-state segment. The preview box becomes the assembled URL (with `word-break: break-all`); the search button opens it via `searchUrl(q) = q` (identity).
- `src/core/preview.js` now exposes a `setEmptyMessage(m)` setter on its return value so the bootstrap can swap the empty-preview placeholder per engine. The chip-fragments path falls back to plain text rendering when the structured fragments are empty (Facebook returns no chip fragments — the assembled URL is rendered as a single text node).
- The light theme has been removed; the tool ships dark-only. The earlier `prefers-color-scheme: dark` media query in `tokens.css` has been collapsed into the default `:root`, and `html { color-scheme: dark }` is set globally so native form controls render in dark UA chrome regardless of the user's OS appearance setting. The Visual style section above has been updated accordingly.
- The `.app` shell is now a centered single column capped at `--page-max-width: 1080px` with a `calc(100vw - 32px)` floor, instead of the previous `min(1600px, 98vw)` sprawl. The earlier note at the top of `.app` about "the full viewport width" is obsolete. All interior sections (header, chip area, composer, Facebook form, sticky preview) cascade from this constraint without their own widths. UI font sizes were lifted ~1px across the board so nothing visible drops below ~12px and most labels/body text sit at 14–15px, since the narrower column made the previous floor feel cramped on a laptop.
