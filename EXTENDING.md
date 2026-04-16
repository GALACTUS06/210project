# Extending the Flowchart

This file explains how to add new nodes, relationships, and content without changing the linear storyline architecture.

## 1) Add a New Source

Open `content/nodes.json` and add an entry to `sources`:

```json
"NewSource2026": {
  "shortCitation": "Author et al. (2026) - Topic",
  "url": "https://example.com/source"
}
```

Use stable keys so nodes can reference sources consistently.

## 2) Add a New Node

Append a new object to the `nodes` array:

```json
{
  "id": "verification",
  "title": "Verification",
  "group": "correct",
  "definition": "2-3 sentence definition.",
  "example": "One concrete real-world example.",
  "sources": ["NewSource2026"],
  "whyMatters": "Short why-this-matters line.",
  "illustration": "assets/illustrations/verification.svg",
  "illustrationAlt": "Accessible alt text for illustration"
}
```

Required fields:

- `id` unique slug used by edges
- `title` display label
- `group` one of: `fact`, `transform`, `impact`, `correct`
- `definition` 2-3 sentences
- `example` one real-world case
- `sources` 1-2 source keys
- `whyMatters` one concise impact statement
- `illustration` valid file path
- `illustrationAlt` meaningful alt text

## 3) Add an Edge

Append to the `edges` array:

```json
{
  "id": "e11",
  "source": "verification",
  "target": "correction",
  "label": "supports debunking"
}
```

Rules:

- `source` and `target` must match existing node `id` values
- keep IDs unique
- use short labels for readability

For the current website, the main displayed path is controlled in `src/app.js` through the `MAIN_PATH_IDS` array. If you add a new step to the visible storyline, also insert its `id` into that array in the correct order.

## 4) Add Illustration File

Create an SVG in `assets/illustrations` and reference it in the node.

Tips:

- keep width/height around 800x400 for consistent stage illustration display
- keep contrast high for both light and dark themes
- keep visuals simple and thematic

## 5) Optional Styling Extensions

Use CSS variables in `styles.css` to theme new categories.

If adding a new node group:

1. Add matching chip or card styling in `styles.css`
2. Update any group label handling in `src/app.js`
3. Update sidebar or summary UI in `index.html` if the new group should be visible there

## 6) Optional Interaction Extensions

Potential improvements:

- filter controls by group
- jump-to-source search
- source-level search
- timeline mode for event-driven outbreaks

- optional side branches for fabrication and manipulation

Most of these can be added inside `src/app.js` while keeping `nodes.json` as the single source of truth.
