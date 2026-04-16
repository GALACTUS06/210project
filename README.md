# Misinformation-Disinformation Flowchart Website

A simple, clean, interactive flowchart website using a linear tree-style storyline.

Main path:

Fact -> Mishearing -> Propagation -> Amplification -> Public Reaction -> Correction

Users can move linearly with Previous/Next or jump to any stage from the sidebar.

## Features

- Pure HTML, CSS, JavaScript
- No frameworks
- No Cytoscape.js
- Linear flow rendered with standard DOM boxes and arrows
- Sidebar jump navigation for all nodes
- Previous/Next storyline controls
- Current node highlighting in both sidebar and path tracker
- Labeled transitions between stages in the visible flow track
- Research overview cards for presentation-ready context
- Smooth card transitions
- Responsive desktop/mobile layout
- Optional light/dark mode toggle
- Keyboard navigation with Left/Right arrows
- Accessible labels and alt text
- Data-driven content from `content/nodes.json`
- Local file fallback via `content/nodes.js`
- Includes a full annotated-bibliography test content pack (8 sources with summaries, credibility, and project-use notes)

## Project Structure

```text
index.html
styles.css
src/
  app.js
content/
  nodes.json
  nodes.js
assets/
  icons/
    info.svg
  illustrations/
    fact.svg
    mishearing.svg
    propagation.svg
    manipulation.svg
    fabrication.svg
    amplification.svg
    public-reaction.svg
    correction.svg
.github/
  workflows/
    deploy.yml
README.md
presentation.md
CONTRIBUTING.md
EXTENDING.md
```

## Run Locally

Recommended: run with a local web server.

Note: opening `index.html` directly also works because of the embedded fallback data in `content/nodes.js`.

### Option A: VS Code Live Server

1. Install the Live Server extension.
2. Right-click `index.html`.
3. Select "Open with Live Server".

### Option B: Python HTTP Server

```bash
python -m http.server 5500
```

Then open http://localhost:5500.

## Content Model

All flowchart content lives in `content/nodes.json`:

- `sources`: citation dictionary used by UI
- `nodes`: each stage (definition, example, sources, illustration)
- `edges`: linear transitions in the storyline

The linear flow UI renders directly from this JSON model.

## Accessibility Notes

- Sidebar buttons and flow controls include accessible labels
- Left/Right keyboard arrows map to Previous/Next
- Active step state is announced through live status text
- All illustrations have descriptive alt text

## Citation Basis (Annotated Bibliography)

- Vosoughi et al. (2018)
- Wardle & Derakhshan (2017)
- Ferreira Caceres et al. (2022)
- Pew Research Center (2019)
- Denniss & Lindberg (2025)
- Broda & Stromback (2024)
- Lewandowsky et al. (2012)
- Benkler et al. (2018)

## Deployment to GitHub Pages

A deploy workflow is included at `.github/workflows/deploy.yml`.

To activate deployment:

1. Push this project to a GitHub repository.
2. In GitHub, open Settings -> Pages.
3. Set Source to "GitHub Actions".
4. Push to `main` branch to trigger deployment.
