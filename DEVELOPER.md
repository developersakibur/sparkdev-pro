# Developer Documentation

Welcome to the **Dev Toolbox Pro** project. This document explains the architecture and how to add or update features.

## Project Structure

- `assets/`: Global assets like icons and third-party libraries (`jszip`).
- `core/`: Fundamental extension logic (Background service workers, content scripts, and the tab manager).
- `modules/`: Each tool is isolated in its own folder.
  - `script.js`: Logic wrapped in an IIFE to prevent global scope pollution.
  - `style.css`: Scoped using `#tab-id` prefixes to prevent styling conflicts.
  - `README.md`: Feature-specific user guide.

## How to Add a New Tab

1. **Create a Module Folder**: Add a new folder in `modules/` (e.g., `modules/my-tool/`).
2. **Add Content to `popup.html`**:
   - Add a new `<button>` to `.tabs-nav`.
   - Add a new `<div id="tab-my-tool" class="tab-content">` for your UI.
   - Link your new CSS and JS at the bottom.
3. **Style Your Tool**: Prefix all CSS selectors in your `style.css` with `#tab-my-tool` to keep styles isolated.
4. **Write Your Logic**: Wrap your JavaScript in an IIFE:
   ```javascript
   (function() {
     // Your code here
   })();
   ```
5. **Update Manifest**: If your new tool requires additional permissions, add them to `manifest.json`.

## Best Practices
- **Isolation**: Never use global variables. Always scope your CSS.
- **Persistence**: Use `chrome.storage.local` or `chrome.storage.sync` for saving user settings.
- **Shared Assets**: Put reusable libraries in `assets/libs/`.
