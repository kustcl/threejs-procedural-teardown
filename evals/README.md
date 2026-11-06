# Evaluations

These prompts are intended for manual or harness-driven evaluation. They cover:

1. A military vehicle with strong silhouette constraints.
2. A consumer product in Chinese with explicit asset constraints.
3. An organic/anatomical subject with a different classification system.
4. A large technical object that tests internal bay and deck structure.

## Running manually

1. Install the skill in your agent's skills directory.
2. Give the agent one prompt from `evals.json`.
3. Require a built HTML plus overview, exploded, top and mobile screenshots.
4. Grade with `references/qa-checklist.md`.
5. Compare against the baseline (same prompt, no skill) if you are benchmarking.

## Useful objective checks

- Built HTML is self-contained; `validate.mjs` passes.
- No page errors in the screenshot harness.
- At least 20 named interactive parts and 5 systems.
- Part tree search returns results in Chinese and English.
- Clicking a part changes its position and opens a dossier.
- `Locate` frames the selected part without clipping.
- Mobile screenshot shows the whole object.
- The top view matches the reference silhouette.
- Labels can be toggled and remain inside the viewport.
