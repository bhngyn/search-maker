// All cross-chip warnings. Each module exports register(ctx, deps) where
// deps = { previewBox, chipState }. Modules return { onRender } if they
// recompute on every preview pass; the bootstrap pushes that callback into
// postRenderHooks.

import * as intitleMultiword from './intitle-multiword.js';
import * as queryTooLong from './query-too-long.js';
import * as overRestricted from './over-restricted.js';
import * as dateRangeReversed from './date-range-reversed.js';
import * as operatorArabicChars from './operator-arabic-chars.js';
import * as singleWordQuote from './single-word-quote.js';

export const warnings = [
  intitleMultiword,
  queryTooLong,
  overRestricted,
  dateRangeReversed,
  operatorArabicChars,
  singleWordQuote,
];
