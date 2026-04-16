# Contributing Guide

Thank you for contributing to the misinformation-disinformation flowchart project.

## Contribution Principles

- Keep definitions accurate, neutral, and evidence-based.
- Use language that is clear to non-specialists.
- Connect every content claim to a source in `content/nodes.json`.
- Preserve accessibility for all UI changes.

## Quick Start

1. Fork and clone the repository.
2. Start a local server from project root.
3. Open the site and verify node interactions.
4. Create a feature branch.

## Recommended Workflow

1. Update content in `content/nodes.json` first.
2. Add or edit illustrations in `assets/illustrations`.
3. Adjust interaction code in `src/` only if needed.
4. Test on desktop and mobile viewport widths.
5. Verify keyboard-only stage navigation.
6. Submit a pull request with a clear summary.

## Pull Request Checklist

- [ ] Node content is complete and source-backed
- [ ] New citations added to `sources` dictionary
- [ ] Illustration files exist and alt text is meaningful
- [ ] No broken links in source URLs
- [ ] Previous/Next and sidebar navigation still work with keyboard
- [ ] Layout remains readable under 960px width

## Coding Standards

- Use vanilla HTML/CSS/JS (no heavy frameworks)
- Keep modules focused:
  - `app.js` for orchestration, loading, and linear navigation
- Prefer descriptive variable names over abbreviations
- Keep functions small and purposeful

## Reporting Issues

When opening an issue, include:

- expected behavior
- actual behavior
- browser and version
- viewport/device info
- screenshots or screen recording when possible

## Source Integrity

If a citation URL changes or a source is corrected:

1. Update only the relevant source entry in `content/nodes.json`.
2. Check all nodes that reference that source key.
3. Note the change in your pull request description.
