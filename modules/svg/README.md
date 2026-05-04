# SVG Vault Module

## Features
- Paste SVG code to preview.
- Override icon color (supporting `currentColor`).
- Override icon size with aspect ratio lock.
- Add background shapes (Square, Circle, Squircle, etc.).
- Customize background: Gradient, Opacity, Rotation, Padding.
- Add Stroke and Shadow to the background.
- Export as optimized SVG or high-quality PNG.

## Implementation Notes
- Logic is isolated in `script.js` using an IIFE.
- Styles are scoped to `#tab-svg` in `style.css`.
- Uses Canvas API for composite rendering and PNG export.
- Generates SVG path data dynamically for background shapes.
