// Facebook search engine descriptor.
//
// Facebook search is fundamentally form-based, not query-string-based:
//   - The user picks a category (top, posts, people, photos, videos, pages).
//   - A required free-text keyword is sent as `q=`.
//   - Optional filters are encoded as a base64'd JSON blob in `filters=`.
//
// Each filter group is mutually exclusive (you can only pick one option from
// "Posts From", one from "Posted In Group", etc.), but groups can be combined
// across the URL. This is a different mental model from chip-based query
// builders, so the Facebook engine ships its own form UI rather than reusing
// the chip composer.
//
// Filter encoding: every filter value is itself a JSON string of
//   { name: "<filter_name>", args: "<filter_args>" }
// For the date filter, `args` is itself a JSON string. The outer object is
// then JSON-stringified, base64-encoded, and trailing `=` is stripped.
//
// Source: whopostedwhat.com filter reference. Operator definitions verbatim.

const CATEGORIES = [
  { value: 'top',    label: 'الأعلى',     hint: 'البحث الموحَّد (الأكثر صلة)' },
  { value: 'posts',  label: 'المنشورات',  hint: 'منشورات نصية فقط' },
  { value: 'people', label: 'الأشخاص',     hint: 'بحث عن أشخاص حسب المدينة أو التعليم أو العمل' },
  { value: 'photos', label: 'الصور',       hint: 'منشورات تحتوي صوراً' },
  { value: 'videos', label: 'الفيديو',     hint: 'منشورات تحتوي فيديو' },
  { value: 'pages',  label: 'الصفحات',     hint: 'بحث عن صفحات Facebook' },
];

// Each section is a mutually-exclusive group of options. Picking an option
// produces one entry in the outer JSON filter blob.
//
// Option shape:
//   { id, label, hint?, outerKey, name, args, idField? }
// where:
//   outerKey  — top-level key in the outer filter JSON (e.g. 'rp_author')
//   name      — value of the inner JSON's `name` field (e.g. 'author_me')
//   args      — value of the inner JSON's `args` field (literal '' for most)
//   idField   — when present, args is taken from a free-text input on the
//               option (e.g. page ID, group ID, location ID, user ID)

const POSTS_FROM = {
  id: 'postsFrom',
  legend: 'كاتب المنشور',
  options: [
    { id: 'none',         label: 'بدون تحديد' },
    { id: 'author_me',    label: 'منشوراتي',                  outerKey: 'rp_author', name: 'author_me' },
    { id: 'author_friends', label: 'منشورات أصدقائي',         outerKey: 'rp_author', name: 'author_friends_feed' },
    { id: 'author_groups',  label: 'منشورات مجموعاتي وصفحاتي', outerKey: 'rp_author', name: 'my_groups_and_pages_posts' },
    { id: 'author_public',  label: 'منشورات عامة',            outerKey: 'rp_author', name: 'merged_public_posts' },
    { id: 'author_page',    label: 'منشورات من صفحة',         outerKey: 'rp_author', name: 'author', idField: { placeholder: 'معرّف الصفحة (أرقام)', hint: 'مثال: 119375054750638', dir: 'ltr' } },
  ],
};

const POST_TYPE = {
  id: 'postType',
  legend: 'نوع المنشور',
  options: [
    { id: 'none',           label: 'بدون تحديد' },
    { id: 'interacted',     label: 'منشورات شاهدتُها', outerKey: 'interacted_posts', name: 'interacted_posts' },
  ],
};

const POSTED_IN_GROUP = {
  id: 'postedInGroup',
  legend: 'ضمن مجموعة',
  options: [
    { id: 'none',          label: 'بدون تحديد' },
    { id: 'my_groups',     label: 'مجموعاتي',         outerKey: 'rp_group', name: 'my_groups_posts' },
    { id: 'group',         label: 'مجموعة محددة',      outerKey: 'rp_group', name: 'group_posts', idField: { placeholder: 'معرّف المجموعة (أرقام)', hint: 'مثال: 574981909329531', dir: 'ltr' } },
  ],
};

