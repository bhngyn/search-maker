// Google OSINT idioms — 35 recipes in 7 groups of 5.
//
// Source of truth: Daniel M. Russell "Advanced Search Operators" (Feb 8, 2024)
// and his SearchResearch blog corpus (~16 years of posts). The grid order
// reflects a deep audit: Russell's #1 habit is vocabulary refinement (Row 3);
// his stated favorite operator is `intext:` (Row 6); his signature idioms
// (subdomain-discovery, fill-blank, subdomain-star) anchor Row 1 and Row 7.
//
// Arab-region tactical idioms (`arab-gov-tlds`, `arabic-leak-stamps`,
// `arabic-name-variants`) translate Russell's "search by synonyms" principle
// into the multi-state, multi-script reality of Arabic-language OSINT.

export const IDIOMS = [
  // ── Row 1: نطاقات ─────────────────────────────────────────────────────────
  {
    id: 'gov-only',
    title: { ar: 'حكومي أمريكي فقط', en: 'US government only' },
    icon: '🏛️',
    pattern: 'site:.gov',
    description: {
      ar: 'يقصر النتائج على نطاقات .gov، وهي حصراً للحكومة الفيدرالية الأمريكية. مدخل سريع للتقارير والإحصاءات والوثائق الرسمية الأمريكية الأصلية. للجهات الحكومية العربية، استخدم وصفة "جهات حكومية عربية" التي تعتمد لاحقات .gov.sa و.gov.ae و.gov.eg وغيرها.',
      en: 'Limits results to .gov domains — reserved exclusively for the US federal government. A fast door into US federal reports, statistics, and original official documents without media noise. For Arab government bodies, use the "Arab government TLDs" recipe (which targets .gov.sa, .gov.ae, .gov.eg, and friends).',
    },
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '.gov' });
    },
  },
  {
    id: 'edu-only',
    title: { ar: 'جامعي فقط', en: 'Universities only' },
    icon: '🎓',
    pattern: 'site:.edu',
    description: {
      ar: 'نتائج من الجامعات. الأبحاث والأطروحات تُنشر هنا، لا في المواقع الإخبارية.',
      en: 'University-only results. Academic research and theses live here, not on news sites.',
    },
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '.edu' });
    },
  },
  {
    id: 'arab-gov-tlds',
    title: { ar: 'جهات حكومية عربية', en: 'Arab government TLDs' },
    icon: '🌍',
    pattern: 'site:.gov.sa OR site:.gov.ae OR site:.gov.eg',
    description: {
      ar: 'شبكة المصادر الحكومية العربية في استعلام واحد بدلاً من ثلاثة متتالية. عدّل النطاقات لتشمل الدول التي تهمّك (.gov.qa, .gov.bh, .gov.ma...).',
      en: 'Arab government sources in a single query instead of three sequential searches. Adjust the TLDs for the countries you care about (.gov.qa, .gov.bh, .gov.ma…).',
    },
    group: 'sites',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'site', text: '.gov.sa' });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'site', text: '.gov.ae' });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId2, 'keyword', { operator: 'site', text: '.gov.eg' });
    },
  },
  {
    id: 'path-fragment',
    title: { ar: 'داخل قسم محدد', en: 'Inside a specific section' },
    icon: '📂',
    pattern: 'site:domain.gov/section',
    description: {
      ar: 'يضيّق البحث إلى قسم محدد داخل موقع كبير دون الحاجة لمعرفة هيكلة نطاقاته الفرعية. مفيد للبوابات الحكومية الضخمة ذات الأقسام المتعددة، مثل site:moh.gov.sa/Ministry "تقرير سنوي" للوصول إلى التقارير السنوية في قسم بعينه.',
      en: 'Narrows the search to a specific section of a large site without needing to know its subdomain layout. Useful for sprawling government portals with many divisions, e.g. site:moh.gov.sa/Ministry "annual report" to reach a particular division\'s reports.',
    },
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '' });
    },
  },
  {
    id: 'subdomain-discovery',
    title: { ar: 'نطاقات فرعية', en: 'Subdomain discovery' },
    icon: '🔍',
    pattern: 'site:X -site:www.X',
    description: {
      ar: 'يبحث داخل موقع ويستبعد النطاق الرئيسي www. — يكشف النطاقات الفرعية الجانبية والداخلية مثل intranet.x.com أو staff.x.com. مفيد لرسم خريطة بنية موقع كبير وكشف بوابات داخلية لم يقصد أصحابها نشرها للعموم.',
      en: 'Searches inside a site while excluding the main www. host — surfaces side and internal subdomains like intranet.x.com or staff.x.com. Useful for mapping the structure of a large site and exposing internal portals the owners didn\'t mean to publish openly.',
    },
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '' });
      chipState.add('keyword', { operator: 'site', text: 'www.', negate: true });
    },
  },

  // ── Row 2: وثائق ──────────────────────────────────────────────────────────
  {
    id: 'file-pdf',
    title: { ar: 'ملفات PDF', en: 'PDF files only' },
    icon: '📄',
    pattern: 'filetype:pdf',
    description: {
      ar: 'تقارير، وثائق رسمية، أبحاث منشورة. PDF هو الصيغة الأشيع للمحتوى الموثّق.',
      en: 'Reports, official documents, published research. PDF is the most common format for documented material.',
    },
    group: 'docs',
    apply(chipState) {
      chipState.add('filetype', { value: 'pdf' });
    },
  },
  {
    id: 'file-excel',
    title: { ar: 'جداول Excel', en: 'Excel spreadsheets' },
    icon: '📊',
    pattern: 'filetype:xlsx',
    description: {
      ar: 'موازنات، رواتب، إحصاءات قابلة للحساب — تُنشر غالباً بسهو أو بحكم الإلزام. مفيد عندما تحتاج البيانات الخام لإجراء حساباتك بنفسك بدلاً من الاكتفاء بملخّص في تقرير صحفي.',
      en: 'Budgets, payrolls, computable statistics — often published by accident or because disclosure rules require it. Useful when you need the raw numbers to run your own calculations rather than relying on a summary in a news report.',
    },
    group: 'docs',
    apply(chipState) {
      chipState.add('filetype', { value: 'xlsx' });
    },
  },
  {
    id: 'gov-doc-on-topic',
    title: { ar: 'وثيقة حكومية حول موضوع', en: 'Government document on a topic' },
    icon: '🏢',
    pattern: 'site:.gov filetype:pdf _____',
    description: {
      ar: 'تركيبة بحث ثلاثية: نطاق + صيغة + موضوع. تُظهر الوثيقة الأصلية الصادرة عن الجهة لا التغطية الإعلامية لها. مفيد للوصول إلى المصدر الأول لإحصاء أو ميزانية أو لائحة، مثل site:.gov.eg filetype:pdf إحصاء أو site:.gov.jo filetype:xlsx ميزانية.',
      en: 'A three-part research compound: domain + filetype + topic. Surfaces the source document issued by the agency itself, not the media coverage of it. Useful for getting to the primary source of a statistic, budget, or regulation, e.g. site:.gov.eg filetype:pdf statistic, or site:.gov.jo filetype:xlsx budget.',
    },
    group: 'docs',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '.gov' });
      chipState.add('filetype', { value: 'pdf' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'leaked-draft',
    title: { ar: 'مسودة مسرّبة', en: 'Leaked draft document' },
    icon: '📝',
    pattern: '(intitle:"draft" OR intitle:"v1" OR intitle:"final") filetype:pdf',
    description: {
      ar: 'كثير من الوثائق تُحفظ بأسماء مثل report-draft.pdf ولا تُحذف من الخوادم بعد نشر النسخة النهائية. مدخل للنسخ المبكرة قبل التنقيح.',
      en: 'Many documents get saved as report-draft.pdf and stay on the server even after the final version ships. A door into early versions before they were polished.',
    },
    group: 'docs',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'intitle', text: 'draft', quoted: true });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'intitle', text: 'v1', quoted: true });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId2, 'keyword', { operator: 'intitle', text: 'final', quoted: true });
      chipState.add('filetype', { value: 'pdf' });
    },
  },
  {
    id: 'arabic-leak-stamps',
    title: { ar: 'أختام عربية للوثائق الداخلية', en: 'Arabic internal-document stamps' },
    icon: '🔏',
    pattern: '("سري" OR "للاستخدام الداخلي" OR "خاص") filetype:pdf',
    description: {
      ar: 'الأختام النصية في الوثائق العربية تُكتب صراحة في النص؛ Google يفهرسها كنصّ قابل للبحث. مفتاح للوثائق الإدارية المسرّبة بسهو.',
      en: 'Stamp text in Arabic documents is written into the text layer, not stamped as an image — Google indexes it as searchable text. A key for administrative documents leaked by accident.',
    },
    group: 'docs',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: 'سري', quoted: true });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'none', text: 'للاستخدام الداخلي', quoted: true });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId2, 'keyword', { operator: 'none', text: 'خاص', quoted: true });
      chipState.add('filetype', { value: 'pdf' });
    },
  },

  // ── Row 3: مفردات ─────────────────────────────────────────────────────────
  // Russell's #1 habit: vocabulary refinement before the real query.
  {
    id: 'wikipedia-arabic-mine',
    title: { ar: 'قاموس ويكيبيديا العربية', en: 'Mine Arabic Wikipedia for vocabulary' },
    icon: '📖',
    pattern: 'site:ar.wikipedia.org _____',
    description: {
      ar: 'ابحث في ويكيبيديا العربية عن المصطلح الفنّي الذي يستخدمه المتخصصون قبل تشغيل الاستعلام الحقيقي. مفيد عندما تحقق في موضوع تخصصي ولا تعرف بعد المفردة الدقيقة التي يتداولها أهل الميدان — خطوة تمهيدية تختار لك مفردات بحث أفضل.',
      en: 'Search Arabic Wikipedia for the technical term specialists actually use before running the real query. Useful when you\'re investigating a specialized topic and don\'t yet know the exact wording the field uses — a vocabulary-scouting pass that gives the real query better keywords.',
    },
    group: 'vocabulary',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'ar.wikipedia.org' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'wikipedia-en-mine',
    title: { ar: 'قاموس ويكيبيديا الإنجليزية', en: 'Mine English Wikipedia for vocabulary' },
    icon: '📚',
    pattern: 'site:en.wikipedia.org _____',
    description: {
      ar: 'يجد المقابل الإنجليزي لمصطلح ما تمهيداً للبحث في المصادر الدولية. مفيد قبل التوسع إلى وكالات أنباء أو وثائق أجنبية، حتى تنطلق بالكلمة التي يستخدمها الناطقون بالإنجليزية فعلاً، لا بترجمة حرفية.',
      en: 'Find the English equivalent of a term as a prelude to searching international sources. Useful before expanding into foreign news outlets or documents — gives you the word English-speakers actually use, not a literal translation.',
    },
    group: 'vocabulary',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'en.wikipedia.org' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'transliteration-or',
    title: { ar: 'كل صيغ الاسم', en: 'All spellings of a name' },
    icon: '🔤',
    pattern: '"أحمد" OR "Ahmad" OR "Ahmed"',
    description: {
      ar: 'جميع الصيغ الإملائية للاسم بالعربية واللاتينية في استعلام واحد — جوهر العمل المعلوماتي العربي عبر اللغات. أضف صيغ رابعة وخامسة إن وُجدت.',
      en: 'Every spelling of a name in Arabic and Latin script in one query — the core of cross-language Arabic OSINT. Add a fourth or fifth spelling if it exists.',
    },
    group: 'vocabulary',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'none', text: '', quoted: true });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId2, 'keyword', { operator: 'none', text: '', quoted: true });
    },
  },
  {
    id: 'synonym-paraphrase',
    title: { ar: 'صيغ تعبير متعددة', en: 'Multiple ways to phrase the same act' },
    icon: '💬',
    pattern: '"قال" OR "صرّح" OR "أكد" OR "أعلن"',
    description: {
      ar: 'يلتقط جميع الطرق التي يَنسب بها الإعلام تصريحاً ما لشخصية (قال، صرّح، أكد، أعلن…). مفيد عندما تجمع كل ما قاله شخص حول موضوع، لئلا تفوتك تصريحات صيغت بأفعال مختلفة. اقرنه باسم الشخصية لاسترجاع تصريحاتها بصياغاتها كافة.',
      en: 'Catches every way the media attributes a quote to a public figure (said, stated, claimed, denied…). Useful when you\'re gathering everything a person has said on a topic and don\'t want to miss statements phrased with different verbs. Pair it with a name to pull all their statements regardless of phrasing.',
    },
    group: 'vocabulary',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: 'قال', quoted: true });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'none', text: 'صرّح', quoted: true });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      const id3 = chipState.addAfter(orId2, 'keyword', { operator: 'none', text: 'أكد', quoted: true });
      const orId3 = chipState.addAfter(id3, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId3, 'keyword', { operator: 'none', text: 'أعلن', quoted: true });
    },
  },
  {
    id: 'arabic-name-variants',
    title: { ar: 'صيغ إملائية متعددة', en: 'Arabic spelling variants' },
    icon: '✏️',
    pattern: '"أحمد" OR "احمد"',
    description: {
      ar: '(للحالات بدون توحيد الأحرف) يلتقط صفحات كُتبت بهمزة وصفحات بدونها في استعلام واحد. مفيد عندما تريد العبارة بصيغتيها دون تشغيل toggle التوحيد العام.',
      en: '(For cases without character normalization) Catches pages written with the hamza and pages written without it in a single query. Useful when you want both spellings without flipping the global normalization toggle.',
    },
    group: 'vocabulary',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId1, 'keyword', { operator: 'none', text: '', quoted: true });
    },
  },

  // ── Row 4: زمن ───────────────────────────────────────────────────────────
  {
    id: 'last-month',
    title: { ar: 'آخر شهر', en: 'Last 30 days' },
    icon: '📅',
    pattern: 'after:30d',
    description: {
      ar: 'نتائج من الثلاثين يوماً الماضية. الأنسب لمتابعة قصة جارية.',
      en: 'Results from the last thirty days. Best for following a developing story.',
    },
    group: 'time',
    apply(chipState) {
      const today = new Date();
      const past = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('date-range', { after: fmt(past), before: '' });
    },
  },
  {
    id: 'last-year',
    title: { ar: 'آخر سنة', en: 'Last 12 months' },
    icon: '🗓️',
    pattern: 'after:1y',
    description: {
      ar: 'نتائج آخر اثني عشر شهراً. يحجب الأرشيف القديم الذي يطغى على الأخبار الحديثة.',
      en: 'Results from the last twelve months. Hides the older archive that often drowns out recent news.',
    },
    group: 'time',
    apply(chipState) {
      const today = new Date();
      const past = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('date-range', { after: fmt(past), before: '' });
    },
  },
  {
    id: 'before-event',
    title: { ar: 'قبل حدث', en: 'Before an event' },
    icon: '⏮️',
    pattern: '"_____" before:event-date -event-noun',
    description: {
      ar: 'يكشف كيف غُطِّيت جهة أو شركة قبل أن تتصدّر العناوين بسبب حادث. الشكل العام: "[الجهة]" before:[تاريخ الحادث] -[اسم الحادث] — يستبعد ضجيج ما-بعد-الحادث ويُظهر الذاكرة المؤسسية ما-قبله. مفيد للتحقيقات الاستعادية: ما الذي كان يُقال عن الجهة قبل أن تنفجر الفضيحة؟',
      en: 'Surfaces how an entity was covered before it hit the headlines because of an incident. Shape: "[entity]" before:[event date] -[event noun] — excludes the post-event noise and reveals the institutional memory from before. Useful for retrospective investigations: what was being said about the entity before the scandal broke?',
    },
    group: 'time',
    apply(chipState) {
      const today = new Date();
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.add('date-range', { before: fmt(today), after: '' });
      chipState.add('keyword', { operator: 'none', text: '', negate: true });
    },
  },
  {
    id: 'custom-range',
    title: { ar: 'نطاق زمني مخصص', en: 'Custom date range' },
    icon: '📆',
    pattern: 'after:YYYY-MM-DD before:YYYY-MM-DD',
    description: {
      ar: 'تحديد فترة زمنية بأي تاريخين تختارهما. مفيد عندما تحقق في حدث في تاريخ معروف بدقة، أو حين تريد تأطير نتائجك في نافذة زمنية لا تطابق آخر شهر أو آخر سنة. اضغط على حقلَي التاريخ في البطاقة المضافة لاختيار البداية والنهاية.',
      en: 'Pick any two dates as your time window. Useful when investigating an event with a known date, or when you need a window that doesn\'t match the last-30-days or last-12-months preset. Click the two date fields in the added chip to choose start and end.',
    },
    group: 'time',
    apply(chipState) {
      chipState.add('date-range', { after: '', before: '' });
    },
  },
  {
    id: 'wayback-pivot',
    title: { ar: 'أرشيف الإنترنت', en: 'Wayback pivot' },
    icon: '🏛️',
    pattern: 'site:web.archive.org _____',
    description: {
      ar: 'يحوّل الاستعلام إلى أرشيف Wayback Machine حيث تظلّ الصفحات المحذوفة محفوظة. مفيد عندما يصطدم البحث الحرّ بصفحة محذوفة أو خطأ 404 — خاصةً لاسترجاع صفحات أُزيلت بعد كشف فضيحة أو تحت ضغط قانوني.',
      en: 'Redirects the query into the Wayback Machine archive, where deleted pages live on. Useful when the open-web search hits a dead end (page removed, 404) — especially for recovering pages taken down after a scandal broke or under legal pressure.',
    },
    group: 'time',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'web.archive.org' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },

  // ── Row 5: بنية منطقية ───────────────────────────────────────────────────
  {
    id: 'or-two',
    title: { ar: 'بديلان', en: 'Two alternatives' },
    icon: '⚖️',
    pattern: 'A OR B',
    description: {
      ar: 'تطابق أيّ من كلمتين — للبحث بأكثر من تهجئة لمرادف أو مفهوم.',
      en: 'Match either of two words — useful for searching alternative spellings of a synonym or concept.',
    },
    group: 'boolean',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: '' });
      const orId = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId, 'keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'or-three',
    title: { ar: 'ثلاثة بدائل', en: 'Three alternatives' },
    icon: '🔀',
    pattern: 'A OR B OR C',
    description: {
      ar: 'تطابق أيّ من ثلاث كلمات. مفيد عند تعدد التهجئات أو المرادفات.',
      en: 'Match any of three words. Useful when a term has several spellings or synonyms.',
    },
    group: 'boolean',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: '' });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'none', text: '' });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId2, 'keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'exclude-word',
    title: { ar: 'استبعاد كلمة', en: 'Exclude a word' },
    icon: '🚫',
    pattern: 'topic -noise',
    description: {
      ar: 'استبعاد كلمة من النتائج لإخفاء معنى ثانوي مزعج (مثلاً "جاكوار" بدون "سيارة").',
      en: 'Drop a word from the results to suppress a noisy secondary meaning (e.g. "jaguar" without "car").',
    },
    group: 'boolean',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', negate: true });
    },
  },
  {
    id: 'exclude-wikipedia',
    title: { ar: 'استبعاد ويكيبيديا', en: 'Exclude Wikipedia' },
    icon: '🚫',
    pattern: '-site:wikipedia.org',
    description: {
      ar: 'استبعاد ويكيبيديا للوصول إلى المصادر الأولية بدلاً من الملخّص الموسوعي. يكسر هيمنة ويكيبيديا على الصفحة الأولى.',
      en: 'Drop Wikipedia to reach primary sources instead of the encyclopedia summary. Breaks Wikipedia\'s grip on the first page of results.',
    },
    group: 'boolean',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'wikipedia.org', negate: true });
    },
  },
  {
    id: 'co-mention',
    title: { ar: 'اقتران اسمين', en: 'Two names mentioned together' },
    icon: '🔗',
    pattern: '"name1" AROUND(5) "name2"',
    description: {
      ar: 'يبحث عن كلمتين تظهران متجاورتين ضمن خمس كلمات. الشكل العام: "[اسم أول]" AROUND(5) "[اسم ثانٍ]". مفيد لربط شخصين أو كياناً وحدثاً معاً، خصوصاً حين يفصل بينهما لقب أو صفة فلا يلتقطهما الاقتباس الحرفي ("الوزير محمد علي" مثلاً).',
      en: 'Finds two words that appear within five words of each other. Shape: "[first name]" AROUND(5) "[second name]". Useful for linking two people, or an entity to an event, especially when a title or descriptor sits between them and a literal phrase wouldn\'t match (e.g. "Minister Mohamed Ali").',
    },
    group: 'boolean',
    apply(chipState) {
      chipState.add('proximity', { term1: '', distance: 5, term2: '' });
    },
  },

  // ── Row 6: موقع الكلمة ───────────────────────────────────────────────────
  {
    id: 'in-title',
    title: { ar: 'في العنوان', en: 'Match in page title' },
    icon: '🏷️',
    pattern: 'intitle:_____',
    description: {
      ar: 'الصفحات التي يكون موضوعها الرئيسي هذا المصطلح، لا تلك التي تذكره عرضاً. يَفصل التغطية الجوهرية عن التغطية العابرة.',
      en: 'Pages where the term is the main topic, not pages that mention it in passing. Separates substantive coverage from drive-by mentions.',
    },
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'intitle', text: '' });
    },
  },
  {
    id: 'in-text-body',
    title: { ar: 'في نصّ الصفحة', en: 'Match in page body' },
    icon: '📃',
    pattern: 'intext:_____',
    description: {
      ar: 'يفرض ظهور الكلمة في جسم الصفحة لا في زخارفها (شريط جانبي، قائمة منسدلة، تذييل). مفيد لاستبعاد الصفحات التي تذكر الكلمة في القوائم العامة أو نصوص الإطار دون أن تتناولها فعلاً — يرفع جودة النتائج بشكل ملحوظ.',
      en: 'Forces the word to appear in the page body, not its chrome (sidebar, dropdown, footer). Useful for filtering out pages that show the term in boilerplate or navigation but don\'t actually discuss it — a noticeable lift in result quality.',
    },
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'intext', text: '' });
    },
  },
  {
    id: 'in-text-doubled',
    title: { ar: 'كلمتان في النصّ', en: 'Two terms in the page body' },
    icon: '📑',
    pattern: 'intext:"A" intext:"B"',
    description: {
      ar: 'يُجبر تواجد عبارتين معاً في نصّ الصفحة لا في الزخارف. مفيد عندما تحقق في تقاطع موضوعين وتريد ضمانة قوية بأن الصفحة تتناولهما فعلاً، مثل intext:"[اسم]" intext:"تحقيق" — يُقصي الصفحات التي تذكر الكلمتين كلٍّ في موضع منفصل بلا علاقة بينهما.',
      en: 'Forces both phrases to appear together in the body text, not the chrome. Useful when investigating the intersection of two topics and you want strong assurance the page actually concerns both, e.g. intext:"[name]" intext:"investigation" — filters out pages that mention each term separately with no real connection.',
    },
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'intext', text: '', quoted: true });
      chipState.add('keyword', { operator: 'intext', text: '', quoted: true });
    },
  },
  {
    id: 'in-url',
    title: { ar: 'في الرابط', en: 'Match in URL' },
    icon: '🔗',
    pattern: 'inurl:_____',
    description: {
      ar: 'يطابق نمطاً في رابط الصفحة. مفيد لاكتشاف مسارات موحّدة (/budget/, /leaked/, /press/).',
      en: 'Match a pattern in the page URL. Useful for finding common paths (/budget/, /leaked/, /press/).',
    },
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'inurl', text: '' });
    },
  },
  {
    id: 'literal-phrase',
    title: { ar: 'اقتباس حرفي', en: 'Literal phrase' },
    icon: '"',
    pattern: '"_____"',
    description: {
      ar: 'بحث عن العبارة بترتيبها الحرفي بلا مرادفات أو توسعة. ضروري لاقتباس مباشر أو اسم مكتوب بطريقة محددة.',
      en: 'Search for the phrase in literal order, with no synonyms or expansion. Essential for direct quotes or a name spelled in a specific way.',
    },
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
    },
  },

  // ── Row 7: توقيع المحقق ──────────────────────────────────────────────────
  // Russell's three explicit Feb 2024 PDF idioms + journalist-recovery moves.
  {
    id: 'fill-blank',
    title: { ar: 'ملء فراغ في عبارة', en: 'Fill in the blank' },
    icon: '⭐',
    pattern: '"phrase * here"',
    description: {
      ar: 'النجمة داخل اقتباس حرفي تملأ مكان كلمة مجهولة. مفيد لاستعادة عبارة تتذكّر ترتيبها لكنك لا تتذكّر إحدى كلماتها — اقتباس سمعته جزئياً، أو شعار حملة فاتك جزء منه.',
      en: 'An asterisk inside a quoted phrase fills in an unknown word. Useful for recovering a phrase whose order you remember but whose middle word you don\'t — a quote you heard only partially, or a campaign slogan you half-remember.',
    },
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: 'كلمة * كلمة', quoted: true });
    },
  },
  {
    id: 'quote-attribution',
    title: { ar: 'استرجاع اقتباس مفقود', en: 'Recover a half-remembered quote' },
    icon: '🎯',
    pattern: '"قال * إنّ *"',
    description: {
      ar: 'يبحث عن اقتباس ذي هيكل ثابت مع نجوم تنوب عن الأسماء المجهولة. مفيد لاكتشاف من قال ماذا في الخطاب الرسمي النمطي، أو لاسترجاع تصريحات تعرف صياغتها لكن لا تعرف صاحبها أو من خصّه بالحديث.',
      en: 'Searches for a quote with a fixed structure and asterisks standing in for unknown names. Useful for uncovering who said what in formulaic public statements, or for recovering quotes whose phrasing you know but whose speaker — or the person being addressed — you don\'t.',
    },
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: 'قال * إنّ *', quoted: true });
    },
  },
  {
    id: 'subdomain-star',
    title: { ar: 'نطاقات فرعية بنجمة', en: 'Subdomains via wildcard' },
    icon: '✳️',
    pattern: 'site:*.X.com',
    description: {
      ar: 'النجمة داخل site: تطابق أيّ نطاق فرعي. مفيد لرسم خريطة الجهات المرتبطة بنطاق علوي واحد دون الحاجة لمعرفتها مسبقاً، مثل site:*.gov.sa الذي يكشف كل الجهات الحكومية السعودية المنشورة على نطاق .gov.sa.',
      en: 'An asterisk inside site: matches any subdomain. Useful for mapping the network of bodies sharing one top-level domain without needing to know them in advance — e.g. site:*.gov.sa surfaces every Saudi government body published on .gov.sa.',
    },
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '*.' });
    },
  },
  {
    id: 'cv-hunt',
    title: { ar: 'سيرة ذاتية بـ PDF', en: 'CV / résumé hunt' },
    icon: '👤',
    pattern: '("CV" OR "résumé" OR "سيرة ذاتية") filetype:pdf -site:linkedin.com',
    description: {
      ar: 'يبحث عن السيرة الذاتية لشخصية دون البوابة المغلقة لـ LinkedIn. متعدد اللغات لتغطية الصياغات العربية والإنجليزية والفرنسية. أضف اسم الهدف في الأسفل.',
      en: 'Hunt for a person\'s CV outside the LinkedIn walled garden. Multilingual to cover Arabic, English, and French phrasings. Add the target\'s name at the bottom.',
    },
    group: 'signature',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: 'CV', quoted: true });
      const orId1 = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      const id2 = chipState.addAfter(orId1, 'keyword', { operator: 'none', text: 'résumé', quoted: true });
      const orId2 = chipState.addAfter(id2, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId2, 'keyword', { operator: 'none', text: 'سيرة ذاتية', quoted: true });
      chipState.add('keyword', { operator: 'site', text: 'linkedin.com', negate: true });
      chipState.add('filetype', { value: 'pdf' });
    },
  },
  {
    id: 'mentioned-by-others',
    title: { ar: 'مذكور لدى الآخرين', en: 'Mentioned by others' },
    icon: '👁️',
    pattern: '"name" -site:their-own-site',
    description: {
      ar: 'يحقق صحفي عن شخصية أو مؤسسة، يريد رؤية ما يقوله الآخرون عنها لا ما تقوله عن نفسها. يستبعد موقعها الرسمي ويُظهر التغطية والانتقاد والإشارات الخارجية.',
      en: 'A journalist investigating a person or institution wants to see what others say about them, not what they say about themselves. Excludes their official site and surfaces outside coverage, criticism, and third-party mentions.',
    },
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.add('keyword', { operator: 'site', text: '', negate: true });
    },
  },
];

export const GROUP_ORDER = ['sites', 'docs', 'vocabulary', 'time', 'boolean', 'position', 'signature'];

export const GROUP_LABELS = {
  sites: { ar: 'نطاقات', en: 'Sites' },
  docs: { ar: 'وثائق', en: 'Documents' },
  vocabulary: { ar: 'مفردات', en: 'Vocabulary' },
  time: { ar: 'زمن', en: 'Time' },
  boolean: { ar: 'بنية منطقية', en: 'Boolean' },
  position: { ar: 'موقع الكلمة', en: 'Position' },
  signature: { ar: 'توقيع المحقق', en: 'Signature' },
};
