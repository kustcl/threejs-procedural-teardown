# Contributing

Thanks for helping improve the skill. The goal is a reusable, honest workflow
for procedural 3D teardown pages — not a collection of copyrighted models.

## Good contributions

- A new **demo brief** and screenshots in `demo/` / `assets/demo/`, without
  bundling the generated source.
- Geometry helpers that are genuinely reusable (lofting, cables, grilles,
  instancing, render-to-texture decals).
- Better interaction or mobile patterns.
- Screenshot/validation tooling and QA improvements.
- Clearer documentation of reference research and proportion work.
- Bug reports with a screenshot and the exact prompt/project state.

## Please do not submit

- `.glb`, `.gltf`, `.obj`, `.fbx`, `.stl` files.
- Photographs, textures, logos or reference images you do not have rights to.
- Scraped UI libraries or nondistributable font files.
- Models that reproduce a real classified or proprietary design with invented
  precision.
- Source code or assets from the private carrier demo.
- "Reskins" that keep a demo's geometry and only change its labels.

## Development

```bash
npm install
npx playwright install chromium
npm run build
npm run validate
npm run shot
```

Before opening a PR:

1. Build and screenshot a generated test project affected by the change.
2. Inspect the images (not just the console).
3. Run `node scripts/validate.mjs` on the built HTML.
4. Keep the page offline and self-contained.
5. Run `npm run check`.
6. Explain what you changed and what remains simplified.

## New demo

Add a brief to `demo/<name>.md` and screenshots to
`assets/demo/<name>-*.png`. Add the image references to the README.

Do not bundle the generated project source or built HTML in this repository,
and do not add copyrighted reference photos or third-party 3D assets.

## Style

- Prefer small functions and explicit units.
- Keep model files free of UI logic.
- Document non-obvious dimensions and coordinate conventions.
- Use `≈` and `*` for estimates.
- Keep comments focused on why, not what the syntax already says.
