<div dir="rtl" lang="ar">

# Search Maker — أداة بناء استعلامات البحث

**Search Maker** أداة لبناء استعلامات بحث متقدّمة في **Google** و**X (تويتر)** و**Facebook**، صُمِّمت لمن يكتب بالعربيّة ويحتاج إلى مزج كلماته العربيّة مع عوامل البحث الإنجليزيّة (`site:` و`intitle:` و`filetype:` ونطاقات التواريخ ومجموعات «أو»‎ وغيرها) دون أن يقفز المؤشّر أو يختلّ ترتيب الأحرف كما يحدث عادةً في الكتابة المختلطة داخل حقل واحد.

تعيش كلّ كلمة بحث في **شريحة** مستقلّة، والعوامل أزرار في الواجهة لا أحرف تُكتَب. ويظهر الاستعلام المُجمَّع في **معاينة قابلة للقراءة فقط** أسفل الصفحة، فتعرف في كلّ لحظة ما الذي سيُرسَل بالضبط، ولا تُحفَظ بياناتك في أيّ مكان.

## التجربة المباشِرة

افتح الأداة في متصفّحك: **<https://bhngyn.github.io/search-maker/>**

أو نزِّل ملفّ `search_maker.html` من [صفحة الإصدارات](https://github.com/bhngyn/search-maker/releases) وافتحه بنقرة مزدوجة. يعمل دون تثبيت ودون اتّصال بالإنترنت، حتى من ذاكرة USB.

## ما الذي تستطيع فعله

- **ثلاثة محرّكات في واجهة واحدة.** بدِّل بين Google وX وFacebook من الترويسة، وتنتقل شرائحك بين Google وX دون أن تفقد شيئًا.
- **بناء استعلامات Google وX بالشرائح.** اكتب كلمةً، اضغط Enter، تتحوّل إلى شريحة. اختَر العامل المناسب (`site:`، `intitle:`، `from:`، `@user`، `#tag`، وسواها) من أزرار العوامل قبل الإضافة، بدل كتابته يدويًّا.
- **قواعد منطقيّة دون كتابة.** الشرائح المتجاورة تعني «و»‎ ضمنًا. اضغط مقبض «‎+أو»‎ على شريحة لبدء مجموعة بدائل، أو ابدأ كلمتك بـ`-` لاستبعادها من النتائج، أو اكتبها بين علامتَي اقتباس `"…"` لمطابقتها حرفيًّا.
- **مكتبة وصفات جاهزة.** لوحة فوق المُحرِّر تحوي **خمسًا وثلاثين وصفة بحث** لكلّ محرّك (Google وX)، مرتّبةً حسب نمط التحقيق: من تضييق النطاق والوثائق المسرّبة إلى إعادة بناء المحادثات وفحص شبكات التضخيم. اضغط الوصفة لترى تشريحها وخطوات بنائها يدويًّا، ثم اضغط زرّ **«أضِف الوصفة كاملة»**‎ فتُضاف شرائحها كلّها إلى منطقة الكلمات بضغطة واحدة.
- **نموذج Facebook.** عند اختيار Facebook يحلّ نموذج مُهيَكَل (الأعلى، المنشورات، الأشخاص، الصور، الفيديو، الصفحات) محلّ منطقة الشرائح، فيبني رابط البحث بصيغته المُشفَّرة الكاملة.
- **توحيد الأحرف العربيّة (اختياريّ).** زرّ في الترويسة يوحّد صور الهمزات (أ إ آ ٱ → ا)، والياء (ى → ي)، والتاء المربوطة (ة → ه)، ويزيل التشكيل، فيوسِّع نتائج البحث للأسماء المكتوبة بأشكال مختلفة. والنتيجة تظهر في المعاينة قبل أن ترسلها.
- **عربيّ / إنجليزيّ.** مُبدِّل لغة الواجهة (AR / EN) في الترويسة، والعربيّة هي اللغة الافتراضيّة.
- **لا يُحفَظ شيء.** لا حسابات، ولا اتّصال بخوادم، ولا تتبُّع، ولا تخزين محلّيّ. تحديث الصفحة يُعيد الأداة إلى الصفر. هذا قرار تصميم لجمهور الأداة، لا قصور فيها.

## دليل المستخدم الكامل

شرحٌ مصوَّر لكلّ ميزة بالعربيّة في [`docs/USER_GUIDE.ar.md`](docs/USER_GUIDE.ar.md)، ومتاح أيضًا بصيغة PDF في مجلّد [`docs/`](docs/).

</div>

---

*English version below ↓*

# Search Maker

Search Maker helps Arabic-speaking journalists, researchers, and OSINT analysts construct advanced search queries across **Google**, **X / Twitter**, and **Facebook** without the bidirectional-text headaches of manually typing mixed Arabic / Latin scripts. For Google and X, every search term lives in its own chip (single-script container, operator chosen from a UI control); for Facebook — whose URL filters are an opaque base64-encoded JSON blob, not a query language — the same shell hosts a category-aware form. The cursor never jumps, the assembled query stays visible in a live preview, and nothing is sent anywhere until you click Search.

## Try it

**Live**: <https://bhngyn.github.io/search-maker/>

The hosted page loads the same single-file build that ships in releases. It runs entirely in your browser — the only network calls are the searches you explicitly trigger.

## Use it offline

Download `dist/index.html` from the [latest release](https://github.com/bhngyn/search-maker/releases) (or build it yourself, see below) and open it in any modern browser. No install, no server.

```
open search-maker/dist/index.html
```

The whole app — HTML, CSS, JS — is one self-contained file. It works directly from `file://` and is safe to carry on a USB stick.

## What it does

- **Three engines, one shell.** Switch between Google, X / Twitter, and Facebook from the header. Chip state is preserved across Google ↔ X swaps; Facebook has its own form.
- **Chip composer (Google + X).** Type a word and press Enter to commit it as a chip. Operators (`site:`, `intitle:`, `inurl:`, `intext:`, `inanchor:`, `filetype:`, `before:`/`after:`, `AROUND`, X's `from:`, `to:`, `@user`, `#tag`, `lang:`, `near:`, `filter:`, `min_faves:` …) are UI controls, not typed text.
- **Boolean grammar without typing.** Adjacent chips imply AND. Click a chip's `+أو` handle (or press Shift+Enter) to start an OR group. Type a leading `-` or click the chip's `−` toggle to negate. Wrap input in `"…"` (or use the `اقتباس حرفي` toggle) to commit a literal phrase.
- **OSINT recipe library.** A dedicated panel above the composer ships 35 pre-built recipes per engine — Russell-grounded for Google (vocabulary refinement, position-of-keyword, Wayback pivots, Arab-region TLDs), and an investigator-arc catalog for X (origin, amplification via `quoted_tweet_id`, conversation reconstruction via `conversation_id`, `source:` fingerprinting, geo-image verification). Click a recipe to see its anatomy, "build it manually" steps, and assembled pattern; click Apply to seed your workspace.
- **Facebook form.** When the engine is Facebook, the chip area is replaced by a category-aware form (Top, Posts, People, Photos, Videos, Pages) that builds the WhoPostedWhat-style `?q=…&filters={base64-JSON}` URL. ID-driven filters (page ID, group ID, location ID, …) are intentionally omitted — they require ID-discovery support that doesn't exist yet.
- **Live preview.** The assembled query (or, for Facebook, the assembled URL) sits in a sticky monospace box at the bottom. Each chip's contribution is highlighted when you focus or add it, so the chip → string mapping is always visible. Click the box to copy.
- **Coaching warnings + tips.** Banner warnings flag aggregate concerns (query too long, too many restrictions, Latin-only operator with Arabic chars). Per-chip glyphs catch chip-local issues (multi-word `intitle:` without quoting, inverted date range) and offer one-tap fixes. Tips suggest OSINT best practices in context.
- **Arabic character normalization.** Optional toggle unifies alef variants (أ إ آ ٱ → ا), ya variants (ى → ي), ta marbuta (ة → ه), and strips diacritics. Off by default. Applies only to Arabic-aware fields; `site:`, `inurl:`, dates, and number ranges pass through untouched. The preview shows exactly what gets normalized.
- **Bilingual UI.** AR / EN language toggle in the header. AR is the default and the canonical voice.
- **Paste-parsing.** Paste a Google- or X-style query string and it tokenizes into chips in one pass with an undo toast.
- **No persistence.** No localStorage, no cookies, no telemetry. Refresh = blank slate. This is a security requirement for the audience, not a bug.

See [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) (English) or [`docs/USER_GUIDE.ar.md`](docs/USER_GUIDE.ar.md) (Arabic) for a screenshot-led walkthrough — also bound as printable PDFs in [`docs/`](docs/).

## Privacy

Zero network requests except the search you explicitly trigger via the search button (Google, X, or Facebook). No fonts, no CDN scripts, no analytics. Everything runs locally in your browser.

## Develop

Source lives under `src/` and compiles to `dist/index.html` via Vite + `vite-plugin-singlefile`.

```bash
npm install              # one-time
npm run dev              # Vite dev server with HMR (port 5173)
npm run build            # produces dist/index.html (+ search_maker.html + .nojekyll for Pages)
npm run preview          # serves dist/ locally (port 4173)
```

The shipping artifact is `dist/index.html`. The production build inlines every CSS and JS chunk, so the output has zero runtime dependencies and no network calls beyond the user-triggered search. Pushes to `main` deploy automatically to GitHub Pages via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

### Architecture

```
src/
  main.js                 bootstrap; wires engine controller, ctx, registries
  core/                   ctx, engine controller, chip-state, assemble, preview, normalize, warnings, tips, history, lang, parse-query
  engines/                google.js, x.js, facebook.js — descriptors driving operator catalogues, drawer items, search URLs, idiom catalogs
  idioms/                 google.js (35 recipes), x.js (35 recipes), sandbox.js, explain.js
  chips/                  keyword, or-connector, filetype, date-range, proximity, number-range, filter (X), engagement (X)
  ui/                     idiom-panel, chip-area, composer, drawer, facebook-form, normalize-toggle, arabic-calendar, …
  warnings/, tips/        per-module register(ctx, deps) files
  styles/                 tokens, base, chips, idioms, facebook
```

Adding a chip type: create `src/chips/<slug>.js` exporting `type`, `label`, `defaultProps()`, `assemble(chip, ctx)`, `render(chip, handlers)`; add it to `src/chips/_registry.js`.

Adding an engine: create `src/engines/<id>.js` with the descriptor (keyword operators, drawer items, templates, search URL, idioms / groups); register it in `main.js`, the header toggle, and the body-class CSS list. The Facebook descriptor demonstrates the `formBased: true` path with a `buildUrl(state)` instead of a chip segment.

Adding a warning or tip: create `src/warnings/<slug>.js` (or `src/tips/<slug>.js`) exporting `register(ctx, deps)` returning `{ onRender }` if it needs to recompute on every preview pass; add it to the corresponding `_registry.js`.

The `ctx` object (`src/core/ctx.js`) is the single integration seam between modules. The full design spec is [`CLAUDE.md`](CLAUDE.md); X-specific operator notes are in [`CLAUDE-X.md`](CLAUDE-X.md).

## Status

Production. Multi-engine (Google + X + Facebook) chip composer and Facebook form, OSINT recipe library, paste-parsing, AR / EN bilingual UI, dark theme only.

## License

MIT — see [LICENSE](LICENSE).
