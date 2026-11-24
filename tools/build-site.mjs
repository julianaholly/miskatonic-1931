// Builds the stand-alone website into dist/ (used by Netlify).
// index.html is written as a page fragment for the Claude artifact viewer, which adds the
// document shell itself. For any other host we add that shell here: doctype, <head> with
// the phone viewport, and the favicon. Everything else is copied as is.
// Run: node tools/build-site.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const out = root + 'dist/';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const page = readFileSync(root + 'index.html', 'utf8');
const split = page.indexOf('<div id="app">');
const head = page.slice(0, split).replace('<meta charset="utf-8">', '').replace(/<meta name="claude:[^>]*>\n?/, '').trim();
const body = page.slice(split).trim();

const favicon = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0B0A09"/>' +
  '<text x="32" y="45" text-anchor="middle" font-family="Futura,Jost,sans-serif" font-size="38" fill="#E2B567">M</text>' +
  '<rect x="8" y="31" width="48" height="2" fill="#FFF6E2" opacity="0.9"/></svg>');

writeFileSync(out + 'index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0B0A09">
<link rel="icon" href="${favicon}">
${head}
</head>
<body>
${body}
</body>
</html>
`);

for (const dir of ['styles', 'src', 'audio']) cpSync(root + dir, out + dir, { recursive: true });
console.log('Built dist/ for the website.');
