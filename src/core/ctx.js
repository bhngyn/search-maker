// `ctx` is the integration seam between the bootstrap and every field,
// warning, tip, and (later) chip module. The shape is preserved exactly
// from the original CONTRACT.md so existing register* functions work
// unchanged after extraction.

/**
 * @typedef {object} Ctx
 * @property {(order: number, fn: () => string) => void} registerSegment
 * @property {(slug: string, api: { setValue: (v: any) => void }) => void} registerField
 * @property {(slug: string, value: any) => void} setField
 * @property {() => void} requestUpdate
 * @property {(slug: string, html: string) => void} addWarning
 * @property {(slug: string) => void} removeWarning
 * @property {(slug: string, opts: { priority: number, messageHtml: string }) => void} addTip
 * @property {(slug: string) => void} removeTip
 * @property {(text: string) => string} normalize
 * @property {() => 'beginner' | 'advanced'} getMode
 * @property {(cb: (mode: string) => void) => void} onModeChange
 */

/**
 * @param {object} args
 * @param {Array<{ order: number, fn: () => string }>} args.segments
 * @param {Map<string, { setValue: (v: any) => void }>} args.fieldRegistry
 * @param {(text: string) => string} args.normalize
 * @param {() => void} args.requestUpdate
 * @param {{ render: (slug: string, html: string) => void, clear: (slug: string) => void }} args.warnings
 * @param {{ add: (slug: string, opts: any) => void, remove: (slug: string) => void }} args.tips
 * @param {{ get: () => 'beginner' | 'advanced', on: (cb: (mode: string) => void) => void }} args.mode
 * @returns {Ctx}
 */
export function createCtx({ segments, fieldRegistry, normalize, requestUpdate, warnings, tips, mode }) {
  function setField(slug, value) {
    const api = fieldRegistry.get(slug);
    if (api && typeof api.setValue === 'function') {
      try { api.setValue(value); } catch (e) { console.warn('setField failed', slug, e); }
    }
  }

  return {
    registerSegment(order, fn) { segments.push({ order, fn }); },
    registerField(slug, api) { fieldRegistry.set(slug, api); },
    setField,
    requestUpdate,
    addWarning(slug, html) { warnings.render(slug, html); },
    removeWarning(slug) { warnings.clear(slug); },
    addTip(slug, opts) { tips.add(slug, opts); },
    removeTip(slug) { tips.remove(slug); },
    normalize,
    getMode: mode.get,
    onModeChange: mode.on,
  };
}
