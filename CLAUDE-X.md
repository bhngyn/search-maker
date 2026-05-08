# CLAUDE-X.md — X / Twitter Boolean Query Builder (deferred plan)

**Status:** deferred. Waiting on UI direction to settle before implementation begins. This document is the locked-in spec/plan; pick it up when ready.

## Purpose of this document

Companion to `CLAUDE.md`. Tells the implementing model exactly what to build for the X (Twitter) sibling tool. The product is a single self-contained HTML file that helps Arabic speakers construct X (formerly Twitter) advanced search queries that use English-language operators (`from:`, `since:`, `min_faves:`, `filter:media`, etc.) without forcing them to fight bidirectional text rendering or constantly switch keyboard layouts. Same problem space and same audience as the Google tool, different operator surface.

The deliverable is a sibling `twitter.html` next to the existing `index.html`. The existing Arabic-Google tool is not modified.

## Hard constraints (inherited verbatim from CLAUDE.md)

- Single self-contained HTML file. No build step, no npm, no frameworks, no external CSS, no external JS, no fonts. Plain HTML, plain CSS, plain vanilla JS in inline `<style>` and `<script>` blocks. Must work via `file://`.
- Persists nothing. No localStorage, sessionStorage, cookies, IndexedDB, service workers. Refresh resets state. This is a security requirement for the user base.
- Interface language is Arabic. `dir="rtl"`, `lang="ar"`. Latin operator content (handles, list slugs, IDs, dates, source values) renders in `dir="ltr"` contexts but with Arabic labels.
- Never silently transforms user input. Every transformation (quoting, normalization, `source:` case+underscore substitution, URL encoding) must be visible in the live preview before any action.
- No analytics, telemetry, or network calls except the explicit X search the user triggers via the search button.

## User profile and design philosophy

Same audience and same Beginner/Advanced split as the Google tool. Re-read `CLAUDE.md` sections "User profile and design philosophy" and "Information architecture and workflow" — the philosophy carries over verbatim. Beginner mode is the default with welcome panel + templates row + guided single-column flow + inline helper sentences + operator-name badges. Advanced mode is dense two-column grid above 720px viewport, helpers hidden, mode toggle preserved in header at all times, field state preserved across mode switches.

## Operator surface

Sourced from Igor Brigadir's twitter-advanced-search reference. Mirrors how `CLAUDE.md` excludes deprecated Google operators: anything broken, time-windowed-too-short, or with opaque mechanism is excluded entirely.

### Beginner-mode essentials (visible by default)

| Field | Operator | Notes |
|---|---|---|
| keywords | (free) | per-field exact-phrase toggle, RTL Arabic input |
| exact phrase | `"…"` | always quoted, RTL Arabic input |
| excluded words | `-token` | space-separated, each token gets `-` prefix |
| from user | `from:` | LTR, no spaces, lowercase enforced visibly |
| to user | `to:` | LTR, same rules as `from:` |
| date range | `since:` / `until:` | two HTML5 date pickers |

### Beginner-mode "more options" disclosure (collapsed by default)

| Field | Operator | Notes |
|---|---|---|
| hashtag | `#tag` | Arabic or Latin |
| cashtag | `$TWTR` | Latin uppercase enforced visibly |
| mentions | `@user` | distinct from `to:` |
| language | `lang:` | dropdown excluding broken codes (`chr`, `iu`, `sk`) |
| min faves | `min_faves:` | numeric |
| min replies | `min_replies:` | numeric |
| min retweets | `min_retweets:` | numeric |
| has media | `filter:media` | toggle |
| no replies | `-filter:replies` | toggle (negation built-in) |
| has links | `filter:links` | toggle |
| OR groups | `(a OR b OR c)` | comma- or أو-separated |
| wildcard inside quote | `"… * …"` | helper for in-quote wildcards |

### Advanced-mode-only fields (always visible in Advanced)

