# Reference Research

The quality ceiling is set before the first `BoxGeometry`. Spend the time here.

## 1. Collect four kinds of images

For a physical object, collect:

1. **Plan / top view** — the single most important silhouette.
2. **Profile / side view** — height, overhangs, wheel or shaft positions.
3. **Front / rear view** — width, symmetry and major openings.
4. **Three-quarter or in-context photo** — materials, color and detail density.

A blueprint or engineering drawing beats a beauty shot. A photo taken from a
similar angle to your intended hero camera is useful for lighting.

If the user supplied images, do not substitute your own mental image. If the
images conflict, state which one you prioritized and why.

## 2. Extract dimensions

Find 3–6 anchor dimensions from public sources:

- Overall length / diameter / height.
- Width, beam or track.
- Major internal volumes.
- Mass / capacity, if it affects labels.

Normalize to a coordinate system. For a 337 m ship, 1 unit = 1 m. For a 30 cm
camera lens, use 1 unit = 1 cm or 1 m with a scaled-down scene; pick one and
write it down.

Use `≈` for rounded data. If a number is classified, unknown or invented, say so
in the dossier footer.

## 3. Trace the silhouette as numbers

Do not model the hull/deck/canopy by eye directly in 3D. First write the plan
outline as an array of `[x, z]` points:

```js
const OUTLINE = [
  [175, 10], [120, 38], [110, 38], [20, 38], ...
];
```

Then check the ratio of key widths and lengths:

- Bow width / max width.
- Nose length / overall length.
- Cockpit position / wheelbase.
- Turret ring position / hull length.

This catches the "pointed bow vs trapezoid bow" class of error before materials.

For a profile, write key heights at stations and compare the side silhouette.
For a complex object, make a rough 2D SVG overlay on top of the reference to
check proportions.

## 4. Build a subsystem map from references

For each reference image, label the visible components. Then group them into
5–9 systems. The groups should be legible when exploded, not a scientific
taxonomy.

Example for a tank:

- Hull and armor
- Turret and fire control
- Main gun and breech
- Powerpack and cooling
- Running gear and suspension
- Crew compartment and stowage

The explosion should reveal relationships (gun → turret → hull; engine →
transmission → final drives → tracks), not just separate every mesh.

## 5. Reference board and honesty

Keep a local `REFERENCES.md` with URLs/description and what each informed. Do
not commit copyrighted reference images into a public repo unless you have the
rights. Use them as private tracing aids.

In the final README, include:

- What references informed the model.
- What is intentionally simplified.
- Which numbers are estimates.

## 6. The "compare, don't defend" loop

When a user says the shape is wrong:

1. Take a top view and a front/side view of the current model.
2. Put the reference and render side by side at the same orientation.
3. Compare the outline point-by-point.
4. Change the numbers in the data/layout module.
5. Rebuild and compare again.

Never argue from the code. The screenshot is the truth.

## 7. Search terms that work

- `<object> orthographic drawing`
- `<object> blueprints side view top view`
- `<object> technical manual cutaway`
- `<object> dimensions`
- `<object> walkaround`
- `<object> exploded diagram`
- For ships: `<hull number> deck plan`, `<class> general arrangement`
- For aircraft: `<type> three-view drawing`
- For machines: `<model> parts diagram`, `<model> service manual`

Check the provenance of numbers. Fan wikis are useful for names, less so for
dimensions; manufacturer data and museum pages are better.

## 8. When references are unavailable

State the ambiguity and build a plausible design language. Pick a recognizable
archetype, use canonical proportions, and label the output as a concept or
stylized interpretation. Do not pretend a fictional design is an exact replica.
