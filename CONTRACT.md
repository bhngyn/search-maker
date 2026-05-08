# Fragment-Merge Contract

This document is the protocol that lets parallel sub-agents contribute code to a single shared `index.html` without colliding. Every sub-agent that produces a *field*, *warning*, or *tip* must follow this contract exactly. The orchestrator runs `validate.js` against each fragment before merging and rejects any that violate it.

## What a sub-agent returns

A single JSON object with three string fields:

```json
{
  "markup":  "<div class=\"field field-foo\">…</div>",
  "styles":  ".field-foo input { … }",
  "script":  "function registerFieldFoo(ctx) { … }"
}
```

The orchestrator merges by string-concatenating into three buckets in `index.html`:

| Bucket          | Marker comment in `index.html`               | Receives        |
| --------------- | -------------------------------------------- | --------------- |
| `<style>` block | `/* === STYLES_INSERT === */`                | `styles`        |
| Fields container | `<!-- === FIELDS_INSERT === -->`            | `markup`        |
| `<script>` block | `/* === SCRIPT_INSERT === */`               | `script`        |

After all fragments are merged, the orchestrator's bootstrap loop calls every `register*` function in source order with a shared `ctx` object.

The orchestrator merges each fragment's `script` by appending two lines into the `SCRIPT_INSERT` block:

```js
function registerFieldFoo(ctx) { … }
__pendingRegisters.push(registerFieldFoo);
```

The push line is added by the merge step, not by the sub-agent. Sub-agents must NOT include their own `__pendingRegisters.push(...)` — that breaks the merge.

## Naming rules

Every field, warning, and tip has a **slug** — a short kebab-case identifier (`keywords`, `intitle`, `proximity`, `intitle-multiword`, `pdf-with-site`).

| Asset    | DOM ID            | CSS root class    | JS function name           |
| -------- | ----------------- | ----------------- | -------------------------- |
| Field    | `field-<slug>`    | `.field-<slug>`   | `registerField<PascalSlug>` |
| Warning  | `warning-<slug>`  | `.warning-<slug>` | `registerWarning<PascalSlug>` |
| Tip      | `tip-<slug>`      | `.tip-<slug>`     | `registerTip<PascalSlug>`     |

`<PascalSlug>` is the slug converted to PascalCase: `proximity` → `Proximity`, `intitle-multiword` → `IntitleMultiword`.

## CSS rules

- Every selector **must** be scoped under `.field-<slug>`, `.warning-<slug>`, or `.tip-<slug>`. No bare element selectors. No `*`. No global rules. No `body`, `html`, `:root`.
- Use the project's CSS custom properties for colors and spacing instead of hardcoded values where possible. The skeleton defines: `--accent`, `--accent-fg`, `--bg`, `--bg-subtle`, `--fg`, `--fg-muted`, `--border`, `--warning`, `--warning-bg`, `--tip`, `--tip-bg`, `--mono`, `--gap`, `--gap-tight`.
- Do not import fonts, images, or other resources. Do not use `url()`.
- Animations and transitions must be ≤ 200 ms.

## Markup rules

- The outer wrapper must be `<div class="field field-<slug>">…</div>` for fields (or `<div class="warning warning-<slug>">…</div>`, `<div class="tip tip-<slug>">…</div>`).
- IDs inside the wrapper must be prefixed with the slug (e.g. `field-keywords-input`, `field-keywords-quote-toggle`).
- Every `<input>`, `<select>`, `<textarea>` must have an associated `<label>`. The label contains the Arabic field name plus an inline `<span class="op-badge">site:</span>` showing the operator (where applicable).
- For inputs that should render LTR (site, URL fragments, file types, dates, numbers), set `dir="ltr"` on the input element. Otherwise leave default (inherits RTL from the document).
- Inline helper sentences live inside `<p class="field-help">…</p>`. They are auto-hidden in Advanced mode by the global stylesheet — fragments don't need to handle visibility.

## Script rules

- The fragment exposes **exactly one** top-level function: `register<Asset><PascalSlug>(ctx) { … }`.
- No top-level `var`, `let`, `const`, `class`, or other declarations outside that function.
- No `document.addEventListener('DOMContentLoaded', …)` — the orchestrator's bootstrap calls register-functions only after DOMContentLoaded.
- No `window.*` assignments. No global pollution.
- Inside the function, use closures for any state. Read DOM with `document.getElementById('field-<slug>-…')` or `wrapper.querySelector(…)` after grabbing the wrapper once.