| Field | Operator | Notes / quirks |
|---|---|---|
| list | `list:owner/slug` or `list:ID` | **cannot be negated** — UI must not offer negate toggle |
| near | `near:` | LTR, supports `near:me` |
| within | `within:Nkm` / `within:Nmi` | pairs with `near:`/`geocode:` |
| geocode | `geocode:lat,lon,radius` | LTR |
| place | `place:` | place-object ID; preferred over coords per source |
| URL | `url:` | substring-matches; hyphens become underscores in match |
| source | `source:` | **case-sensitive, spaces become underscores** — preview shows transformed form |
| filter: blue verified | `filter:blue_verified` | toggle |
| filter: verified (legacy) | `filter:verified` | toggle |
| filter: follows | `filter:follows` | **cannot be negated** — UI must not offer negate toggle |
| filter: nativeretweets | `filter:nativeretweets` | warning: ~7–10 day window |
| filter: retweets (legacy) | `filter:retweets` | toggle |
| filter: quote | `filter:quote` | toggle |
| filter: images | `filter:images` | toggle |
| filter: videos | `filter:videos` | toggle |
| filter: native video | `filter:native_video` | toggle |
| filter: spaces | `filter:spaces` | toggle |
| filter: hashtags | `filter:hashtags` | toggle |
| filter: mentions | `filter:mentions` | toggle |
| since_id | `since_id:` | snowflake ID |
| max_id | `max_id:` | snowflake ID |
| within_time | `within_time:Nd|h|m|s` | LTR |
| conversation ID | `conversation_id:` | tweet ID |
| quoted tweet ID | `quoted_tweet_id:` | tweet ID |
| quoted user ID | `quoted_user_id:` | numeric user ID |

### Excluded entirely (deprecated / broken / time-windowed-too-short)

`lang:chr|iu|sk` (broken per source — keyword fallback masquerading as filter), `filter:vine` and `filter:periscope` (services dead), `filter:news` and `filter:safe` (opaque mechanism), `card_name:*` / `card_domain:` / `card_url:` family (only ~7–8 day window — would mislead users like the Google tool's exclusion of `filetype:csv`/`mp3`), `source:twitter_ads` (doesn't work alone).

## Canonical query-assembly order

X's parser is largely commutative, but consistent ordering makes the live preview readable. Order is content → user → geo → time → engagement → filters → IDs:

| # | Segment |
|---|---|
| 1 | keywords (with optional quoting) |
| 2 | exact phrase (always quoted) |
| 3 | excluded words |
| 4 | OR groups |
| 5 | wildcard helper |
| 6 | `#hashtag` |
| 7 | `$cashtag` |
| 8 | `@user` |
| 9 | `from:` |
| 10 | `to:` |
| 11 | `list:` |
| 12 | `lang:` |
| 13 | `near:` |
| 14 | `within:` |
| 15 | `geocode:` |
| 16 | `place:` |
| 17 | `since:` |
| 18 | `until:` |
| 19 | `since_id:` |
| 20 | `max_id:` |
| 21 | `within_time:` |
| 22 | `min_replies:` |
| 23 | `min_faves:` |
| 24 | `min_retweets:` |
| 25 | `filter:replies` (or `-filter:replies`) |
| 26 | `filter:nativeretweets` / `filter:retweets` / `filter:quote` |
| 27 | `filter:media` and media sub-filters (images, videos, native_video, spaces) |
| 28 | `filter:links` / `filter:hashtags` / `filter:mentions` |
| 29 | `filter:verified` / `filter:blue_verified` / `filter:follows` |
| 30 | `url:` |
| 31 | `source:` |
| 32 | `conversation_id:` |
| 33 | `quoted_tweet_id:` / `quoted_user_id:` |

## Coaching warnings (visible in both modes — objective construction errors)

Inherits philosophy from `CLAUDE.md`: warnings flag, never block. Inline near the triggering field. Auto-disappear when condition resolves.

1. **Time-only query**: any of `since:`/`until:`/`since_id:`/`max_id:`/`within_time:` set with no other field. Per source: every time operator must be paired with another term.
2. **Reversed date range**: `since:` later than `until:`, or `since_id:` greater than `max_id:`.
3. **Wildcard outside quote**: `*` in keywords without exact-phrase toggle on, or in any non-quoted field. Mirrors Google tool's `intitle:` multi-word warning.
4. **`source:` casing/spaces transformation**: when value contains spaces or uppercase, show what the tool will substitute. Per the hard constraint about no silent transformation, the preview always shows the literal transformed form (`source:twitter_for_iphone`); the warning explains *why* it changed.
5. **Multi-word in single-token field**: spaces in `from:`, `to:`, `@user`, `list:`, `near:` (without quoting), `place:`, ID fields. Most inputs reject directly; the warning fires when user pastes content with spaces.
6. **Time-windowed operator**: `filter:nativeretweets` is set → ~7–10 day window note. (We exclude `card_name:` entirely so no warning needed there.)
7. **Arabic in Latin-only field**: Arabic typed into `from:`, `to:`, `@user`, `list:`, `url:`, `source:`, IDs.
8. **Query exceeds ~22 operators**: per source, hard cap on tweet search syntax.
9. **Non-negatable filter forced negative**: should be unreachable via UI (no negate toggle for `filter:follows` / `list:`), but caches a regression if a future fragment adds one.

