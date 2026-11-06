# Prompt Template

Use this when the user gives a thin brief and you need to lock the production
scope. Fill it in yourself from context; do not make the user answer every line.

```text
SUBJECT
  Object:
  Variant / era:
  Primary references:
  Must-have recognizable features:

STRUCTURE
  Natural systems (5–9):
  Required internal parts:
  Repeatable details / instanced elements:
  Known dimensions:
  Uncertain or classified values:

INTERACTION
  Click to explode + dossier: yes
  Hover highlight / tooltip: yes
  Part tree + search: yes
  Labels toggle: yes
  Expand all / collapse all / reset: yes
  Wireframe / auto-rotate: yes
  Locate camera: yes
  Mobile support: yes

VISUAL
  Palette:
  Mood/reference:
  Background:
  Accent:
  Label style:
  HUD style:

DELIVERY
  Single offline HTML: yes
  Source folder: yes
  Screenshots: overview / top / exploded / selected / mobile
  Notes: intentional simplifications and estimate disclosures
```

## Example filled brief — main battle tank

```text
SUBJECT
  Object: Leopard 2A7 main battle tank
  References: three-view drawing, walkaround photos, public dimensions
  Features: arrow-shaped turret, 120 mm smoothbore, side skirts,
            leopard-pattern camo, rear powerpack

STRUCTURE
  Systems: hull & armour / turret & fire control / main gun / powerpack /
           running gear / crew & stowage
  Required parts: glacis, driver hatch, turret shell, gun mantlet, barrel,
                  thermal sight, commander sight, engine, transmission,
                  tracks, road wheels, side skirts, bustle rack
  Dimensions: 7.93 m hull length, 3.75 m width, 3.0 m height (approx.)
  Estimates: engine output and armour values are public estimates

INTERACTION
  Standard contract. Click turret/gun/engine/tracks individually.
  Explode: turret up, gun forward, powerpack up/aft, wheels outward.

VISUAL
  Palette: olive drab / graphite / amber warning accents
  Background: dark technical grid and soft fog
  HUD: glass panels with stencil type and a single warm accent
```

## Example filled brief — espresso machine

```text
SUBJECT
  Object: dual-boiler prosumer espresso machine
  References: front/side product photos, parts diagram, dimensions
  Features: group head, portafilter, steam wand, PID display, drip tray,
            two boilers, pump, water tank

STRUCTURE
  Systems: body panels / water circuit / boilers / group head / grinder /
           controls & electronics
  Dimensions: 35 × 45 × 40 cm; use 1 unit = 1 cm
  Visual: brushed steel, black glass, warm copper boiler, cool screen glow

INTERACTION
  Standard contract. Explode panels outward, boilers up, group head and wand
  forward, water tank rearward.
```

## What makes a good object brief

- One variant, not a vague family.
- A silhouette-defining feature called out.
- A plausible set of systems.
- At least one source of dimensions.
- A clear art direction.
- A known level of simplification.
