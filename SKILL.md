---
name: threejs-procedural-teardown
description: >
  Build a complete, interactive Three.js 3D exploded-view / teardown page for
  almost any object — aircraft, ships, tanks, cars, engines, robots, machines,
  buildings, electronics, product props, or anatomy — as one self-contained,
  offline HTML page. Produces procedural geometry and canvas textures, layered
  explosion animation, hover and click picking, part tree with search, spec
  dossiers, in-scene callouts, orbit controls, responsive HUD, and a polished
  dark technical art direction. Use this skill whenever the user asks for a 3D
  teardown, exploded view, cutaway, assembly diagram, structure breakdown,
  digital twin, interactive product visualization, or a "Three.js scene of X",
  even if they only give an object name or reference images. Also trigger for
  Chinese requests such as 3D 拆解、爆炸图、结构分层、交互式三维可视化、
  三维结构展示、Three.js 机械/舰船/设备页面.
---

# Three.js Procedural Teardown

Turn a short object prompt into a genuine interactive teardown page, not a
generic rotating cube. The output should read as a real object at first glance,
have a clear structural logic, and remain usable on a laptop or phone.

## What "done" means

A successful build has all of the following:

- Recognizable silhouette and proportions from at least three reference angles.
- 5–9 logical systems and typically 20–80 interactive parts.
- All geometry generated in code; all textures generated with Canvas2D.
- No external model, texture, font, or UI files. One built HTML that opens from
  `file://` with no network.
- Click a part → smooth exploded displacement along its layer normal → dossier
  popup → "locate this part" camera move. Click again / blank → collapse.
- Hover highlight + tooltip; part-tree search; callouts toggle; expand-all,
  collapse-all, reset view, wireframe, auto-rotate.
- Loading progress and first-run onboarding that can be dismissed.
- Desktop and portrait-mobile screenshots that you have actually inspected.
- A clean console: no page errors and no failed network requests.

If any item is missing, the build is not done.

## The one rule that matters most

**Start from a reference, never from imagination.**

Before modelling, collect at least:

1. A top or plan view.
2. A side/profile view.
3. A front or three-quarter view.
4. Published dimensions and a short list of real subsystems.

Trace the *silhouette* first. For a ship, that means the deck outline and hull
profile; for a tank, the hull and turret plan; for an engine, the casing and
accessory layout. A beautiful interior inside a wrong outline still reads as
wrong. Keep a short reference dossier in `REFERENCES.md` in the project.

If the user sends a corrected reference, compare top/front silhouettes before
touching materials or UI. Shape corrections outrank cosmetic work.

## Non-negotiables

- **Three.js only** for 3D; no external UI framework.
- **Everything procedural:** `BoxGeometry`, `CylinderGeometry`,
  `ExtrudeGeometry`, `LatheGeometry`, `ShapeGeometry`, `TubeGeometry`,
  custom `BufferGeometry`, instancing and merged geometry.
- **Procedural textures only:** deck markings, metal panels, radar faces,
  grilles, hazard stripes, signage, glass tint, etc. via Canvas2D.
- **One source of truth:** all systems, parts, specs, callout text and explosion
  vectors live in a data module. Geometry, tree, labels and dossier consume it.
- **One world unit = one metre** unless the subject is tiny. This keeps
  proportions, camera distances and explosion offsets coherent.
- **Camera-first composition:** hero three-quarter framing, then verify with
  top/front screenshots. Do not rely on the user to orbit to find the object.
- **No copyrighted reference assets in the deliverable.** Use references only
  to derive geometry and proportions.
- **No unverified claims.** Mark estimates as estimates; avoid classified or
  fictional performance numbers presented as fact.

## Workflow

### 0. Intake

Extract from the prompt:

- Subject and variant.
- Reference images or links.
- Required parts/systems.
- Visual style (dark tech, clean showroom, blueprint, military, medical, etc.).
- Deliverable (single HTML, source repo, embedded page, video, etc.).
- Interaction requirements and target devices.

If the user gives only a name, make sensible choices and proceed. Do not block
on questions that a reference search can answer. If the object is obscure,
state the interpretation in the final note.

### 1. Reference dossier and dimensions

Read `references/reference-research.md`. Build a small `REFERENCES.md`:

- 2–4 image sources.
- Overall length / width / height / mass or other anchor dimensions.
- 5–10 named subsystems.
- Any silhouette notes ("bow is a blunt trapezoid, not pointed").
- What is intentionally simplified.

