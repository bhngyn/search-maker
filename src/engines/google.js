// Google search engine descriptor. Mirrors the original behaviour of the
// app before the engine abstraction was introduced — strings, operator
// catalogue, drawer order, and templates are all extracted verbatim from
// the previous `src/chips/keyword.js`, `src/ui/composer.js`,
// `src/ui/drawer.js`, and `src/ui/templates.js` so the Google experience
// is byte-identical post-refactor.
//
// Engine descriptor shape is locked by `src/core/engine.js` — see the
// docblock there before changing this file.

const keywordOperators = {
  none: {
    label: 'كلمة',
    opName: '',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  site: {
    label: 'موقع (site:)',
    opName: 'site',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  intitle: {
    label: 'في العنوان (intitle:)',
    opName: 'intitle',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  intext: {
    label: 'في النص (intext:)',
    opName: 'intext',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  inanchor: {
    label: 'في نص الروابط (inanchor:)',
    opName: 'inanchor',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  inurl: {
    label: 'في الرابط (inurl:)',
    opName: 'inurl',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
};

const composerPills = [
  { op: 'none',     label: 'كلمة عادية' },
  { op: 'site',     label: 'في الموقع' },
  { op: 'intitle',  label: 'في عنوان الصفحة' },
  { op: 'inurl',    label: 'في رابط الصفحة' },
  { op: 'intext',   label: 'في نص الصفحة' },
  { op: 'inanchor', label: 'في الروابط الواردة' },
];

const drawerItems = {
  site:           { kind: 'keyword', operator: 'site',     label: 'البحث في موقع محدد',      desc: 'يحصر النتائج بنطاق معين، مثل bbc.com',                    badge: 'site:' },
  intitle:        { kind: 'keyword', operator: 'intitle',  label: 'البحث في عنوان الصفحة',   desc: 'كلمة يجب أن تظهر في عنوان النتيجة',                       badge: 'intitle:' },
  inurl:          { kind: 'keyword', operator: 'inurl',    label: 'البحث في رابط الصفحة',    desc: 'كلمة يجب أن تظهر في رابط النتيجة',                        badge: 'inurl:' },
  intext:         { kind: 'keyword', operator: 'intext',   label: 'البحث في نص الصفحة',      desc: 'كلمة يجب أن تظهر في محتوى النتيجة',                       badge: 'intext:' },
  inanchor:       { kind: 'keyword', operator: 'inanchor', label: 'البحث في روابط واردة',    desc: 'كلمة من نص الروابط التي تشير للصفحة',                     badge: 'inanchor:' },
  filetype:       { kind: 'special', type: 'filetype',     label: 'نوع الملف',                desc: 'حصر النتائج في PDF أو Word أو غيرها',                     badge: 'filetype:',         tier: 'beginner' },
  'date-range':   { kind: 'special', type: 'date-range',   label: 'نطاق زمني',                desc: 'حصر النتائج بين تاريخين',                                  badge: 'before: / after:',  tier: 'beginner' },
  proximity:      { kind: 'special', type: 'proximity',    label: 'كلمتان متقاربتان',         desc: 'كلمتان تظهران بقرب بعضهما، مفيد لربط شخصين',              badge: 'AROUND(N)',         tier: 'advanced' },
  'number-range': { kind: 'special', type: 'number-range', label: 'نطاق عددي',                desc: 'أرقام بين قيمتين، مثل 100..500',                          badge: '..',                tier: 'advanced' },
};

const templates = [
  {
    id: 'site',
    title: 'بحث في موقع محدد',
    description: 'حصر النتائج بنطاق معين مثل bbc.com',
    icon: '🌐',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '' });
    },
  },
  {
    id: 'docs',
    title: 'بحث في الوثائق',
    description: 'العثور على ملفات PDF أو Word',
    icon: '📄',
    apply(chipState) {
      chipState.add('filetype', { value: 'pdf' });
    },
  },
  {
    id: 'daterange',
    title: 'بحث في نطاق زمني',
    description: 'حصر النتائج بين تاريخين',
    icon: '📅',
    apply(chipState) {
      const today = new Date();
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('date-range', { after: fmt(lastYear), before: fmt(today) });
    },
  },
];

export default {
  id: 'google',
  label: 'Google',
  labels: {
    subtitle: 'ابنِ استعلامات بحث متقدمة في Google باللغة العربية، دون الحاجة إلى الكتابة بالإنجليزية أو تبديل لوحة المفاتيح.',
    searchBtnLabel: 'البحث في Google',
    emptyPreview: 'ابدأ بكتابة كلمات البحث',
  },
  searchUrl: q => 'https://www.google.com/search?q=' + encodeURIComponent(q || ''),
  keywordOperators,
  keywordOperatorOrder: ['none', 'site', 'intitle', 'intext', 'inanchor', 'inurl'],
  composerPills,
  drawer: {
    items: drawerItems,
    beginnerOrder: ['date-range', 'filetype', 'site', 'intitle', 'intext', 'inurl', 'inanchor'],
    beginnerMore: ['proximity', 'number-range'],
    advancedKeywords: ['site', 'intitle', 'inurl', 'intext', 'inanchor'],
    advancedSpecials: ['filetype', 'date-range', 'proximity', 'number-range'],
  },
  templates,
  dateRangeOps: { after: 'after', before: 'before' },
  addableChipTypes: new Set(['keyword', 'or-connector', 'filetype', 'date-range', 'proximity', 'number-range']),
  arabicForbiddenOps: new Set(['site', 'inurl']),
  multiWordOps: new Set(['intitle', 'intext', 'inanchor']),
  parser: {
    keywordOperators: new Set(['site', 'intitle', 'intext', 'inanchor', 'inurl']),
    prefixOperators: {},
  },
};
