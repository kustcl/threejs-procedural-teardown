# Production Pipeline

This is the long-form version of the workflow in `SKILL.md`. Use it when the
object is complex enough that you need a plan and checkpoints.

## Phase 0 — Scope the output

Decide these before writing code:

| Question | Default |
|---|---|
| Subject / variant? | Use the exact variant the user named. If none, pick the most recognizable production version. |
| Deliverable? | One self-contained HTML + source folder + screenshots. |
| Visual style? | Dark technical showroom with one cold accent, unless the user specifies otherwise. |
| Interactive parts? | 5–9 systems, 20–80 named parts. |
| Device target? | Desktop 1440–1920 px, mobile 390×844. |
| Accuracy policy? | Use public dimensions; mark estimates explicitly. |
| Exclusions? | No external models, textures, fonts or UI libraries. |

Write these choices into `PLAN.md` or the project README so later edits do not
drift.

## Phase 1 — Reference dossier

Create `REFERENCES.md`:

```markdown
# Object: <name>

## Sources
1. <URL / description> — plan view, used for silhouette
2. <URL / description> — profile, used for height
3. <URL / description> — detail, used for subsystem layout

## Anchor dimensions
- Length: ...
- Width / beam: ...
- Height: ...
- Mass / capacity: ...

## Named systems
1. ...
2. ...

## Silhouette notes
- Bow / nose: ...
- Deck / roof: ...
- Tail / rear: ...

## Intentional simplifications
- ...
```

For the object, sketch a normalized coordinate convention:

- `+X` forward / long axis.
- `+Y` up.
- `+Z` right / starboard.
- Origin at ground or geometric center.
- 1 unit = 1 metre.

If the object is organic, use anatomical planes instead: superior/inferior,
anterior/posterior, left/right.

**Checkpoint:** you can describe the object's silhouette in three lines without
looking at the reference again. If not, keep researching.

## Phase 2 — Structure map

Define systems before parts. A system is a layer that will separate in the
exploded view.

Examples:

- Aircraft carrier: hull / flight deck / island & electronics / propulsion /
  weapons / air wing / habitability & C2.
- Main battle tank: hull / turret & fire control / main gun / powerpack /
  running gear / crew compartment / stowage.
- Espresso machine: chassis / water circuit / boiler / group head / grinder /
  controls & electronics / body panels.
- Human heart: outer anatomy / coronary vessels / right heart / left heart /
  valves / conduction system.

For each part define `id`, display names, system, description, specs and an
explosion vector. Prefer meaningful assemblies over individual fasteners.
Small repeated detail can be geometry inside a larger part.

**Checkpoint:** every named subsystem in the reference dossier appears somewhere
in the data tree, and every part can be explained in one sentence.

## Phase 3 — App shell

Start with a working vertical slice:

1. Renderer + camera + OrbitControls.
2. A single placeholder assembly and 3 systems in the data model.
3. Part tree and dossier.
4. Raycast selection and explosion.
5. Screenshot it.

Only after that add materials, labels, onboarding and polish. This prevents
spending hours on art before the interaction contract works.

Use the module split from `SKILL.md`. Keep model files independent of UI files.

## Phase 4 — Model by layer

Work in this order:

1. **Global silhouette** — hull / fuselage / shell / main masses.
2. **Structure** — frames, decks, bulkheads, supports, openings.
3. **Major equipment** — engines, weapons, rotors, gearboxes, tanks.
4. **Systems detail** — pipes, wiring, rails, vents, lights.
5. **Repeated detail** — bolts, tie-downs, seats, lights, fasteners.
6. **Decals and markings** — only after the geometry reads correctly.

For each system module:

- Build in world coordinates first; it is easier to compare against references.
- Register the part with the shared context (`ctx.part(id, parentGroup)`).
- Add whole assemblies to the part group, not individual interactive bolts.
- Keep a `basePosition` of zero unless the part is intentionally offset.
- Use nested part groups only when a child should inherit the parent's
  explosion.

**Checkpoint:** plan and front screenshots look right before you spend time on
materials.

## Phase 5 — Materials, textures and atmosphere

1. Create a procedural environment map (equirectangular Canvas2D → PMREM).
2. Build a small material library; avoid one unique material per mesh.
3. Generate Canvas textures for the information-bearing surfaces.
4. Set lighting in layers: neutral key, broad fill, cool rim, practical lights.
5. Add restrained bloom and outline.
6. Add the atmospheric background (grid, stars, haze) last; it must not
   compete with the object.

**Checkpoint:** a screenshot reads as the material you intended (metal, painted
steel, ceramic, glass, fabric) without relying on bloom.

## Phase 6 — Interaction and HUD

Implement in this order:

1. Orbit + damping + touch mapping.
2. Pickable list and raycast.
3. Hover state and tooltip.
4. Select → explode → dossier.
5. Camera locate/focus.
6. Part tree + search.
7. Labels with leader lines.
8. Toolbar toggles and keyboard shortcuts.
9. Loading, onboarding, progress and toasts.
10. Mobile drawers and responsive camera.

**Checkpoint:** every item in the interaction contract in `SKILL.md` works with
mouse and touch.

## Phase 7 — Visual QA loop

Use the screenshot script. Review every image yourself. A full pass:

- Hero overview.
- Top view.
- Front or side view.
- Selected part.
- Fully exploded.
- Mobile portrait.
- Close-up of the most complicated region.

Fix silhouette errors first, then structural gaps, then materials, then UI.

For a user correction like "the bow is wrong", do not polish materials. Take a
top view, compare the outline point-by-point, change the data, rebuild, and
compare again.

**Checkpoint:** no known silhouette error remains; labels and panels do not
cover important geometry; mobile is framed.

## Phase 8 — Build and deliver

Run:

```bash
node scripts/build-page.mjs .
node scripts/validate.mjs dist/<name>.html
node scripts/screenshot.mjs dist/<name>.html --out shots
```

Deliver:

- `dist/<name>.html` — self-contained offline page.
- Source folder.
- `shots/overview.png`, `shots/exploded.png`, `shots/mobile.png`, optionally
  `shots/top.png`.
- README with controls and build instructions.
- A short "known simplifications" note.

## Time box (suggested)

| Phase | Small object | Complex object |
|---|---|---|
| Reference + data | 20–40 min | 60–120 min |
| App shell | 20–40 min | 40–90 min |
| Geometry | 60–120 min | 3–8 h |
| Materials | 20–40 min | 40–90 min |
| UI / interactions | 40–80 min | 1–3 h |
| QA / iteration | 30–60 min | 1–3 h |

The exact time matters less than the order: silhouette → structure → systems →
polish → screenshots.