Derive a normalized coordinate system:
`+X = forward`, `+Y = up`, `+Z = starboard/right`, origin at the object center
or ground plane. Write the dimensions into the data module before modelling.

### 2. Structure map and part data

Read `references/data-model.md`.

Define 5–9 systems. Each system is a visible layer with a color and a short
description. Define each interactive part with:

- `id`, Chinese display name, English name, system, role.
- 2–4 sentence description.
- 4–8 spec rows (real values where possible).
- A 3D explosion vector in metres.
- An optional callout anchor and screen offset.
- An optional parent part for nested assemblies.

Prefer parts that are recognizable assemblies (`turret`, `engine block`,
`landing gear`, `compressor stage`) over hundreds of screws. Small repeated
details should be instanced decoration inside a larger part.

### 3. App shell

Create the project with this split:

```
main.js
style.css
src/
  data.js            systems + parts + overview + labels
  context.js         part registry, system groups, pickable index
  textures.js        Canvas2D texture atlas
  materials.js       PBR material library + environment
  geometry.js        reusable geometry helpers
  stage.js           renderer, camera, controls, lights, post, atmosphere
  animation.js       explosion tweens + camera director
  interaction.js     picking, hover, selection, keyboard, camera fit
  ui.js              HUD, tree, dossier, labels, onboarding
  model/
    index.js         build orchestration
    <system>.js      one module per structural layer
```

Use the app-shell split consistently. Keep model files free of UI logic. Keep
UI files free of geometry. (The carrier demo source is not bundled; use the
patterns in the references and build the shell from scratch.)

### 4. Model geometry

Build from large to small:

1. Ground/primary silhouette and structural shell.
2. Major internal volumes and decks/floors.
3. Subsystems and mechanical assemblies.
4. Repeated details: ribs, bolts, vents, tie-downs, lights, small parts.
5. Reference-specific decals and signage.

Use custom lofted `BufferGeometry` for hulls, aircraft fuselages, blades and
other tapered volumes. Use `LatheGeometry` for domes, nozzles and pressure
vessels. Use `TubeGeometry` for pipes and railings. Use `ShapeGeometry` for
flat panels and `ExtrudeGeometry` for wings, brackets and thick plates.

Before you write a new helper, check `references/threejs-cookbook.md`. Reuse the
patterns for:

- `box`, `roundedBox`, `cyl`, `cylinderBetween`, `tubeFromPoints`.
- Plan-shape deck/outline with holes.
- Lofted hull/fuselage sections.
- Mirrored folded wings.
- Instanced tie-downs, lights and repeated detail.
- `BufferGeometryUtils.mergeGeometries` for draw-call reduction.
- LOD for aircraft or repeated high-detail variants.

### 5. Materials, textures and atmosphere

Use `MeshStandardMaterial` / `MeshPhysicalMaterial` with a procedural
environment map. Canvas textures should carry the readable information:
deck lines, panel seams, radar grids, hazard bands, labels, grime, screen UI.

Keep the palette coherent: one hull/base color, one metal color, one glass, one
accent. Reserve the accent for selection, active states and "working" parts.

Post-processing:
- `EffectComposer` + `RenderPass`.
- `OutlinePass` for selected/hovered parts.
- Restrained `UnrealBloomPass` (strength roughly 0.2–0.6; threshold ≥ 0.9).
- `OutputPass`; ACES/AgX tone mapping.
- Dark grid/starfield/atmosphere if the style calls for it, but never let the
  background outshine the object.

The user's typical art direction is dark navy, naval gray, cyan accents and
glassmorphism. Adapt it to the subject; do not copy the carrier UI wholesale.

### 6. Interaction and HUD

Implement the standard contract:

- OrbitControls: left drag rotate, wheel zoom, right drag pan, two-finger
  dolly+rotate on touch.
- `Raycaster` picking against a flattened pickable list.
- Hover outline/tooltip; click selects and expands.
- Clicking the selected part again, or blank space, collapses.
- Hover/selected part receives a pulsing halo and/or point light.
- Detail panel shows name, category, description, spec table and a `Locate`
  button that frames the part in its final exploded position.
