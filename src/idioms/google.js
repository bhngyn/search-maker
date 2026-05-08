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
    title: 'حكومي فقط',
    icon: '🏛️',
    pattern: 'site:.gov',
    description: 'يقصر النتائج على نطاقات .gov. مدخل لتقارير، إحصاءات، ووثائق رسمية أمريكية أصلية بدون ضوضاء الإعلام.',
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '.gov' });
    },
  },
  {
    id: 'edu-only',
    title: 'جامعي فقط',
    icon: '🎓',
    pattern: 'site:.edu',
    description: 'نتائج من الجامعات. الأبحاث والأطروحات تُنشر هنا، لا في المواقع الإخبارية.',
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '.edu' });
    },
  },
  {
    id: 'arab-gov-tlds',
    title: 'جهات حكومية عربية',
    icon: '🌍',
    pattern: 'site:.gov.sa OR site:.gov.ae OR site:.gov.eg',
    description: 'شبكة المصادر الحكومية العربية في استعلام واحد بدلاً من ثلاثة متتالية. عدّل النطاقات لتشمل الدول التي تهمّك (.gov.qa, .gov.bh, .gov.ma...).',
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
    title: 'داخل قسم محدد',
    icon: '📂',
    pattern: 'site:domain.gov/section',
    description: '(Russell signature) يضيّق البحث إلى قسم داخل موقع كبير دون معرفة هيكلة النطاقات الفرعية. مثال Russell: site:sanantonio.gov/dsd "retaining wall".',
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '' });
    },
  },
  {
    id: 'subdomain-discovery',
    title: 'نطاقات فرعية',
    icon: '🔍',
    pattern: 'site:X -site:www.X',
    description: '(Russell PDF idiom 1) يبحث داخل موقع ويستبعد www. — يكشف النطاقات الفرعية الجانبية والداخلية مثل intranet.x.com أو staff.x.com.',
    group: 'sites',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '' });
      chipState.add('keyword', { operator: 'site', text: 'www.', negate: true });
    },
  },

  // ── Row 2: وثائق ──────────────────────────────────────────────────────────
  {
    id: 'file-pdf',
    title: 'ملفات PDF',
    icon: '📄',
    pattern: 'filetype:pdf',
    description: 'تقارير، وثائق رسمية، أبحاث منشورة. PDF هو الصيغة الأشيع للمحتوى الموثّق.',
    group: 'docs',
    apply(chipState) {
      chipState.add('filetype', { value: 'pdf' });
    },
  },
  {
    id: 'file-excel',
    title: 'جداول Excel',
    icon: '📊',
    pattern: 'filetype:xlsx',
    description: '(Russell signature) موازنات، رواتب، إحصاءات قابلة للحساب. غالباً ما تُنشر بسهو أو بحكم الإلزام.',
    group: 'docs',
    apply(chipState) {
      chipState.add('filetype', { value: 'xlsx' });
    },
  },
  {
    id: 'gov-doc-on-topic',
    title: 'وثيقة حكومية حول موضوع',
    icon: '🏢',
    pattern: 'site:.gov filetype:pdf _____',
    description: '(Russell\'s most-quoted compound) النطاق + الصيغة + الموضوع. تُظهر الوثيقة الأصلية الصادرة عن الجهة، لا التغطية الإعلامية لها. مثال Russell: site:sanantonio.gov filetype:doc injuries.',
    group: 'docs',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '.gov' });
      chipState.add('filetype', { value: 'pdf' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'leaked-draft',
    title: 'مسودة مسرّبة',
    icon: '📝',
    pattern: '(intitle:"draft" OR intitle:"v1" OR intitle:"final") filetype:pdf',
    description: 'كثير من الوثائق تُحفظ بأسماء مثل report-draft.pdf ولا تُحذف من الخوادم بعد نشر النسخة النهائية. مدخل للنسخ المبكرة قبل التنقيح.',
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
    title: 'أختام عربية للوثائق الداخلية',
    icon: '🔏',
    pattern: '("سري" OR "للاستخدام الداخلي" OR "خاص") filetype:pdf',
    description: 'الأختام النصية في الوثائق العربية تُكتب صراحة في النص؛ Google يفهرسها كنصّ قابل للبحث. مفتاح للوثائق الإدارية المسرّبة بسهو.',
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
    title: 'قاموس ويكيبيديا العربية',
    icon: '📖',
    pattern: 'site:ar.wikipedia.org _____',
    description: '(Russell\'s #1 habit, localized) ابحث في ويكيبيديا العربية عن المصطلح الفنّي الذي يستخدمه المتخصصون قبل تشغيل الاستعلام الحقيقي. أهم خطوة لا يتجاوزها المحقق المُحنّك.',
    group: 'vocabulary',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'ar.wikipedia.org' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'wikipedia-en-mine',
    title: 'قاموس ويكيبيديا الإنجليزية',
    icon: '📚',
    pattern: 'site:en.wikipedia.org _____',
    description: 'المقابل الإنجليزي للمصطلح للبحث في المصادر الدولية. حركة Russell التوقيعية في النص.',
    group: 'vocabulary',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'en.wikipedia.org' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'transliteration-or',
    title: 'كل صيغ الاسم',
    icon: '🔤',
    pattern: '"أحمد" OR "Ahmad" OR "Ahmed"',
    description: 'جميع الصيغ الإملائية للاسم بالعربية واللاتينية في استعلام واحد — جوهر العمل المعلوماتي العربي عبر اللغات. أضف صيغ رابعة وخامسة إن وُجدت.',
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
    title: 'صيغ تعبير متعددة',
    icon: '💬',
    pattern: '"قال" OR "صرّح" OR "أكد" OR "أعلن"',
    description: '(Russell\'s "Smith denied/claimed/argued" idiom) يلتقط جميع الطرق التي يَنسب بها الإعلام تصريحاً ما لشخصية. اقرنه باسم الشخصية لاسترجاع كل تصريحاتها بصياغاتها المختلفة.',
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
    title: 'صيغ إملائية متعددة',
    icon: '✏️',
    pattern: '"أحمد" OR "احمد"',
    description: '(للحالات بدون توحيد الأحرف) يلتقط صفحات كُتبت بهمزة وصفحات بدونها في استعلام واحد. مفيد عندما تريد العبارة بصيغتيها دون تشغيل toggle التوحيد العام.',
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
    title: 'آخر شهر',
    icon: '📅',
    pattern: 'after:30d',
    description: 'نتائج من الثلاثين يوماً الماضية. الأنسب لمتابعة قصة جارية.',
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
    title: 'آخر سنة',
    icon: '🗓️',
    pattern: 'after:1y',
    description: 'نتائج آخر اثني عشر شهراً. يحجب الأرشيف القديم الذي يطغى على الأخبار الحديثة.',
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
    title: 'قبل حدث',
    icon: '⏮️',
    pattern: '"_____" before:event-date -event-noun',
    description: '(Russell signature "West Fertilizer" -explosion) لرؤية كيف غُطِّيت شركة قبل أن تتصدّر العناوين بسبب حادث. يستبعد ضجيج ما-بعد-الحادث ويظهر الذاكرة المؤسسية ما-قبله.',
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
    id: 'year-window',
    title: 'نافذة سنة',
    icon: '📆',
    pattern: 'after:Y-1-1 before:Y-12-31',
    description: 'تأطير زمني بسنة كاملة. مفيد لتحديد الفترة التي حدث فيها شيء أو لتأطير حقبة.',
    group: 'time',
    apply(chipState) {
      const year = new Date().getFullYear();
      chipState.add('date-range', {
        after: `${year}-01-01`,
        before: `${year}-12-31`,
      });
    },
  },
  {
    id: 'wayback-pivot',
    title: 'أرشيف الإنترنت',
    icon: '🏛️',
    pattern: 'site:web.archive.org _____',
    description: '(Russell pivot move) عندما يصل البحث الحرّ لطريق مسدود (الصفحة محذوفة، 404). يحوّل الاستعلام إلى Wayback Machine حيث الصفحات المحذوفة محفوظة.',
    group: 'time',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'web.archive.org' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },

  // ── Row 5: بنية منطقية ───────────────────────────────────────────────────
  {
    id: 'or-two',
    title: 'بديلان',
    icon: '⚖️',
    pattern: 'A OR B',
    description: 'تطابق أيّ من كلمتين — للبحث بأكثر من تهجئة لمرادف أو مفهوم.',
    group: 'boolean',
    apply(chipState) {
      const id1 = chipState.add('keyword', { operator: 'none', text: '' });
      const orId = chipState.addAfter(id1, 'or-connector', { kind: 'or' });
      chipState.addAfter(orId, 'keyword', { operator: 'none', text: '' });
    },
  },
  {
    id: 'or-three',
    title: 'ثلاثة بدائل',
    icon: '🔀',
    pattern: 'A OR B OR C',
    description: 'تطابق أيّ من ثلاث كلمات. مفيد عند تعدد التهجئات أو المرادفات.',
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
    title: 'استبعاد كلمة',
    icon: '🚫',
    pattern: 'topic -noise',
    description: 'استبعاد كلمة من النتائج لإخفاء معنى ثانوي مزعج (مثلاً "جاكوار" بدون "سيارة").',
    group: 'boolean',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', negate: true });
    },
  },
  {
    id: 'exclude-wikipedia',
    title: 'استبعاد ويكيبيديا',
    icon: '🚫',
    pattern: '-site:wikipedia.org',
    description: 'استبعاد ويكيبيديا للوصول إلى المصادر الأولية بدلاً من الملخّص الموسوعي. يكسر هيمنة ويكيبيديا على الصفحة الأولى.',
    group: 'boolean',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: 'wikipedia.org', negate: true });
    },
  },
  {
    id: 'co-mention',
    title: 'اقتران اسمين',
    icon: '🔗',
    pattern: '"name1" AROUND(5) "name2"',
    description: '(Russell "Manuel AROUND(2) Isquierdo") كلمتان متجاورتان خلال خمس كلمات — ممتاز لربط شخصين معاً، أو حين يفصل بينهما لقب أو صفة فلا يلتقطهما الاقتباس الحرفي.',
    group: 'boolean',
    apply(chipState) {
      chipState.add('proximity', { term1: '', distance: 5, term2: '' });
    },
  },

  // ── Row 6: موقع الكلمة ───────────────────────────────────────────────────
  {
    id: 'in-title',
    title: 'في العنوان',
    icon: '🏷️',
    pattern: 'intitle:_____',
    description: 'الصفحات التي يكون موضوعها الرئيسي هذا المصطلح، لا تلك التي تذكره عرضاً. يَفصل التغطية الجوهرية عن التغطية العابرة.',
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'intitle', text: '' });
    },
  },
  {
    id: 'in-text-body',
    title: 'في نصّ الصفحة',
    icon: '📃',
    pattern: 'intext:_____',
    description: '(Russell\'s favorite operator) المصطلح في القائمة الجانبية أو القائمة المنسدلة يُلوِّث النتائج. intext: يفرض ظهور الكلمة في جسم الصفحة لا في زخارفها.',
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'intext', text: '' });
    },
  },
  {
    id: 'in-text-doubled',
    title: 'كلمتان في النصّ',
    icon: '📑',
    pattern: 'intext:"A" intext:"B"',
    description: '(Russell\'s signature compound intext:"Manuel Isquierdo" intext:"grand jury") يُجبر تواجد عبارتين معاً في نصّ الصفحة لا في الزخارف. ضمانة قوية لصفحة فعلية حول الموضوع.',
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'intext', text: '', quoted: true });
      chipState.add('keyword', { operator: 'intext', text: '', quoted: true });
    },
  },
  {
    id: 'in-url',
    title: 'في الرابط',
    icon: '🔗',
    pattern: 'inurl:_____',
    description: 'يطابق نمطاً في رابط الصفحة. مفيد لاكتشاف مسارات موحّدة (/budget/, /leaked/, /press/).',
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'inurl', text: '' });
    },
  },
  {
    id: 'literal-phrase',
    title: 'اقتباس حرفي',
    icon: '"',
    pattern: '"_____"',
    description: 'بحث عن العبارة بترتيبها الحرفي بلا مرادفات أو توسعة. ضروري لاقتباس مباشر أو اسم مكتوب بطريقة محددة.',
    group: 'position',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
    },
  },

  // ── Row 7: توقيع المحقق ──────────────────────────────────────────────────
  // Russell's three explicit Feb 2024 PDF idioms + journalist-recovery moves.
  {
    id: 'fill-blank',
    title: 'ملء فراغ في عبارة',
    icon: '⭐',
    pattern: '"phrase * here"',
    description: '(Russell PDF idiom 2) النجمة داخل اقتباس تملأ كلمة مجهولة. لإيجاد عبارات بترتيب محدد لكن بكلمة وسط لا تتذكّرها.',
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: 'كلمة * كلمة', quoted: true });
    },
  },
  {
    id: 'quote-attribution',
    title: 'استرجاع اقتباس مفقود',
    icon: '🎯',
    pattern: '"قال * إنّ *"',
    description: '(Russell PDF idiom 2 في تطبيق صحفي) ابحث عن اقتباس بهيكل ثابت ونجوم تملأ الأسماء المجهولة. تكشف من قال ماذا في خطاب نمطي.',
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: 'قال * إنّ *', quoted: true });
    },
  },
  {
    id: 'subdomain-star',
    title: 'نطاقات فرعية بنجمة',
    icon: '✳️',
    pattern: 'site:*.X.com',
    description: '(Russell PDF idiom 3) النجمة في site: تطابق أيّ نطاق فرعي. مثال: site:*.gov.sa يكشف كل الجهات الحكومية السعودية المرتبطة.',
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '*.' });
    },
  },
  {
    id: 'cv-hunt',
    title: 'سيرة ذاتية بـ PDF',
    icon: '👤',
    pattern: '("CV" OR "résumé" OR "سيرة ذاتية") filetype:pdf -site:linkedin.com',
    description: 'يبحث عن السيرة الذاتية لشخصية دون البوابة المغلقة لـ LinkedIn. متعدد اللغات لتغطية الصياغات العربية والإنجليزية والفرنسية. أضف اسم الهدف في الأسفل.',
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
    title: 'مذكور لدى الآخرين',
    icon: '👁️',
    pattern: '"name" -site:their-own-site',
    description: 'يحقق صحفي عن شخصية أو مؤسسة، يريد رؤية ما يقوله الآخرون عنها لا ما تقوله عن نفسها. يستبعد موقعها الرسمي ويُظهر التغطية والانتقاد والإشارات الخارجية.',
    group: 'signature',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.add('keyword', { operator: 'site', text: '', negate: true });
    },
  },
];

export const GROUP_ORDER = ['sites', 'docs', 'vocabulary', 'time', 'boolean', 'position', 'signature'];

export const GROUP_LABELS = {
  sites: 'نطاقات',
  docs: 'وثائق',
  vocabulary: 'مفردات',
  time: 'زمن',
  boolean: 'بنية منطقية',
  position: 'موقع الكلمة',
  signature: 'توقيع المحقق',
};
