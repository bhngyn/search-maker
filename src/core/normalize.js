// Arabic normalization. Returns the input unchanged unless the toggle is on.
//
// Substitutions, in order:
//   1. Strip Arabic diacritics (tashkeel) plus tatweel and superscript alef.
//   2. Unify alef variants (أ إ آ ٱ → ا).
//   3. Unify ya variants (ى → ي).
//   4. Convert ta marbuta to ha (ة → ه) — most aggressive; opt-in.
//
// Apply only to Arabic-content fields. Site, inurl, filetype, dates, and
// number ranges must pass through untouched (the caller chooses).

/**
 * @param {() => boolean} getEnabled - returns true when the normalize toggle is checked
 * @returns {(text: string) => string}
 */
export function createNormalizer(getEnabled) {
  return function normalize(text) {
    if (!getEnabled() || !text) return text;
    let s = String(text);
    s = s.replace(/[ً-ْٰـ]/g, '');
    s = s.replace(/[أإآٱ]/g, 'ا');
    s = s.replace(/ى/g, 'ي');
    s = s.replace(/ة/g, 'ه');
    return s;
  };
}