## Strategy tips (Beginner-only, conditional, single-tip-at-a-time, dismissible)

1. When `filter:media` is on → suggest pairing with `lang:` to narrow results.
2. When `min_faves:` ≥ 1000 → suggest combining with `from:` or date range to avoid empty results.
3. When `from:` is set with no date range → suggest adding `since:`/`until:` for active accounts.
4. When `lang:ar` is selected → suggest enabling Arabic normalization to broaden across alef/ya variants.
5. When only the keywords field is set with 3+ words and no other restrictions → suggest narrowing.

Strategy tips do not appear in Advanced mode.

## Templates (Beginner-mode templates row)

Three large card-style buttons. Each pre-fills relevant fields, scrolls to the keywords field, and focuses it.

1. **بحث في حساب** — pre-fills `from:` placeholder (focuses `from:` field, then keywords).
2. **بحث عن تغريدات شائعة** — pre-fills `min_faves:1000`, opens keywords.
3. **بحث في فترة زمنية** — pre-fills `since:` (today − 30d) and `until:` (today), opens keywords.

## Arabic normalization

Reuses the Google tool's normalization function unchanged: strip diacritics `ً-ْ` + `ٰ` + `ـ` (tatweel); unify `أ|إ|آ|ٱ → ا`, `ى → ي`, `ة → ه`. Toggle in header, off by default. Apply only to Arabic content fields (keywords, exact phrase, excluded, hashtag value if Arabic, OR groups). Never apply to: `from:`, `to:`, `@user`, `list:`, `lang:`, `near:`, `geocode:`, `place:`, `url:`, `source:`, dates, IDs, numerics.

## Search submission

Action row at bottom: copy button (نسخ → تم النسخ for ~1.5s) and search button (البحث في X). Search button URL-encodes the query and opens `https://x.com/search?q=ENCODED_QUERY&src=typed_query` in a new tab via `target="_blank" rel="noopener noreferrer"`. When the query is empty: muted Arabic placeholder in preview, both buttons disabled.

## Files to create when implementing (on `feat/x-builder` branch)

- `twitter.html` — the deliverable. Same insertion markers as `index.html` (`/* === STYLES_INSERT === */`, `<!-- === FIELDS_INSERT === -->`, `/* === SCRIPT_INSERT === */`).
- `CONTRACT-X.md` — copy of `CONTRACT.md` with the X canonical-order table (above) substituted and Google-specific examples replaced with X examples.
- `merge-x.js` — clone of `merge.js`, single change: `HTML = path.join(__dirname, 'twitter.html')`. Reuses `validate.js` unchanged.
- `fragments-x/*.json` — per-field/warning/tip fragment JSONs produced by parallel sub-agents.

## Files NOT to modify

`index.html`, `CLAUDE.md`, `CONTRACT.md`, `merge.js`, `validate.js`, `README.md`. Parallel work on the Google tool keeps its tools.

## Implementation phases & parallel agent strategy

### Phase 0 — branch setup (sequential)

1. `git checkout -b feat/x-builder`
2. Confirm `git status` clean.

### Phase 1 — skeleton & infrastructure (sequential, single Sonnet 4.6 agent)

One agent, briefed with `CLAUDE.md` + `index.html` + this file, produces:

- `twitter.html` skeleton: full document chrome (header with title/subtitle/mode-toggle/normalization-toggle, welcome panel, templates row placeholder, sections containers with `FIELDS_INSERT` marker, query preview, action row, reset button), full CSS for both modes including `prefers-color-scheme` dark mode (with `STYLES_INSERT` marker inside `<style>`), bootstrap script with `__pendingRegisters`, `ctx` factory, mode-switching, normalization toggle, query-assembly loop reading the X canonical order, copy/search handlers, two-tap reset (with `SCRIPT_INSERT` marker inside `<script>`).
- `CONTRACT-X.md`: copy of `CONTRACT.md` with the X canonical-order table substituted.
- `merge-x.js`: clone of `merge.js`, single line changed to target `twitter.html`.

Acceptance: `twitter.html` opens in a browser, shows full chrome, empty preview, mode/normalization toggles work. Commit: `feat(x): skeleton + fragment infra for x-builder`.

### Phase 2 — operator fragments (3 parallel Sonnet 4.6 agents in single message)

**Agent A — Content & Users (12 fragments):** keywords, exact-phrase, excluded, or-groups, wildcard, hashtag, cashtag, from, to, mention, list, lang.