## The `ctx` object

The bootstrap creates one `ctx` per page load and passes the same instance to every register function.

```ts
ctx = {
  // Register a query-string segment producer.
  // `order` is the spec's 15-step position (1 = keywords, 4 = site, 9 = filetype, etc.).
  // `fn()` is called every assembly pass; return '' to contribute nothing.
  registerSegment(order: number, fn: () => string): void,

  // Register the field's setter so templates can pre-fill it.
  // Optional — only fields that participate in templates need to register.
  registerField(slug: string, api: { setValue: (v: any) => void }): void,

  // Trigger a preview re-render. Call after any state change.
  requestUpdate(): void,

  // Coaching warnings (visible in both Beginner and Advanced).
  addWarning(slug: string, messageHtml: string): void,
  removeWarning(slug: string): void,

  // Strategy tips (Beginner-only, single-tip-at-a-time, priority-ordered).
  // Higher priority wins ties. Suggested range: 0-100.
  addTip(slug: string, opts: { priority: number, messageHtml: string }): void,
  removeTip(slug: string): void,

  // Arabic normalization. Returns the input unchanged if the toggle is off.
  normalize(text: string): string,

  // Mode state.
  getMode(): 'beginner' | 'advanced',
  onModeChange(callback: (mode: string) => void): void,
}
```

## Worked example: a fictional `field-foo`

```json
{
  "markup": "<div class=\"field field-foo\">\n  <label for=\"field-foo-input\">\n    تجربة\n    <span class=\"op-badge\">foo:</span>\n  </label>\n  <input id=\"field-foo-input\" type=\"text\" />\n  <p class=\"field-help\">شرح الحقل بلغة عربية بسيطة.</p>\n</div>",

  "styles": ".field-foo input { width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; }\n.field-foo input:focus { border-color: var(--accent); outline: 2px solid var(--accent); outline-offset: 1px; }",

  "script": "function registerFieldFoo(ctx) {\n  const input = document.getElementById('field-foo-input');\n  const getValue = () => input.value.trim();\n  ctx.registerField('foo', { setValue: (v) => { input.value = v; ctx.requestUpdate(); } });\n  ctx.registerSegment(99, () => {\n    const v = getValue();\n    return v ? `foo:${ctx.normalize(v)}` : '';\n  });\n  input.addEventListener('input', () => ctx.requestUpdate());\n}"
}
```

The `99` order is illustrative — real operators must use the order from CLAUDE.md "Query assembly logic". The 15 canonical orders are:

| Order | Segment                                      |
| ----- | -------------------------------------------- |
| 1     | keywords                                     |
| 2     | exact phrase (always quoted)                 |
| 3     | excluded words (`-` prefix per token)        |
| 4     | `site:`                                      |
| 5     | `intitle:`                                   |
| 6     | `inurl:`                                     |
| 7     | `intext:`                                    |
| 8     | `inanchor:`                                  |
| 9     | `filetype:`                                  |
| 10    | `before:YYYY-MM-DD`                          |
| 11    | `after:YYYY-MM-DD`                           |
| 12    | proximity (`"a" AROUND(N) "b"`)              |
| 13    | wildcard                                     |
| 14    | number range (`LOW..HIGH`)                   |
| 15    | OR groups (`(a OR b OR c)`)                  |

Empty segments are filtered out and remaining segments joined with single spaces.

## What the validator checks

`validate.js` runs against each fragment JSON before merge. It rejects fragments that:

1. Use bare element selectors (e.g. `input { … }`) anywhere in `styles`.
2. Use `*`, `body`, `html`, or `:root` as a top-level selector.
3. Define multiple top-level functions in `script`, or any top-level `var`/`let`/`const`/`class`.
4. Use `document.addEventListener('DOMContentLoaded'`.
5. Touch `window.*` or any other global.
6. Have a `script` whose one function name doesn't match `register(Field|Warning|Tip)[A-Z]\w*\(ctx\)`.

The validator is fast and cheap. It is not a full parser — it uses regex and is intentionally conservative. False positives can be resolved by tweaking the fragment to be unambiguously valid.
