# Data Model

The data module is the contract between geometry, the HUD and the part tree.
Write it before modelling and treat it as the single source of truth.

## 1. Overview

```js
export const OVERVIEW = {
  code: 'OBJ-01',
  name: 'OBJECT NAME',
  nameCN: '物体名称',
  className: 'Section · Variant',
  intro: 'Two or three sentences describing what this object is and why its structure is interesting.',
  stats: [
    { k: 'Length', v: '337', u: 'm', note: 'OVERALL' },
    { k: 'Mass', v: '≈ 100,000', u: 't', note: 'FULL LOAD' },
    // 4–6 headline numbers that fit on one panel
  ],
  extra: [
    ['Power', '2 × ...'],
    ['Material', '...'],
    ['Crew / capacity', '...'],
  ],
};
```

Do not put uncertain numbers in the headline without `≈` / `*` and a note.

## 2. Systems

A system becomes a tree section, a color and a UI category. Aim for 5–9.

```js
export const SYSTEMS = [
  {
    id: 'structure',
    code: '01',
    name: '结构主体',
    en: 'STRUCTURE',
    color: '#55e6ff',
    desc: 'Main load-bearing shell and frames.',
  },
  // ...
];
```

Use a consistent color family: one accent per system, all readable against the
same dark background.

## 3. Parts

```js
export const PARTS = [
  {
    id: 'main_shell',
    system: 'structure',
    name: '主壳体',
    en: 'MAIN SHELL',
    role: 'Primary enclosure / structure',
    explode: [0, -14, 0],       // metres, in parent-local space
    desc: 'What it does, what it connects to, and why it matters.',
    specs: [
      ['Length', '...'],
      ['Material', '...'],
      ['Key interface', '...'],
      ['Quantity', '...'],
    ],
  },
];
```

Field rules:

- `id`: stable lowercase snake_case. Never change it after the UI is wired.
- `system`: must match a `SYSTEMS.id`.
- `explode`: the displacement at full expansion for this part, in metres.
- `parent`: optional. A nested part inherits its parent's displacement and adds
  its own.
- `name` / `en`: keep both. The tree and tooltip can show both.
- `desc`: 2–4 sentences; no marketing fluff.
- `specs`: 4–8 rows, each `[label, value]`. Values may be strings with units.
- `role`: short phrase for the dossier subtitle.

### Choosing explosion vectors

Choose directions by system so the exploded view reads as a diagram:

| System | Typical direction |
|---|---|
| Outer shell / hull | down or outward |
| Deck / roof | up |
| Island / superstructure | up |
| Electronics / sensors | further up |
| Aircraft / payloads | up and slightly out |
| Engine / drivetrain | down and aft |
| Running gear / wheels | down and outward |
| Weapons / external stores | outward |
| Interior compartments | lateral (port/starboard or left/right) |

Nested children add to the parent's motion, so a radar on an island should have
its own upward vector, not a full absolute position.

Keep offsets generous enough to be legible from the hero camera but not so large
that the model becomes a pile. A useful rule: the largest offset should be
roughly 20–35% of the object's longest dimension.

## 4. Labels / Callouts

Callouts are authored in rest-world coordinates. The UI converts them into
part-local space so they follow explosions.

```js
export const LABELS = [
  {
    part: 'main_shell',
    anchor: [150, 10, 15],     // rest-world position
    title: 'FULL LENGTH',
    value: '337 m',
    dx: 80, dy: -90,           // screen-space offset in CSS pixels
  },
];
```

Rules:

- 8–12 labels for a complex object; fewer for a simple one.
- Choose anchors near an actual feature, not the bounding-box center.
- `dx/dy` should place boxes in empty space around the object at the hero view.
- Implement screen-space clamping and simple collision relaxation.
- Hide labels when the anchor is behind the camera or outside the viewport.

## 5. Part registry / context

Use a small context module so every model file registers its part identically.

```js
export function createContext({ materials, textures }) {
  const root = new THREE.Group();
  const systems = new Map();
  const parts = new Map();

  for (const s of SYSTEMS) {
    const g = new THREE.Group();
    g.userData.system = s.id;
    root.add(g);
    systems.set(s.id, g);
  }

  function part(id, parent) {
    const data = PART_MAP.get(id);
    const g = new THREE.Group();
    g.name = `part:${id}`;
    g.userData.partRoot = true;
    g.userData.partId = id;
    parent.add(g);

    const rec = {
      id, data, group: g, t: 0, target: 0,
      meshes: [], children: [], parentPart: null,
      localAnchor: new THREE.Vector3(), basePosition: g.position.clone(),
    };
    parts.set(id, rec);
    return g;
  }

  return { root, systems, parts, system: (id) => systems.get(id), part, ... };
}
```

After building:

1. Compute each part's local anchor from its world-space bounding box.
2. Assign every pickable mesh to its **nearest** part root.
3. Collect all meshes for outline/marquee selection.
4. Add labels in local coordinates.

Do not assign a child mesh to the parent part accidentally. For nested parts,
walk up to the nearest `partRoot`.

## 6. UI-derived counts

Never hard-code system counts or total part counts in the UI. Derive:

```js
const counts = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, parts.filter((p) => p.data.system === s.id).length]),
);
```

## 7. Accuracy and uncertainty

Use `≈` for rounded public data and `*` for estimates. Include a footer note:

> Public figures are approximate; classified or unpublished values are marked
> as estimates.

For fictional objects, say the numbers are design targets rather than real
measurements.