const TAGGED_LOCATION = {
  id: 'taggedLocation',
  legend: 'في موقع',
  options: [
    { id: 'none',     label: 'بدون تحديد' },
    { id: 'location', label: 'موقع محدد', outerKey: 'rp_location', name: 'location', idField: { placeholder: 'معرّف الموقع (أرقام)', hint: 'مثال: 115028691842393', dir: 'ltr' } },
  ],
};

const SORT_BY = {
  id: 'sortBy',
  legend: 'الترتيب',
  options: [
    { id: 'none',   label: 'الأكثر صلة (افتراضي)' },
    { id: 'recent', label: 'الأحدث',                 outerKey: 'rp_chrono_sort', name: 'chronosort' },
  ],
};

const PHOTO_TYPE = {
  id: 'photoType',
  legend: 'نوع الصور',
  options: [
    { id: 'none',       label: 'بدون تحديد' },
    { id: 'interacted', label: 'صور شاهدتُها', outerKey: 'interacted_photos', name: 'interacted_photos' },
  ],
};

const VIDEO_SOURCE = {
  id: 'videoSource',
  legend: 'مصدر الفيديو',
  options: [
    { id: 'none',     label: 'بدون تحديد' },
    { id: 'live',     label: 'بث مباشر',                outerKey: 'videos_source', name: 'videos_live' },
    { id: 'episode',  label: 'حلقات',                    outerKey: 'videos_source', name: 'videos_episode' },
    { id: 'feed',     label: 'من الأصدقاء والمجموعات',   outerKey: 'videos_source', name: 'videos_feed' },
  ],
};

// People-search filter sections. Each option emits a single outer-JSON entry.
// City/Education/Work each take a single ID input (no enum options).
const PEOPLE_CITY = {
  id: 'peopleCity',
  legend: 'المدينة',
  kind: 'idOnly',
  outerKey: 'city',
  name: 'users_location',
  idField: { placeholder: 'معرّف المدينة (أرقام)', hint: 'مثال: 115028691842393', dir: 'ltr' },
};
const PEOPLE_EDUCATION = {
  id: 'peopleEducation',
  legend: 'التعليم',
  kind: 'idOnly',
  outerKey: 'school',
  name: 'users_school',
  idField: { placeholder: 'معرّف المؤسسة التعليمية', hint: 'مثال: 751335894893898', dir: 'ltr' },
};
const PEOPLE_WORK = {
  id: 'peopleWork',
  legend: 'العمل',
  kind: 'idOnly',
  outerKey: 'employer',
  name: 'users_employer',
  idField: { placeholder: 'معرّف جهة العمل', hint: 'مثال: 20531316728', dir: 'ltr' },
};
const PEOPLE_MUTUAL = {
  id: 'peopleMutual',
  legend: 'أصدقاء مشتركون',
  options: [
    { id: 'none',          label: 'بدون تحديد' },
    { id: 'my_friends',    label: 'أصدقائي',                  outerKey: 'friends', name: 'users_friends' },
    { id: 'friends_of_friends', label: 'أصدقاء أصدقائي',       outerKey: 'friends', name: 'users_friends_of_friends' },
    { id: 'friends_of',    label: 'أصدقاء شخص محدد',          outerKey: 'friends', name: 'users_friends_of_people', idField: { placeholder: 'معرّف الشخص (أرقام)', hint: 'مثال: 100000154813605', dir: 'ltr' } },
  ],
};

// Pages-search filter sections.
const PAGES_VERIFIED = {
  id: 'pagesVerified',
  legend: 'الحساب الموثّق',
  kind: 'toggle',
  outerKey: 'verified',
  name: 'pages_verified',
  toggleLabel: 'صفحات موثَّقة فقط',
};

