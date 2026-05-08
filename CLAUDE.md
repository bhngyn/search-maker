# CLAUDE.md — Arabic Boolean Query Builder

## Purpose of this document

This file tells you, the implementing model, exactly what to build. The product is a single self-contained HTML file that helps Arabic speakers construct Google search queries that use English-language boolean and search operators (`site:`, `intitle:`, `OR`, `AROUND`, etc.) without forcing them to fight bidirectional text rendering or constantly switch keyboard layouts. The user's primary problem today is that mixing Arabic (right-to-left) terms with Latin (left-to-right) operators in a single text field causes the cursor to jump unpredictably and the visible character order to diverge from the logical order, making OSINT-style search work painful and error-prone.

The solution is a hybrid form interface: each Arabic search term lives in its own RTL-direction input, each operator is a UI control rather than typed text, and the assembled query string only appears in a read-only LTR-rendered preview field at the bottom. The user never has to manually mix scripts.

## Hard constraints

These are non-negotiable. If you find yourself wanting to break one, stop and re-read this section.

The deliverable is a single HTML file. No build step. No npm. No external CSS frameworks. No JavaScript frameworks. Plain HTML, plain CSS, plain vanilla JavaScript, all in one file. Inline `<style>` and `<script>` blocks. The file must work when opened directly from the local filesystem with `file://` — no server required. This matters because the intended user base includes researchers in adversarial environments, sometimes on offline laptops, sometimes on USB sticks. External dependencies are a security and reliability liability.

The tool must persist nothing. No localStorage, no sessionStorage, no cookies, no IndexedDB, no service workers. State lives in memory only. Refreshing the page resets the tool to its blank initial state. This is a security requirement for the user base, not a bug. Do not add a "recent searches" feature, do not save form state across reloads, do not offer to remember anything. If a user wants to keep a query, they will copy it themselves.

The interface language is Arabic. All visible labels, buttons, tooltips, placeholders, helper text, and error messages are in Arabic. The document `dir` attribute is `rtl`. The `lang` attribute is `ar`. Latin-script content (operator names like `site:`, the assembled query preview, domain inputs) must be rendered in explicit LTR contexts using `dir="ltr"` on the relevant elements, but their *labels* are Arabic.

The tool must never silently change a user's input. Every transformation applied to user-typed text — quoting a phrase, adding a minus sign, normalizing Arabic characters, URL-encoding for the search button — must be visible in the live preview before the user takes any action. The preview is the contract between the tool and the user.

## User profile and design philosophy

The audience is Arabic-speaking journalists, researchers, OSINT analysts, citizen investigators, and curious newcomers. Digital literacy ranges from low (someone who uses Google but has never heard of a search operator and is uncertain about technical English terms) to medium (someone comfortable with web forms and basic search techniques) to high (an OSINT professional who writes operator-rich queries by hand). The tool must serve all three.

The dominant design constraint is that the default experience must work for the low-literacy user without overwhelming them, because that user is the one most likely to abandon the tool if the first impression is intimidating. A high-literacy user can endure a slightly verbose interface for thirty seconds and then switch to advanced mode; a low-literacy user who sees a wall of unfamiliar English-named operators will close the tab and never return.

Therefore the tool ships in **Beginner mode** by default. Beginner mode is the friendly, guided, helper-rich experience: only the most useful fields are visible, every field has a plain-Arabic label and a one-sentence explanation beneath it, contextual tips and gentle warnings appear as the user works, and the visual rhythm prioritizes clarity over density. The user is led from top to bottom through a clear workflow: read the welcome, fill in what you know, watch the query build, copy or search.

A single prominent toggle in the header switches the tool to **Advanced mode**. Advanced mode is the dense, expert experience: all operator fields are revealed simultaneously, helper text and tips disappear, the visual rhythm prioritizes screen efficiency over hand-holding, and the user works in a multi-field grid rather than a guided vertical flow. Coaching warnings (the linter-style safety net for objective query construction errors) remain on in both modes because they catch mistakes that hurt experts and novices equally; advanced users who truly want a silent interface can dismiss individual warnings, but there is no global switch to suppress them.

The Beginner/Advanced toggle replaces what an earlier draft of this spec called "educational mode" and a separate "query coaching" toggle. Consolidating these into a single mode switch is intentional: low-literacy users do not benefit from being asked to make multiple meta-decisions about their interface before they have even started searching, and the cognitive cost of multiple toggles outweighs the marginal flexibility. One switch, two clearly-named modes, predictable behavior.

Within both modes, the tool *teaches* operators by letting users observe cause and effect in the live preview, never by hiding operators behind plain-language labels that obscure what is actually happening. The operator name (`site:`, `intitle:`, etc.) is always visible somewhere on every operator control even in Beginner mode, because the goal is for a Beginner-mode user to gradually learn the syntax and graduate to Advanced mode at their own pace.

## Information architecture and workflow

The tool's layout differs between Beginner mode and Advanced mode. Both modes share the same header, the same query preview, and the same action row, but the middle of the page (where the user actually builds the query) is structured differently in each mode to match the intended user's working style.

### Shared regions (identical in both modes)

