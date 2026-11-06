#!/usr/bin/env node
// Repository self-check used by CI and `npm run check`.
// It verifies the docs, scripts, demo assets and the "no bundled demo source"
// rule. It does not require a browser or a generated project.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const warnings = [];

const required = [
  'SKILL.md',
  'README.md',
  'README.zh-CN.md',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'package.json',
  'demo/README.md',
  'assets/demo/carrier-01-wireframe.png',
  'assets/demo/carrier-02-exploded.png',
  'assets/demo/carrier-03-exploded.png',
  'references/production-pipeline.md',
  'references/data-model.md',
  'references/threejs-cookbook.md',
  'references/reference-research.md',
  'references/qa-checklist.md',
  'references/case-carrier-demo.md',
  'references/prompt-template.md',
  'scripts/build-page.mjs',
  'scripts/screenshot.mjs',
  'scripts/validate.mjs',
  'scripts/check-skill.mjs',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(ROOT, rel))) failures.push(`missing ${rel}`);
}

// The carrier demo source must not be bundled.
if (fs.existsSync(path.join(ROOT, 'examples'))) {
  failures.push('examples/ exists; the carrier demo source must not be bundled');
}
if (fs.existsSync(path.join(ROOT, 'scripts', 'copy-example.mjs'))) {
  failures.push('copy-example.mjs exists; no example source should be shipped');
}

// Basic SKILL.md metadata.
const skillPath = path.join(ROOT, 'SKILL.md');
if (fs.existsSync(skillPath)) {
  const skill = fs.readFileSync(skillPath, 'utf8');
  if (!skill.startsWith('---\n')) failures.push('SKILL.md must start with YAML frontmatter');
  if (!/^name:\s*threejs-procedural-teardown\s*$/m.test(skill)) {
    failures.push('SKILL.md frontmatter name mismatch');
  }
  if (!/^description:/m.test(skill)) failures.push('SKILL.md frontmatter description missing');
  if (skill.includes('examples/cvn78')) failures.push('SKILL.md still references bundled carrier source');
}

// README must point at all three demo screenshots.
for (const name of ['README.md', 'README.zh-CN.md']) {
  const readmePath = path.join(ROOT, name);
  if (!fs.existsSync(readmePath)) continue;
  const readme = fs.readFileSync(readmePath, 'utf8');
  for (const img of ['carrier-01-wireframe.png', 'carrier-02-exploded.png', 'carrier-03-exploded.png']) {
    if (!readme.includes(img)) failures.push(`${name} does not reference ${img}`);
  }
  if (readme.includes('examples/cvn78')) failures.push(`${name} still references bundled carrier source`);
}
if (fs.existsSync(path.join(ROOT, 'README.zh-CN.md'))) {
  const zh = fs.readFileSync(path.join(ROOT, 'README.zh-CN.md'), 'utf8');
  if (!zh.includes('README.md')) failures.push('README.zh-CN.md is missing the English README link');
  if (!/本仓库不包含航母源码|源码和构建产物不包含/.test(zh)) {
    failures.push('README.zh-CN.md must state that the carrier source is not included');
  }
}

// No 3D / texture assets except the three documentation screenshots.
const forbidden = /\.(?:glb|gltf|obj|fbx|stl|hdr|exr|ktx2|jpg|jpeg|webp)$/i;
const requiredPng = new Set([
  'assets/demo/carrier-01-wireframe.png',
  'assets/demo/carrier-02-exploded.png',
  'assets/demo/carrier-03-exploded.png',
]);
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist' || name === 'shots') continue;
    const p = path.join(dir, name);
    const rel = path.relative(ROOT, p).replaceAll('\\', '/');
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else {
      if (forbidden.test(name)) failures.push(`forbidden asset ${rel}`);
      if (name.toLowerCase().endsWith('.png') && !rel.startsWith('assets/demo/')) {
        failures.push(`unexpected png ${rel}`);
      }
    }
  }
}
walk(ROOT);

// Demo image sanity.
for (const p of requiredPng) {
  const full = path.join(ROOT, p);
  if (fs.existsSync(full) && fs.statSync(full).size < 100_000) {
    warnings.push(`${p} looks unusually small`);
  }
}

if (failures.length) {
  console.error('\nRepository check failed:');
  for (const f of failures) console.error('  ✗ ' + f);
  process.exitCode = 1;
} else {
  console.log('  ✓ repository check passed');
}
for (const w of warnings) console.warn('  ! ' + w);