**Agent B — Time, Engagement, Geo (12 fragments):** since, until, since-id, max-id, within-time, min-faves, min-replies, min-retweets, near, within, geocode, place.

**Agent C — Filters, URL, Source, Graph (~20 fragments):** filter-replies, filter-media, filter-images, filter-videos, filter-native-video, filter-spaces, filter-links, filter-mentions, filter-hashtags, filter-blue-verified, filter-verified, filter-follows, filter-nativeretweets, filter-retweets, filter-quote, url, source, conversation-id, quoted-tweet-id, quoted-user-id.

Each agent's prompt: `CONTRACT-X.md` path, slug list it owns, canonical order numbers from this file, X-specific quirks for its fields. Each agent produces N validated fragment JSONs and a brief report.

After all three return: orchestrator runs `node validate.js fragments-x/<each>.json` then `node merge-x.js fragments-x/*.json` to integrate. Commit: `feat(x): operator fields A/B/C merged`.

### Phase 3 — warnings, tips, templates (sequential, 1 Sonnet 4.6 agent)

Produces fragment JSONs for the 9 coaching warnings and 5 strategy tips (slugs prefixed `warning-` / `tip-`). Templates touch the skeleton's existing templates row (direct `Edit` of `twitter.html`, not new fragments). Commit: `feat(x): coaching warnings, strategy tips, templates`.

### Phase 4 — verification & polish (sequential)

1. Open `twitter.html` via `file://` (Claude_Preview MCP if available, else manual).
2. Smoke-test: Arabic typing → no cursor jumps; exact-phrase toggle → quotes appear/disappear; `from:foo` + `since:2024-01-01` → preview shows `from:foo since:2024-01-01`; `source:Twitter for iPhone` → preview shows `source:Twitter_for_iPhone` with warning explaining transformation; reversed `since:`/`until:` → reversed-date warning; click search → opens `https://x.com/search?q=...` in new tab; refresh → all state resets.
3. Verify accessibility: tab order, focus indicators, screen-reader labels.
4. Final commit: `feat(x): polish + e2e smoke pass`. Push: `git push -u origin feat/x-builder`. PR creation deferred until user requests.

## Verification (end-to-end acceptance tests)

Done when, opened from `file://` on Chrome/Firefox/Safari:

- Typing Arabic into keywords produces no cursor jumps or visible reordering.
- Per-field exact-phrase toggles add/remove quotes in the preview instantly.
- `كلمة1 كلمة2` in excluded → `-كلمة1 -كلمة2` in preview.
- `from:` accepts a Latin handle, rejects spaces and Arabic with inline warning.
- `source:Twitter for iPhone` shows `source:Twitter_for_iPhone` with inline note explaining the substitution.
- `until:` earlier than `since:` shows reversed-date warning.
- `*` in keywords without exact-phrase toggle shows wildcard-needs-quotes warning.
- `min_faves:1000` produces `min_faves:1000` segment.
- `filter:media` toggle adds `filter:media`. `-filter:replies` toggle adds the negated form.
- `filter:follows` and `list:` have no negate toggle in the UI.
- Mode toggle preserves all field values across switches; welcome panel/templates/helper sentences/disclosure visible only in Beginner; Advanced uses two-column grid above 720px.
- Arabic normalization toggle, when on, normalizes content fields visibly and leaves Latin/numeric/date fields untouched.
- Search button URL-encodes and opens `https://x.com/search?q=...` in new tab.
- Copy button copies preview verbatim, shows تم النسخ for ~1.5s.
- Reset button uses two-tap inline confirmation.
- All three template buttons pre-fill correctly and scroll/focus keywords.
- Refresh resets all state. No localStorage / cookies / network calls except explicit X search.
- All 9 coaching warnings and 5 strategy tips fire and clear correctly.
- `node validate.js fragments-x/<sample>.json` exits 0 for every produced fragment.

## What this does NOT do

- Does not modify `index.html`, `merge.js`, `validate.js`, `CONTRACT.md`, or any existing repo file.
- No `card_name:`/`card_domain:`/`card_url:` family (time-windowed, would mislead).
- No broken language codes (`chr`, `iu`, `sk`).
- No Bing/DuckDuckGo or any non-X engine.
- No "share this query", no persistence, no third mode, no raw-query textarea escape hatch.
- No analytics, telemetry, web fonts, CDN scripts, or external resources.
- No push to `main` and no PR without explicit user instruction.

## Source attribution

Operator definitions sourced from Igor Brigadir's `twitter-advanced-search` (https://github.com/igorbrigadir/twitter-advanced-search). When in doubt about exact behavior, consult that document.
