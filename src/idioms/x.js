// X / Twitter OSINT idiom library — 35 recipes, 7 groups of 5.
//
// Groups follow the investigative arc: origin → amplification → thread →
// person → audience → framing → verify.  This mirrors how X investigations
// actually flow in the field (Bellingcat / OSINTCurio / Igor Brigadir
// cross-referenced).
//
// Each idiom's title and description are bilingual { ar, en } pairs.  The
// language toggle in the header chooses which side renders.  English copy
// matches the messages.js voice for X (engine.x.drawer.*, engine.x.tpl.*):
// short imperative / noun-phrase titles, practical descriptions, X-native
// terminology (tweet, retweet, quote tweet, thread, native video, verified,
// Spaces).
//
// Chip API:  chipState.add(type, props)
//            chipState.addAfter(afterId, type, props)
// OR groups: add() returns a chip id; addAfter uses that id for chaining.
// addAfter deliberately skips cleanupConnectors mid-mutation so partial OR
// groups land cleanly (CLAUDE.md deviation note).
//
// date-range props use { after, before } field names; the X engine descriptor
// retranslates to since:/until: at assemble time (dateRangeOps: { after:'since', before:'until' }).

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function today() {
  return new Date();
}

function daysAgo(n) {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Shared "how to get the ID" hints
//
// Appended to descriptions of any recipe whose pattern needs a numeric
// tweet/conversation ID. The opaque-looking number scares first-timers, so
// each hint shows the URL → ID mapping with a worked example.
// ---------------------------------------------------------------------------

const TWEET_ID_HINT = {
  ar: ' كيفية الحصول على معرّف التغريدة: افتحها في X وانسخ الرقم الطويل من نهاية رابطها — مثلاً في `x.com/user/status/1853991234567890123` المعرّف هو `1853991234567890123`.',
  en: ' How to get the tweet ID: open the tweet in X and copy the long number at the end of its URL — e.g. in `x.com/user/status/1853991234567890123`, the ID is `1853991234567890123`.',
};

const CONVERSATION_ID_HINT = {
  ar: ' كيفية الحصول على معرّف المحادثة: افتح التغريدة الأولى (الجذر) في الموضوع وانسخ الرقم الطويل من نهاية رابطها — مثلاً في `x.com/user/status/1853991234567890123` المعرّف هو `1853991234567890123`.',
  en: ' How to get the conversation ID: open the first (root) tweet of the thread and copy the long number at the end of its URL — e.g. in `x.com/user/status/1853991234567890123`, the ID is `1853991234567890123`.',
};

// ---------------------------------------------------------------------------
// IDIOMS
// ---------------------------------------------------------------------------

export const IDIOMS = [
  // ── Row 1 — المصدر الأول ──────────────────────────────────────────────────

  {
    id: 'first-tweeter',
    title: { ar: 'أول من غرّد', en: 'First to tweet it' },
    icon: '⚡',
    pattern: '_____ since:_ until:_ -filter:replies -filter:retweets',
    description: {
      ar: 'حدث كاسر تحتاج المصدر الأصلي قبل أن يتكرر. يقصّ الردود وإعادات النشر فيظهر التغريدات الأولى داخل النافذة الزمنية.',
      en: 'Breaking event — find the original source before it gets retweeted. Strips replies and retweets so the earliest tweets in the time window surface.',
    },
    group: 'origin',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('date-range', {
        after: fmt(daysAgo(30)),
        before: fmt(today()),
      });
      chipState.add('filter', { value: 'replies', negate: true });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  {
    id: 'first-video-witness',
    title: { ar: 'أول شاهد بالفيديو', en: 'First video witness' },
    icon: '🎥',
    pattern: '_____ filter:native_video lang:ar since:_ until:_ -filter:retweets',
    description: {
      ar: 'أول فيديو خام التقطه شاهد عيان لا قناة إخبارية. الفيديو الأصلي + اللغة العربية = شهادة محلية، لا مادة معاد بثها.',
      en: 'Raw video shot by an eyewitness, not a news channel. Native video + Arabic language = a local testimony, not rebroadcast footage.',
    },
    group: 'origin',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'native_video' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
      chipState.add('date-range', {
        after: fmt(daysAgo(30)),
        before: fmt(today()),
      });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  {
    id: 'first-image-witness',
    title: { ar: 'أول صورة ميدانية', en: 'First image from the scene' },
    icon: '📸',
    pattern: '_____ filter:images lang:ar -filter:retweets since:_ until:_',
    description: {
      ar: 'أول صورة محلية لحادثة قبل أن تنتشر. الصور + اللغة + استبعاد إعادة النشر يكشف المصور المحلي الأول.',
      en: 'The first local photo of an incident before it spreads. Images + language + excluding retweets surfaces the original on-the-ground photographer.',
    },
    group: 'origin',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'images' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
      chipState.add('filter', { value: 'retweets', negate: true });
      chipState.add('date-range', {
        after: fmt(daysAgo(30)),
        before: fmt(today()),
      });
    },
  },

  {
    id: 'deleted-via-mentions',
    title: { ar: 'تغريدة محذوفة', en: 'Deleted tweet via mentions' },
    icon: '🗑️',
    pattern: '@user "phrase" since:_ until:_',
    description: {
      ar: 'التغريدة محذوفة لكن أحدهم اقتبسها في رد أو لقطة. يصطاد الإشارات والاقتباسات التي بقيت بعد الحذف فيعيد بناء النص الأصلي.',
      en: 'The original tweet is gone but someone quoted it in a reply or screenshot. Hunts the mentions and quotes that survived the deletion so you can reconstruct the original text.',
    },
    group: 'origin',
    apply(chipState) {
      chipState.add('keyword', { operator: 'mention', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.add('date-range', {
        after: fmt(daysAgo(30)),
        before: fmt(today()),
      });
    },
  },

  {
    id: 'custom-range',
    title: { ar: 'نطاق زمني مخصص', en: 'Custom date range' },
    icon: '📆',
    pattern: 'since:YYYY-MM-DD until:YYYY-MM-DD',
    description: {
      ar: 'تحديد فترة زمنية بأي تاريخين تختارهما. مفيد عندما تحقق في حدث في تاريخ معروف بدقة، أو حين تريد تأطير نتائجك في نافذة زمنية محددة لا تطابق الإعدادات الافتراضية للوصفات الأخرى. اضغط على حقلَي التاريخ في البطاقة المضافة لاختيار البداية والنهاية.',
      en: 'Pick any two dates as your time window. Useful when investigating an event with a known date, or when you need a specific window that doesn\'t match the defaults baked into the other recipes. Click the two date fields in the added chip to choose start and end.',
    },
    group: 'origin',
    apply(chipState) {
      chipState.add('date-range', { after: '', before: '' });
    },
  },

  // ── Row 2 — شبكة التضخيم ─────────────────────────────────────────────────

  {
    id: 'quoters-of-tweet',
    title: { ar: 'من اقتبس التغريدة', en: 'Who quote-tweeted it' },
    icon: '🔁',
    pattern: 'quoted_tweet_id:_____',
    description: {
      ar: 'لرسم خريطة من اقتبس تغريدة محورية. يكشف كل من أعاد التأطير عبر الاقتباس — وليس الإعجاب فقط.' + TWEET_ID_HINT.ar,
      en: 'Map who quote-tweeted a pivotal tweet. Surfaces every account that reframed it via QT — not just liked it.' + TWEET_ID_HINT.en,
    },
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'quoted_tweet_id', text: '' });
    },
  },

  {
    id: 'paid-amplifiers',
    title: { ar: 'مُضخّمون بالعلامة الزرقاء', en: 'Blue-check amplifiers' },
    icon: '💙',
    pattern: 'quoted_tweet_id:_____ filter:blue_verified',
    description: {
      ar: 'للتمييز بين تضخيم مدفوع وتضخيم عضوي. يحصر مقتبسي تغريدة معينة في حسابات Blue المدفوعة فيكشف نمط الشراء.' + TWEET_ID_HINT.ar,
      en: 'Tell paid amplification apart from organic. Restricts quote-tweeters of a given tweet to paid Blue accounts so coordinated buying patterns surface.' + TWEET_ID_HINT.en,
    },
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'quoted_tweet_id', text: '' });
      chipState.add('filter', { value: 'blue_verified' });
    },
  },

  {
    id: 'account-quotes',
    title: { ar: 'ماذا يقتبس الحساب', en: 'What an account quotes' },
    icon: '🗨️',
    pattern: 'from:user filter:quote',
    description: {
      ar: 'لرسم خريطة آراء حساب من خلال من يقتبس عنهم. الاقتباسات إشارة موقف؛ تكشف الشبكة الفكرية للحساب.',
      en: 'Map an account\'s views through who they quote-tweet. Quote tweets are a stance signal; they expose the account\'s ideological network.',
    },
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('filter', { value: 'quote' });
    },
  },

  {
    id: 'street-on-statement',
    title: { ar: 'ردود الشارع على بيان', en: 'Street reactions to a statement' },
    icon: '📢',
    pattern: 'quoted_tweet_id:_____ -filter:verified -filter:blue_verified',
    description: {
      ar: 'بيان رسمي صدر، نريد قراءة الشارع غير الموثّق. يستثني الموثقين بكل أنواعهم فيظهر ما قاله الناس فعلاً.' + TWEET_ID_HINT.ar,
      en: 'An official statement dropped — read the unverified street. Excludes both verified tiers so what ordinary people actually said floats up.' + TWEET_ID_HINT.en,
    },
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'quoted_tweet_id', text: '' });
      chipState.add('filter', { value: 'verified', negate: true });
      chipState.add('filter', { value: 'blue_verified', negate: true });
    },
  },

  {
    id: 'verified-quote-reactions',
    title: { ar: 'ردود فعل المؤثرين', en: 'Reactions from influencers' },
    icon: '⭐',
    pattern: '_____ filter:blue_verified filter:quote -filter:retweets',
    description: {
      ar: 'حدث كبير، نريد كيف أطّره المؤثرون مدفوعو الاشتراك. الاقتباس + الزرقاء = من يضع تأطيره فوق تأطير غيره عبر QT.',
      en: 'Major event — see how paid-subscription influencers framed it. Quote + blue check = who layers their take on someone else\'s tweet via QT.',
    },
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'blue_verified' });
      chipState.add('filter', { value: 'quote' });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  // ── Row 3 — إعادة بناء المحادثة ──────────────────────────────────────────

  {
    id: 'full-thread',
    title: { ar: 'كامل الموضوع', en: 'Full thread' },
    icon: '🧵',
    pattern: 'conversation_id:_____',
    description: {
      ar: 'تغريدة جذر بمحادثة طويلة، نريد كل الردود والردود على الردود. يستحضر الموضوع كاملاً متجاوزاً ترتيب X الافتراضي.' + CONVERSATION_ID_HINT.ar,
      en: 'A root tweet with a long conversation — pull every reply and reply-to-reply. Loads the entire thread, bypassing X\'s default ordering.' + CONVERSATION_ID_HINT.en,
    },
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
    },
  },

  {
    id: 'thread-arabic',
    title: { ar: 'ردود الموضوع بالعربية', en: 'Arabic replies in a thread' },
    icon: '🌐',
    pattern: 'conversation_id:_____ lang:ar',
    description: {
      ar: 'المحادثة متعددة اللغات، نريد الأصوات المحلية فقط. يقتطف الجزء العربي من المحادثة في بحث متعدد اللغات.' + CONVERSATION_ID_HINT.ar,
      en: 'A multilingual conversation — keep only the local voices. Slices out the Arabic segment of a cross-language thread.' + CONVERSATION_ID_HINT.en,
    },
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'thread-top-replies',
    title: { ar: 'الردود الأكثر تفاعلاً', en: 'Top-engagement replies' },
    icon: '🔝',
    pattern: 'conversation_id:_____ min_faves:100',
    description: {
      ar: 'محادثة بآلاف الردود، نريد الأهم. يطفو الردود ذات التفاعل الحقيقي ويتجاوز ترتيب الخوارزمية المبهم.' + CONVERSATION_ID_HINT.ar,
      en: 'A thread with thousands of replies — surface the ones that mattered. Floats up replies with real engagement and bypasses X\'s opaque ranking.' + CONVERSATION_ID_HINT.en,
    },
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 100 });
    },
  },

  {
    id: 'thread-verified',
    title: { ar: 'الردود الموثّقة', en: 'Verified replies' },
    icon: '✅',
    pattern: 'conversation_id:_____ filter:verified',
    description: {
      ar: 'الذين ردوا من النخب التقليدية الموثقة على تغريدة بعينها. يكشف الحوار العمودي بين المؤسسات.' + CONVERSATION_ID_HINT.ar,
      en: 'Legacy-verified accounts that replied to a given tweet. Reveals the institutional, top-down dialogue inside the thread.' + CONVERSATION_ID_HINT.en,
    },
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('filter', { value: 'verified' });
    },
  },

  {
    id: 'thread-dissent',
    title: { ar: 'ردود المعارضة', en: 'Dissenting replies' },
    icon: '⚖️',
    pattern: 'conversation_id:_____ -from:author filter:has_engagement',
    description: {
      ar: 'الاعتراضات والتصحيحات تحت تغريدة جدلية. يستثني صاحب التغريدة ويُبقي الردود المتفاعلة فقط — حيث يكون التصحيح غالباً.' + CONVERSATION_ID_HINT.ar,
      en: 'Pushback and corrections under a contested tweet. Excludes the original author and keeps only replies with engagement — where the corrections usually live.' + CONVERSATION_ID_HINT.en,
    },
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('keyword', { operator: 'from', text: '', negate: true });
      chipState.add('filter', { value: 'has_engagement' });
    },
  },

  // ── Row 4 — الشخص والموضوع ───────────────────────────────────────────────

  {
    id: 'person-on-topic',
    title: { ar: 'ماذا قال الشخص؟', en: 'What did the person say?' },
    icon: '🎙️',
    pattern: 'from:user _____',
    description: {
      ar: 'شخصية عامة وموضوع — كل ما قالته. البحث الأساسي لاستخراج موقف شخص من ملف.',
      en: 'A public figure and a topic — everything they said about it. The core search for pulling a person\'s stance on a file.',
    },
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },

  {
    id: 'position-evolution',
    title: { ar: 'تطور الموقف عبر الزمن', en: 'Position drift over time' },
    icon: '📅',
    pattern: 'from:user _____ since:_ until:_',
    description: {
      ar: 'متى تغيّر تأطير المسؤول لقضية بعينها. النافذة الزمنية تكشف تحولات الخطاب وتغيرات السياسة.',
      en: 'When did an official\'s framing of a given issue shift. The time window exposes shifts in rhetoric and policy pivots.',
    },
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('date-range', {
        after: fmt(daysAgo(365)),
        before: fmt(today()),
      });
    },
  },

  {
    id: 'did-they-name',
    title: { ar: 'هل ذكر هذا الاسم؟', en: 'Did they name this person?' },
    icon: '🔍',
    pattern: 'from:user "name"',
    description: {
      ar: 'للتحقق ما إذا كان مسؤول قد ذكر اسماً بعينه. الاقتباس يمنع التطابقات الجزئية ويعطي إثباتاً قابلاً للنقل.',
      en: 'Verify whether an official ever uttered a specific name. The quote blocks partial matches and gives a citable, screenshot-ready hit.',
    },
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
    },
  },

  {
    id: 'person-vs-person',
    title: { ar: 'الشخص ضد الشخص', en: 'Person vs. person' },
    icon: '⚔️',
    pattern: 'from:userA (@userB OR "userB display")',
    description: {
      ar: 'جدل علني بين شخصيتين — مباشر أو بالاسم. يدمج الإشارات وذكر الاسم في استعلام واحد فيكشف المواجهات والإشارات الضمنية.',
      en: 'A public spat between two figures — direct or by-name. Combines mentions and name references in one query so direct hits and indirect digs both surface.',
    },
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      const mentionId = chipState.add('keyword', { operator: 'mention', text: '' });
      const orId = chipState.addAfter(mentionId, 'or-connector', {});
      chipState.addAfter(orId, 'keyword', { operator: 'none', text: '', quoted: true });
    },
  },

  {
    id: 'person-quote-network',
    title: { ar: 'شبكة اقتباسات الشخص', en: 'Their quote-tweet network' },
    icon: '🕸️',
    pattern: 'from:user filter:quote',
    description: {
      ar: 'شبكة المرجعيات الفكرية للشخص عبر اقتباساته. ما يختار الشخص اقتباسه إشارة موقف؛ يبني خارطة تأييد ضمنية.',
      en: 'Map a person\'s intellectual references through what they choose to quote-tweet. Quote selection is a stance signal; it builds an implicit endorsement graph.',
    },
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('filter', { value: 'quote' });
    },
  },

  // ── Row 5 — الجمهور والتفاعل ─────────────────────────────────────────────

  {
    id: 'account-audience',
    title: { ar: 'من يرد على الحساب', en: 'Who replies to an account' },
    icon: '👥',
    pattern: 'to:user -filter:retweets',
    description: {
      ar: 'فهم قاعدة الجمهور المتفاعل لشخصية. الردود الأصلية بمعزل عن إعادات النشر.',
      en: 'Understand the engaged audience around a figure. Original replies, with retweets stripped out.',
    },
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'to', text: '' });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  {
    id: 'anger-on-statement',
    title: { ar: 'غضب على بيان رسمي', en: 'Anger at an official statement' },
    icon: '😡',
    pattern: 'to:official min_faves:50 lang:ar',
    description: {
      ar: 'بعد بيان مثير للجدل، نريد قراءة الغضب المحلي. عتبة التفاعل + العربية تفلتر إلى الردود التي وجدت صدى فعلياً.',
      en: 'After a controversial statement, read the local anger. An engagement threshold + Arabic filters down to replies that actually resonated.',
    },
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'to', text: '' });
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 50 });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'how-addressed',
    title: { ar: 'كيف يخاطبه الناس', en: 'How people address them' },
    icon: '🏷️',
    pattern: 'to:user "term" lang:ar',
    description: {
      ar: 'تتبع الألقاب التي يستخدمها الناس مع شخصية — احترام أم سخرية. يكشف خطاب القاعدة (لقب، نعت، شتيمة).',
      en: 'Track the labels people apply to a figure — respect or mockery. Surfaces base-rate vocabulary (titles, epithets, insults).',
    },
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'to', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'viral-unverified',
    title: { ar: 'الفيروسي بلا توثيق', en: 'Viral without verification' },
    icon: '🦠',
    pattern: '_____ min_faves:10000 -filter:verified -filter:blue_verified',
    description: {
      ar: 'تفاعل ضخم على حساب غير موثّق = اختراق صحفي مواطن. يصطاد الانتشار العضوي خارج الحسابات الرسمية أو المدفوعة.',
      en: 'Massive engagement on an unverified account = a citizen-journalism breakthrough. Catches organic virality outside the official and paid tiers.',
    },
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 10000 });
      chipState.add('filter', { value: 'verified', negate: true });
      chipState.add('filter', { value: 'blue_verified', negate: true });
    },
  },

  {
    id: 'organic-arabic-virality',
    title: { ar: 'تفاعل عربي بدون اشتراك', en: 'Organic Arabic virality' },
    icon: '🌿',
    pattern: '_____ min_faves:5000 -filter:blue_verified lang:ar',
    description: {
      ar: 'للتمييز بين الانتشار العضوي العربي والتضخيم المدفوع. عتبة عالية + استثناء الزرقاء = صوت شعبي حقيقي وصل لأرقام كبيرة.',
      en: 'Tell organic Arabic spread apart from paid amplification. A high threshold + excluding blue checks = a real grassroots voice that reached scale.',
    },
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 5000 });
      chipState.add('filter', { value: 'blue_verified', negate: true });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  // ── Row 6 — تأطير وروايات متضادة ─────────────────────────────────────────

  {
    id: 'unofficial-voices',
    title: { ar: 'الأصوات غير الرسمية', en: 'Unofficial voices' },
    icon: '📣',
    pattern: '_____ -filter:verified -filter:blue_verified lang:ar',
    description: {
      ar: 'استبعاد كل المنصات الرسمية والمدفوعة لرؤية الشارع. يفصل التأطير الشعبي عن المؤسسي والمدفوع.',
      en: 'Exclude every official and paid tier to see the street. Separates grassroots framing from institutional and paid-amplifier framing.',
    },
    group: 'framing',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'verified', negate: true });
      chipState.add('filter', { value: 'blue_verified', negate: true });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'competing-hashtags',
    title: { ar: 'هاشتاقات متنافسة', en: 'Competing hashtags' },
    icon: '#️⃣',
    pattern: '(#tagA OR #tagB) lang:ar',
    description: {
      ar: 'حدثان متنافسان حول نفس الواقعة (#الرواية_أ OR #الرواية_ب). يضع التأطيرَين جنباً إلى جنب في نفس الجدول الزمني.',
      en: 'Two competing hashtags around the same event (#narrativeA OR #narrativeB). Lays both framings side by side in a single timeline.',
    },
    group: 'framing',
    apply(chipState) {
      const hashId = chipState.add('keyword', { operator: 'hashtag', text: '' });
      chipState.addAfter(hashId, 'or-connector', {});
      chipState.addAfter(hashId, 'keyword', { operator: 'hashtag', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'cross-script-name',
    title: { ar: 'اسم الشخص بلغتين', en: 'A name across scripts' },
    icon: '🌍',
    pattern: '("اسم عربي" OR "Latin name" OR ACRONYM) topic',
    description: {
      ar: 'شخصية عربية لها صيغة لاتينية وأخرى مختصرة. يحلّ مشكلة تعدد كتابة الاسم في خط واحد بدل بحوث متعددة.',
      en: 'A figure with an Arabic spelling, a Latin transliteration, and an acronym. Solves the multi-spelling problem in one query instead of three searches.',
    },
    group: 'framing',
    apply(chipState) {
      const kw1 = chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.addAfter(kw1, 'or-connector', {});
      const kw2 = chipState.addAfter(kw1, 'keyword', { operator: 'none', text: '', quoted: true });
      chipState.addAfter(kw2, 'or-connector', {});
      chipState.addAfter(kw2, 'keyword', { operator: 'none', text: '' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },

  {
    id: 'event-bilingual',
    title: { ar: 'الحدث بلغتين', en: 'An event in two languages' },
    icon: '🌐',
    pattern: '_____ (lang:ar OR lang:en)',
    description: {
      ar: 'حدث دولي نريد روايته بالعربية والإنجليزية معاً. يكشف الفجوات بين التأطير المحلي والدولي.',
      en: 'An international event — read the story in Arabic and English at once. Exposes the gaps between the local and the international framing.',
    },
    group: 'framing',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      const langAr = chipState.add('keyword', { operator: 'lang', text: 'ar' });
      chipState.addAfter(langAr, 'or-connector', {});
      chipState.addAfter(langAr, 'keyword', { operator: 'lang', text: 'en' });
    },
  },

  {
    id: 'hashtag-hijack',
    title: { ar: 'خطف الهاشتاق', en: 'Hashtag hijack' },
    icon: '🎣',
    pattern: '#tag -lang:ar',
    description: {
      ar: 'هاشتاق عربي يبدو أن غير عرب يستخدمونه. يكشف التغريدات الخارجية على وسم محلي — مؤشر على تنسيق خارجي محتمل.',
      en: 'An Arabic hashtag that non-Arabic speakers seem to be pushing. Surfaces foreign-language tweets riding a local tag — a possible coordination signal.',
    },
    group: 'framing',
    apply(chipState) {
      chipState.add('keyword', { operator: 'hashtag', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar', negate: true });
    },
  },

  // ── Row 7 — تحقق وتخصص ───────────────────────────────────────────────────

  {
    id: 'geo-image-witness',
    title: { ar: 'صورة محلية في موقع', en: 'On-the-ground image at a place' },
    icon: '📍',
    pattern: '_____ filter:images near:city lang:ar',
    description: {
      ar: 'حدث في مدينة معينة، نريد صور المحليين. تثليث الموقع + اللغة + الصور = شهادة بصرية قابلة للتحقق.',
      en: 'An event in a specific city — pull images from locals. Triangulating location + language + images = a verifiable visual testimony.',
    },
    group: 'verify',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'images' });
      chipState.add('keyword', { operator: 'near', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'raw-video-no-press',
    title: { ar: 'فيديو خام بلا قنوات', en: 'Raw video without news channels' },
    icon: '🎬',
    pattern: '_____ filter:native_video -from:press lang:ar',
    description: {
      ar: 'استبعاد قناة إخبارية معروفة لرؤية الفيديو الخام. يطفو الشهادة الميدانية بدل المادة الإخبارية المُعاد بثها.',
      en: 'Exclude a known news channel to see the raw footage. Floats up on-the-ground witness video instead of rebroadcast news material.',
    },
    group: 'verify',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'native_video' });
      chipState.add('keyword', { operator: 'from', text: '', negate: true });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'unusual-source',
    title: { ar: 'مصدر تطبيق غير عادي', en: 'Unusual source app' },
    icon: '🤖',
    pattern:
      '_____ -source:Twitter_for_iPhone -source:Twitter_for_Android -source:Twitter_Web_App',
    description: {
      ar: 'تنسيق بوتات نشطة على وسم؟ نستثني التطبيقات الشائعة الثلاثة. يكشف الجدولة والأتمتة عبر استبعاد العملاء المهيمنين.',
      en: 'Bots coordinated on a hashtag? Exclude the three dominant clients. Surfaces scheduling and automation by stripping out the apps real humans use.',
    },
    group: 'verify',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('keyword', {
        operator: 'source',
        text: 'Twitter_for_iPhone',
        negate: true,
      });
      chipState.add('keyword', {
        operator: 'source',
        text: 'Twitter_for_Android',
        negate: true,
      });
      chipState.add('keyword', {
        operator: 'source',
        text: 'Twitter_Web_App',
        negate: true,
      });
    },
  },

  {
    id: 'domain-amplification',
    title: { ar: 'روابط تضخّم نطاقاً', en: 'Links amplifying a domain' },
    icon: '🔗',
    pattern: 'url:domain lang:ar -filter:retweets',
    description: {
      ar: 'نقيس انتشار موقع إخباري بالعربية بدون التكرار. url: يطابق أيّ جزء من الرابط — يمكن أيضاً وضع شظية مسار لتتبع مقالة بعينها.',
      en: 'Measure how a news domain spreads in Arabic without retweet noise. url: matches any part of the link — drop in a path fragment to track a single article.',
    },
    group: 'verify',
    apply(chipState) {
      chipState.add('keyword', { operator: 'url', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  {
    id: 'live-spaces',
    title: { ar: 'مساحة صوتية حول حدث', en: 'Live Spaces around an event' },
    icon: '🎙️',
    pattern: '_____ filter:spaces lang:ar',
    description: {
      ar: 'بحث عن مساحات Spaces مباشرة حول حدث جارٍ. المساحات الصوتية شهادات حية في الوقت الحقيقي ومصدر صوتي نادر يصعب الوصول إليه بطرق أخرى.',
      en: 'Find live Spaces around an unfolding event. Spaces are real-time audio testimony — a rare voice source that\'s hard to reach any other way.',
    },
    group: 'verify',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('filter', { value: 'spaces' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },
];

// ---------------------------------------------------------------------------
// Group metadata
// ---------------------------------------------------------------------------

export const GROUP_ORDER = [
  'origin',
  'amplification',
  'thread',
  'person',
  'audience',
  'framing',
  'verify',
];

export const GROUP_LABELS = {
  origin:        { ar: 'المصدر الأول',           en: 'Original source' },
  amplification: { ar: 'شبكة التضخيم',           en: 'Amplification network' },
  thread:        { ar: 'إعادة بناء المحادثة',     en: 'Reconstruct the conversation' },
  person:        { ar: 'الشخص والموضوع',          en: 'Person and topic' },
  audience:      { ar: 'الجمهور والتفاعل',         en: 'Audience and engagement' },
  framing:       { ar: 'تأطير وروايات متضادة',    en: 'Framing and counter-narratives' },
  verify:        { ar: 'تحقق وتخصص',             en: 'Verify and specialize' },
};
