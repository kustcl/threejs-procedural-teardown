# Changelog

## 0.1.0 — 2026-11-06

Initial public skill release.

- Added the `threejs-procedural-teardown` agent skill.
- Added a reference-first production pipeline and QA checklist.
- Added procedural Three.js cookbook patterns (lofts, decks, textures,
  instancing, LOD, picking, outlines, labels, explosion, camera fit, mobile).
- Added a data model for systems, parts, callouts and overview stats.
- Added tooling:
  - `build-page.mjs` — self-contained HTML builder
  - `screenshot.mjs` — desktop/mobile QA capture
  - `validate.mjs` — offline/encoding/size validation
  - `check-skill.mjs` — repository self-check
- Added the Ford-class carrier demo brief and three demo screenshots.
  **The carrier source code is intentionally not included.**
- Added a full Simplified Chinese README (`README.zh-CN.md`).
- Added example evaluation prompts.
- Added MIT license, third-party notices and contribution guidance.

### Demo notes

- The carrier demo demonstrates 7 systems and 51 interactive parts.
- Screenshots cover exploded wireframe, exploded systems and component
  inspection states.
- The source is not part of this repository; the demo exists to communicate
  the output quality of the skill.
