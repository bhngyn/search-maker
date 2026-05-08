# Search Maker

أداة بناء استعلامات البحث

Search Maker helps Arabic-speaking journalists, researchers, and OSINT analysts construct powerful Google search queries that mix Arabic terms with English-language operators (`site:`, `intitle:`, `filetype:`, date ranges, `AROUND` proximity, and boolean groups) without the bidirectional-text headaches of manually typing mixed scripts. Every search term lives in its own chip; operators are UI controls, not typed text, so the cursor never jumps and the query assembles cleanly in a live preview.

## Use it

Download `dist/index.html` from the [latest release](https://github.com/bhngyn/search-maker/releases) and open it in any modern browser. No install. No network. Works offline from `file://`.

```
open search-maker/dist/index.html
```

The whole app — HTML, CSS, JS — is one self-contained file.

## What it does

- Builds Google queries with operators like `site:`, `intitle:`, `inurl:`, `intext:`, `inanchor:`, `filetype:`, date ranges (`before:`/`after:`), proximity (`AROUND`), and OR groups
- Handles Arabic (RTL) terms alongside Latin (LTR) operators without cursor jumps or character reordering — each chip is single-script internally
- Type a word, press Enter to commit it as a chip; press Shift+Enter to OR-extend the previous chip; type a leading `-` to negate
- Optional Arabic character normalization to unify alef variants, ya variants, ta marbuta, and strip diacritics for broader recall
- Ships in Beginner mode (guided, friendly, ghost-chip preview, helper hints) and Advanced mode (denser, slash-menu hints, advanced operators top-level)
- No state persistence. No localStorage, cookies, or telemetry. Refresh resets the tool to a blank slate.

## Privacy

Zero network requests except the Google search you explicitly trigger via the search button. Everything runs locally in your browser.

## Develop

Source lives under `src/` and compiles to `dist/index.html` via Vite + `vite-plugin-singlefile`.

```bash
npm install              # one-time
npm run dev              # Vite dev server with HMR (port 5173)
npm run build            # produces dist/index.html
npm run preview          # serves dist/ locally (port 4173)
```

The shipping artifact is `dist/index.html`. The production build inlines every CSS and JS chunk, so the output has zero runtime dependencies and zero network requests beyond the user-triggered Google search.

Adding a chip type:
1. Create `src/chips/<slug>.js` exporting `type`, `label`, `defaultProps()`, `assemble(chip, ctx)`, and `render(chip, handlers)`.
2. Add an entry to `src/chips/_registry.js`.

Adding a warning or tip:
1. Create `src/warnings/<slug>.js` (or `src/tips/<slug>.js`) exporting `register(ctx, deps)` that returns `{ onRender }` if it needs to recompute on every preview pass.
2. Add an import to the corresponding `_registry.js`.

The `ctx` object (`src/core/ctx.js`) is the single integration seam between modules.

## Status

Production-ready chip-based MVP. See `CLAUDE.md` for the design spec.

## License

MIT — see [LICENSE](LICENSE).