const PAGES_CATEGORY = {
  id: 'pagesCategory',
  legend: 'فئة الصفحة',
  options: [
    { id: 'none',       label: 'بدون تحديد' },
    { id: 'local',      label: 'محل أو مكان محلي',                 outerKey: 'category', name: 'pages_category', argsValue: '1006' },
    { id: 'company',    label: 'شركة أو منظمة أو مؤسسة',           outerKey: 'category', name: 'pages_category', argsValue: '1013' },
    { id: 'brand',      label: 'علامة تجارية أو منتج',              outerKey: 'category', name: 'pages_category', argsValue: '1009' },
    { id: 'artist',     label: 'فنان أو فرقة أو شخصية عامة',         outerKey: 'category', name: 'pages_category', argsValue: '1007,180164648685982' },
    { id: 'entertain',  label: 'ترفيه',                              outerKey: 'category', name: 'pages_category', argsValue: '1019' },
    { id: 'cause',      label: 'قضية أو مجتمع',                       outerKey: 'category', name: 'pages_category', argsValue: '2612' },
  ],
};

// Date-Posted is shared. It's a special section (not a radio group) — a
// year picker with an optional "advanced" range mode (start_day/end_day).
const DATE_POSTED = {
  id: 'datePosted',
  legend: 'تاريخ النشر',
  kind: 'date',
  outerKey: 'rp_creation_time',
  name: 'creation_time',
};

// Per-category section composition. The form renders sections in this order
// when the matching category is selected.
const CATEGORY_SECTIONS = {
  top:    [SORT_BY, POSTS_FROM, POST_TYPE, POSTED_IN_GROUP, TAGGED_LOCATION, DATE_POSTED],
  posts:  [POSTS_FROM, POST_TYPE, POSTED_IN_GROUP, TAGGED_LOCATION, DATE_POSTED],
  people: [PEOPLE_CITY, PEOPLE_EDUCATION, PEOPLE_WORK, PEOPLE_MUTUAL],
  photos: [POSTS_FROM, PHOTO_TYPE, TAGGED_LOCATION, DATE_POSTED],
  videos: [VIDEO_SOURCE, TAGGED_LOCATION, DATE_POSTED],
  pages:  [PAGES_VERIFIED, PAGES_CATEGORY],
};

/**
 * Build a Facebook search URL from a form-state snapshot.
 *
 * State shape (managed by ui/facebook-form.js):
 *   {
 *     category: 'top' | 'posts' | 'people' | 'photos' | 'videos' | 'pages',
 *     keyword:  string,
 *     // For radio sections: { sectionId: { optionId, idValue? } }
 *     sections: { [sectionId]: { optionId: string, idValue?: string } },
 *     // For toggle sections (pagesVerified): { sectionId: boolean }
 *     toggles:  { [sectionId]: boolean },
 *     // For idOnly sections (peopleCity etc.): { sectionId: string }
 *     ids:      { [sectionId]: string },
 *     // Date section state: { startYear, startMonth, startDay, endYear, endMonth, endDay } or null
 *     date:     null | { ... },
 *   }
 */
function buildFacebookUrl(state) {
  const category = state.category || 'top';
  const keyword  = (state.keyword || '').trim();
  // Facebook requires q=… even when empty; whopostedwhat sends "people" as
  // a placeholder. We send the literal user keyword, leaving empty if blank.
  const filterPairs = collectFilterPairs(state);
  const filtersStr = encodeFilters(filterPairs);
  const qParam = 'q=' + encodeURIComponent(keyword);
  const filtersParam = filtersStr ? '&epa=FILTERS&filters=' + filtersStr : '';
  return `https://www.facebook.com/search/${category}/?${qParam}${filtersParam}`;
}

