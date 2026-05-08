// X / Twitter OSINT idiom library — 35 recipes, 7 groups of 5.
//
// Groups follow the investigative arc: origin → amplification → thread →
// person → audience → framing → verify.  This mirrors how X investigations
// actually flow in the field (Bellingcat / OSINTCurio / Igor Brigadir
// cross-referenced).
//
// Literals are used for Arabic strings instead of i18n keys — acceptable
// because the UI is Arabic-only (CLAUDE.md: "interface language is Arabic").
// A mechanical pass to route through messages.js is the migration path if an
// English UI ever lands.
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
// IDIOMS
// ---------------------------------------------------------------------------

export const IDIOMS = [
  // ── Row 1 — المصدر الأول ──────────────────────────────────────────────────

  {
    id: 'first-tweeter',
    title: 'أول من غرّد',
    icon: '⚡',
    pattern: '_____ since:_ until:_ -filter:replies -filter:retweets',
    description:
      'حدث كاسر تحتاج المصدر الأصلي قبل أن يتكرر. يقصّ الردود وإعادات النشر فيظهر التغريدات الأولى داخل النافذة الزمنية.',
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
    title: 'أول شاهد بالفيديو',
    icon: '🎥',
    pattern: '_____ filter:native_video lang:ar since:_ until:_ -filter:retweets',
    description:
      'أول فيديو خام التقطه شاهد عيان لا قناة إخبارية. الفيديو الأصلي + اللغة العربية = شهادة محلية، لا مادة معاد بثها.',
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
    title: 'أول صورة ميدانية',
    icon: '📸',
    pattern: '_____ filter:images lang:ar -filter:retweets since:_ until:_',
    description:
      'أول صورة محلية لحادثة قبل أن تنتشر. الصور + اللغة + استبعاد إعادة النشر يكشف المصور المحلي الأول.',
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
    title: 'تغريدة محذوفة',
    icon: '🗑️',
    pattern: '@user "phrase" since:_ until:_',
    description:
      'التغريدة محذوفة لكن أحدهم اقتبسها في رد أو لقطة. يصطاد الإشارات والاقتباسات التي بقيت بعد الحذف فيعيد بناء النص الأصلي.',
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
    id: 'breaking-arabic',
    title: 'عاجل بالعربية',
    icon: '🔴',
    pattern: '"عاجل" _____ lang:ar -filter:retweets since:_ until:_',
    description:
      'كلمة "عاجل" هي العَلَم الفعلي للأخبار الكاسرة بالعربية. الاقتباس الحرفي يحصر النتائج على هذا التأطير المحلي.',
    group: 'origin',
    apply(chipState) {
      chipState.add('keyword', { operator: 'none', text: 'عاجل', quoted: true });
      chipState.add('keyword', { operator: 'none', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
      chipState.add('filter', { value: 'retweets', negate: true });
      chipState.add('date-range', {
        after: fmt(daysAgo(7)),
        before: fmt(today()),
      });
    },
  },

  // ── Row 2 — شبكة التضخيم ─────────────────────────────────────────────────

  {
    id: 'quoters-of-tweet',
    title: 'من اقتبس التغريدة',
    icon: '🔁',
    pattern: 'quoted_tweet_id:_____',
    description:
      'لرسم خريطة من اقتبس تغريدة محورية. يكشف كل من أعاد التأطير عبر الاقتباس — وليس الإعجاب فقط. (انسخ معرّف التغريدة من رابطها.)',
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'quoted_tweet_id', text: '' });
    },
  },

  {
    id: 'paid-amplifiers',
    title: 'مُضخّمون بالعلامة الزرقاء',
    icon: '💙',
    pattern: 'quoted_tweet_id:_____ filter:blue_verified',
    description:
      'للتمييز بين تضخيم مدفوع وتضخيم عضوي. يحصر مقتبسي تغريدة معينة في حسابات Blue المدفوعة فيكشف نمط الشراء.',
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'quoted_tweet_id', text: '' });
      chipState.add('filter', { value: 'blue_verified' });
    },
  },

  {
    id: 'account-quotes',
    title: 'ماذا يقتبس الحساب',
    icon: '🗨️',
    pattern: 'from:user filter:quote',
    description:
      'لرسم خريطة آراء حساب من خلال من يقتبس عنهم. الاقتباسات إشارة موقف؛ تكشف الشبكة الفكرية للحساب.',
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('filter', { value: 'quote' });
    },
  },

  {
    id: 'street-on-statement',
    title: 'ردود الشارع على بيان',
    icon: '📢',
    pattern: 'quoted_tweet_id:_____ -filter:verified -filter:blue_verified',
    description:
      'بيان رسمي صدر، نريد قراءة الشارع غير الموثّق. يستثني الموثقين بكل أنواعهم فيظهر ما قاله الناس فعلاً.',
    group: 'amplification',
    apply(chipState) {
      chipState.add('keyword', { operator: 'quoted_tweet_id', text: '' });
      chipState.add('filter', { value: 'verified', negate: true });
      chipState.add('filter', { value: 'blue_verified', negate: true });
    },
  },

  {
    id: 'verified-quote-reactions',
    title: 'ردود فعل المؤثرين',
    icon: '⭐',
    pattern: '_____ filter:blue_verified filter:quote -filter:retweets',
    description:
      'حدث كبير، نريد كيف أطّره المؤثرون مدفوعو الاشتراك. الاقتباس + الزرقاء = من يضع تأطيره فوق تأطير غيره عبر QT.',
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
    title: 'كامل الموضوع',
    icon: '🧵',
    pattern: 'conversation_id:_____',
    description:
      'تغريدة جذر بمحادثة طويلة، نريد كل الردود والردود على الردود. يستحضر الموضوع كاملاً متجاوزاً ترتيب X الافتراضي. (انسخ معرّف التغريدة الجذر.)',
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
    },
  },

  {
    id: 'thread-arabic',
    title: 'ردود الموضوع بالعربية',
    icon: '🌐',
    pattern: 'conversation_id:_____ lang:ar',
    description:
      'المحادثة متعددة اللغات، نريد الأصوات المحلية فقط. يقتطف الجزء العربي من المحادثة في بحث متعدد اللغات.',
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'thread-top-replies',
    title: 'الردود الأكثر تفاعلاً',
    icon: '🔝',
    pattern: 'conversation_id:_____ min_faves:100',
    description:
      'محادثة بآلاف الردود، نريد الأهم. يطفو الردود ذات التفاعل الحقيقي ويتجاوز ترتيب الخوارزمية المبهم.',
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 100 });
    },
  },

  {
    id: 'thread-verified',
    title: 'الردود الموثّقة',
    icon: '✅',
    pattern: 'conversation_id:_____ filter:verified',
    description:
      'الذين ردوا من النخب التقليدية الموثقة على تغريدة بعينها. يكشف الحوار العمودي بين المؤسسات.',
    group: 'thread',
    apply(chipState) {
      chipState.add('keyword', { operator: 'conversation_id', text: '' });
      chipState.add('filter', { value: 'verified' });
    },
  },

  {
    id: 'thread-dissent',
    title: 'ردود المعارضة',
    icon: '⚖️',
    pattern: 'conversation_id:_____ -from:author filter:has_engagement',
    description:
      'الاعتراضات والتصحيحات تحت تغريدة جدلية. يستثني صاحب التغريدة ويُبقي الردود المتفاعلة فقط — حيث يكون التصحيح غالباً.',
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
    title: 'ماذا قال الشخص؟',
    icon: '🎙️',
    pattern: 'from:user _____',
    description:
      'شخصية عامة وموضوع — كل ما قالته. البحث الأساسي لاستخراج موقف شخص من ملف.',
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('keyword', { operator: 'none', text: '' });
    },
  },

  {
    id: 'position-evolution',
    title: 'تطور الموقف عبر الزمن',
    icon: '📅',
    pattern: 'from:user _____ since:_ until:_',
    description:
      'متى تغيّر تأطير المسؤول لقضية بعينها. النافذة الزمنية تكشف تحولات الخطاب وتغيرات السياسة.',
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
    title: 'هل ذكر هذا الاسم؟',
    icon: '🔍',
    pattern: 'from:user "name"',
    description:
      'للتحقق ما إذا كان مسؤول قد ذكر اسماً بعينه. الاقتباس يمنع التطابقات الجزئية ويعطي إثباتاً قابلاً للنقل.',
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
    },
  },

  {
    id: 'person-vs-person',
    title: 'الشخص ضد الشخص',
    icon: '⚔️',
    pattern: 'from:userA (@userB OR "userB display")',
    description:
      'جدل علني بين شخصيتين — مباشر أو بالاسم. يدمج الإشارات وذكر الاسم في استعلام واحد فيكشف المواجهات والإشارات الضمنية.',
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
    title: 'شبكة اقتباسات الشخص',
    icon: '🕸️',
    pattern: 'from:user filter:quote',
    description:
      'شبكة المرجعيات الفكرية للشخص عبر اقتباساته. ما يختار الشخص اقتباسه إشارة موقف؛ يبني خارطة تأييد ضمنية.',
    group: 'person',
    apply(chipState) {
      chipState.add('keyword', { operator: 'from', text: '' });
      chipState.add('filter', { value: 'quote' });
    },
  },

  // ── Row 5 — الجمهور والتفاعل ─────────────────────────────────────────────

  {
    id: 'account-audience',
    title: 'من يرد على الحساب',
    icon: '👥',
    pattern: 'to:user -filter:retweets',
    description:
      'فهم قاعدة الجمهور المتفاعل لشخصية. الردود الأصلية بمعزل عن إعادات النشر.',
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'to', text: '' });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  {
    id: 'anger-on-statement',
    title: 'غضب على بيان رسمي',
    icon: '😡',
    pattern: 'to:official min_faves:50 lang:ar',
    description:
      'بعد بيان مثير للجدل، نريد قراءة الغضب المحلي. عتبة التفاعل + العربية تفلتر إلى الردود التي وجدت صدى فعلياً.',
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'to', text: '' });
      chipState.add('engagement', { metric: 'min_faves', direction: 'min', value: 50 });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'how-addressed',
    title: 'كيف يخاطبه الناس',
    icon: '🏷️',
    pattern: 'to:user "term" lang:ar',
    description:
      'تتبع الألقاب التي يستخدمها الناس مع شخصية — احترام أم سخرية. يكشف خطاب القاعدة (لقب، نعت، شتيمة).',
    group: 'audience',
    apply(chipState) {
      chipState.add('keyword', { operator: 'to', text: '' });
      chipState.add('keyword', { operator: 'none', text: '', quoted: true });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
    },
  },

  {
    id: 'viral-unverified',
    title: 'الفيروسي بلا توثيق',
    icon: '🦠',
    pattern: '_____ min_faves:10000 -filter:verified -filter:blue_verified',
    description:
      'تفاعل ضخم على حساب غير موثّق = اختراق صحفي مواطن. يصطاد الانتشار العضوي خارج الحسابات الرسمية أو المدفوعة.',
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
    title: 'تفاعل عربي بدون اشتراك',
    icon: '🌿',
    pattern: '_____ min_faves:5000 -filter:blue_verified lang:ar',
    description:
      'للتمييز بين الانتشار العضوي العربي والتضخيم المدفوع. عتبة عالية + استثناء الزرقاء = صوت شعبي حقيقي وصل لأرقام كبيرة.',
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
    title: 'الأصوات غير الرسمية',
    icon: '📣',
    pattern: '_____ -filter:verified -filter:blue_verified lang:ar',
    description:
      'استبعاد كل المنصات الرسمية والمدفوعة لرؤية الشارع. يفصل التأطير الشعبي عن المؤسسي والمدفوع.',
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
    title: 'هاشتاقات متنافسة',
    icon: '#️⃣',
    pattern: '(#tagA OR #tagB) lang:ar',
    description:
      'حدثان متنافسان حول نفس الواقعة (#الرواية_أ OR #الرواية_ب). يضع التأطيرَين جنباً إلى جنب في نفس الجدول الزمني.',
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
    title: 'اسم الشخص بلغتين',
    icon: '🌍',
    pattern: '("اسم عربي" OR "Latin name" OR ACRONYM) topic',
    description:
      'شخصية عربية لها صيغة لاتينية وأخرى مختصرة. يحلّ مشكلة تعدد كتابة الاسم في خط واحد بدل بحوث متعددة.',
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
    title: 'الحدث بلغتين',
    icon: '🌐',
    pattern: '_____ (lang:ar OR lang:en)',
    description:
      'حدث دولي نريد روايته بالعربية والإنجليزية معاً. يكشف الفجوات بين التأطير المحلي والدولي.',
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
    title: 'خطف الهاشتاق',
    icon: '🎣',
    pattern: '#tag -lang:ar',
    description:
      'هاشتاق عربي يبدو أن غير عرب يستخدمونه. يكشف التغريدات الخارجية على وسم محلي — مؤشر على تنسيق خارجي محتمل.',
    group: 'framing',
    apply(chipState) {
      chipState.add('keyword', { operator: 'hashtag', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar', negate: true });
    },
  },

  // ── Row 7 — تحقق وتخصص ───────────────────────────────────────────────────

  {
    id: 'geo-image-witness',
    title: 'صورة محلية في موقع',
    icon: '📍',
    pattern: '_____ filter:images near:city lang:ar',
    description:
      'حدث في مدينة معينة، نريد صور المحليين. تثليث الموقع + اللغة + الصور = شهادة بصرية قابلة للتحقق.',
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
    title: 'فيديو خام بلا قنوات',
    icon: '🎬',
    pattern: '_____ filter:native_video -from:press lang:ar',
    description:
      'استبعاد قناة إخبارية معروفة لرؤية الفيديو الخام. يطفو الشهادة الميدانية بدل المادة الإخبارية المُعاد بثها.',
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
    title: 'مصدر تطبيق غير عادي',
    icon: '🤖',
    pattern:
      '_____ -source:Twitter_for_iPhone -source:Twitter_for_Android -source:Twitter_Web_App',
    description:
      'تنسيق بوتات نشطة على وسم؟ نستثني التطبيقات الشائعة الثلاثة. يكشف الجدولة والأتمتة عبر استبعاد العملاء المهيمنين.',
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
    title: 'روابط تضخّم نطاقاً',
    icon: '🔗',
    pattern: 'url:domain lang:ar -filter:retweets',
    description:
      'نقيس انتشار موقع إخباري بالعربية بدون التكرار. url: يطابق أيّ جزء من الرابط — يمكن أيضاً وضع شظية مسار لتتبع مقالة بعينها.',
    group: 'verify',
    apply(chipState) {
      chipState.add('keyword', { operator: 'url', text: '' });
      chipState.add('keyword', { operator: 'lang', text: 'ar' });
      chipState.add('filter', { value: 'retweets', negate: true });
    },
  },

  {
    id: 'live-spaces',
    title: 'مساحة صوتية حول حدث',
    icon: '🎙️',
    pattern: '_____ filter:spaces lang:ar',
    description:
      'بحث عن مساحات Spaces مباشرة حول حدث جارٍ. المساحات الصوتية شهادات حية في الوقت الحقيقي ومصدر صوتي نادر يصعب الوصول إليه بطرق أخرى.',
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
  origin: 'المصدر الأول',
  amplification: 'شبكة التضخيم',
  thread: 'إعادة بناء المحادثة',
  person: 'الشخص والموضوع',
  audience: 'الجمهور والتفاعل',
  framing: 'تأطير وروايات متضادة',
  verify: 'تحقق وتخصص',
};