- Part tree: systems → parts, search across Chinese/English/ID, click to locate.
- Toolbar: expand all, collapse all, reset view, labels, wireframe, auto-rotate.
- Callout labels: DOM overlay with leader lines; clamp into safe viewport areas,
  avoid panel overlap, toggle on/off.
- Keyboard shortcuts `E/C/R/L/W/A`, `Esc`.
- Loading overlay with real build stages, then a short onboarding overlay.
- Progress meter during expand/collapse.
- Responsive layout: desktop side panels; portrait drawers/bottom sheets; a
  wider camera pullback by aspect ratio.

The exploded view must be *layered*, not random. Assign each part a direction
that reveals its system: deck up, island up, aircraft higher, hull down,
propulsion down/outward, compartments lateral. Nested parts inherit their
parent's displacement then add their own.

### 7. Build and visual QA

Use the bundled scripts:

```bash
node scripts/build-page.mjs <project-folder>
node scripts/screenshot.mjs <built-html> --out shots
node scripts/validate.mjs <built-html>
```

Then inspect the screenshots yourself. Use `read_image` / image viewing; do not
claim a visual result from code alone.

For every pass, capture and review:

1. Hero overview (three-quarter, UI visible).
2. Top / plan view of the primary silhouette.
3. Front/side view for proportions.
4. Selected part and dossier.
5. Fully exploded view.
6. Portrait mobile view.
7. One close-up of the most complex area.

Check:
- Silhouette matches reference at plan and profile.
- No floating gaps, holes, intersecting decks or detached assemblies.
- Every part that should touch touches.
- Labels are readable and do not collide with panels.
- Selected/hovered part is obvious.
- Explosion reveals structure instead of making a junk pile.
- Mobile camera fits the object; no clipped bow, nose, wings or wheels.
- No console errors; load completes; loader disappears.
- Frame rate remains usable; lower DPR / bloom on weak GPUs.

Read `references/qa-checklist.md` for the full checklist.

### 8. Package and hand off

Deliver:

- Source project folder.
- Single self-contained `dist/<name>.html`.
- 3–5 screenshots (overview, exploded, selected, mobile, plan view).
- A short README with controls and build/screenshot commands.
- A note listing intentional simplifications and uncertain data.

Before final delivery, run `validate.mjs` and one final screenshot pass.

## Failure modes to avoid

- **Wrong silhouette.** A pointed bow when the reference is a trapezoid, a
  generic box when the reference has a distinctive deck, or a car with the
  wrong greenhouse. Fix the outline before details.
- **Decorative noise instead of structure.** Hundreds of tiny boxes with no
  system logic. Build readable assemblies first.
- **A model that only works from one angle.** Check front/top.
- **UI covering the subject.** Panels should frame the central safe area.
- **Unreadable dark model.** Raise neutral fill and ambient; do not just add
  bloom.
- **Bloomy neon soup.** Lower emissive intensities, raise bloom threshold.
- **Labels stuck in a pile.** Clamp, offset and resolve collisions; hide labels
  that fall behind the camera.
- **Explosions that just scatter.** Give each layer a direction and a reason.
- **Mobile crop.** Scale the camera distance by aspect ratio; test 390×844.
- **Claiming done without screenshots.** Always inspect the built page.

## Bundled resources

Read when needed, not all at once:

- `references/production-pipeline.md` — phase-by-phase production checklist.
- `references/data-model.md` — system/part/label/overview schemas and examples.
- `references/threejs-cookbook.md` — geometry, materials, UI, picking,
  explosion, camera and performance patterns.
- `references/reference-research.md` — how to gather and trace references.
- `references/qa-checklist.md` — visual, interaction and mobile QA.
- `references/case-carrier-demo.md` — lessons from the Ford-class carrier
  demo, including the bow-trapezoid correction and what went wrong.
- `references/prompt-template.md` — a reusable brief for a new object.
- `demo/README.md` — the carrier demo brief and three screenshots. The carrier
  source is intentionally not included.
- `assets/demo/` — the three carrier demo screenshots.

## Working style

- Make a plan and keep it visible for long builds.
- Prefer a working vertical slice early: camera + one system + picking + UI,
  then add layers.
- After each major change, build and screenshot.
- When the user gives a reference correction, repeat the silhouette pass before
  any other polish.
- Keep the code modular but do not over-abstract. A clear `model/<system>.js`
  file and a small `geometry.js` helper library is usually enough.
- Report what changed and what remains uncertain, in the user's language.