function collectFilterPairs(state) {
  const pairs = []; // [outerKey, innerJsonString]
  const sections = CATEGORY_SECTIONS[state.category] || [];
  for (const section of sections) {
    if (section.kind === 'date') {
      const inner = encodeDateFilter(state.date);
      if (inner) pairs.push([section.outerKey, JSON.stringify({ name: section.name, args: inner })]);
      continue;
    }
    if (section.kind === 'toggle') {
      if (state.toggles && state.toggles[section.id]) {
        pairs.push([section.outerKey, JSON.stringify({ name: section.name, args: '' })]);
      }
      continue;
    }
    if (section.kind === 'idOnly') {
      const v = (state.ids && state.ids[section.id]) || '';
      if (v.trim()) pairs.push([section.outerKey, JSON.stringify({ name: section.name, args: v.trim() })]);
      continue;
    }
    // Radio section.
    const sel = state.sections && state.sections[section.id];
    if (!sel || !sel.optionId || sel.optionId === 'none') continue;
    const opt = section.options.find(o => o.id === sel.optionId);
    if (!opt || !opt.outerKey) continue;
    let args = '';
    if (typeof opt.argsValue === 'string') args = opt.argsValue;
    else if (opt.idField) args = (sel.idValue || '').trim();
    pairs.push([opt.outerKey, JSON.stringify({ name: opt.name, args })]);
  }
  return pairs;
}

function encodeDateFilter(date) {
  if (!date) return '';
  const ds = date.startDay, de = date.endDay;
  if (!ds && !de) {
    // Year-only fallback: if startYear+endYear set, fill out months/days
    if (!date.startYear && !date.endYear) return '';
  }
  // Build the inner-inner object. Facebook expects month strings like
  // "2019-1" (not zero-padded) and day strings like "2019-1-1".
  const out = {};
  if (date.startYear)  out.start_year  = String(date.startYear);
  if (date.startMonth) out.start_month = date.startMonth;
  if (date.endYear)    out.end_year    = String(date.endYear);
  if (date.endMonth)   out.end_month   = date.endMonth;
  if (date.startDay)   out.start_day   = date.startDay;
  if (date.endDay)     out.end_day     = date.endDay;
  if (Object.keys(out).length === 0) return '';
  return JSON.stringify(out);
}

function encodeFilters(pairs) {
  if (!pairs.length) return '';
  const obj = {};
  for (const [k, v] of pairs) obj[k] = v;
  const json = JSON.stringify(obj);
  // UTF-8 safe base64 — btoa() is Latin-1 only.
  let b64;
  try {
    b64 = btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    b64 = btoa(json);
  }
  // Strip trailing `=` per whopostedwhat — Facebook accepts this form.
  return b64.replace(/=+$/, '');
}

export default {
  id: 'facebook',
  label: 'Facebook',
  formBased: true,
  labels: {
    subtitle: 'ابنِ روابط بحث متقدم في Facebook، مع تحديد الفئة والمرشحات بصيغة نموذج. الأداة تُولّد رابط البحث الذي تستخدمه أداة WhoPostedWhat.',
    searchBtnLabel: 'البحث في Facebook',
    emptyPreview: 'اكتب كلمة البحث أو اختر مرشحاً لبناء رابط Facebook.',
  },
  // Identity passthrough — the form already produces the full URL, so the
  // preview's `q` is the URL. The search button opens `q` as-is.
  searchUrl: q => q,
  categories: CATEGORIES,
  categorySections: CATEGORY_SECTIONS,
  buildUrl: buildFacebookUrl,
  // Stub fields for the chip system. These are never read while Facebook is
  // active because main.js hides the chip surface, but the engine controller
  // / chip modules import from this descriptor at boot, so the keys must
  // exist with safe defaults.
  keywordOperators: { none: { label: 'كلمة', opName: '', dir: 'rtl', normalizes: false, quotable: false, acceptsArabic: true } },
  keywordOperatorOrder: ['none'],
  composerPills: [{ op: 'none', label: 'كلمة' }],
  drawer: { items: {}, beginnerOrder: [], beginnerMore: [], advancedKeywords: [], advancedSpecials: [] },
  templates: [],
  dateRangeOps: { after: 'after', before: 'before' },
  addableChipTypes: new Set(['keyword']),
  arabicForbiddenOps: new Set(),
  multiWordOps: new Set(),
  parser: { keywordOperators: new Set(), prefixOperators: {} },
};
