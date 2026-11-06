# Three.js Cookbook for Procedural Teardown

Patterns proven on the carrier demo and related production work. Copy the
idea, not the object.

## Dependencies

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
```

Bundle everything with esbuild. The final page must work offline.

## Helpers worth having

```js
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  return m;
}

function cylinderBetween(a, b, r, mat, seg = 8) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const dir = end.clone().sub(start);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, dir.length(), seg),
    mat,
  );
  m.position.copy(start).add(end).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
  return m;
}

function tube(points, radius, mat, tubular = 32, radial = 6) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)));
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, tubular, radius, radial, false),
    mat,
  );
}

function merged(geometries, material) {
  const normalized = geometries.map((g) => (g.index ? g.toNonIndexed() : g));
  return new THREE.Mesh(mergeGeometries(normalized, false), material);
}
```

Normalize indexed and non-indexed geometry before merging. Mixing
`BoxGeometry` (indexed) with `ExtrudeGeometry` (non-indexed) otherwise fails.

## Lofted hull / fuselage

A hull is a set of cross-section rings along the long axis. Each ring is a
sequence of points from port deck edge down around the keel to starboard top.

```js
function loft(stations, ringFn) {
  const pos = [], uv = [], idx = [];
  const rings = stations.map(ringFn);
  const ringN = rings[0].length;

  rings.forEach((ring, i) => {
    ring.forEach(([x, y, z], j) => {
      pos.push(x, y, z);
      uv.push(i / (rings.length - 1), j / (ringN - 1));
    });
  });

  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < ringN - 1; j++) {
      const a = i * ringN + j;
      const b = (i + 1) * ringN + j;
      const c = (i + 1) * ringN + j + 1;
      const d = i * ringN + j + 1;
      idx.push(a, b, d, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
```

For a carrier, use stations along X with half-widths at top/waterline and a keel
Y. For an aircraft fuselage, use elliptical rings along X. For a car, use
superellipse cross-sections.

Add cut-outs by skipping quads in the index loop and then adding a framed border
around the opening. A cutaway must look deliberate; add a dark frame, a thin
emissive edge and an interior floor/wall behind it.

## Plan-shape deck with holes

```js
function shapeFromPlan(points /* [x,z] */) {
  const s = new THREE.Shape();
  points.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  s.closePath();
  return s;
}

const geom = new THREE.ShapeGeometry(shape, 12);
geom.rotateX(-Math.PI / 2);
// Override ShapeGeometry UVs with world-normalized UVs.
```

For elevator holes, add `THREE.Path` holes. Keep every hole fully inside the
outer contour. The top surface is a separate `ShapeGeometry` so you can put a
canvas markings texture on it; the slab below can be dark steel.

For a trapezoid bow, use a small number of intentional points. A long curved
point list tends to render as a rounded bullet. The CVN-78 correction keeps a
flat leading edge and two long straight chamfers.

## Canvas textures

```js
function canvasTexture(w, h, draw, { repeat = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
```

Use textures for readable content: panel seams, deck lines, radar grids,
grilles, hazard stripes, labels, screens. Set `anisotropy` on the deck and
hull textures. Avoid 4K canvases unless the camera gets close enough to justify
the memory.

For deck markings, draw a transparent canvas containing only the paint and put
it on a second `ShapeGeometry` 0.03–0.06 m above the base deck. Then the deck
base and the markings can be picked/exploded separately if desired.

## Environment and lights

Create a procedural equirectangular canvas, then run it through
`PMREMGenerator.fromEquirectangular`. Do not load an HDR.

Lighting that reads well on dark technical scenes:

- Hemisphere or ambient cool fill.
- One neutral key from the upper front.
- One broad fill from the camera side.
- One cool rim from behind.
- Small point lights for hangars, cabins, reactor rooms.

Keep the model brighter than the background. If the model looks black, raise
neutral fill and lighten the base material before adding bloom.

## Selection outline and bloom

```js
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outline = new OutlinePass(size, scene, camera);
outline.edgeStrength = 3.2;
outline.edgeGlow = 0.35;
outline.visibleEdgeColor.set(0x8eefff);
composer.addPass(outline);

const bloom = new UnrealBloomPass(size, 0.34, 0.56, 0.94);
composer.addPass(bloom);
composer.addPass(new OutputPass());
```

Use `outline.selectedObjects = part.meshes` for selected + hovered parts.
Keep bloom threshold high and emissive intensities restrained. A pulsing
`Sprite` halo and a small `PointLight` at the selected part anchor read better
than cranking bloom.

## Picking and hover

```js
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pick(ev) {
  const r = canvas.getBoundingClientRect();
  pointer.set(
    ((ev.clientX - r.left) / r.width) * 2 - 1,
    -((ev.clientY - r.top) / r.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  for (const h of hits) {
    const id = h.object.userData.pickPart;
    if (id) return parts.get(id);
  }
  return null;
}
```

Set `userData.pickPart` on every pickable mesh by walking to its **nearest**
part root. Throttle hover raycasts to ~20 Hz. Disable raycast on window glass
that would otherwise block the consoles behind it:

```js
glass.raycast = () => {};
```

## Labels with leader lines

Use DOM labels, not `Sprite` text, for crisp type:

```js
const screen = world.clone().project(camera);
const x = (screen.x * 0.5 + 0.5) * innerWidth;
const y = (-screen.y * 0.5 + 0.5) * innerHeight;
```

Position each label box at `x + dx, y + dy`, clamp it inside a safe viewport
area, and draw a line from the anchor to the nearest box edge in SVG. Hide
labels when projected z is outside `[-1, 1]`.

Add a simple collision relaxation: sort by y and push overlapping boxes down,
then clamp to the visible area. Avoid putting labels over the side panels.

## Explosion tween

```js
const from = rec.t;
const to = 1;
const start = performance.now();
const duration = 1100;

function update(now) {
  const raw = Math.min(1, (now - start) / duration);
  const e = 1 - Math.pow(1 - raw, 4); // outQuart
  rec.t = from + (to - from) * e;
  rec.group.position
    .copy(rec.basePosition)
    .addScaledVector(rec.explodeVector, rec.t);
}
```

Store one vector per part. For nested parts, the child inherits the parent's
world movement automatically; do not manually add parent offsets.

Use a progress label that reflects the active parts, not `expanded / total`,
which reads as 2% when a single part is open.

## Camera framing and focus

For a selected part, frame its **predicted final** position, not the current
in-flight bounding box:

```js
const box = new THREE.Box3().setFromObject(part.group);
const remaining = part.target - part.t;
box.translate(new THREE.Vector3(...part.data.explode).multiplyScalar(1.5 * remaining));
const sphere = box.getBoundingSphere(new THREE.Sphere());
```

Compute both vertical and horizontal fit distances:

```js
const vFov = THREE.MathUtils.degToRad(camera.fov);
const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
const dist = Math.max(
  radius / Math.sin(vFov / 2),
  radius / Math.sin(hFov / 2),
) * margin;
```

For portrait screens, pull the home camera back:

```js
const homeScale = Math.max(1, 1.1 / camera.aspect);
```

A 337 m ship at 1600×900 fits around 440 m distance; at 390×844 it needs about
1050 m. Test both.

## Performance

- Merge small static geometry by material.
- Use `InstancedMesh` for repeated aircraft, tie-downs, lights, bolts, trees,
  bollards and windows.
- Use `THREE.LOD` for repeated aircraft or other complex repeated assets.
- Keep pixel ratio at `min(devicePixelRatio, 1.7)`, lower on weak GPUs.
- Lower bloom resolution/strength on mobile.
- Warm the composer before revealing the page:

```js
renderer.compile(scene, camera);
stage.render(); // compile bloom/outline/output passes while loader is visible
```

- Avoid creating a new material per mesh. Reuse a material library.
- Avoid one draw call per bolt; instancing is almost always better.

## Common pitfalls

- `ExtrudeGeometry` is non-indexed while `BoxGeometry` is indexed. Normalize
  before merging.
- `LineBasicMaterial` is not affected by `wireframe`; filter materials when
  toggling wireframe.
- Transparent glass blocks picking; mark window glass with a no-op `raycast`.
- Point lights in physically correct rendering need much higher intensity than
  old Three.js examples; test visually.
- The first composer render compiles postprocessing shaders and can freeze the
  loader. Warm it before the reveal.
- A canvas texture with `flipY` needs consistent UV orientation; draw a test
  grid and verify on the deck before adding fine markings.
- A camera directly above the model needs a stable up vector or the screen
  orientation will be arbitrary.
- Mobile CSS panels can have `pointer-events: auto` even when translated off
  screen; explicitly set `pointer-events: none` for closed drawers.
- Text gets corrupted if you edit UTF-8 source through a non-UTF-8 shell tool.
  Keep source files UTF-8 and scan for the U+FFFD replacement character before
  building.

## Recommended draw budget

| Metric | Target |
|---|---|
| Interactive parts | 20–80 |
| Draw calls | < 350 |
| Triangles | < 1.5 M |
| Texture memory | < 64 MB |
| Bundle size | < 1.5 MB (minified HTML) |
| Desktop frame rate | 50–60 fps at 1600×900 |
| Mobile frame rate | 30–60 fps at 390×844 |
