# Search Maker

أداة بناء استعلامات البحث

Search Maker helps Arabic-speaking journalists, researchers, and OSINT analysts construct powerful Google search queries that mix Arabic terms with English-language operators (`site:`, `intitle:`, `filetype:`, date ranges, `AROUND` proximity, and boolean groups) without the bidirectional-text headaches of manually typing mixed scripts. Each search operator is a UI control rather than typed text, so the cursor never jumps and the query assembles cleanly in a live preview.

## Use it

Clone or download the repo and open `index.html` in any modern browser. No install. No build step. Works offline from `file://`.

```
git clone https://github.com/bhngyn/search-maker.git
open search-maker/index.html
```

## What it does

- Builds Google queries with operators like `site:`, `intitle:`, `inurl:`, `intext:`, `inanchor:`, `filetype:`, date ranges (`before:`/`after:`), proximity search (`AROUND`), and OR groups
- Handles Arabic (RTL) terms alongside Latin (LTR) operators without cursor jumps or character reordering
- Optional Arabic character normalization to unify alef variants, ya variants, ta marbuta, and strip diacritics for broader recall
- Ships in Beginner mode (guided, friendly, field labels and helper text) and Advanced mode (dense two-column grid for power users)
- No state persistence. No localStorage, cookies, or telemetry. Refresh resets the tool to a blank slate.

## Privacy

Zero network requests except the Google search you explicitly trigger via the search button. Everything runs locally in your browser.

## Status

Under active development. See `CLAUDE.md` for the full design spec.

## License

MIT — see [LICENSE](LICENSE).
