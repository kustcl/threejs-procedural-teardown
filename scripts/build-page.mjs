#!/usr/bin/env node
// Build a procedural teardown project into one self-contained, offline HTML file.
//
//   node scripts/build-page.mjs <project-folder> [--out <file>] [--no-minify]
//
// The project needs:
//   main.js      module entry
//   style.css    page CSS (optional)
//   package.json optional metadata
//   build.json   optional { "title": "...", "lang": "zh-CN" }
//
// Dependencies resolve from this repo's node_modules first, then the project's.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function has(name) {
  return process.argv.includes(name);
}

const project = path.resolve(process.argv[2] || '.');
const entry = path.join(project, 'main.js');
if (!fs.existsSync(entry)) {
  console.error(`\n  No main.js found in ${project}\n`);
  process.exit(1);
}

const pkg = fs.existsSync(path.join(project, 'package.json'))
  ? JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'))
  : {};
const buildCfg = fs.existsSync(path.join(project, 'build.json'))
  ? JSON.parse(fs.readFileSync(path.join(project, 'build.json'), 'utf8'))
  : {};

const slug = (buildCfg.slug || pkg.name || path.basename(project))
  .replace(/^@[^/]+\//, '')
  .replace(/[^a-z0-9-_]+/gi, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase() || 'teardown';
const title = buildCfg.title || pkg.displayName || pkg.name || path.basename(project);
const lang = buildCfg.lang || 'en';

const require = createRequire(path.join(REPO, 'package.json'));
const esbuild = require('esbuild');

const nodePaths = [
  path.join(REPO, 'node_modules'),
  path.join(project, 'node_modules'),
  ...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean),
].filter((p) => fs.existsSync(p));

const outDefault = path.join(project, 'dist', `${slug}.html`);
const out = path.resolve(arg('--out', outDefault));
const minify = !has('--no-minify');

const t0 = Date.now();
const result = await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  nodePaths,
  format: 'esm',
  target: 'es2022',
  minify,
  write: false,
  legalComments: 'none',
  loader: { '.woff': 'base64', '.woff2': 'base64', '.ttf': 'base64' },
  logLevel: 'warning',
});

const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const cssPath = path.join(project, 'style.css');
let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
if (minify && css) {
  const cssResult = await esbuild.transform(css, { loader: 'css', minify: true });
  css = cssResult.code;
}

const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#02060b">
<title>${escapeHtml(title)}</title>
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<!-- Bundled with Three.js (MIT, © 2010-2026 three.js authors). See THIRD_PARTY_NOTICES.md. -->
<script type="module">
${js}
</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html, 'utf8');
const kb = (html.length / 1024).toFixed(0);
console.log(`  ${out}  ${kb} KB  ${Date.now() - t0} ms`);

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
