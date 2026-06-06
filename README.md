# 🚀 SparkDev Pro: The Unified Developer Workspace

[![Version](https://img.shields.io/badge/version-1.6.0-cyan.svg)](https://github.com/developersakibur/sparkdev-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Chrome%20|%20Edge-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)

**SparkDev Pro** is a high-performance, modular toolkit designed for modern web developers and designers. It unifies essential tools—fluid typography generation, image optimization, SVG modulation, advanced text transformation, and WordPress administration—into a single, professional workspace.

---

## 💎 Core Modules

### 1. 📐 Clamp Generator (Fluid Typography)
An advanced tool for creating perfectly fluid design systems using the CSS `clamp()` function.
*   **Linear Mapping Engine:** Automatically suggests Min/Max values based on professional design ratios.
*   **Negative Support:** Full support for negative fluid design (margins/offsets) with professional `calc(-1 * clamp())` output.
*   **Dynamic Preview Slider:** Test your fluid values in real-time across a customizable viewport range.
*   **Presets:** Independent "Text" and "Spacing" configurations that persist across sessions.

### 2. 🖼️ WebP Pro (Batch Optimizer)
High-efficiency image conversion and compression powered by `OffscreenCanvas`.
*   **Intelligent Compression:** Uses binary-search logic to hit specific KB targets while maximizing quality.
*   **Batch Processing:** Drag and drop multiple images for simultaneous conversion.
*   **ZIP Management:** Bundles optimized assets into a single archive with custom prefix naming.
*   **Live Dashboard:** Real-time summary showing total files, original weight, and storage space saved.

### 3. 🛡️ SVG Vault (Icon Modulator)
Transform flat icons into brand-ready assets in seconds.
*   **Shape Morphing:** Wrap any SVG path into **Polygons** (Square, Circle, Shield) or organic **Blobs**.
*   **Advanced Backgrounds:** Support for solid colors and complex gradients (Linear/Radial) with opacity control.
*   **Visual Filters:** Native SVG `feDropShadow` integration with blur, offset, and flood-opacity controls.
*   **Smart Aspect Ratio:** Lock or unlock aspect ratios for precise sizing control.

### 4. 🔠 Text Transformer (Case Converter)
A professional-grade text processing suite for copywriters and developers.
*   **8 Conversion Modes:** Sentence case, lower case, UPPER CASE, Capitalized Case, Title Case (with smart word filtering), aLtErNaTiNg cAsE, InVeRsE CaSe, and URL Slug-ify.
*   **Live Statistics:** Real-time character and word counting.
*   **Persistence:** Automatically saves your last input to namespaced storage.

### 📝 SparkPad (Rich Note Manager)
A dedicated document editor for capturing client requirements and project notes.
*   **Rich Formatting:** Support for Bold, Italic, Underline, and custom Text Coloration.
*   **Document Structure:** Easily create bullet lists and insert hyperlinks.
*   **Auto-Persistence:** Your notes are saved instantly as you type.
*   **HTML Export:** Download your formatted notes as .html files for sharing.

### 🎨 Color (Advanced Picker & Palette)
*   **Dual-Mode Picking:** Choose between the native **EyeDropper API** (for quick picking) or the **Advanced Live Picker** (for zoomed, high-precision selection).
*   **History & Favorites:** Store the last 20 picked colors. Features drag-and-drop reordering for favorites and custom naming (e.g., "Brand Primary").

### 🔍 Font (Advanced Finder)
Identify and analyze typography on any webpage with surgical precision.
*   **Shadow DOM Isolation:** UI is encapsulated to prevent style conflicts with host sites.
*   **Pinned Cards:** Capture and compare multiple font data cards simultaneously.

### ⚡ WP Quick Tools
*   **No-Cache (NC) Tools:** Bypass server-side caches using aggressive 50-character random strings and timestamped versions.
*   **Elementor Optimization:** Toggle the Elementor loader panel visibility per-domain.
*   **Environment Toggling:** Fast access to `/wp-admin/`, site-health, and diagnostic tools.

---

## 📖 User Guide: How to Use SparkDev Pro

### 📐 Clamp Generator
1.  **Input:** Enter your **Max Size** first. The tool will automatically suggest a **Min Size** based on your selected type (Text or Spacing).
2.  **Adjust:** Change the Viewport Min/Max widths in the config panel (cog icon).
3.  **Preview:** Use the slider at the bottom to see how the value scales between your viewport limits.
4.  **Copy:** Click the result box to copy the `clamp()` or `calc(-1 * clamp())` code.

### 🖼️ WebP Pro
1.  **Upload:** Drag images into the dashed area or click to browse.
2.  **Configure:** Set your **Target Quality** and **Max Size (KB)**. The engine will find the best compression to stay under your limit.
3.  **Zip:** Enable the "Zip Toggle" to download all processed images as a single `.zip` file. You can set a custom filename prefix.
4.  **Convert:** Hit "Convert & Download" to process all images.

### 🛡️ SVG Vault
1.  **Paste:** Drop your raw SVG code into the input area.
2.  **Style:** 
    *   **Icon:** Enable "Icon Color" to force a specific color onto all SVG paths.
    *   **Shape:** Choose between **Polygon** (set sides and roundness) or **Blob** (set complexity and contrast). Use "Shuffle" for new blob variations.
    *   **Background:** Toggle gradients and adjust angles/stops for a premium look.
3.  **Export:** Copy the resulting SVG code or download it directly as a `.svg` file.

### 🔠 Text Transformer
1.  **Paste:** Type or paste your text into the main area.
2.  **Convert:** Click any case button (e.g., "Title Case", "Slug"). The converted text is **automatically copied** to your clipboard.
3.  **Download:** Use the download icon to save your transformed text as a `.txt` file.

### 🎨 Color Picker
1.  **Pick:** Click "Pick Color". 
    *   *Default:* The popup shrinks, and the cursor becomes a crosshair.
    *   *Advanced:* If enabled in Settings, a live magnifying glass appears on the page.
2.  **Manage:** In the history table, you can **Drag** the handle to reorder, click the **Heart** to favorite, or **Name** the color for future reference.
3.  **Clean:** Use the trash icon at the top to clear all non-favorited history.

### ⚡ WP Quick Tools
1.  **Shortcuts:** Click "WP-Admin" to jump to the dashboard of the current site.
2.  **No-Cache:** Use "NC Normal" or "NC Incognito" to open the current page with cache-busting parameters (`?nc=...&ver=...`).
3.  **Diagnostics:** Use "Speed" (Google PageSpeed) or "DNS" to analyze the current domain instantly.
4.  **Tab Position:** Use the "Before/After" toggle to control where new tabs opened by this tool appear.

### 🔍 Font Finder
1.  **Activate:** Switch to the Font tab and click "Enable Font Finder".
2.  **Inspect:** Hover over any text on the page to see its properties.
3.  **Pin:** Click on an element to pin a permanent data card. You can pin multiple cards to compare styles.

---

## ⚙️ Global Preferences (Settings)
*   **Advanced Color Picker:** Enables a zoomed, high-precision picker instead of the native browser dropper.
*   **Copy Link Text:** Adds a "Copy Link Text" option to your browser's right-click menu when clicking on links.
*   **Enable Right-Click:** Force-enables the right-click menu on websites that attempt to disable it.

---

## 🏗️ Technical Architecture

### UI Framework (ITCSS + BEM)
*   **Inverted Triangle CSS:** Follows a strict hierarchy (Settings → Generic → Layout → Components → Utilities).
*   **Namespaced BEM:** All components use the `sd-c-*` prefix to prevent collisions.

### Performance & Scalability
*   **Dynamic Lazy-Loading:** Modules are loaded "Just-in-Time" when activated, keeping the initial memory footprint low.
*   **Service Worker Migration:** Automatic storage cleanup and migration logic handles legacy data formats during updates.

---

**License**: MIT | Built with ❤️ for the Developer Community.