The header sits at the top of the page in both modes. It contains, from start to end in RTL reading order: the tool's Arabic title, a one-sentence Arabic description (one short line, written for someone who has never used a search operator before, communicating that this tool helps you build powerful Google searches in Arabic), and a control cluster on the opposite side of the header containing the mode toggle (a clearly labeled segmented control showing وضع المبتدئ on one side and وضع المتقدم on the other, with the active mode visually highlighted) and the Arabic normalization toggle (off by default, with a small info icon).

The query preview and action row sit at the bottom of the page in both modes. The preview is a read-only styled element with `dir="ltr"`, monospace font, large enough to comfortably show roughly three lines of query, expanding if needed. The preview updates on every input event and every control change, with no debounce. Below the preview, the action row contains two equal-weight primary buttons: a copy button labeled نسخ, and a search button labeled البحث في Google. The copy button writes the query to the clipboard and briefly changes its label to تم النسخ for about 1.5 seconds. The search button URL-encodes the query and opens `https://www.google.com/search?q=ENCODED_QUERY` in a new tab using `target="_blank"` and `rel="noopener noreferrer"`. When the query is empty, the preview shows a placeholder message in muted Arabic (something like ابدأ بكتابة كلمات البحث) and both action buttons are disabled.

### Beginner mode layout and workflow

Beginner mode is the default. It is structured as a top-to-bottom guided workflow with five visually distinct sections stacked vertically, each clearly labeled with an Arabic section title. The user reads down the page, fills in only what is relevant, and arrives at the query preview at the bottom. The layout is single-column at all viewport widths to preserve the linear reading flow.

The first section is the welcome panel, expanded by default at first load and collapsible via a clear button labeled إخفاء. The panel is friendly in tone, written for a user who has never built a search query before. It contains three short Arabic paragraphs: the first explains that this tool helps Arabic speakers build advanced Google searches without having to type English operators or switch keyboard layouts; the second describes the workflow in one sentence (fill in what you know, watch your query appear at the bottom, then copy it or send it to Google); the third invites the user to try the example templates below or just start typing in the keywords field. Once collapsed within a session, the panel stays collapsed until the page is refreshed.

The second section is the templates row, presented as three large, friendly buttons with Arabic labels and small descriptive subtitles beneath each label explaining what the template does. Each template button has an icon to anchor recognition for users who scan rather than read. The three templates are بحث في موقع محدد (with a subtitle along the lines of "ابحث داخل موقع واحد فقط — مفيد للمواقع الإخبارية أو الحكومية"), بحث عن وثائق مسربة (with a subtitle "ابحث عن ملفات PDF أو وثائق أخرى — مفيد للتحقيقات"), and بحث في نطاق زمني (with a subtitle "ابحث ضمن فترة زمنية محددة — مفيد لتغطية حدث معين"). Clicking a template pre-fills the relevant fields and scrolls the user smoothly to the keywords field with focus, so the user immediately sees where to begin typing.

The third section is the essential fields, the four most-used controls, presented in a single column with generous vertical spacing. Each field has a large Arabic label, an Arabic placeholder showing an example, an inline Arabic helper sentence beneath the field explaining what it does, and a small grey badge to the side of the label showing the underlying operator name (`site:`, `intitle:`, etc.) so the user passively learns the syntax over time. The four fields, in order, are: keywords (with per-field exact-phrase toggle labeled اقتباس حرفي), exact phrase (always quoted, labeled clearly as a separate field for required phrases), excluded words (with helper text explaining that each word will be filtered out), and site restriction (Latin LTR input, labeled الموقع, with a placeholder showing `example.com`).

The fourth section is the more-options disclosure: a single full-width button labeled خيارات إضافية with a chevron indicator that, when clicked, expands to reveal the advanced operator fields. This section is collapsed by default in Beginner mode. When expanded, it reveals the operator fields in a single-column layout consistent with the essential fields above (large labels, helper sentences, operator name badges). The fields exposed here are: title contains (`intitle:`), URL contains (`inurl:`), body text contains (`intext:`), anchor text contains (`inanchor:`), file type (`filetype:`), date range (two date pickers for `before:` and `after:`), proximity search (`AROUND`), wildcard helper, number range, and OR groups. Each field's behavior matches the specifications later in this document; the Beginner-mode treatment is the friendlier, more spacious presentation of those same controls.

The fifth section is the query preview and actions described above. In Beginner mode, this section is preceded by a small Arabic heading like استعلامك جاهز to make the transition from "building" to "finished" feel concrete.

