#!/usr/bin/env node
/*
 * Fragment validator. Runs against a single fragment JSON (from stdin or argv[2])
 * and exits 0 if valid, 1 with messages if not.
 *
 * Usage:
 *   node validate.js < fragment.json
 *   node validate.js fragment.json
 *
 * This is a development-only tool; it is not shipped to end users.
 * It enforces the rules in CONTRACT.md via cheap regex checks. Conservative,
 * not a parser. Tweak fragments to be unambiguously valid if false-positive.
 */
'use strict';

const fs = require('fs');

function read() {
  if (process.argv[2] && process.argv[2] !== '-') {
    return fs.readFileSync(process.argv[2], 'utf8');
  }
  return fs.readFileSync(0, 'utf8');
}

function fail(msg) {
  process.stderr.write('FRAGMENT INVALID: ' + msg + '\n');
}

function pascal(slug) {
  return slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function validate(frag) {
  const errors = [];

  for (const k of ['markup', 'styles', 'script']) {
    if (typeof frag[k] !== 'string') errors.push(`missing string field: ${k}`);
  }
  if (errors.length) return errors;

  // ---- Script: exactly one top-level function declaration of the right shape.
  const fnDecl = frag.script.match(/^\s*function\s+(register(?:Field|Warning|Tip)([A-Z]\w*))\s*\(\s*ctx\s*\)\s*\{/m);
  if (!fnDecl) {
    errors.push('script must start with a top-level `function register(Field|Warning|Tip)<PascalSlug>(ctx) { ... }`');
  }
  // Strip the function body so we can check what (if anything) is at top level.
  // Naive brace counting; ignores braces inside strings/regex but acceptable for our use.
  const stripped = (() => {
    const s = frag.script;
    const startMatch = s.match(/^\s*function\s+\w+\s*\([^)]*\)\s*\{/m);
    if (!startMatch) return s;
    let i = startMatch.index + startMatch[0].length;
    let depth = 1;
    while (i < s.length && depth > 0) {
      const ch = s[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
    return s.slice(0, startMatch.index) + s.slice(i);
  })();
  if (/(^|\n)\s*(var|let|const|class)\s+\w/.test(stripped)) {
    errors.push('no top-level var/let/const/class declarations allowed in script');
  }
  if ((stripped.match(/(^|\n)\s*function\s+\w+\s*\(/g) || []).length > 0) {
    errors.push('script must declare exactly one top-level function');
  }
  if (stripped.replace(/\s|\/\/.*$|\/\*[\s\S]*?\*\//gm, '').length > 0) {
    errors.push('no top-level statements outside the register function (only the function declaration is allowed)');
  }
  // No DOMContentLoaded.
  if (/addEventListener\s*\(\s*['"]DOMContentLoaded['"]/.test(frag.script)) {
    errors.push('do not register DOMContentLoaded — bootstrap runs after DOM ready');
  }
  // No window.* writes.
  if (/\bwindow\s*\.\s*\w+\s*=/.test(frag.script)) {
    errors.push('no writes to window.* allowed');
  }
  // No __pendingRegisters touches (merge step adds those).
  if (/__pendingRegisters/.test(frag.script)) {
    errors.push('do not reference __pendingRegisters — the orchestrator appends the push line');
  }

  // ---- Styles: every selector must be scoped under .field-/.warning-/.tip-.
  const cssRules = frag.styles.split('}').map(r => r.split('{')[0]).filter(s => s.trim());
  for (const rawSel of cssRules) {
    // Skip @media/@supports/@keyframes preludes — they don't have a selector at the top level.
    const sel = rawSel.trim();
    if (!sel || sel.startsWith('@')) continue;
    // Some rules can have multiple comma-separated selectors. Each must be scoped.
    const parts = sel.split(',').map(p => p.trim()).filter(Boolean);
    for (const p of parts) {
      // Strip combinators and pseudo to inspect the leading token.
      const leading = p.split(/[\s>+~]/)[0];
      if (/^(\*|html|body|:root)\b/.test(leading)) {
        errors.push(`disallowed top-level selector: \`${p}\``);
        continue;
      }
      // Must START with .field-, .warning-, or .tip-.
      if (!/^\.(field|warning|tip)-[a-z][\w-]*/.test(leading)) {
        errors.push(`selector must start with \`.field-<slug>\`, \`.warning-<slug>\`, or \`.tip-<slug>\`: \`${p}\``);
      }
    }
  }

  // ---- Markup sanity: outer wrapper class matches a known prefix.
  if (!/class\s*=\s*"[^"]*\b(field|warning|tip)\b[^"]*\b(field|warning|tip)-[a-z][\w-]*/.test(frag.markup)) {
    errors.push('markup must start with `<div class="(field|warning|tip) (field|warning|tip)-<slug>">`');
  }

  return errors;
}

const raw = read();
let frag;
try { frag = JSON.parse(raw); }
catch (e) { fail('invalid JSON: ' + e.message); process.exit(1); }

const errs = validate(frag);
if (errs.length) {
  errs.forEach(fail);
  process.exit(1);
}
process.stdout.write('OK\n');
