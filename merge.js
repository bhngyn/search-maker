#!/usr/bin/env node
/*
 * Merge fragment JSON files into index.html.
 *
 * Usage: node merge.js <fragment.json> [<fragment.json> ...]
 *
 * Fragments are merged in argument order. Each contributes:
 *   - styles -> appended to the STYLES_INSERT block
 *   - markup -> appended to the FIELDS_INSERT block
 *   - script -> appended to SCRIPT_INSERT block, followed by an auto-generated
 *               `__pendingRegisters.push(<funcName>);` line
 *
 * Re-runnable: this script never writes a fragment twice. Each fragment carries
 * a unique top-level function name (e.g. registerFieldKeywords); if that name
 * is already present in index.html's script block, the fragment is skipped.
 *
 * Development-only. Not shipped to end users.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, 'index.html');
const STYLES_MARKER = '/* === STYLES_INSERT === */';
const FIELDS_MARKER = '<!-- === FIELDS_INSERT === -->';
const SCRIPT_MARKER = '/* === SCRIPT_INSERT === */';

function loadHtml() {
  return fs.readFileSync(HTML, 'utf8');
}

function findFnName(script) {
  const m = script.match(/^\s*function\s+(register(?:Field|Warning|Tip)\w+)\s*\(\s*ctx\s*\)/m);
  return m ? m[1] : null;
}

function injectBefore(html, marker, payload) {
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('marker not found: ' + marker);
  return html.slice(0, idx) + payload + html.slice(idx);
}

function alreadyMerged(html, fnName) {
  if (!fnName) return false;
  const re = new RegExp('function\\s+' + fnName + '\\s*\\(', 'g');
  return re.test(html);
}

function main() {
  const fragPaths = process.argv.slice(2);
  if (!fragPaths.length) {
    console.error('Usage: node merge.js <fragment.json> [...]');
    process.exit(2);
  }

  let html = loadHtml();
  let changed = 0;
  for (const fp of fragPaths) {
    const raw = fs.readFileSync(fp, 'utf8');
    let frag;
    try { frag = JSON.parse(raw); }
    catch (e) { console.error(`bad JSON in ${fp}: ${e.message}`); process.exit(1); }
    const fnName = findFnName(frag.script);
    if (!fnName) { console.error(`no register* function in ${fp}`); process.exit(1); }
    if (alreadyMerged(html, fnName)) {
      console.log(`skip (already merged): ${fnName}`);
      continue;
    }
    html = injectBefore(html, STYLES_MARKER, frag.styles + '\n\n  ');
    html = injectBefore(html, FIELDS_MARKER, frag.markup + '\n      ');
    const scriptPayload = frag.script + '\n  __pendingRegisters.push(' + fnName + ');\n\n  ';
    html = injectBefore(html, SCRIPT_MARKER, scriptPayload);
    console.log(`merged: ${fnName} (from ${path.basename(fp)})`);
    changed++;
  }
  if (changed > 0) {
    fs.writeFileSync(HTML, html);
    console.log(`wrote ${changed} fragment(s) to ${HTML}`);
  } else {
    console.log('no changes');
  }
}

main();
