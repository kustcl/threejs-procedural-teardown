#!/usr/bin/env node
// Validate that a built page is truly self-contained and not corrupted.
//
//   node scripts/validate.mjs <built-html> [project-folder]
//
// Checks:
//   - one inline module script, no external script/link/media tags
//   - no external asset extensions in source imports
//   - reasonable file size
//   - no U+FFFD replacement characters (UTF-8 corruption)
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('\n  Usage: node scripts/validate.mjs <built-html> [project-folder]\n');
  process.exit(1);
}

const htmlPath = path.resolve(file);
if (!fs.existsSync(htmlPath)) {
  console.error(`  Missing ${htmlPath}`);
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');
const failures = [];
const warnings = [];

if (html.includes('\uFFFD')) failures.push('U+FFFD replacement character found (encoding corruption)');
if (/<script[^>]+\bsrc\s*=/i.test(html)) failures.push('external <script src> found');
if (/<link[^>]+\brel\s*=\s*["']?stylesheet/i.test(html)) failures.push('external stylesheet <link> found');
if (/<(?:img|source|video|audio|iframe)\b/i.test(html)) failures.push('external media tag found');
if (!/<script\b[^>]*type=["']module["'][^>]*>/i.test(html)) failures.push('inline module script not found');
if (!/<div id=["']app["']>\s*<\/div>/i.test(html)) failures.push('#app mount not found');

const externalUrls = [...html.matchAll(/\b(?:src|href)\s*=\s*["'](https?:|\/\/)/gi)];
if (externalUrls.length) failures.push(`external src/href URL(s) found: ${externalUrls.length}`);

const mb = Buffer.byteLength(html) / 1024 / 1024;
if (mb > 3.2) failures.push(`bundle is ${mb.toFixed(2)} MB; target < 3.2 MB`);
if (mb > 1.8) warnings.push(`bundle is ${mb.toFixed(2)} MB; consider reducing textures/geometry`);

const project = process.argv[3] ? path.resolve(process.argv[3]) : null;
if (project) {
  const forbidden = /\.(?:glb|gltf|obj|fbx|stl|hdr|exr|ktx2|jpg|jpeg|png|webp)(?:["'?]|$)/i;
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      if (['node_modules', 'dist', '.git', 'shots'].includes(name)) continue;
      const p = path.join(dir, name);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (/\.(?:js|mjs|css|html)$/i.test(name)) {
        const text = fs.readFileSync(p, 'utf8');
        if (forbidden.test(text)) {
          failures.push(`external asset reference in ${path.relative(project, p)}`);
        }
      }
    }
  };
  walk(project);
}

if (failures.length) {
  console.error('\nValidation failed:');
  for (const f of failures) console.error('  ✗ ' + f);
  process.exitCode = 1;
} else {
  console.log(`  ✓ self-contained  ${htmlPath}  (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
}
for (const w of warnings) console.warn('  ! ' + w);
