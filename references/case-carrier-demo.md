# Case Study: CVN-78 Carrier Demo

This case study documents the carrier demo produced from the brief in
`demo/README.md`. The demo source is intentionally not included; the three
screenshots in `assets/demo/` are the public artifact. The lessons below cover
the architecture and iteration process that produced them.

## Scope

- Subject: Ford-class aircraft carrier, CVN-78.
- 7 systems, 51 interactive parts.
- World scale: 1 unit = 1 m. Hull roughly 344 m long, flight deck 78 m wide.
- Deliverable: one offline HTML page, no external models/textures/UI libraries.

## Systems and notable parts

| System | Examples |
|---|---|
| Hull & structure | hull loft, bulbous bow, hangar deck, 4 deck-edge elevators, bulkheads, keel frames |
| Flight deck | deck shell, markings, 4 EMALS, AAG wires/barricade, IFLOLS, weapon elevators, nets, tie-downs |
| Island & electronics | stepped island, bridge/Pri-Fly/CIC, 6-face DBR, mast, EW, SATCOM, funnel |
| Propulsion | 2 A1B reactors, steam generators, turbines, gears, 4 shafts/props, rudders, diesel |
| Weapons & support | ESSM, RAM, Phalanx, damage control, fuelling/arming |
| Air wing | F/A-18E/F, F-35C, E-2D, MH-60, CMV-22B; folded/spread variants; deck + hangar |
| Habitability & C2 | berthing, mess, medical, magazines, fuel tanks, CIC, bridge interior |

## What worked

- A **data-first** model: `src/data.js` drove the tree, dossiers, counts and
  labels; geometry modules only registered part groups.
- **One source of truth** for part IDs and explosion vectors.
- Reusing a small geometry library (`box`, `cyl`, `loft`, `cylinderBetween`,
  `tube`, `mergeGeomList`, `addRailing`) kept the model modules readable.
- A separate `textures.js` made it easy to iterate on deck markings and radar
  faces without touching geometry.
- **Build + screenshot after every visual change** caught several proportion
  problems that were invisible in code.
- Nested parts (island → DBR/mast/SATCOM; hull → elevators/hangar) made the
  explosion logically coherent.
- Instancing aircraft/tie-downs and merging static detail kept draw calls
  reasonable.
- A staged loader plus `renderer.compile()` + one composer render before reveal
  eliminated the first-frame freeze.

## Corrections that mattered

### 1. Bow shape

The first deck plan tapered to a sharp point. The reference showed a broad,
blunt flight deck. The first correction made a rounded nose, but the user
correctly pointed out it should read as a **trapezoid**. The final plan uses:

- a flat leading edge about 20 m wide;
- two long straight chamfered sides;
- shoulders at x = 120 m, transitioning into the full-beam deck;
- straight deck-edge markings, nets and lights generated from the same outline.

Lesson: a long list of shoulder points renders as a round bullet. Use few,
deliberate points when the reference is a trapezoid.

### 2. The "missing" island

A blank white slab that looked like the navigation bridge turned out to be the
**funnel casing**. Raycasting the screen point and walking the object parents
identified it in one step. Lesson: when an unknown shape misbehaves, raycast it
and inspect its part chain instead of guessing.

### 3. DBR arrays

The six radar panels were initially positioned around the world origin instead
of the island tower, so they floated over the deck. The fix was to pass the
tower center into the panel helper. This is a good reminder: a "small" local
coordinate error can scatter a whole subsystem.

### 4. Camera focus after explosion

The `Locate` camera framed the current in-flight bounding box, so the selected
DBR moved out of frame. Fix: predict the final position using
`remaining = target - t` and translate the fit box by the part's explosion
vector before computing the distance.

### 5. Mobile drawers

Closed drawers retained `pointer-events: auto` through a higher-specificity
rule and blocked the page. Fix: set `#ui .panel { pointer-events: none }` when
closed and only enable pointer events on `.open` in the mobile breakpoint.

### 6. First-load hitch

The loader was still fading several seconds after the UI was ready because the
first composer render compiled postprocessing shaders on the main thread. Fix:
compile and draw one frame with the loader opaque, then run the progress
sequence and reveal.

## Performance profile of the demo

- ~80–110 fps on an RTX 4060 laptop at 1600×900 during screenshot runs.
- ~1 MB minified self-contained HTML, with fonts not bundled.
- 51 interactive parts, 12 callouts, 7 systems.
- Instanced aircraft/tie-downs, merged detail, LOD aircraft.
- Adaptive pixel-ratio fallback if FPS drops below 28.

## Patterns worth reusing

Reuse the ideas:

- the module split (data / context / model / stage / ui / interaction /
  animation);
- the part registry and pickable index;
- the data schema and single source of truth;
- the event/HUD bridge;
- the build/screenshot/QA loop;
- the warm-up and responsive camera patterns.

Do not reuse the carrier dimensions, outline, system copy, asset names or UI
skin. The demo source is not part of this repository. Build the new subject from
its own references.