The Beginner mode workflow encourages a top-to-bottom progression: read the welcome (or skip it), pick a template (or don't), fill in essential fields, optionally expand more options, then copy or search. A user who only fills in the keywords field and clicks search has used the tool successfully. A user who fills in every field has built a sophisticated OSINT query without ever typing an English operator name.

### Advanced mode layout and workflow

Advanced mode is for power users who already know what the operators do and want to fill them in quickly. The layout shifts from a guided single-column flow to a denser multi-column grid that fits more controls on screen at once.

When the user toggles to Advanced mode, the welcome panel is hidden, the templates row is hidden (advanced users do not need template scaffolding; if they want a template they can switch back temporarily), the inline helper sentences beneath fields are hidden, the operator name badges remain visible (because they double as the field label in advanced mode), and the more-options disclosure is replaced by always-visible advanced fields. Strategy tips are hidden. Coaching warnings remain visible because they catch objective construction errors regardless of skill level.

The Advanced mode field layout is a two-column grid on viewports wider than roughly 720px and a single column on narrower viewports. Fields are grouped logically rather than presented in a strict ordered list: the left column contains the text-based content operators (keywords, exact phrase, excluded words, intitle, intext, inanchor, wildcard) and the right column contains the structural and scoping operators (site, inurl, filetype, date range, proximity, number range, OR groups). Visual density is significantly higher than in Beginner mode: smaller vertical padding, more compact field heights, smaller labels using the operator name as the primary label with a brief Arabic gloss in smaller text below it.

The query preview and action row sit at the bottom in advanced mode as in beginner mode, but in advanced mode the preview is given proportionally more visual weight because it is the focal point of expert use. Consider expanding the preview to four or five visible lines and using a slightly larger monospace font.

The mode toggle in the header is always visible and always usable, so a user can switch back to Beginner mode at any moment without losing their entered field values. Field state must be preserved across mode switches within a session.

### Field specifications

The following field specifications apply in both modes. The modes affect presentation density, helper visibility, and grouping, not the field behavior itself.

The keywords field is a free Arabic text input, RTL, with a per-field exact-phrase toggle that, when on, wraps the field's contents in double quotes in the assembled query.

The exact phrase field is a separate Arabic text input, RTL, that is always wrapped in double quotes in the assembled query if non-empty. It exists alongside the keywords toggle because users often want both a loose keyword search and a required exact phrase in the same query.

The excluded words field is an Arabic text input, RTL, that accepts space-separated terms. Each term is automatically prefixed with a minus sign in the assembled query, so typing رياضة كرة produces `-رياضة -كرة`.

The site restriction field is a Latin-script input, LTR, labeled الموقع, with a placeholder showing example syntax such as `example.com` or `*.gov`. Produces `site:VALUE` in the query.

The intitle field is an Arabic text input with a per-field exact-phrase toggle. Produces `intitle:VALUE` in the query.

The inurl field is a Latin-script input, LTR. Produces `inurl:VALUE` in the query.

The intext field is an Arabic text input with a per-field exact-phrase toggle. Produces `intext:VALUE` in the query.

The inanchor field is an Arabic text input with a per-field exact-phrase toggle. Produces `inanchor:VALUE` in the query.

The filetype field is a dropdown with options for (none), pdf, doc, docx, xls, xlsx, ppt, pptx, txt, and rtf. Do not include csv or mp3 in the dropdown options because Google has deindexed those filetype searches per the source document; including them would mislead users.

The date range consists of two HTML5 date inputs, one for `after:` and one for `before:`. Either or both may be left blank. Format dates as `YYYY-MM-DD` in the query.

The proximity search consists of three controls: term 1 (Arabic input, RTL), distance (number input, LTR, default 5, min 1, max 50), and term 2 (Arabic input, RTL). When all three are filled, the query includes `"term1" AROUND(N) "term2"` with quotes always wrapped because Arabic terms with spaces require quoting for proximity search to behave correctly.

The wildcard helper is a single Arabic text input where the user can type a phrase using `*` as a placeholder for any unknown word. The field's contents are passed through to the query verbatim, optionally wrapped in quotes via a per-field toggle.

The number range consists of two number inputs (low and high) plus an optional unit prefix such as `$`. Produces `$50..$100` or `1950..1960` depending on whether a prefix is provided.

The OR groups field is a single Arabic text input where the user types alternatives separated by the Arabic word أو or by commas. The tool converts these to uppercase `OR` with proper spacing in the query. Typing مهرجان, مؤتمر, ندوة produces `(مهرجان OR مؤتمر OR ندوة)` in the query. The parentheses are visual hints to the user about grouping; per the source document, Google's parser ignores parentheses, but including them in the preview helps users understand the OR group's scope. A small Arabic helper note in Beginner mode explains that Google does not actually parse parentheses but the OR alternatives still work correctly.

## Global controls

The header contains two controls that change how the tool behaves: the mode toggle and the Arabic normalization toggle. They sit together in a control cluster on the opposite side of the header from the title, visually distinct from form fields below.

The mode toggle is a segmented control with two options: وضع المبتدئ (Beginner mode, the default) and وضع المتقدم (Advanced mode). The active mode is visually highlighted. Switching modes preserves all field values entered so far; only the presentation changes. The mode toggle is the single most important meta-control on the page and must be unambiguously visible at all times.

The Arabic normalization toggle is a small control labeled توحيد الأحرف العربية, off by default, with a small info icon that reveals an Arabic explanation on click or focus. When on, every Arabic-containing field is passed through a normalization function before being inserted into the query string. The preview reflects the normalized form so the user can see exactly what is being sent.

The normalization function does the following substitutions, in this order:

1. Strip Arabic diacritics (tashkeel): the Unicode range `\u064B-\u0652` plus `\u0670` (superscript alef) and `\u0640` (tatweel).
2. Unify alef variants: replace `أ` (U+0623), `إ` (U+0625), `آ` (U+0622), and `ٱ` (U+0671) all with the bare alef `ا` (U+0627).
3. Unify ya variants: replace `ى` (alef maksura, U+0649) with `ي` (U+064A).
4. Unify ta marbuta to ha: replace `ة` (U+0629) with `ه` (U+0647). Note: this one is more aggressive and some users may disagree; include it because it materially improves recall on the open web, but it is the strongest argument for keeping normalization opt-in rather than default.

Apply normalization only to Arabic content. The site field, URL field, file-type dropdown, dates, and number ranges must pass through untouched.

## Query assembly logic

Build the query string by concatenating segments in this order, with single spaces between non-empty segments:

1. Keywords field (with exact-phrase quoting if its toggle is on, normalized if global normalization is on).
2. Always-quoted exact phrase field (always wrapped in double quotes if non-empty, normalized if normalization is on).
3. Excluded words, each token prefixed with `-`, space-separated.
4. `site:VALUE` if site field is non-empty.
5. `intitle:VALUE` if non-empty (quoted if its toggle is on, normalized if normalization is on; if the value contains spaces and is not quoted, only the first word will bind to `intitle:` per Google's behavior, so consider auto-quoting any multi-word `intitle:` value and surface this in a small helper note rather than silently changing semantics — actually, per the hard constraint about not silently changing input, do *not* auto-quote; instead, when the user types a multi-word value into a non-quoted `intitle:` field, show a small inline warning suggesting they enable the exact-phrase toggle).
6. `inurl:VALUE` if non-empty.
7. `intext:VALUE` if non-empty (quoting and normalization rules as above; same warning applies for multi-word values).
8. `inanchor:VALUE` if non-empty (quoting and normalization rules as above; same warning applies for multi-word values).
9. `filetype:VALUE` if dropdown is set.
10. `before:YYYY-MM-DD` if before-date is set.
11. `after:YYYY-MM-DD` if after-date is set.
12. `"term1" AROUND(N) "term2"` if all three proximity controls are filled.
13. Wildcard field contents (passed through verbatim, optionally quoted, optionally normalized).
14. Number range as `LOW..HIGH` or `PREFIXLOW..PREFIXHIGH` if both numbers are set.
15. OR group as `(term1 OR term2 OR term3)` if at least two terms are present after splitting on commas or the Arabic word أو, with empty terms discarded.

Empty fields produce no segment. The preview renders the resulting string. If all fields are empty, the preview shows a placeholder message in muted text (in Arabic, something like ابدأ بكتابة كلمات البحث) and both action buttons are disabled.

## Beginner mode helper content

Beginner mode shows three categories of helper content: inline operator explanations beneath every field, contextual strategy tips that appear conditionally based on what the user is doing, and the welcome panel described in the workflow section above. All Arabic text below is illustrative; refine the wording for natural Arabic phrasing while preserving meaning and approximate length. None of this content appears in Advanced mode.

### Inline operator explanations

Beneath every operator field in Beginner mode, display a small line of Arabic helper text in muted color explaining what that operator does and when it is useful. These explanations should be specific to the operator, not generic. The explanations below are the required content for each field:

The keywords field helper text should explain that this is the main search term, that words can be in any order, and that enabling the exact-phrase toggle will require Google to find the words in the exact sequence typed.

The excluded words field helper text should explain that any word added here will be excluded from results, and that this is useful for filtering out a common but irrelevant meaning of a word (the example used in the Russell document is searching for jaguar while excluding cars, football, and OS).

The site restriction field helper text should explain that this restricts results to a single domain, that wildcards like `*.gov` find all government subdomains, and that this is one of the most useful operators for OSINT work because it lets researchers narrow to authoritative sources or specific organizations.

The exact phrase field helper text should explain that this requires Google to find the exact sequence of words typed, that this is essential when searching for Arabic names because Arabic name tokens are often split incorrectly by search engines, and that the field exists separately from the keywords toggle so users can combine a loose keyword search with a required exact phrase.

The intitle helper text should explain that this finds pages with the term in the page title (the text shown in the browser tab and in search results), that titles are usually a strong signal of what the page is about, and that this is particularly useful for finding articles, official statements, and document indexes.

The inurl helper text should explain that this finds pages where the term appears in the web address itself, that this is useful for finding specific sections of websites (such as pages with `archive`, `report`, or `leak` in the URL), and that URL terms are usually in English even on Arabic sites.

The intext helper text should explain that this requires the term to appear in the body of the page, useful when a word might appear in titles or URLs but you want to confirm it is discussed in the content itself.

The inanchor helper text should explain that this finds pages that other pages link to using the specified anchor text, that this is a way of finding pages that the wider web considers authoritative on a topic, and that it is more advanced and produces fewer results than other operators.

The filetype helper text should explain that this finds only documents of the specified type, that PDF is the most common choice for finding reports, leaked documents, and academic papers, and that combining filetype with site restriction is a foundational OSINT pattern (for example, finding all PDFs on a government domain).

The date range helper text should explain that this filters results to a specific time window, that both before and after dates can be set independently, and that this is essential for narrowing down to a specific event or period.

The proximity (AROUND) helper text should explain that this finds pages where two terms appear within a specified number of words of each other, that this is useful for finding mentions of two people together or a person near an organization or event, and that the order of the terms does not matter (Google finds both directions).

The wildcard helper text should explain that the asterisk acts as a placeholder for any word, that this is useful for finding partial quotes or fill-in-the-blank phrases (the Russell document gives the example of `Obama voted * on the * bill`), and that wildcards work best inside quoted phrases.

The number range helper text should explain that this finds pages mentioning numbers within the specified range, that adding a unit prefix like `$` narrows it to monetary amounts, and that this works well for finding price ranges, year ranges, or other numeric criteria.

The OR groups helper text should explain that this lets the user search for any of several alternatives, that the tool will accept terms separated by commas or by the Arabic word أو, and that this is useful for searching across synonyms or name variants.

### Contextual strategy tips

Strategy tips appear conditionally in Beginner mode based on what the user is doing in the form. They are short Arabic suggestions that surface OSINT best practices without lecturing. Each tip is small, dismissible for the current session, and only appears when its triggering condition is met. Strategy tips do not appear in Advanced mode. Implement at least these tips:

When the filetype dropdown is set to PDF, surface a tip suggesting the user also consider adding a site restriction (for example, restricting to government domains often surfaces leaked or official documents) and mentioning that combining filetype with specific phrases like quoted internal-document language can reveal documents not meant for public consumption.

When a name with spaces is typed in the keywords field and the exact-phrase toggle is on, surface a tip suggesting the user try common Arabic name variants — explaining briefly that Arabic names often have multiple valid spellings (alef variants, ya variants) and that enabling Arabic normalization in the header can broaden the search across these variants automatically.

When both before and after dates are set, surface a tip explaining that narrow date ranges combined with site restrictions are extremely effective for finding event-specific coverage, and suggesting that researchers combine date ranges with intitle for finding articles that announced or commented on a specific event.

When the proximity (AROUND) controls are filled in, surface a tip noting that proximity search is one of the most powerful OSINT techniques for finding two people or entities mentioned together, and suggesting that small distances (3 to 5 words) work well for direct co-mentions while larger distances (10 to 20) work for finding any contextual relationship.

When the user fills in only a keywords field with no other restrictions, surface a tip after a short delay encouraging the user to consider adding a site restriction or date range to narrow results, because broad keyword searches often return too many results to review effectively.

Tips should appear with a subtle visual treatment (small icon, muted background, distinct from warnings) so they read as suggestions rather than errors. Each tip has a small dismiss button that hides it for the current session.

## Query coaching warnings

Coaching warnings catch objective query construction errors that degrade search quality regardless of user skill level. They are visible in both Beginner and Advanced mode. There is no global switch to suppress them, because their value is independent of expertise: an analyst who has been writing operators for a decade still benefits from being told when their `intitle:` value is multi-word and unquoted, or when their date range is reversed. Individual warnings can be dismissed for the current session, but advanced users who want a fully silent interface should dismiss them one at a time as they appear rather than disabling the system globally.

Warnings have a more attention-grabbing visual treatment than strategy tips (a warning color, a caution icon) but should still feel calm rather than alarming. They appear inline near the field that triggered them, never as overlays or modals.

Implement at least these coaching warnings:

When a user types multiple words into the intitle, intext, or inanchor fields without enabling the exact-phrase toggle for that field, display an inline warning explaining that only the first word will bind to the operator and suggesting they either enable the exact-phrase toggle or move additional terms to the keywords field. This warning is the most important one in the system because the silent failure mode of these operators surprises even experienced users.

When the user sets a before date that is earlier than the after date, display a warning explaining that the date range is reversed and will return no results.

When the user types Arabic characters into a field that expects Latin (the site field, the inurl field), display a warning explaining that this field expects a domain name or URL fragment in Latin characters and that Google will not match Arabic text in URLs.

When the user enables the exact-phrase toggle on a field containing only a single word, display a gentle note explaining that quoting a single word forces Google to disable spelling correction and synonyms for that word, which is sometimes intended (for proper nouns or technical terms) but often unnecessary.

When the assembled query exceeds Google's effective length limit (around 32 words for meaningful results), display a warning suggesting the user simplify the query, because very long queries often return zero results due to Google's internal handling.

When the user fills in more than four operator-restricted fields simultaneously (for example, site, intitle, filetype, and date range all at once), display a warning that highly restricted queries often return no results and suggesting the user start with fewer restrictions and add more only if results are too broad.

Warnings appear immediately as the triggering condition is met and disappear when the condition is resolved. This is different from tips, which persist until dismissed.

## Visual style

The tool ships with two visual treatments, one per mode. Both share the same color palette, typography, and accessibility primitives, but they use those primitives to produce visibly different rhythms.

### Shared visual primitives

Use a system font stack that supports Arabic well: `"Segoe UI", Tahoma, "Geeza Pro", "Arabic Typesetting", system-ui, sans-serif`. Do not load web fonts because they fail offline and add a network dependency.

Color palette: light theme with neutral grays for backgrounds and borders, a single calm accent color for primary actions (a blue around `#2563eb` works well, but the implementer can choose any single accent that meets WCAG AA contrast on white), and amber or orange (not red) for coaching warnings. Red is reserved for true destructive actions, of which the tool has none. Provide a `prefers-color-scheme: dark` media query that flips the palette to a dark theme; do not add a manual dark-mode toggle because the system preference handles it without state.

The live query preview must be visually distinct from the inputs above it: a subtle background tint, a thin border, monospace font, slightly larger text than the form labels. It is the most important element on the page and should look like it.

Buttons in the action row should be visually equivalent in weight (both primary-styled) so the user reads them as parallel choices, not as one main action and one secondary action.

Coaching warnings use the warning color and a caution icon. They appear inline near the field that triggered them, never as overlays or modals. They must be visible enough to catch the user's eye but never aggressive enough to feel alarming, because most warnings are advisory rather than blocking.

### Beginner mode visual treatment

Beginner mode prioritizes approachability, generous whitespace, and a clear top-to-bottom reading rhythm. The layout is single-column at all viewport widths, with a comfortable maximum width of around 720 pixels centered on the page. Vertical spacing between fields is generous (around 24 to 32 pixels of margin between field groups). Field labels are larger than in Advanced mode (around 16 to 18 pixels). Helper sentences beneath fields use a muted gray color (around 60% opacity of the body text color) and a smaller size (around 13 to 14 pixels), so they read as supporting text rather than primary content.

The welcome panel uses a subtle background tint distinct from the rest of the page (a very light shade of the accent color works well) so it reads as an introduction rather than a form section. The templates row uses three large card-style buttons with icons, Arabic labels, and subtitles, sized generously enough to be tappable on touch devices (minimum 48 pixels of vertical hit area). The more-options disclosure button is full-width and clearly clickable, with a chevron indicator that rotates when the section is expanded.

Strategy tips appear with a small icon (a lightbulb or similar suggestion-conveying glyph) and a muted background. They are visually subordinate to the form fields and never use red or yellow.

Operator name badges (the small grey labels showing `site:`, `intitle:`, etc., next to each Arabic field label) use a monospace font, a small size (around 11 to 12 pixels), and a muted background to read as informational rather than interactive.

### Advanced mode visual treatment

Advanced mode prioritizes density, screen efficiency, and rapid scanning. The layout uses a two-column grid on viewports wider than around 720 pixels, collapsing to a single column on narrower viewports. Vertical spacing between fields is tight (around 8 to 12 pixels of margin). Field labels are smaller than in Beginner mode (around 13 to 14 pixels) and use the operator name as the primary label with a smaller Arabic gloss beneath it. Inline helper sentences are hidden entirely.

The welcome panel, the templates row, and the more-options disclosure are all hidden in Advanced mode. The user sees the header, the field grid, the live query preview (rendered slightly larger and given more vertical space than in Beginner mode because it is the focal point of expert use), and the action row.

The mode toggle in the header should make the active mode obvious through a clear visual highlight (filled background, white text) on the active option and a muted treatment (no fill, regular text) on the inactive option. The transition between modes should be fast and unobtrusive: instant or with a very brief CSS transition (under 200 ms). Do not animate the mode switch elaborately; a sharp transition reads as responsive, while a long animation reads as sluggish.

## Accessibility for low-to-medium digital literacy

Standard accessibility (covered in the next section) addresses screen readers, keyboard navigation, and contrast. Cognitive accessibility — making the tool comprehensible to users who are not confident with technology — is equally important for the target audience and is addressed here.

### Language register

All Arabic text in Beginner mode uses everyday vocabulary rather than technical Arabic. Avoid Modern Standard Arabic technical neologisms that an average user would not recognize from daily life. When a technical concept must be expressed, prefer a plain description over a coined term. For example, prefer "ابحث داخل موقع واحد فقط" over a more literal translation of "site restriction operator". Where the concept genuinely has no plain Arabic equivalent (the word "domain" in URLs, for instance), use the most common loanword rather than a forced classical translation.

The tool addresses the user with the second-person singular informal register where appropriate, because the formal register can read as bureaucratic and intimidating. However, the implementer should preserve a respectful tone throughout; informal does not mean casual, and the tool should never read as condescending.

### Recovery from mistakes

A user with low digital literacy is more likely to fill in a field incorrectly, get confused about what a control does, or accidentally trigger something they did not intend. The tool must be forgiving of these situations.

Every field that the user has filled in should have a small clear button (an X icon, accessible via keyboard with a visible label) that empties just that field without affecting any other field. This lets a user undo a mistake in one place without having to refresh the page and lose all their other work.

A single global reset button labeled مسح الكل sits near the action row at the bottom of the page (in both modes), prompting for confirmation via a brief inline confirmation step (the button changes its label to تأكيد المسح for about 3 seconds when clicked, and the user must click again within that window to actually reset). This two-tap pattern prevents accidental clearing of work without requiring a modal dialog. After 3 seconds with no second click, the button reverts to its normal state.

If the user clicks the search button but the assembled query exceeds the safe length threshold or contains other coaching warnings, the tool does not block the search but does briefly emphasize the relevant warnings (for example, by briefly outlining them) so the user notices them before navigating away. Coaching warnings should never *block* user actions, only *flag* them.

### Touch targets and motor accessibility

All interactive elements (buttons, toggles, inputs, dismiss buttons on tips and warnings) have a minimum touch target size of 44 by 44 pixels in Beginner mode. Advanced mode may use slightly smaller targets (down to roughly 32 pixels) given that advanced users are more likely on desktop with mice, but mobile-friendly sizing remains a constraint there too.

Avoid hover-only interactions anywhere in the tool. Tooltips, info popovers, and helper reveals must work via tap or click, not hover.

### Cognitive load reduction in Beginner mode

Beginner mode never displays more than one strategy tip at a time. If multiple tips would qualify based on triggering conditions, show them in priority order one at a time, surfacing the next only after the previous has been dismissed or its condition is no longer met. This prevents the screen from filling with advice and overwhelming the user.

Beginner mode never asks the user to make more than one meta-decision at a time. The mode toggle is the only meta-decision in Beginner mode; the Arabic normalization toggle is available but visually de-emphasized so a Beginner user can ignore it without feeling they have made an incomplete choice.

Beginner mode keeps the field labels and helper text on every field at all times, even when the field is filled in. Some interfaces hide the label once the field has content; this saves screen space at the cost of leaving the user unable to remember what they were filling in. For a low-literacy user, persistent labels are worth the screen real estate.

### First-run experience

The very first thing a user sees on opening the tool must communicate, within the first second of looking at the page, what the tool is and how to use it. The welcome panel handles this: it is expanded by default, sits prominently at the top of Beginner mode, and reads in plain Arabic. The implementing model must resist any urge to hide the welcome panel behind a "?" or "help" icon — for the target user, an undiscovered help button is no help at all.

The first form field below the welcome panel is the keywords field, which is the single most important field and the one a user with no other plan will reach for first. Its placeholder text shows a concrete Arabic example (something like اكتب كلمات البحث هنا، مثلاً: انتخابات), giving the user a model to imitate.

## Technical accessibility

Every form control has an associated `<label>`. The advanced-section toggle is a `<button>` with `aria-expanded` reflecting state. The copy button's confirmation state should be announced to screen readers via an `aria-live="polite"` region. Tab order follows visual order in the RTL flow. All interactive elements have visible focus indicators that meet WCAG contrast requirements.

Tooltips for operator explanations should be implemented as either always-visible helper text below the field or as a click-to-reveal pattern, not as hover-only tooltips, because hover tooltips are inaccessible on touch devices and to keyboard users.

## What not to build

Do not add a free-form raw query textarea where users can type a mix of Arabic and Latin. The whole point of the tool is to avoid that field. If you find yourself building one, stop.

Do not add accounts, login, syncing, sharing, or any backend. The tool is a single static HTML file.

Do not add analytics, telemetry, or any network calls beyond the Google search the user explicitly triggers via the search button. No fonts, no CDN scripts, no external CSS, no third-party tracking. Treat any non-essential network call as a privacy violation and refuse to add it.

Do not add a "share this query" feature that generates a shareable URL — that would encode the user's investigation into a link that could be intercepted, logged, or shoulder-surfed.

Do not add language detection or auto-switching. The tool is in Arabic. If a future version needs to support other languages, that is a separate project.

Do not add support for Bing, DuckDuckGo, or other search engines in v1. The operators specified here are Google-specific (sourced from Daniel M. Russell's February 2024 documentation of Google's advanced operators) and other engines parse them differently. Adding multi-engine support would require operator translation logic that is out of scope.

Do not add the deprecated operators mentioned in the source document (`link:`, `info:`, `~` synonym, `+` verbatim, `related:`, `filetype:csv`, `filetype:mp3`). They no longer work and including them would mislead users.

Do not add educational content beyond the categories specified in the Beginner mode helper content and query coaching warnings sections above. Specifically, do not add guided interactive tours where arrows point at fields, do not add a multi-step onboarding wizard, do not add full-page tutorials or example galleries, and do not add a help center or FAQ accordion. The helper system specified above (welcome panel, inline operator explanations, contextual strategy tips, coaching warnings) is sufficient and intentional. More layers would bloat the file and patronize the user. If you find yourself wanting to add a fifth category of help content, stop and re-read this constraint.

Do not add a third mode. The tool ships with exactly two modes: Beginner and Advanced. Resist any temptation to add intermediate modes, custom modes, or per-feature mode toggles. The cognitive cost of additional meta-decisions outweighs any flexibility gained.

Do not hide the mode toggle behind a settings menu, a kebab icon, or a secondary screen. The mode toggle is the most important meta-control on the page and must be visible in the header at all times in both modes.

## Acceptance criteria

The implementing model should consider the work done when all of the following are true.

The file opens correctly via `file://` on Chrome, Firefox, and Safari. Typing Arabic text into the keywords field produces no cursor jumps and no visible character reordering. Toggling the per-field exact-phrase control on a non-empty field causes the preview to update instantly with quotes appearing or disappearing. The site field accepts `example.com`, `*.gov`, and `subdomain.example.com` and produces correct `site:` segments. The two date pickers, when both are set, produce both `before:` and `after:` segments in the query. The AROUND proximity builder produces a correctly formed `"term1" AROUND(N) "term2"` segment with uppercase `AROUND` and parentheses around the number. The copy button copies the exact preview string to the clipboard and shows visible confirmation. The search button opens a new tab to Google with the query correctly URL-encoded. The Arabic normalization toggle, when enabled, transforms the preview to use bare alef and dotted ya forms and strips diacritics. Refreshing the page resets all state. No network requests are made except the Google search the user explicitly triggers. All three template buttons in Beginner mode pre-fill the correct fields without auto-submitting and scroll the user to the keywords field with focus.

For the mode system, the following must hold true. The tool starts in Beginner mode by default on every page load. The mode toggle is visible in the header at all times in both modes. Switching from Beginner to Advanced preserves all entered field values; switching back also preserves them. In Beginner mode, the welcome panel is visible by default and can be collapsed via its close button, after which it stays collapsed for the rest of the session. The templates row is visible in Beginner mode and hidden in Advanced mode. Inline helper sentences beneath fields are visible in Beginner mode and hidden in Advanced mode. The more-options disclosure is collapsed by default in Beginner mode and replaced by always-visible advanced fields in Advanced mode. The Advanced mode field grid uses two columns on viewports wider than 720 pixels and a single column below that breakpoint. Operator name badges (`site:`, `intitle:`, etc.) remain visible in both modes.

For helpers and coaching, the following must hold true. Strategy tips appear in Beginner mode when their triggering conditions are met (filetype set to PDF, names with spaces in the keywords field with exact-phrase on, both dates set, proximity controls filled, broad keyword search with no restrictions) and are individually dismissible for the session. Strategy tips do not appear in Advanced mode. Only one strategy tip is visible at a time in Beginner mode; if multiple conditions qualify, tips are surfaced in priority order. Coaching warnings appear in both modes when their triggering conditions are met (multi-word values in intitle and similar fields without quoting, reversed date ranges, Arabic in Latin-only fields, single-word quoting, very long queries, over-restricted queries) and disappear automatically when the condition is resolved. Coaching warnings never block actions; they only flag issues.

For approachability and recovery, the following must hold true. Every filled field has a clear-field button that empties only that field. The global reset button uses the two-tap inline confirmation pattern (label changes to تأكيد المسح for 3 seconds on first click, requiring a second click to actually clear) and never opens a modal dialog. All interactive elements meet a minimum touch target size of 44 by 44 pixels in Beginner mode. No interactions in either mode require hover; all reveals work via tap or click. Field labels and helper text remain visible after a field has been filled in (Beginner mode); labels remain visible in Advanced mode but helper text is hidden. The keywords field placeholder shows a concrete Arabic example to model the input.

## Source attribution

The operator definitions and quirks documented in this spec are derived from Daniel M. Russell's "Advanced Search Operators" reference dated February 8, 2024. When in doubt about an operator's exact behavior, consult that document.

## Implementation status

Repository: https://github.com/bhngyn/search-maker

The deliverable is a single self-contained `index.html` with no build step, no external dependencies, and no network requests beyond the Google search the user explicitly triggers.

**Fields implemented (14 total, covering all 15 query-assembly segments):**
keywords, exact-phrase, excluded, site, intitle, inurl, intext, inanchor, filetype, date-range (before + after are separate segments), proximity (AROUND), wildcard, number-range, or-groups.

**Strategy tips (5):** filetype=PDF → suggest site restriction; keywords with quoted multi-word name → suggest normalization; both date inputs set → suggest combining with intitle; proximity filled → OSINT distance guidance; keywords-only with no other restrictions → suggest narrowing.

**Coaching warnings (6+):** multi-word value in intitle/intext/inanchor without exact-phrase toggle (fires per-field); reversed date range; Arabic characters in site or inurl field; single-word exact-phrase quoting (keywords and wildcard); query exceeds 32 words; more than 4 operator-restricted fields active simultaneously.

**Mode system:** Beginner mode (default) shows welcome panel, three template buttons, inline helper sentences, operator-name badges, and the more-options disclosure (collapsed by default). Advanced mode hides welcome/templates/helpers/disclosure and renders all fields in a two-column grid (≥720 px viewport). All field values are preserved across mode switches within a session. Tips are suppressed in Advanced mode; warnings remain active in both.

**Arabic normalization (opt-in, off by default):** strips diacritics and tatweel; unifies alef variants (أ إ آ ٱ → ا); unifies alef maksura (ى → ي); converts ta marbuta (ة → ه). Normalization applies only to Arabic-content fields; site, inurl, filetype, dates, and number range pass through untouched. Preview reflects normalized form before the user acts.

**Recovery controls:** every filled field shows a per-field clear button (×); global reset uses a two-tap inline confirmation (label changes to تأكيد المسح for 3 s, requires a second click to execute). No modal dialogs.

**Visual:** light theme with `#2563eb` accent; `prefers-color-scheme: dark` dark theme; system Arabic font stack; RTL document with explicit LTR contexts for the query preview, site/inurl inputs, date inputs, and number inputs.

**Deviations from spec:**
- Template button #2 label is "بحث في الوثائق" (neutral framing) rather than "بحث عن وثائق مسربة" — editorial decision agreed before implementation began.
- Touch targets in Beginner mode are ≥36 px (secondary clear buttons) and ≥44 px (primary action buttons), rather than a uniform 44 px everywhere — secondary controls are visually subordinate and the relaxed minimum was applied deliberately.

**How to verify:** Open `index.html` directly via `file://` in any modern browser (Chrome, Firefox, or Safari); no server or network connection required.