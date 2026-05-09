// i18n message dictionary. Single source of truth for every Arabic and English
// label, placeholder, validation message, and tip in the app.
//
// Each entry maps a stable key to a `{ ar, en }` pair. For interpolated
// strings, the value is a function `(vars) => string` per language.
//
// `t(key, vars)` reads the active language from src/core/lang.js's module-level
// accessor and resolves. Unknown keys fall through to the key itself so a
// missing translation is loud rather than silent.

import { getActiveLang } from '../core/lang.js';

export const MESSAGES = {
  // ===== HTML shell =====
  'app.title':              { ar: 'أداة بناء استعلامات البحث',        en: 'Search Query Builder' },
  'app.engineToggleLabel':  { ar: 'محرك البحث',                       en: 'Search engine' },
  'app.langToggleLabel':    { ar: 'اللغة',                              en: 'Language' },
  'app.langArabic':         { ar: 'AR',                                en: 'AR' },
  'app.langEnglish':        { ar: 'EN',                                en: 'EN' },
  'app.normalizeLabel':     { ar: 'توحيد الأحرف العربية',              en: 'Arabic normalization' },
  'app.normalizeInfoTitle': { ar: 'ما هذا؟',                            en: 'What is this?' },
  'app.normalizeInfoBody':  {
    ar: 'عند تفعيل هذا الخيار، يقوم البرنامج بتوحيد بعض الأحرف العربية المتشابهة (مثل أ، إ، آ تصبح ا) قبل البحث، مما يساعد على الحصول على نتائج أوسع. لا يغيّر هذا الخيار ما تكتبه — يظهر التحويل في معاينة الاستعلام أدناه.',
    en: 'When enabled, the tool unifies similar Arabic letters (e.g. أ, إ, آ → ا) before searching, broadening results across spelling variants. Your typed text is not changed — the transformation appears only in the query preview below. Useful when the search terms include Arabic, regardless of the UI language.',
  },
  'app.welcomeBlurbHtml': {
    ar: 'ابدأ بوصفة جاهزة من <strong>«وصفات بحث جاهزة»</strong> أدناه، أو اكتب كلمتك واضغط <kbd>Enter</kbd> لبناء استعلامك من الصفر.',
    en: 'Start with a ready-made recipe from <strong>"Recipes"</strong> below, or type a term and press <kbd>Enter</kbd> to build your query from scratch.',
  },
  'app.welcomeCloseLabel':  { ar: 'إخفاء لوحة الترحيب',                 en: 'Hide welcome panel' },
  'app.welcomeCloseText':   { ar: 'إخفاء',                              en: 'Hide' },
  'app.chipSectionHeading': { ar: 'ابنِ بحثك بإضافة كلمات',             en: 'Build your search by adding terms' },
  'app.previewHeading':     { ar: 'استعلامك جاهز',                      en: 'Your query' },
  'app.copyBtn':            { ar: 'نسخ',                                 en: 'Copy' },
  'app.copyBtnDone':        { ar: 'تم النسخ',                            en: 'Copied' },
  'app.resetBtn':           { ar: 'مسح الكل',                            en: 'Clear all' },
  'app.resetBtnConfirm':    { ar: 'تأكيد المسح',                         en: 'Tap again to confirm' },
  'app.undoBtn':            { ar: 'تراجع',                                en: 'Undo' },
  'app.undoBtnTitle':       { ar: 'تراجع (Ctrl+Z)',                       en: 'Undo (Ctrl+Z)' },
  'app.copyFailed':         { ar: 'تعذر النسخ — يرجى نسخ الاستعلام يدوياً', en: 'Copy failed — please copy the query manually.' },
  'app.fbFormHeading':      { ar: 'نموذج بحث Facebook',                  en: 'Facebook search form' },
  'app.versionLabel':       {
    ar: (vars) => 'الإصدار ' + vars.v,
    en: (vars) => 'Version ' + vars.v,
  },
  'app.versionAriaLabel':   {
    ar: (vars) => 'إصدار الأداة ' + vars.v,
    en: (vars) => 'Tool version ' + vars.v,
  },

  // ===== Engine: Google =====
  'engine.google.subtitle': {
    ar: 'ابنِ استعلامات بحث متقدمة في Google باللغة العربية، دون الحاجة إلى الكتابة بالإنجليزية أو تبديل لوحة المفاتيح.',
    en: 'Build advanced Google search queries — Arabic terms welcome, no keyboard switching, no fighting bidirectional text.',
  },
  'engine.google.searchBtn':    { ar: 'البحث في Google',                en: 'Search Google' },
  'engine.google.emptyPreview': { ar: 'ستظهر هنا صيغة الاستعلام بعد إضافة الكلمات أعلاه', en: 'Your assembled query will appear here once you add terms above' },

  // Google operator labels (dropdown / pills / drawer-badge text uses op.opName + ':' so badges stay literal)
  'engine.google.op.none.label':     { ar: 'كلمة',                       en: 'Word' },
  'engine.google.op.site.label':     { ar: 'موقع (site:)',               en: 'Site (site:)' },
  'engine.google.op.intitle.label':  { ar: 'في العنوان (intitle:)',     en: 'In title (intitle:)' },
  'engine.google.op.intext.label':   { ar: 'في النص (intext:)',          en: 'In body (intext:)' },
  'engine.google.op.inanchor.label': { ar: 'في نص الروابط (inanchor:)',   en: 'In anchor text (inanchor:)' },
  'engine.google.op.inurl.label':    { ar: 'في الرابط (inurl:)',         en: 'In URL (inurl:)' },

  // Google composer pills (short labels under the ghost chip)
  'engine.google.pill.none':     { ar: 'كلمة عادية',                     en: 'Plain word' },
  'engine.google.pill.site':     { ar: 'في الموقع',                       en: 'On a site' },
  'engine.google.pill.intitle':  { ar: 'في عنوان الصفحة',                 en: 'In page title' },
  'engine.google.pill.inurl':    { ar: 'في رابط الصفحة',                  en: 'In page URL' },
  'engine.google.pill.intext':   { ar: 'في نص الصفحة',                    en: 'In page body' },
  'engine.google.pill.inanchor': { ar: 'في الروابط الواردة',               en: 'In incoming links' },

  // Google drawer items (label + desc; badge is literal)
  'engine.google.drawer.site.label':            { ar: 'البحث في موقع محدد',          en: 'Search a specific site' },
  'engine.google.drawer.site.desc':             { ar: 'يحصر النتائج بنطاق معين، مثل bbc.com', en: 'Limit results to one domain, e.g. bbc.com' },
  'engine.google.drawer.intitle.label':         { ar: 'البحث في عنوان الصفحة',       en: 'Match in page title' },
  'engine.google.drawer.intitle.desc':          { ar: 'كلمة يجب أن تظهر في عنوان النتيجة', en: 'A term that must appear in the result\'s title' },
  'engine.google.drawer.inurl.label':           { ar: 'البحث في رابط الصفحة',        en: 'Match in page URL' },
  'engine.google.drawer.inurl.desc':            { ar: 'كلمة يجب أن تظهر في رابط النتيجة', en: 'A term that must appear in the result\'s URL' },
  'engine.google.drawer.intext.label':          { ar: 'البحث في نص الصفحة',          en: 'Match in page body' },
  'engine.google.drawer.intext.desc':           { ar: 'كلمة يجب أن تظهر في محتوى النتيجة', en: 'A term that must appear in the page content' },
  'engine.google.drawer.inanchor.label':        { ar: 'البحث في روابط واردة',         en: 'Match in inbound anchor text' },
  'engine.google.drawer.inanchor.desc':         { ar: 'كلمة من نص الروابط التي تشير للصفحة', en: 'A term from links pointing at the page' },
  'engine.google.drawer.filetype.label':        { ar: 'نوع الملف',                    en: 'File type' },
  'engine.google.drawer.filetype.desc':         { ar: 'حصر النتائج في PDF أو Word أو غيرها', en: 'Restrict to PDF, Word, etc.' },
  'engine.google.drawer.dateRange.label':       { ar: 'نطاق زمني',                    en: 'Date range' },
  'engine.google.drawer.dateRange.desc':        { ar: 'حصر النتائج بين تاريخين',      en: 'Restrict results to a window of dates' },
  'engine.google.drawer.proximity.label':       { ar: 'كلمتان متقاربتان',              en: 'Two nearby words' },
  'engine.google.drawer.proximity.desc':        { ar: 'كلمتان تظهران بقرب بعضهما، مفيد لربط شخصين', en: 'Two words near each other — useful for linking entities' },
  'engine.google.drawer.numberRange.label':     { ar: 'نطاق عددي',                    en: 'Number range' },
  'engine.google.drawer.numberRange.desc':      { ar: 'أرقام بين قيمتين، مثل 100..500',  en: 'Numbers between two values, e.g. 100..500' },
  'engine.google.drawer.social.telegram.label':     { ar: 'تيليغرام',                                  en: 'Telegram' },
  'engine.google.drawer.social.telegram.desc':      { ar: 'يحصر النتائج بقنوات ومجموعات تيليغرام العامة', en: 'Limit results to public Telegram channels and groups' },
  'engine.google.drawer.social.fb-groups.label':    { ar: 'مجموعات فيسبوك',                            en: 'Facebook groups' },
  'engine.google.drawer.social.fb-groups.desc':     { ar: 'يحصر النتائج بصفحات مجموعات فيسبوك',         en: 'Limit results to Facebook group pages' },
  'engine.google.drawer.social.fb.label':           { ar: 'فيسبوك',                                    en: 'Facebook' },
  'engine.google.drawer.social.fb.desc':            { ar: 'الحسابات والصفحات والمنشورات على فيسبوك',     en: 'Profiles, pages, and posts on Facebook' },
  'engine.google.drawer.social.x.label':            { ar: 'إكس / تويتر',                              en: 'X / Twitter' },
  'engine.google.drawer.social.x.desc':             { ar: 'المحتوى العام على منصة إكس',                en: 'Public content on X / Twitter' },
  'engine.google.drawer.social.linkedin.label':     { ar: 'لينكدإن',                                   en: 'LinkedIn' },
  'engine.google.drawer.social.linkedin.desc':      { ar: 'الحسابات والشركات والمنشورات على لينكدإن',   en: 'Profiles, companies, and posts on LinkedIn' },
  'engine.google.drawer.social.reddit.label':       { ar: 'ريديت',                                     en: 'Reddit' },
  'engine.google.drawer.social.reddit.desc':        { ar: 'المنتديات الفرعية والمنشورات والتعليقات على ريديت', en: 'Subreddits, posts, and comments on Reddit' },
  'engine.google.drawer.social.youtube.label':      { ar: 'يوتيوب',                                    en: 'YouTube' },
  'engine.google.drawer.social.youtube.desc':       { ar: 'القنوات والفيديوهات والتعليقات على يوتيوب',   en: 'Channels, videos, and comments on YouTube' },
  'engine.google.drawer.social.instagram.label':    { ar: 'إنستغرام',                                  en: 'Instagram' },
  'engine.google.drawer.social.instagram.desc':     { ar: 'الحسابات والمنشورات على إنستغرام',           en: 'Profiles and posts on Instagram' },
  'engine.google.drawer.social.tiktok.label':       { ar: 'تيك توك',                                   en: 'TikTok' },
  'engine.google.drawer.social.tiktok.desc':        { ar: 'الحسابات والفيديوهات على تيك توك',           en: 'Profiles and videos on TikTok' },

  // Google templates
  'engine.google.tpl.site.title':     { ar: 'بحث في موقع محدد',            en: 'Search a specific site' },
  'engine.google.tpl.site.desc':      { ar: 'حصر النتائج بنطاق معين مثل bbc.com', en: 'Limit results to one domain, e.g. bbc.com' },
  'engine.google.tpl.docs.title':     { ar: 'بحث في الوثائق',                en: 'Search documents' },
  'engine.google.tpl.docs.desc':      { ar: 'العثور على ملفات PDF أو Word',   en: 'Find PDF or Word files' },
  'engine.google.tpl.daterange.title':{ ar: 'بحث في نطاق زمني',             en: 'Search a date range' },
  'engine.google.tpl.daterange.desc': { ar: 'حصر النتائج بين تاريخين',       en: 'Restrict results to a window of dates' },

  // ===== Engine: X / Twitter =====
  'engine.x.label':         { ar: 'X / تويتر',                            en: 'X / Twitter' },
  'engine.x.subtitle':      {
    ar: 'ابنِ استعلامات بحث متقدمة في X / تويتر باللغة العربية، دون الحاجة إلى الكتابة بالإنجليزية أو تبديل لوحة المفاتيح.',
    en: 'Build advanced X / Twitter search queries — Arabic terms welcome, no keyboard switching, no bidirectional headaches.',
  },
  'engine.x.searchBtn':     { ar: 'البحث في X',                           en: 'Search X' },
  'engine.x.emptyPreview':  { ar: 'ستظهر هنا صيغة الاستعلام بعد إضافة الكلمات أعلاه', en: 'Your assembled query will appear here once you add terms above' },

  // X operator labels
  'engine.x.op.none.label':            { ar: 'كلمة',                       en: 'Word' },
  'engine.x.op.from.label':            { ar: 'من حساب (from:)',            en: 'From account (from:)' },
  'engine.x.op.to.label':              { ar: 'ردّاً على حساب (to:)',         en: 'Reply to account (to:)' },
  'engine.x.op.mention.label':         { ar: 'ذِكر (@user)',                en: 'Mention (@user)' },
  'engine.x.op.hashtag.label':         { ar: 'هاشتاج (#tag)',                en: 'Hashtag (#tag)' },
  'engine.x.op.url.label':             { ar: 'رابط (url:)',                 en: 'Link (url:)' },
  'engine.x.op.list.label':            { ar: 'قائمة (list:)',               en: 'List (list:)' },
  'engine.x.op.lang.label':            { ar: 'لغة (lang:)',                 en: 'Language (lang:)' },
  'engine.x.op.near.label':            { ar: 'قرب (near:)',                  en: 'Near (near:)' },
  'engine.x.op.source.label':          { ar: 'تطبيق المصدر (source:)',       en: 'Source app (source:)' },
  'engine.x.op.conversation_id.label': { ar: 'محادثة (conversation_id:)',    en: 'Conversation (conversation_id:)' },
  'engine.x.op.quoted_tweet_id.label': { ar: 'اقتباس تغريدة (quoted_tweet_id:)', en: 'Quoted tweet (quoted_tweet_id:)' },

  // X composer pills
  'engine.x.pill.none':    { ar: 'كلمة عادية',                            en: 'Plain word' },
  'engine.x.pill.from':    { ar: 'من حساب',                               en: 'From account' },
  'engine.x.pill.to':      { ar: 'ردّاً على',                              en: 'Reply to' },
  'engine.x.pill.mention': { ar: 'ذِكر (@)',                              en: 'Mention (@)' },
  'engine.x.pill.hashtag': { ar: 'هاشتاج (#)',                            en: 'Hashtag (#)' },
  'engine.x.pill.filterImages': { ar: 'صور فقط',                          en: 'Images only' },
  'engine.x.pill.filterVideos': { ar: 'فيديو فقط',                        en: 'Videos only' },
  'engine.x.pill.dateRange':    { ar: 'نطاق زمني',                        en: 'Date range' },

  // X drawer items
  'engine.x.drawer.from.label':            { ar: 'من حساب',                en: 'From an account' },
  'engine.x.drawer.from.desc':             { ar: 'حصر النتائج بتغريدات حساب معين', en: 'Tweets from one specific account' },
  'engine.x.drawer.to.label':              { ar: 'ردّاً على حساب',           en: 'Replies to an account' },
  'engine.x.drawer.to.desc':               { ar: 'تغريدات موجَّهة لحساب معين',  en: 'Tweets directed at one account' },
  'engine.x.drawer.mention.label':         { ar: 'ذِكر حساب',               en: 'Account mention' },
  'engine.x.drawer.mention.desc':          { ar: 'تغريدات تذكر حساباً (@user)',  en: 'Tweets that mention @user' },
  'engine.x.drawer.hashtag.label':         { ar: 'هاشتاج',                  en: 'Hashtag' },
  'engine.x.drawer.hashtag.desc':          { ar: 'تغريدات تحتوي وسماً معيناً',   en: 'Tweets that contain a hashtag' },
  'engine.x.drawer.list.label':            { ar: 'قائمة',                   en: 'List' },
  'engine.x.drawer.list.desc':             { ar: 'حصر النتائج بأعضاء قائمة معينة', en: 'Restrict to members of a list' },
  'engine.x.drawer.url.label':             { ar: 'رابط داخل التغريدة',        en: 'Link in tweet' },
  'engine.x.drawer.url.desc':              { ar: 'تغريدات تشير لنطاق معين',   en: 'Tweets pointing at a domain' },
  'engine.x.drawer.lang.label':            { ar: 'لغة التغريدة',             en: 'Tweet language' },
  'engine.x.drawer.lang.desc':             { ar: 'مثل ar للعربية أو en للإنجليزية', en: 'e.g. ar for Arabic or en for English' },
  'engine.x.drawer.near.label':            { ar: 'قرب موقع جغرافي',           en: 'Near a place' },
  'engine.x.drawer.near.desc':             { ar: 'حصر النتائج قرب مدينة أو near:me', en: 'Restrict near a city or near:me' },
  'engine.x.drawer.source.label':          { ar: 'تطبيق المصدر',              en: 'Source app' },
  'engine.x.drawer.source.desc':           { ar: 'التطبيق الذي أُرسلت منه التغريدة', en: 'The app the tweet was posted from' },
  'engine.x.drawer.conversation_id.label': { ar: 'معرّف المحادثة',            en: 'Conversation ID' },
  'engine.x.drawer.conversation_id.desc':  { ar: 'كل التغريدات في محادثة معينة', en: 'All tweets in one conversation' },
  'engine.x.drawer.quoted_tweet_id.label': { ar: 'معرّف تغريدة مقتبَسة',       en: 'Quoted tweet ID' },
  'engine.x.drawer.quoted_tweet_id.desc':  { ar: 'تغريدات تقتبس تغريدة معينة',  en: 'Tweets that quote one specific tweet' },
  'engine.x.drawer.dateRange.label':       { ar: 'نطاق زمني',                en: 'Date range' },
  'engine.x.drawer.dateRange.desc':        { ar: 'حصر النتائج بين تاريخين',  en: 'Restrict results to a window of dates' },
  'engine.x.drawer.filter.label':          { ar: 'تصفية بنوع التغريدة',       en: 'Filter by tweet type' },
  'engine.x.drawer.filter.desc':           { ar: 'تغريدات بصور أو فيديو، ردود، تحقق…', en: 'Photos, video, replies, verified…' },
  'engine.x.drawer.engagement.label':      { ar: 'حد أدنى/أقصى للتفاعل',      en: 'Engagement threshold' },
  'engine.x.drawer.engagement.desc':       { ar: 'إعجابات أو ردود أو إعادات تغريد', en: 'Likes, replies, or retweets' },
  'engine.x.drawer.engagement.faves.label':    { ar: 'حد أدنى للإعجابات',     en: 'Min likes' },
  'engine.x.drawer.engagement.faves.desc':     { ar: 'تغريدات تخطّت عدداً معيّناً من الإعجابات.', en: 'Tweets above a likes threshold.' },
  'engine.x.drawer.engagement.replies.label':  { ar: 'حد أدنى للردود',         en: 'Min replies' },
  'engine.x.drawer.engagement.replies.desc':   { ar: 'تغريدات أثارت نقاشاً واسعاً.',  en: 'Tweets that sparked wide discussion.' },
  'engine.x.drawer.engagement.retweets.label': { ar: 'حد أدنى لإعادات التغريد', en: 'Min retweets' },
  'engine.x.drawer.engagement.retweets.desc':  { ar: 'تغريدات انتشرت على نطاق واسع.', en: 'Tweets that spread widely.' },

  // X templates
  'engine.x.tpl.account.title':    { ar: 'تغريدات من حساب',                en: 'Tweets from an account' },
  'engine.x.tpl.account.desc':     { ar: 'حصر النتائج بحساب معين',          en: 'Restrict results to one account' },
  'engine.x.tpl.popular.title':    { ar: 'تغريدات شائعة',                   en: 'Popular tweets' },
  'engine.x.tpl.popular.desc':     { ar: 'تفاعل مرتفع: 1000 إعجاب أو أكثر', en: 'High engagement: 1000+ likes' },
  'engine.x.tpl.daterange.title':  { ar: 'بحث في فترة زمنية',                en: 'Search a date window' },
  'engine.x.tpl.daterange.desc':   { ar: 'آخر 30 يوماً افتراضياً',           en: 'Last 30 days by default' },

  // ===== Engine: Facebook =====
  'engine.facebook.subtitle': {
    ar: 'ابنِ روابط بحث متقدم في Facebook، مع تحديد الفئة والمرشحات كنموذج. الأداة تُولّد رابط البحث الذي تستخدمه أداة WhoPostedWhat.',
    en: 'Build advanced Facebook search URLs — pick a category and filters as a form. Generates the same URL pattern as WhoPostedWhat.',
  },
  'engine.facebook.searchBtn':     { ar: 'البحث في Facebook',               en: 'Search Facebook' },
  'engine.facebook.emptyPreview':  { ar: 'اكتب كلمة البحث أو اختر مرشحاً لبناء رابط Facebook.', en: 'Type a keyword or pick a filter to build a Facebook URL.' },

  // Facebook category buttons
  'engine.facebook.cat.top.label':    { ar: 'الأعلى',     en: 'Top' },
  'engine.facebook.cat.top.hint':     { ar: 'البحث الموحَّد (الأكثر صلة)', en: 'Universal search (most relevant)' },
  'engine.facebook.cat.posts.label':  { ar: 'المنشورات',  en: 'Posts' },
  'engine.facebook.cat.posts.hint':   { ar: 'منشورات نصية فقط', en: 'Text posts only' },
  'engine.facebook.cat.people.label': { ar: 'الأشخاص',    en: 'People' },
  'engine.facebook.cat.people.hint':  { ar: 'بحث عن أشخاص حسب المدينة أو التعليم أو العمل', en: 'Find people by city, education, or employer' },
  'engine.facebook.cat.photos.label': { ar: 'الصور',      en: 'Photos' },
  'engine.facebook.cat.photos.hint':  { ar: 'منشورات تحتوي صوراً', en: 'Posts containing photos' },
  'engine.facebook.cat.videos.label': { ar: 'الفيديو',    en: 'Videos' },
  'engine.facebook.cat.videos.hint':  { ar: 'منشورات تحتوي فيديو', en: 'Posts containing videos' },
  'engine.facebook.cat.pages.label':  { ar: 'الصفحات',    en: 'Pages' },
  'engine.facebook.cat.pages.hint':   { ar: 'بحث عن صفحات Facebook', en: 'Find Facebook pages' },

  // Facebook section legends + options
  'engine.facebook.sec.postsFrom.legend':           { ar: 'كاتب المنشور',          en: 'Posted by' },
  'engine.facebook.sec.postsFrom.opt.none':         { ar: 'بدون تحديد',            en: 'No filter' },
  'engine.facebook.sec.postsFrom.opt.author_me':    { ar: 'منشوراتي',              en: 'My posts' },
  'engine.facebook.sec.postsFrom.opt.author_friends':{ ar: 'منشورات أصدقائي',       en: 'My friends\' posts' },
  'engine.facebook.sec.postsFrom.opt.author_groups':{ ar: 'منشورات مجموعاتي وصفحاتي', en: 'My groups\' & pages\' posts' },
  'engine.facebook.sec.postsFrom.opt.author_public':{ ar: 'منشورات عامة',           en: 'Public posts' },
  'engine.facebook.sec.postsFrom.opt.author_page':  { ar: 'منشورات من صفحة',       en: 'From a page' },
  'engine.facebook.sec.postsFrom.idPlaceholder':    { ar: 'معرّف الصفحة (أرقام)',   en: 'Page ID (numbers)' },
  'engine.facebook.sec.postsFrom.idHint':           { ar: 'مثال: 119375054750638',  en: 'e.g. 119375054750638' },

  'engine.facebook.sec.postType.legend':           { ar: 'نوع المنشور',           en: 'Post type' },
  'engine.facebook.sec.postType.opt.none':         { ar: 'بدون تحديد',            en: 'No filter' },
  'engine.facebook.sec.postType.opt.interacted':   { ar: 'منشورات شاهدتُها',       en: 'Posts I\'ve seen' },

  'engine.facebook.sec.postedInGroup.legend':       { ar: 'ضمن مجموعة',            en: 'In a group' },
  'engine.facebook.sec.postedInGroup.opt.none':     { ar: 'بدون تحديد',            en: 'No filter' },
  'engine.facebook.sec.postedInGroup.opt.my_groups':{ ar: 'مجموعاتي',              en: 'My groups' },
  'engine.facebook.sec.postedInGroup.opt.group':    { ar: 'مجموعة محددة',          en: 'A specific group' },
  'engine.facebook.sec.postedInGroup.idPlaceholder':{ ar: 'معرّف المجموعة (أرقام)',  en: 'Group ID (numbers)' },
  'engine.facebook.sec.postedInGroup.idHint':       { ar: 'مثال: 574981909329531',  en: 'e.g. 574981909329531' },

  'engine.facebook.sec.taggedLocation.legend':      { ar: 'في موقع',                en: 'Tagged location' },
  'engine.facebook.sec.taggedLocation.opt.none':    { ar: 'بدون تحديد',             en: 'No filter' },
  'engine.facebook.sec.taggedLocation.opt.location':{ ar: 'موقع محدد',              en: 'A specific location' },
  'engine.facebook.sec.taggedLocation.idPlaceholder':{ ar: 'معرّف الموقع (أرقام)',   en: 'Location ID (numbers)' },
  'engine.facebook.sec.taggedLocation.idHint':      { ar: 'مثال: 115028691842393',   en: 'e.g. 115028691842393' },

  'engine.facebook.sec.sortBy.legend':              { ar: 'الترتيب',                en: 'Sort by' },
  'engine.facebook.sec.sortBy.opt.none':            { ar: 'الأكثر صلة (افتراضي)',    en: 'Most relevant (default)' },
  'engine.facebook.sec.sortBy.opt.recent':          { ar: 'الأحدث',                  en: 'Most recent' },

  'engine.facebook.sec.photoType.legend':           { ar: 'نوع الصور',              en: 'Photo type' },
  'engine.facebook.sec.photoType.opt.none':         { ar: 'بدون تحديد',             en: 'No filter' },
  'engine.facebook.sec.photoType.opt.interacted':   { ar: 'صور شاهدتُها',           en: 'Photos I\'ve seen' },

  'engine.facebook.sec.videoSource.legend':         { ar: 'مصدر الفيديو',           en: 'Video source' },
  'engine.facebook.sec.videoSource.opt.none':       { ar: 'بدون تحديد',             en: 'No filter' },
  'engine.facebook.sec.videoSource.opt.live':       { ar: 'بث مباشر',                en: 'Live' },
  'engine.facebook.sec.videoSource.opt.episode':    { ar: 'حلقات',                   en: 'Episodes' },
  'engine.facebook.sec.videoSource.opt.feed':       { ar: 'من الأصدقاء والمجموعات',   en: 'From friends and groups' },

  'engine.facebook.sec.peopleCity.legend':          { ar: 'المدينة',                 en: 'City' },
  'engine.facebook.sec.peopleCity.idPlaceholder':   { ar: 'معرّف المدينة (أرقام)',   en: 'City ID (numbers)' },
  'engine.facebook.sec.peopleCity.idHint':          { ar: 'مثال: 115028691842393',   en: 'e.g. 115028691842393' },

  'engine.facebook.sec.peopleEducation.legend':     { ar: 'التعليم',                 en: 'Education' },
  'engine.facebook.sec.peopleEducation.idPlaceholder':{ ar: 'معرّف المؤسسة التعليمية', en: 'School ID' },
  'engine.facebook.sec.peopleEducation.idHint':     { ar: 'مثال: 751335894893898',    en: 'e.g. 751335894893898' },

  'engine.facebook.sec.peopleWork.legend':          { ar: 'العمل',                   en: 'Employer' },
  'engine.facebook.sec.peopleWork.idPlaceholder':   { ar: 'معرّف جهة العمل',          en: 'Employer ID' },
  'engine.facebook.sec.peopleWork.idHint':          { ar: 'مثال: 20531316728',        en: 'e.g. 20531316728' },

  'engine.facebook.sec.peopleMutual.legend':                  { ar: 'أصدقاء مشتركون',           en: 'Mutual friends' },
  'engine.facebook.sec.peopleMutual.opt.none':                { ar: 'بدون تحديد',                en: 'No filter' },
  'engine.facebook.sec.peopleMutual.opt.my_friends':          { ar: 'أصدقائي',                   en: 'My friends' },
  'engine.facebook.sec.peopleMutual.opt.friends_of_friends':  { ar: 'أصدقاء أصدقائي',             en: 'Friends of my friends' },
  'engine.facebook.sec.peopleMutual.opt.friends_of':          { ar: 'أصدقاء شخص محدد',           en: 'Friends of a specific person' },
  'engine.facebook.sec.peopleMutual.idPlaceholder':           { ar: 'معرّف الشخص (أرقام)',        en: 'Person ID (numbers)' },
  'engine.facebook.sec.peopleMutual.idHint':                  { ar: 'مثال: 100000154813605',      en: 'e.g. 100000154813605' },

  'engine.facebook.sec.pagesVerified.legend':       { ar: 'الحساب الموثّق',           en: 'Verified status' },
  'engine.facebook.sec.pagesVerified.toggleLabel':  { ar: 'صفحات موثَّقة فقط',         en: 'Verified pages only' },

  'engine.facebook.sec.pagesCategory.legend':       { ar: 'فئة الصفحة',              en: 'Page category' },
  'engine.facebook.sec.pagesCategory.opt.none':     { ar: 'بدون تحديد',              en: 'No filter' },
  'engine.facebook.sec.pagesCategory.opt.local':    { ar: 'محل أو مكان محلي',         en: 'Local business or place' },
  'engine.facebook.sec.pagesCategory.opt.company':  { ar: 'شركة أو منظمة أو مؤسسة',    en: 'Company, organization, or institution' },
  'engine.facebook.sec.pagesCategory.opt.brand':    { ar: 'علامة تجارية أو منتج',      en: 'Brand or product' },
  'engine.facebook.sec.pagesCategory.opt.artist':   { ar: 'فنان أو فرقة أو شخصية عامة', en: 'Artist, band, or public figure' },
  'engine.facebook.sec.pagesCategory.opt.entertain':{ ar: 'ترفيه',                   en: 'Entertainment' },
  'engine.facebook.sec.pagesCategory.opt.cause':    { ar: 'قضية أو مجتمع',            en: 'Cause or community' },

  'engine.facebook.sec.datePosted.legend':          { ar: 'تاريخ النشر',             en: 'Date posted' },
  'engine.facebook.sec.datePosted.hint':            { ar: 'اختر تاريخي البداية والنهاية. اتركه فارغاً لتجاهل المرشّح.', en: 'Pick start and end dates. Leave empty to skip this filter.' },
  'engine.facebook.sec.datePosted.from':            { ar: 'من',                     en: 'From' },
  'engine.facebook.sec.datePosted.to':              { ar: 'إلى',                    en: 'To' },

  'ui.fbForm.ariaLabel':         { ar: 'نموذج البحث في Facebook',           en: 'Facebook search form' },
  'ui.fbForm.categoryLegend':    { ar: 'نوع البحث',                          en: 'Search type' },
  'ui.fbForm.keywordLegend':     { ar: 'كلمة البحث',                         en: 'Search keyword' },
  'ui.fbForm.keywordHint':       { ar: 'حقل مطلوب من Facebook. اكتب كلمة واحدة أو عبارة (عربية أو إنجليزية).', en: 'Required by Facebook. Type a single word or phrase (Arabic or English).' },
  'ui.fbForm.explainer.title':   { ar: 'كيف تعمل أداة بحث Facebook',   en: 'How the Facebook search tool works' },
  'ui.fbForm.explainer.intro':   { ar: 'لا يستخدم Facebook عوامل بحث (مثل site: أو AND). بدلاً من ذلك يبني الرابط من فئة بحث ومجموعة مرشحات. هذه الأداة تكوّن نفس الرابط نيابة عنك.', en: 'Facebook doesn’t use search operators (no site: or AND). Instead, it builds a URL from a search category plus a set of filters. This tool assembles that URL for you.' },
  'ui.fbForm.explainer.step1':   { ar: 'اختر الفئة من الشريط أعلاه — كل فئة تكشف مرشحات مختلفة لأن Facebook نفسه يستخدم مرشحات مختلفة لكل نوع بحث.', en: 'Pick a category from the bar above — each category exposes different filters because Facebook itself surfaces different filters per search type.' },
  'ui.fbForm.explainer.step2':   { ar: 'اكتب كلمة البحث المطلوبة (عربية أو إنجليزية) في الحقل أسفله.', en: 'Type the required search keyword (Arabic or English) in the field below.' },
  'ui.fbForm.explainer.step3':   { ar: 'حدّد المرشحات لتضييق النتائج — خيار واحد من كل قسم. اتركها فارغة لأوسع نطاق.', en: 'Add filters to narrow your results — one option per section. Leave them blank for the broadest search.' },
  'ui.fbForm.explainer.step4':   { ar: 'اضغط «البحث في Facebook» لفتح الرابط، أو «نسخ» لنسخه ومشاركته.', en: 'Click “Search Facebook” to open the URL, or “Copy” to copy and share it.' },
  'ui.fbForm.explainer.dismiss': { ar: 'إخفاء',                           en: 'Dismiss' },
  'ui.fbForm.attribution':       { ar: 'مستوحى من Henk van Ess و Daniel Endresz و Dan Nemec و Tormund Gerhardsen', en: 'Inspired by Henk van Ess, Daniel Endresz, Dan Nemec, Tormund Gerhardsen' },
  'ui.fbForm.keywordPlaceholder':{ ar: 'اكتب كلمة البحث',                    en: 'Type your search keyword' },
  'ui.fbForm.noFilters':         { ar: 'لا توجد مرشحات إضافية لهذه الفئة.',  en: 'No additional filters for this category.' },
  'ui.fbForm.toggleDefault':     { ar: 'تفعيل',                              en: 'Enable' },

  // ===== UI strings (composer) =====
  'ui.composer.placeholder':    { ar: 'اكتب كلمة، ثم اضغط Enter لإضافتها', en: 'Type a term, then press Enter to add it' },
  'ui.composer.ariaLabel':      { ar: 'إضافة كلمة بحث جديدة',               en: 'Add a new search term' },
  'ui.composer.ghostLabel':     { ar: 'سيُضاف:',                            en: 'Will add:' },
  'ui.composer.opPillsLabel':   { ar: 'نوع العامل',                          en: 'Operator type' },
  'ui.composer.quoteToggleLabel':{ ar: 'اقتباس حرفي',                        en: 'Exact phrase' },
  'ui.composer.quoteToggleTitle':{
    ar: 'اقتباس حرفي — يطابق العبارة كما هي. اختصار: اكتب "العبارة" بين علامتي اقتباس.',
    en: 'Exact phrase — match the words as written. Shortcut: wrap the term in "quotes".',
  },
  'ui.composer.modifierRowLabel': { ar: 'معدِّل',                              en: 'Modifier' },
  'ui.composer.notToggleLabel': { ar: 'استبعاد',                              en: 'Exclude' },
  'ui.composer.notToggleTitle': {
    ar: 'استبعاد هذه الكلمة من النتائج. اختصار: ابدأ الكلمة بـ "−".',
    en: 'Exclude this term from the results. Shortcut: start the term with "−".',
  },
  'ui.composer.orToggleLabel':  { ar: 'بديل (أو)',                            en: 'Alternative (OR)' },
  'ui.composer.orToggleTitle':  {
    ar: 'إضافتها كبديل للكلمة السابقة. اختصار: Shift + Enter.',
    en: 'Add as an alternative to the previous term. Shortcut: Shift + Enter.',
  },
  'ui.composer.quoteHint':      {
    ar: 'يطابق العبارة بالضبط. اختصار: اكتب "كلمة" أو "عبارة" بين علامتَي اقتباس.',
    en: 'Matches the exact phrase. Shortcut: wrap a "word" or "phrase" in quotes.',
  },
  'ui.composer.pasteHint':      {
    ar: 'سيُضاف ككلمة واحدة. اضغط Enter لتأكيد، أو الصق نصاً مع علامات اقتباس للحصول على كلمات منفصلة.',
    en: 'This will commit as a single chip. Press Enter to confirm, or paste text with quote marks to get separate chips.',
  },
  'ui.composer.commitGroupLabel':{ ar: 'إضافة الكلمة',                       en: 'Add the term' },
  'ui.composer.btnAnd':         { ar: 'أضف',                                 en: 'Add' },
  'ui.composer.btnAddSpecial':  { ar: '+ بناء المعادلة',                     en: '+ Search Operators' },
  'ui.composer.btnAddSpecialAria':{ ar: 'إضافة عنصر إلى معادلة البحث',         en: 'Add a search operator' },
  'ui.composer.helpText':       {
    ar: 'اكتب كلمة واضغط Enter. ستظهر كـ«كلمة بحث» — اضغطها بعد ذلك لتعديلها.',
    en: 'Type a term and press Enter. It will become a chip you can edit by clicking it.',
  },
  'ui.composer.pasteToast':     {
    ar: (vars) => 'أُضيفت ' + vars.count + ' كلمة من اللصق — ',
    en: (vars) => 'Added ' + vars.count + ' chip' + (vars.count === 1 ? '' : 's') + ' from paste — ',
  },
  'ui.composer.pasteUndo':      { ar: 'تراجع',                              en: 'Undo' },

  // ===== UI strings (chip area) =====
  'ui.chipArea.orGroupAriaLabel':  { ar: 'مجموعة "أو"',                     en: 'OR group' },
  'ui.chipArea.orGroupLabel':      { ar: 'أيٌ مما يلي',                     en: 'Any of these' },
  'ui.chipArea.orGroupHelper':     { ar: 'تطابق أيّ كلمة من هذه الكلمات.',   en: 'Matches any of these terms.' },
  'ui.chipArea.orGroupAdd':        { ar: '+ بديل آخر',                      en: '+ Another alternative' },
  'ui.chipArea.orGroupAddTitle':   { ar: 'إضافة بديل آخر بـ "أو"',           en: 'Add another OR alternative' },
  'ui.chipArea.andSeam':           { ar: 'و',                                en: 'and' },
  'ui.chipArea.emptyHeading':      { ar: 'ابدأ من قالب جاهز:',              en: 'Start from a template:' },
  'ui.chipArea.emptyHint':         { ar: 'ستظهر كلمات بحثك هنا. اكتب كلمة في الأسفل أو اختر وصفة من الأعلى.', en: 'Your search terms will appear here. Type a term below, or pick a recipe above.' },
  'ui.chipArea.emptyAdvancedFallback':{
    ar: 'لم تُضف أي كلمات بعد. اكتب كلمة في الأسفل واضغط Enter.',
    en: 'No terms yet. Type one below and press Enter.',
  },
  'ui.chipArea.dragHint':          { ar: 'اضغط Alt+سهم لتحريك الكلمة',       en: 'Press Alt+Arrow to move the chip' },

  // OR / AND connector
  'ui.orConnector.label':          { ar: 'أو',                              en: 'OR' },
  'ui.orConnector.ariaLabel':      { ar: 'موصل: أو',                        en: 'Connector: OR' },
  'ui.orConnector.deleteAria':     { ar: 'حذف موصل «أو»',                   en: 'Delete OR connector' },
  'ui.andConnector.label':         { ar: 'و',                                en: 'AND' },
  'ui.andConnector.ariaLabel':     { ar: 'موصل: و',                          en: 'Connector: AND' },
  'ui.andConnector.deleteAria':    { ar: 'حذف موصل «و»',                    en: 'Delete AND connector' },
  'ui.boolConnector.toggleHint':   { ar: 'اضغط للتبديل بين «أو» و «و»',     en: 'Click to toggle between OR and AND' },

  // ===== UI strings (drawer) =====
  'ui.drawer.beginnerMore':        { ar: 'خيارات إضافية',                   en: 'More options' },
  'ui.drawer.advancedKeywordsHeading':{ ar: 'عوامل البحث على الكلمات',       en: 'Keyword operators' },
  'ui.drawer.advancedSocialHeading':  { ar: 'مواقع التواصل الاجتماعي',         en: 'Social media sites' },
  'ui.drawer.advancedSpecialsHeading':{ ar: 'قيود إضافية',                   en: 'Additional filters' },

  // ===== UI strings (chip popover) =====
  'ui.popover.ariaLabel':          { ar: 'تنبيه على الكلمة',                en: 'Chip warning' },
  'ui.popover.glyphAriaLabel':     {
    ar: (vars) => 'تنبيه: ' + vars.text,
    en: (vars) => 'Warning: ' + vars.text,
  },

  // ===== UI strings (chip toolbar) =====
  'ui.toolbar.ariaLabel':          { ar: 'إجراءات على الكلمات المحددة',     en: 'Actions on selected chips' },
  'ui.toolbar.count':              {
    ar: (vars) => vars.n + ' محدّدة',
    en: (vars) => vars.n + ' selected',
  },
  'ui.toolbar.opLabel':            { ar: 'غيّر العامل:',                    en: 'Change operator:' },
  'ui.toolbar.opAria':             { ar: 'تغيير العامل لكل المحدّد',         en: 'Change operator for all selected' },
  'ui.toolbar.opMixed':            { ar: '(متعدّدة)',                       en: '(mixed)' },
  'ui.toolbar.negate':             { ar: 'نفي (-)',                         en: 'Negate (-)' },
  'ui.toolbar.unnegate':           { ar: 'إلغاء النفي',                      en: 'Remove negation' },
  'ui.toolbar.delete':             { ar: 'حذف',                              en: 'Delete' },
  'ui.toolbar.clearSelection':     { ar: 'إلغاء التحديد',                    en: 'Clear selection' },

  // ===== Chip strings (keyword) =====
  'chip.keyword.deleteAria':       { ar: 'حذف الكلمة',                      en: 'Delete chip' },
  'chip.keyword.orHandleAria':     { ar: 'إضافة بديل بـ "أو"',               en: 'Add OR alternative' },
  'chip.keyword.orHandleText':     { ar: '+ أو',                            en: '+ OR' },
  'chip.keyword.notHandleText':    { ar: '− ليس',                           en: '− NOT' },
  'chip.keyword.opSelectAria':     { ar: 'اختر العامل',                      en: 'Choose operator' },
  'chip.keyword.quoteOn':          { ar: 'إلغاء الاقتباس',                   en: 'Remove exact-match' },
  'chip.keyword.quoteOff':         { ar: 'اقتباس حرفي',                      en: 'Exact phrase' },
  'chip.keyword.notOn':            { ar: 'إلغاء النفي',                      en: 'Remove negation' },
  'chip.keyword.notOff':           { ar: 'نفي (-)',                          en: 'Negate (-)' },

  'chip.keyword.validate.multiWord': {
    ar: 'كلمات متعددة بدون اقتباس — سيُربط أول جزء فقط بالعامل. فعّل الاقتباس.',
    en: 'Multiple words without quoting — only the first word binds to the operator. Enable exact-match.',
  },
  'chip.keyword.validate.multiWordFix': { ar: 'فعّل الاقتباس',                en: 'Enable exact-match' },
  'chip.keyword.validate.arabicForbidden': {
    ar: 'هذا الحقل يتوقع نصاً لاتينياً. لن يطابق محرك البحث النص العربي هنا.',
    en: 'This operator expects Latin-script text. The search engine will not match Arabic content here.',
  },
  'chip.keyword.validate.singleWordQuoted': {
    ar: 'اقتباس كلمة واحدة يُعطّل تصحيح التهجئة والمرادفات. غالباً غير ضروري.',
    en: 'Quoting a single word disables spell-correction and synonyms. Usually not needed.',
  },
  'chip.keyword.validate.singleWordQuotedFix': { ar: 'إلغاء الاقتباس',       en: 'Remove quoting' },

  // ===== Chip strings (date-range) =====
  'chip.dateRange.deleteAria':     { ar: 'حذف النطاق الزمني',                en: 'Delete date range' },
  'chip.dateRange.afterLabel':     { ar: 'بعد:',                              en: 'After:' },
  'chip.dateRange.afterAria':      { ar: 'بعد تاريخ',                         en: 'After date' },
  'chip.dateRange.beforeLabel':    { ar: 'قبل:',                              en: 'Before:' },
  'chip.dateRange.beforeAria':     { ar: 'قبل تاريخ',                         en: 'Before date' },
  'chip.dateRange.validate.inverted': {
    ar: 'النطاق الزمني مقلوب — تاريخ "بعد" أحدث من "قبل"، لن تكون هناك نتائج.',
    en: 'Date range is inverted — "After" is later than "Before"; no results will match.',
  },
  'chip.dateRange.validate.invertedFix': { ar: 'بدّل التاريخين',              en: 'Swap dates' },
  'chip.dateRange.calendar.placeholder': { ar: 'اختر تاريخاً',                  en: 'Pick a date' },
  'chip.dateRange.calendar.openAria':    { ar: 'افتح التقويم',                  en: 'Open calendar' },
  'chip.dateRange.calendar.prevAria':    { ar: 'الشهر السابق',                  en: 'Previous month' },
  'chip.dateRange.calendar.nextAria':    { ar: 'الشهر التالي',                  en: 'Next month' },
  'chip.dateRange.calendar.clearAria':   { ar: 'امسح التاريخ',                  en: 'Clear date' },
  'chip.dateRange.calendar.todayLabel':  { ar: 'اليوم',                          en: 'Today' },
  'chip.dateRange.calendar.months': {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  'chip.dateRange.calendar.weekdays': {
    ar: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },

  // ===== Chip strings (proximity) =====
  'chip.proximity.deleteAria':     { ar: 'حذف بحث القرب',                    en: 'Delete proximity search' },
  'chip.proximity.term1Placeholder':{ ar: 'الكلمة الأولى',                   en: 'First word' },
  'chip.proximity.term1Aria':      { ar: 'الكلمة الأولى',                    en: 'First word' },
  'chip.proximity.distLabel':      { ar: 'بمسافة',                           en: 'within' },
  'chip.proximity.distAria':       { ar: 'عدد الكلمات بين المصطلحين',         en: 'Number of words between the two terms' },
  'chip.proximity.distSuffix':     { ar: 'كلمات من',                         en: 'words of' },
  'chip.proximity.term2Placeholder':{ ar: 'الكلمة الثانية',                   en: 'Second word' },
  'chip.proximity.term2Aria':      { ar: 'الكلمة الثانية',                    en: 'Second word' },

  // ===== Chip strings (filter, X / Twitter) =====
  'chip.filter.deleteAria':        { ar: 'حذف التصفية',                      en: 'Delete filter' },
  'chip.filter.selectAria':        { ar: 'اختر نوع التصفية',                 en: 'Choose filter type' },
  'chip.filter.opt.none':          { ar: 'بدون تحديد',                        en: 'No filter' },
  'chip.filter.opt.media':         { ar: 'وسائط (صور أو فيديو)',              en: 'Media (photos or video)' },
  'chip.filter.opt.images':        { ar: 'صور فقط',                            en: 'Images only' },
  'chip.filter.opt.videos':        { ar: 'فيديو فقط',                          en: 'Videos only' },
  'chip.filter.opt.native_video':  { ar: 'فيديو تويتر الأصلي',                en: 'Native Twitter video' },
  'chip.filter.opt.spaces':        { ar: 'تويتر سبيسز',                       en: 'Twitter Spaces' },
  'chip.filter.opt.links':         { ar: 'يحتوي على رابط',                    en: 'Contains a link' },
  'chip.filter.opt.mentions':      { ar: 'يذكر حساباً',                       en: 'Mentions an account' },
  'chip.filter.opt.hashtags':      { ar: 'يحتوي على هاشتاج',                  en: 'Contains a hashtag' },
  'chip.filter.opt.replies':       { ar: 'ردود على تغريدات',                  en: 'Replies' },
  'chip.filter.opt.quote':         { ar: 'اقتباسات',                          en: 'Quote tweets' },
  'chip.filter.opt.nativeretweets':{ ar: 'إعادات تغريد أصلية',                en: 'Native retweets' },
  'chip.filter.opt.retweets':      { ar: 'إعادات تغريد قديمة',                 en: 'Legacy retweets' },
  'chip.filter.opt.verified':      { ar: 'حسابات موثّقة (قديمة)',              en: 'Verified accounts (legacy)' },
  'chip.filter.opt.blue_verified': { ar: 'حسابات Twitter Blue',               en: 'Twitter Blue accounts' },
  'chip.filter.opt.follows':       { ar: 'حسابات أتابعها',                    en: 'Accounts I follow' },
  'chip.filter.opt.has_engagement':{ ar: 'لديها تفاعل',                       en: 'Has engagement' },
  'chip.filter.validate.notNegatable': {
    ar: 'هذا النوع من التصفية لا يمكن نفيه. أزل النفي أو اختر نوعاً آخر.',
    en: 'This filter cannot be negated. Remove the negation or pick another filter.',
  },
  'chip.filter.validate.notNegatableFix': { ar: 'إلغاء النفي',                en: 'Remove negation' },
  'chip.filter.notOn':             { ar: 'إلغاء النفي',                       en: 'Remove negation' },
  'chip.filter.notOff':            { ar: 'نفي (-)',                            en: 'Negate (-)' },

  // ===== Chip strings (engagement, X / Twitter) =====
  'chip.engagement.deleteAria':    { ar: 'حذف حد التفاعل',                    en: 'Delete engagement threshold' },
  'chip.engagement.metricAria':    { ar: 'اختر مقياس التفاعل',                 en: 'Choose engagement metric' },
  'chip.engagement.metric.faves':  { ar: 'إعجابات',                            en: 'Likes' },
  'chip.engagement.metric.replies':{ ar: 'ردود',                                en: 'Replies' },
  'chip.engagement.metric.retweets':{ ar: 'إعادات تغريد',                      en: 'Retweets' },
  'chip.engagement.dirMin':        { ar: 'حد أدنى ≥',                          en: 'At least ≥' },
  'chip.engagement.dirMax':        { ar: 'حد أقصى ≤',                          en: 'At most ≤' },
  'chip.engagement.dirMinAria':    { ar: 'حد أدنى',                            en: 'Minimum' },
  'chip.engagement.dirMaxAria':    { ar: 'حد أقصى',                            en: 'Maximum' },
  'chip.engagement.numAria':       { ar: 'القيمة العددية',                    en: 'Numeric value' },
  'chip.engagement.validate.invalid':    { ar: 'القيمة العددية غير صالحة. أدخل رقماً صحيحاً أكبر من أو يساوي صفر.', en: 'Invalid value. Enter a non-negative integer.' },
  'chip.engagement.validate.invalidFix': { ar: 'إعادة إلى 100',                en: 'Reset to 100' },

  // ===== Chip strings (filetype) =====
  'chip.filetype.deleteAria':      { ar: 'حذف نوع الملف',                     en: 'Delete file type' },
  'chip.filetype.selectAria':      { ar: 'اختر نوع الملف',                    en: 'Choose file type' },
  'chip.filetype.opt.none':        { ar: 'بدون تحديد',                         en: 'No filter' },
  'chip.filetype.opt.txt':         { ar: 'نص (txt)',                           en: 'Text (txt)' },

  // ===== Chip strings (number-range) =====
  'chip.numberRange.deleteAria':   { ar: 'حذف النطاق الرقمي',                  en: 'Delete number range' },
  'chip.numberRange.lowPlaceholder':{ ar: 'من',                                 en: 'from' },
  'chip.numberRange.lowAria':      { ar: 'الرقم الأدنى',                       en: 'Lower bound' },
  'chip.numberRange.highPlaceholder':{ ar: 'إلى',                              en: 'to' },
  'chip.numberRange.highAria':     { ar: 'الرقم الأقصى',                       en: 'Upper bound' },
  'chip.numberRange.prefixAria':   { ar: 'البادئة',                            en: 'Prefix' },

  // ===== Tip framework =====
  'ui.tip.dismissAria':            { ar: 'إخفاء الاقتراح',                  en: 'Dismiss tip' },

  // ===== Idiom panel chrome (existing) =====
  'idiom.empty':       { ar: 'لا توجد وصفات لهذا المحرك.', en: 'No recipes for this engine.' },
  'idiom.pillTitle':   { ar: 'وصفات بحث جاهزة',           en: 'Recipe playbook' },
  'idiom.pillCount':   {
    ar: (v) => v.n + ' وصفة',
    en: (v) => v.n + ' recipe' + (v.n === 1 ? '' : 's'),
  },
  'idiom.toggleShow':  { ar: '📖 شروح',           en: '📖 Descriptions' },
  'idiom.toggleHide':  { ar: '📖 إخفاء الشروح',   en: '📖 Hide descriptions' },
  // idiom.previewHint removed — unused after the inspector redesign.

  // ===== Idiom panel — search + group filter =====
  'idiom.search.placeholder': { ar: 'ابحث في الوصفات...', en: 'Search recipes...' },
  'idiom.groupFilter.label':  { ar: 'تصفية حسب المجموعة', en: 'Filter by group' },
  'idiom.groupFilter.all':    { ar: 'الكل', en: 'All' },

  // ===== Idiom panel — inspector section headings =====
  'idiom.section.whatItDoes': { ar: 'ما تفعله الوصفة',        en: 'What this recipe does' },
  'idiom.section.anatomy':    { ar: 'بنية الوصفة',             en: 'Recipe anatomy' },
  'idiom.section.howto':      { ar: 'كيف تبنيها يدوياً',       en: 'Build it manually' },
  'idiom.section.assembled':  { ar: 'النص المُجمَّع',           en: 'Assembled query' },

  // ===== Idiom panel — inspector action buttons =====
  'idiom.applyRecipe':    { ar: 'أضِف الوصفة كاملة',     en: 'Add recipe to query' },
  'idiom.replaceRecipe':  { ar: 'استبدل البحث الحالي',   en: 'Replace current query' },
  'idiom.reapply':        { ar: 'أضِف مرة أخرى',          en: 'Apply again' },
  'idiom.applied':        { ar: 'مُطبَّقة',                en: 'Applied' },
  'idiom.addThisChip':    { ar: 'أضِف هذه الكلمة فقط',   en: 'Add only this chip' },

  // ===== Idiom panel — empty / fallback states =====
  'idiom.search.noResults': {
    ar: (v) => 'لا توجد وصفات تطابق "' + v.q + '"',
    en: (v) => 'No recipes match "' + v.q + '"',
  },
  'idiom.anatomy.unavailable': {
    ar: 'تعذّر استخراج بنية الوصفة. اضغط أضِف لتجربتها مباشرة.',
    en: "Couldn't extract this recipe's anatomy. Press Apply to try it directly.",
  },

  // ===== Idiom panel — "Build it manually" step templates =====
  //
  // Strings use [[...]] markers around control names; the renderer replaces
  // them with `.idiom-control-mention` styled spans.
  //
  // One-time convention note at the top of the "Build it manually" section.
  // Tells the user that whatever appears between «...» / "..." is what they
  // type into the keyword field — the marks themselves are not typed.
  'idiom.howto.note': {
    ar: 'ℹ︎ ما يظهر بين علامتَي «» هو ما تكتبه داخل خانة الكلمة (لا تكتب العلامتين أنفسهما).',
    en: 'ℹ︎ Whatever appears between the « » marks is what you type into the keyword field (don\'t type the marks themselves).',
  },
  // keyword chip — plain word, no operator
  'idiom.howto.keyword.plain': {
    ar: (v) => v.text
      ? 'اكتب «' + v.text + '» داخل خانة الكلمة، ثم اضغط Enter.'
      : 'اكتب كلمتك داخل خانة الكلمة بين العلامتَين «» (مثلاً: «انتخابات»)، ثم اضغط Enter.',
    en: (v) => v.text
      ? 'Type «' + v.text + '» into the keyword field, then press Enter.'
      : 'Type your keyword between the « » marks (e.g., «election»), then press Enter.',
  },
  // keyword chip — with content operator (site:, intitle:, etc.)
  'idiom.howto.keyword.withOp': {
    ar: (v) => v.text
      ? 'اكتب «' + v.text + '» داخل خانة الكلمة، اضغط [[' + v.opLabel + ']] من شريط المؤشرات، ثم Enter.'
      : 'اكتب كلمتك بين العلامتَين «» (مثلاً: «.gov» مع site: أو «صحفي» مع intitle:)، اضغط [[' + v.opLabel + ']]، ثم Enter.',
    en: (v) => v.text
      ? 'Type «' + v.text + '» into the keyword field, click [[' + v.opLabel + ']] in the operator row, then press Enter.'
      : 'Type your term between the « » marks (e.g., «.gov» with site: or «journalist» with intitle:), click [[' + v.opLabel + ']], then Enter.',
  },
  // keyword chip — quoted (literal phrase)
  'idiom.howto.keyword.quoted': {
    ar: (v) => {
      const head = v.text
        ? 'اكتب «' + v.text + '» داخل خانة الكلمة كعبارة حرفية واحدة'
        : 'اكتب عبارتك الحرفية بين العلامتَين «» (مثلاً: «جامعة الملك سعود»)';
      const op = v.opLabel ? '، اضغط [[' + v.opLabel + ']]' : '';
      return head + op + '، فعّل [[اقتباس حرفي]]، ثم اضغط Enter.';
    },
    en: (v) => {
      const head = v.text
        ? 'Type «' + v.text + '» into the keyword field as a single literal phrase'
        : 'Type your literal phrase between the « » marks (e.g., «John F Smith»)';
      const op = v.opLabel ? ', click [[' + v.opLabel + ']]' : '';
      return head + op + ', enable [[Literal quote]], then press Enter.';
    },
  },
  // keyword chip — negate (excluded word, no operator)
  'idiom.howto.keyword.negate': {
    ar: (v) => v.text
      ? 'اكتب «' + v.text + '» داخل خانة الكلمة لاستبعادها، اضغط [[− NOT]] قبل Enter (أو ابدأ بـ "-").'
      : 'اكتب الكلمة التي تريد استبعادها بين العلامتَين «» (مثلاً: «إعلان»)، اضغط [[− NOT]] قبل Enter (أو ابدأ بـ "-").',
    en: (v) => v.text
      ? 'Type «' + v.text + '» into the keyword field to exclude it, press [[− NOT]] before Enter (or start with "-").'
      : 'Type the word to exclude between the « » marks (e.g., «advertisement»), press [[− NOT]] before Enter (or start with "-").',
  },
  // keyword chip — negate + operator
  'idiom.howto.keyword.negateOp': {
    ar: (v) => v.text
      ? 'اكتب «' + v.text + '» داخل خانة الكلمة، اضغط [[' + v.opLabel + ']]، ثم [[− NOT]] قبل Enter.'
      : 'اكتب الكلمة التي تريد استبعادها بين العلامتَين «» (مثلاً: «دعاية»)، اضغط [[' + v.opLabel + ']]، ثم [[− NOT]] قبل Enter.',
    en: (v) => v.text
      ? 'Type «' + v.text + '» into the keyword field, click [[' + v.opLabel + ']], then [[− NOT]] before Enter.'
      : 'Type the word to exclude between the « » marks (e.g., «propaganda»), click [[' + v.opLabel + ']], then [[− NOT]] before Enter.',
  },
  // or-connector chip
  'idiom.howto.or': {
    ar: 'اضغط [[+أو]] على آخر كلمة، ثم اكتب البديل في خانة الكلمة الجديدة (نفس قاعدة العلامتَين «»).',
    en: 'Click [[+Or]] on the previous chip, then type the alternative in the new keyword field (same « » convention).',
  },
  // special chip — date-range
  'idiom.howto.special.dateRange': {
    ar: (v) => {
      const parts = [];
      if (v.after)  parts.push('"بعد" ' + v.after);
      if (v.before) parts.push('"قبل" ' + v.before);
      const range = parts.length ? '، أدخل ' + parts.join(' و') : '، ثم أدخل التواريخ المطلوبة';
      return 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']]' + range + '.';
    },
    en: (v) => {
      const parts = [];
      if (v.after)  parts.push('"After" ' + v.after);
      if (v.before) parts.push('"Before" ' + v.before);
      const range = parts.length ? ', enter ' + parts.join(' and ') : ', then fill in the dates';
      return 'Click [[+ Add]], pick [[' + v.itemLabel + ']]' + range + '.';
    },
  },
  // special chip — filetype
  'idiom.howto.special.filetype': {
    ar: (v) => 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']]، ثم اختر «' + v.value.toUpperCase() + '» من القائمة.',
    en: (v) => 'Click [[+ Add]], pick [[' + v.itemLabel + ']], then choose "' + v.value.toUpperCase() + '" from the list.',
  },
  // special chip — filter (X engine)
  'idiom.howto.special.filter': {
    ar: (v) => 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']]، حدّد «' + v.filterValue + '»' + (v.negate ? '، ثم فعّل [[− NOT]] لاستبعادها' : '') + '.',
    en: (v) => 'Click [[+ Add]], pick [[' + v.itemLabel + ']], select "' + v.filterValue + '"' + (v.negate ? ', then enable [[− NOT]] to exclude it' : '') + '.',
  },
  // special chip — engagement (X engine)
  'idiom.howto.special.engagement': {
    ar: (v) => 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']]، اختر «' + v.metric + '» (' + (v.direction === 'min' ? 'حد أدنى' : 'حد أقصى') + ') وأدخل ' + v.value + '.',
    en: (v) => 'Click [[+ Add]], pick [[' + v.itemLabel + ']], choose "' + v.metric + '" (' + v.direction + ') and enter ' + v.value + '.',
  },
  // special chip — proximity
  'idiom.howto.special.proximity': {
    ar: (v) => {
      const t1 = v.term1 ? '«' + v.term1 + '»' : 'الكلمة الأولى بين «» (مثلاً: «انفجار»)';
      const t2 = v.term2 ? '«' + v.term2 + '»' : 'الكلمة الثانية بين «» (مثلاً: «بيروت»)';
      return 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']]، أدخل ' + t1 + ' و' + t2 + ' بمسافة ' + v.distance + '.';
    },
    en: (v) => {
      const t1 = v.term1 ? '«' + v.term1 + '»' : 'first term between « » (e.g., «explosion»)';
      const t2 = v.term2 ? '«' + v.term2 + '»' : 'second term between « » (e.g., «Beirut»)';
      return 'Click [[+ Add]], pick [[' + v.itemLabel + ']], enter ' + t1 + ' and ' + t2 + ' with distance ' + v.distance + '.';
    },
  },
  // special chip — number-range
  'idiom.howto.special.numberRange': {
    ar: (v) => 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']]، أدخل الحد الأدنى ' + v.low + ' والأقصى ' + v.high + (v.prefix ? ' بالبادئة "' + v.prefix + '"' : '') + '.',
    en: (v) => 'Click [[+ Add]], pick [[' + v.itemLabel + ']], enter min ' + v.low + ' and max ' + v.high + (v.prefix ? ' with prefix "' + v.prefix + '"' : '') + '.',
  },
  // special chip — generic fallback
  'idiom.howto.special.generic': {
    ar: (v) => 'اضغط [[+ إضافة]]، اختر [[' + v.itemLabel + ']] واضبط الحقول.',
    en: (v) => 'Click [[+ Add]], pick [[' + v.itemLabel + ']] and fill the fields.',
  },

  // ===== Warnings =====
  'warning.queryTooLong':          {
    ar: (v) => '⚠️ الاستعلام طويل (' + v.count + ' كلمة). Google قد يُعيد نتائج قليلة أو لا شيء عند تجاوز نحو 32 كلمة. حاول تبسيط البحث.',
    en: (v) => '⚠️ Query is long (' + v.count + ' words). Google often returns few or no results past about 32 words. Try simplifying.',
  },
  'warning.overRestricted':        {
    ar: (v) => '⚠️ فعّلت ' + v.count + ' قيود بحث في نفس الوقت. الاستعلامات المقيدة جداً غالباً لا تُعيد نتائج. ابدأ بقيود أقل وأضف المزيد إذا كانت النتائج واسعة.',
    en: (v) => '⚠️ ' + v.count + ' restrictions are active at once. Heavily restricted queries often return zero results. Start with fewer and add more if results are too broad.',
  },
  'warning.operatorArabicChars':   {
    ar: (v) => '⚠️ تحتوي حقول (' + v.labels + ') على أحرف عربية. هذه الحقول تتوقع نصاً لاتينياً، ولن يتطابق محرك البحث مع النص العربي فيها.',
    en: (v) => '⚠️ Field(s) ' + v.labels + ' contain Arabic characters. These operators expect Latin-script text and will not match Arabic content.',
  },

  // ===== Tips =====
  'tip.filetypePdf':               {
    ar: '💡 تلميح: ابحث عن PDF مع قيد موقع لاكتشاف وثائق محصورة. مثلاً، إضافة <code>site:.gov</code> أو <code>site:.edu</code> غالباً تكشف وثائق رسمية أو أكاديمية.',
    en: '💡 Tip: combine PDF with a site restriction to surface restricted documents. Adding <code>site:.gov</code> or <code>site:.edu</code> often reveals official or academic files.',
  },
  'tip.keywordNameVariants':       {
    ar: '💡 تلميح: الأسماء العربية لها كثير من التهجئات المختلفة (أ، إ، آ). يمكنك تفعيل «توحيد الأحرف العربية» في الأعلى ليشمل البحث هذه الاختلافات تلقائياً.',
    en: '💡 Tip: Arabic names have many spelling variants (أ, إ, آ). Enable "Arabic normalization" at the top to broaden the search across them automatically.',
  },
  'tip.proximityUsage':            {
    ar: '💡 تلميح: بحث القرب من أقوى أدوات OSINT لإيجاد شخصين أو كيانين يُذكران معاً. المسافات الصغيرة (3–5) تجد الذكر المباشر، بينما المسافات الأكبر (10–20) تجد أي علاقة سياقية.',
    en: '💡 Tip: proximity search is one of the strongest OSINT tools for finding two entities mentioned together. Small distances (3–5) find direct mentions; larger ones (10–20) find any contextual relationship.',
  },
  'tip.dateRangeBoth':             {
    ar: '💡 النطاقات الزمنية الضيقة مع قيود الموقع فعّالة جداً للعثور على تغطية أحداث بعينها. جرّب دمج هذا النطاق مع حقل «في عنوان الصفحة» (intitle:) للعثور على مقالات تتعلق بحدث محدد.',
    en: '💡 Narrow date ranges combined with site restrictions are very effective for event coverage. Try combining this range with an <code>intitle:</code> chip to find articles about a specific event.',
  },
  'tip.keywordsNoRestrictions':    {
    ar: '💡 تلميح: الكلمات الرئيسية وحدها قد تُعيد نتائج كثيرة جداً. فكّر في إضافة قيد للموقع أو نطاق زمني (زرّ «بناء المعادلة») لتضييق النتائج.',
    en: '💡 Tip: plain keywords alone often return too many results. Consider adding a site restriction or date range (the "+ Search Operators" button) to narrow them.',
  },
};

/**
 * Resolve a key to its localized string.
 * @param {string} key
 * @param {object} [vars] - interpolation variables for function-valued entries
 * @returns {string}
 */
export function t(key, vars) {
  const entry = MESSAGES[key];
  if (!entry) return key;
  const lang = getActiveLang() || 'ar';
  const value = entry[lang] != null ? entry[lang] : entry.ar;
  if (typeof value === 'function') return value(vars || {});
  return value;
}
