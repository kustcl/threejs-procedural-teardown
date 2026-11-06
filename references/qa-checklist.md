# QA Checklist

Run this before calling a teardown done. Read the screenshots, not just the
console.

## A. Silhouette and proportions

- [ ] Top/plan view matches the reference at a glance.
- [ ] Front/side view does not look too wide, too narrow, too tall or too squat.
- [ ] Bow / nose / tail / rear silhouettes use the intended shape (trapezoid,
      point, rounded, square) — not a generic default.
- [ ] Major overhangs are supported or visibly cantilevered.
- [ ] The object is not floating above its ground plane unintentionally.
- [ ] Subassemblies are in the right place (island, turret, engine, wheels,
      wings, optics).
- [ ] No part is lost inside another part in the assembled view.

## B. Structural integrity

- [ ] No visible gaps where surfaces should meet.
- [ ] No z-fighting flicker on coplanar panels.
- [ ] No back-face culling holes on hulls, wings or folded panels.
- [ ] Cutaways have frames/edges and interior walls; they look deliberate.
- [ ] Doors, elevators, hatches and rails do not float.
- [ ] Repeated details follow the surface rather than hover above it.

## C. Materials and lighting

- [ ] The model is readable at the hero exposure.
- [ ] Base color is not crushed to black.
- [ ] Metal looks like metal, glass reads as glass, paint reads as paint.
- [ ] Bloom is restrained; emissive strips do not swallow adjacent detail.
- [ ] The background does not outshine the subject.
- [ ] No texture moiré or visible low-resolution pixels at the hero view.
- [ ] Selected outline is visible against both bright and dark parts.

## D. Explosion

- [ ] Each system moves in a logical direction.
- [ ] The assembled → exploded transition uses easing and looks intentional.
- [ ] No parts remain inside the hull/casing when fully expanded.
- [ ] Aircraft/vehicles/loose objects do not intersect each other.
- [ ] The camera can frame the expanded object; reset returns to home.
- [ ] Collapse returns every part to its rest position.
- [ ] Progress feedback appears and completes.
- [ ] Single-part explosion is obvious; nested parts move with parents.

## E. Picking and selection

- [ ] Clicking a part selects the intended part, not an invisible glass pane,
      a decal or a label.
- [ ] Instanced objects select the correct type/assembly.
- [ ] Hover outline and tooltip appear.
- [ ] Clicking blank space collapses/closes.
- [ ] Clicking the selected part again collapses.
- [ ] "Locate" frames the final exploded position, not the pre-animation box.
- [ ] Camera fit does not clip the selected part at the top or sides.
- [ ] Esc closes the detail / onboarding.

## F. HUD

- [ ] Part count and system count are derived from data, not hard-coded.
- [ ] Search filters both Chinese and English names.
- [ ] Tree scrolls; active row is visible.
- [ ] Detail panel scrolls internally on short screens.
- [ ] Labels toggle and reposition every frame.
- [ ] Labels do not overlap the side panels or each other badly.
- [ ] Tooltip is not clipped at screen edges.
- [ ] Toolbar has clear active states.
- [ ] Loading progress reaches 100% and the loader disappears.
- [ ] Intro overlay can be closed; it does not block the page forever.

## G. Responsive / touch

- [ ] 390×844 screenshot shows the entire object, not a cropped section.
- [ ] Top toolbar fits; labels are readable.
- [ ] Side panels open as drawers and close without blocking the canvas.
- [ ] A closed drawer has `pointer-events: none`; it cannot intercept clicks.
- [ ] Two-finger dolly/rotate works.
- [ ] Tap selects a part; detail panel opens.
- [ ] No horizontal page scroll.
- [ ] Buttons are at least ~32 px touch targets.

## H. Performance

- [ ] No console errors.
- [ ] No failed network requests.
- [ ] First frame completes after the loader without a long freeze.
- [ ] Desktop frame rate is >= 45–50 fps at 1600×900.
- [ ] Mobile frame rate is >= 30 fps, or quality is automatically reduced.
- [ ] `renderer.info.render.calls` is within budget (< 350 target).
- [ ] Pixel ratio capped; bloom reduced on low-power devices.
- [ ] Page remains interactive while expanded.

## I. Self-contained build

- [ ] `dist/<name>.html` opens from `file://`.
- [ ] No external `<script src>`, `<link rel=stylesheet>`, `<img>` or network
      requests.
- [ ] No `.glb`, `.gltf`, `.obj`, `.fbx`, `.png`, `.jpg`, `.hdr` references.
- [ ] No U+FFFD replacement-character encoding corruption in source or built HTML.
- [ ] Bundle size is reasonable (< ~1.5 MB preferred, 3 MB hard ceiling).
- [ ] The title and viewport meta are correct.
- [ ] One inline module script and `#app` mount are present.

## J. Delivery

- [ ] Source tree is present and readable.
- [ ] README explains controls, build and screenshots.
- [ ] At least overview + exploded + mobile screenshots exist.
- [ ] Data-visibility note included for estimates/classified values.
- [ ] No copyrighted reference assets redistributed.
- [ ] Final answer states what changed, what is simplified and how to open it.
