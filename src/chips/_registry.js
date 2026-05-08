// Single source of truth for chip types. Adding a new chip type means
// writing one new file in this directory and adding it to the map below.
//
// The keys here are chip.type values. Each module must export:
//   - type: string (matches the key)
//   - label: string (Arabic display name for menus / drawer)
//   - defaultProps(): object
//   - assemble(chip, ctx): string
//   - render(chip, handlers): HTMLElement

import * as keyword from './keyword.js';
import * as orConnector from './or-connector.js';

export const chipTypes = {
  keyword,
  'or-connector': orConnector,
};

/**
 * Term-chip types — those that can carry user content and stand alone.
 * Used by the composer's `+ إضافة` menu (Phase 5+) and by chip-state's
 * cleanup logic for OR connectors.
 */
export const termChipTypes = ['keyword'];
