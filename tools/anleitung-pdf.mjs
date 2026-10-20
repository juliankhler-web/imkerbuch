/* Aufruf: node tools/anleitung-pdf.mjs docs/GERAETETEST.md docs/pdf/ImkerBuch-Test-am-iPhone.pdf "Untertitel" – macht aus einer Anleitung (Markdown) ein A4-PDF zum Abhaken */
// Markdown → gestaltetes HTML (A4) → PDF über Chrome headless
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire('/Users/juliankoehler/ImkerApp/package.json');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
import path from 'node:path';
const [quelleRoh, zielRoh, untertitel] = process.argv.slice(2);
const quelle = path.resolve(quelleRoh), ziel = path.resolve(zielRoh);   // Chrome braucht absolute Pfade (file://…)
let html = md.render(fs.readFileSync(quelle, 'utf8'));
html = html.replace(/<li>\[ \] /g, '<li class="task"><span class="box"></span>').replace(/<li>\[x\] /gi, '<li class="task"><span class="box an">✓</span>');
html = html.replace(/<li>(<p>)?\[ \] /g, '<li class="task">$1<span class="box"></span>');
const css = `
@page { size: A4; margin: 16mm 15mm 16mm 15mm; @bottom-right { content: counter(page); } }
:root { --honig:#E8A013; --honig-hell:#FCEFD3; --text:#2B2620; --grau:#6E655A; --linie:#E9DFCF; }
* { box-sizing: border-box; }
body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: var(--text); font-size: 10.6pt; line-height: 1.5; margin: 0; }
.kopf { display:flex; align-items:center; gap:12px; border-bottom: 3px solid var(--honig); padding-bottom: 10px; margin-bottom: 14px; }
.kopf svg { width: 34px; height: 34px; flex: none; }
.kopf .t { font-size: 9pt; color: var(--grau); }
h1 { font-size: 20pt; margin: 0; line-height: 1.15; }
h2 { font-size: 13.5pt; margin: 20px 0 8px; padding: 6px 10px; background: var(--honig-hell); border-left: 5px solid var(--honig); border-radius: 0 12px 12px 0; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 14px 0 6px; break-after: avoid; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0 6px 0; padding-left: 22px; }
li { margin: 4px 0; break-inside: avoid; }
li.task { list-style: none; position: relative; margin-left: -22px; padding-left: 28px; }
.box { position: absolute; left: 2px; top: 2px; width: 15px; height: 15px; border: 1.8px solid var(--honig); border-radius: 4px; background: #fff; }
code { font-family: "SF Mono", Menlo, monospace; font-size: 9.2pt; background: #F4EEE4; padding: 1px 5px; border-radius: 5px; }
blockquote { margin: 10px 0; padding: 8px 12px; background: #F7F3EC; border-left: 4px solid var(--linie); border-radius: 0 12px 12px 0; color: var(--grau); }
table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 9.6pt; break-inside: avoid; }
th, td { border: 1px solid var(--linie); padding: 5px 7px; text-align: left; vertical-align: top; }
th { background: var(--honig-hell); }
hr { border: 0; border-top: 1px solid var(--linie); margin: 16px 0; }
a { color: #9A6A08; text-decoration: none; }
strong { color: #1E1A15; }
`;
const logo = '<svg viewBox="0 0 100 100"><polygon points="30,8 50,20 50,44 30,56 10,44 10,20" fill="#E8A013"/><polygon points="70,30 90,42 90,66 70,78 50,66 50,42" fill="none" stroke="#2B2620" stroke-width="6"/><polygon points="30,52 50,64 50,88 30,100 10,88 10,64" fill="none" stroke="#2B2620" stroke-width="6" transform="translate(0,-6)"/></svg>';
// Erste Überschrift in den Kopf übernehmen
const m = html.match(/<h1>([\s\S]*?)<\/h1>/);
const titel = m ? m[1] : 'ImkerBuch';
html = html.replace(/<h1>[\s\S]*?<\/h1>/, '');
const seite = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${titel}</title><style>${css}</style></head><body>
<div class="kopf">${logo}<div><h1>${titel}</h1><div class="t">${untertitel || ''}</div></div></div>${html}</body></html>`;
const tmp = ziel.replace(/\.pdf$/, '.html');
fs.writeFileSync(tmp, seite);
execFileSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${ziel}`, 'file://' + tmp], { stdio: 'ignore' });
fs.unlinkSync(tmp);
console.log('PDF:', ziel, fs.statSync(ziel).size, 'Bytes');
