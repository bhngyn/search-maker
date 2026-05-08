// Single source of truth for the 14 form-based fields. Adding a new field
// means writing one new file in this directory and adding one import line
// here. Order matters — the bootstrap calls register() in this order, which
// determines the order of `ctx.registerSegment(...)` calls when fields share
// segment ordering decisions.
//
// Note: each field still picks its own segment number via ctx.registerSegment(N, ...);
// this array is the *registration* order, not the *segment* order.

import * as keywords from './keywords.js';
import * as exactPhrase from './exact-phrase.js';
import * as excluded from './excluded.js';
import * as site from './site.js';
import * as intitle from './intitle.js';
import * as inurl from './inurl.js';
import * as intext from './intext.js';
import * as inanchor from './inanchor.js';
import * as filetype from './filetype.js';
import * as dateRange from './date-range.js';
import * as proximity from './proximity.js';
import * as wildcard from './wildcard.js';
import * as numberRange from './number-range.js';
import * as orGroups from './or-groups.js';

export const fields = [
  keywords,
  exactPhrase,
  excluded,
  site,
  intitle,
  inurl,
  intext,
  inanchor,
  filetype,
  dateRange,
  proximity,
  wildcard,
  numberRange,
  orGroups,
];
