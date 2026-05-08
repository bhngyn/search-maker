// X / Twitter search engine descriptor. v1 surface — covers the operators
// an Arabic-speaking analyst would actually reach for day-to-day.
//
// Source: CLAUDE-X.md (the locked spec) and Igor Brigadir's
// twitter-advanced-search reference. Excluded by spec: lang:chr|iu|sk,
// filter:vine|periscope|news|safe, card_name:*/card_domain:/card_url:,
// source:twitter_ads, third-party-client cloudhopper-style sources.
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
  from: {
    label: 'من حساب (from:)',
    opName: 'from',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  to: {
    label: 'ردّاً على حساب (to:)',
    opName: 'to',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  mention: {
    label: 'ذِكر (@user)',
    opName: 'mention',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
    format: v => '@' + v,
    badge: '@',
  },
  hashtag: {
    label: 'هاشتاج (#tag)',
    opName: 'hashtag',
    dir: 'rtl',
    normalizes: true,
    quotable: false,
    acceptsArabic: true,
    format: v => '#' + v,
    badge: '#',
  },
  cashtag: {
    label: 'رمز سهم ($TWTR)',
    opName: 'cashtag',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
    format: v => '$' + v,
    badge: '$',
  },
  url: {
    label: 'رابط (url:)',
    opName: 'url',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  list: {
    label: 'قائمة (list:)',
    opName: 'list',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  lang: {
    label: 'لغة (lang:)',
    opName: 'lang',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  near: {
    label: 'قرب (near:)',
    opName: 'near',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  source: {
    label: 'تطبيق المصدر (source:)',
    opName: 'source',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  conversation_id: {
    label: 'محادثة (conversation_id:)',
    opName: 'conversation_id',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  quoted_tweet_id: {
    label: 'اقتباس تغريدة (quoted_tweet_id:)',
    opName: 'quoted_tweet_id',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
};

const composerPills = [
  { op: 'none',    label: 'كلمة عادية' },
  { op: 'from',    label: 'من حساب' },
  { op: 'to',      label: 'ردّاً على' },
  { op: 'mention', label: 'ذِكر (@)' },
  { op: 'hashtag', label: 'هاشتاج (#)' },
];

const drawerItems = {
  from:            { kind: 'keyword', operator: 'from',            label: 'من حساب',                desc: 'حصر النتائج بتغريدات حساب معين',           badge: 'from:',     tier: 'beginner' },
  to:              { kind: 'keyword', operator: 'to',              label: 'ردّاً على حساب',          desc: 'تغريدات موجَّهة لحساب معين',                badge: 'to:',       tier: 'beginner' },
  mention:         { kind: 'keyword', operator: 'mention',         label: 'ذِكر حساب',               desc: 'تغريدات تذكر حساباً (@user)',              badge: '@',         tier: 'beginner' },
  hashtag:         { kind: 'keyword', operator: 'hashtag',         label: 'هاشتاج',                  desc: 'تغريدات تحتوي وسماً معيناً',                badge: '#',         tier: 'beginner' },
  cashtag:         { kind: 'keyword', operator: 'cashtag',         label: 'رمز سهم',                 desc: 'رموز الأسهم المالية مثل $TWTR',            badge: '$',         tier: 'beginner' },
  list:            { kind: 'keyword', operator: 'list',            label: 'قائمة',                   desc: 'حصر النتائج بأعضاء قائمة معينة',           badge: 'list:',     tier: 'beginner' },
  url:             { kind: 'keyword', operator: 'url',             label: 'رابط داخل التغريدة',       desc: 'تغريدات تشير لنطاق معين',                  badge: 'url:',      tier: 'beginner' },
  lang:            { kind: 'keyword', operator: 'lang',            label: 'لغة التغريدة',             desc: 'مثل ar للعربية أو en للإنجليزية',           badge: 'lang:',     tier: 'beginner' },
  near:            { kind: 'keyword', operator: 'near',            label: 'قرب موقع جغرافي',          desc: 'حصر النتائج قرب مدينة أو near:me',         badge: 'near:',     tier: 'beginner' },
  source:          { kind: 'keyword', operator: 'source',          label: 'تطبيق المصدر',             desc: 'التطبيق الذي أُرسلت منه التغريدة',          badge: 'source:',   tier: 'beginner' },
  conversation_id: { kind: 'keyword', operator: 'conversation_id', label: 'معرّف المحادثة',           desc: 'كل التغريدات في محادثة معينة',              badge: 'conv_id:',  tier: 'advanced' },
  quoted_tweet_id: { kind: 'keyword', operator: 'quoted_tweet_id', label: 'معرّف تغريدة مقتبَسة',     desc: 'تغريدات تقتبس تغريدة معينة',               badge: 'quoted:',   tier: 'advanced' },
  'date-range':    { kind: 'special', type: 'date-range',          label: 'نطاق زمني',                desc: 'حصر النتائج بين تاريخين',                   badge: 'since: / until:', tier: 'beginner' },
  filter:          { kind: 'special', type: 'filter',              label: 'تصفية بنوع التغريدة',      desc: 'تغريدات بصور أو فيديو، ردود، تحقق…',        badge: 'filter:',   tier: 'beginner' },
  engagement:      { kind: 'special', type: 'engagement',          label: 'حد أدنى/أقصى للتفاعل',     desc: 'إعجابات أو ردود أو إعادات تغريد',           badge: 'min_*:',    tier: 'beginner' },
};

const templates = [
  {
    id: 'account',
    title: 'تغريدات من حساب',
    description: 'حصر النتائج بحساب معين',
    icon: '👤',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
    },
  },
  {
    id: 'popular',
    title: 'تغريدات شائعة',
    description: 'تفاعل مرتفع: 1000 إعجاب أو أكثر',
    icon: '🔥',
    apply(chipState) {
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 1000 });
    },
  },
  {
    id: 'daterange',
    title: 'بحث في فترة زمنية',
    description: 'آخر 30 يوماً افتراضياً',
    icon: '📅',
    apply(chipState) {
      const today = new Date();
      const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('date-range', { after: fmt(past), before: fmt(today) });
    },
  },
];

export default {
  id: 'x',
  label: 'X / تويتر',
  labels: {
    subtitle: 'ابنِ استعلامات بحث متقدمة في X / تويتر باللغة العربية، دون الحاجة إلى الكتابة بالإنجليزية أو تبديل لوحة المفاتيح.',
    searchBtnLabel: 'البحث في X',
    emptyPreview: 'ابدأ بكتابة كلمات البحث',
  },
  searchUrl: q => 'https://x.com/search?q=' + encodeURIComponent(q || '') + '&src=typed_query',
  keywordOperators,
  keywordOperatorOrder: [
    'none', 'from', 'to', 'mention', 'hashtag', 'cashtag',
    'url', 'list', 'lang', 'near', 'source',
    'conversation_id', 'quoted_tweet_id',
  ],
  composerPills,
  drawer: {
    items: drawerItems,
    beginnerOrder: ['date-range', 'from', 'mention', 'hashtag', 'filter', 'engagement', 'lang'],
    beginnerMore: ['to', 'cashtag', 'list', 'url', 'near', 'source', 'conversation_id', 'quoted_tweet_id'],
    advancedKeywords: ['from', 'to', 'mention', 'hashtag', 'cashtag', 'list', 'url', 'lang', 'near', 'source', 'conversation_id', 'quoted_tweet_id'],
    advancedSpecials: ['date-range', 'filter', 'engagement'],
  },
  templates,
  dateRangeOps: { after: 'since', before: 'until' },
  addableChipTypes: new Set(['keyword', 'or-connector', 'date-range', 'filter', 'engagement']),
  arabicForbiddenOps: new Set(['from', 'to', 'mention', 'cashtag', 'list', 'url', 'lang', 'near', 'source', 'conversation_id', 'quoted_tweet_id']),
  // Twitter handles/IDs are single-token; the multi-word warn doesn't apply.
  // Plain `none` keywords still allow free multi-word text.
  multiWordOps: new Set(),
  parser: {
    keywordOperators: new Set(['from', 'to', 'url', 'list', 'lang', 'near', 'source', 'conversation_id', 'quoted_tweet_id']),
    prefixOperators: { '@': 'mention', '#': 'hashtag', '$': 'cashtag' },
  },
};
