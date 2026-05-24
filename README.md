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
*   **Container Shaping:** Wrap any SVG path into Square, Squircle, Circle, or Shield geometries.
*   **Dynamic Coloration:** Automatically parses and replaces fill/stroke attributes with brand colors.
*   **Visual Filters:** Native SVG `feDropShadow` integration with blur and offset controls.

### 4. 🔠 Text Transformer (Case Converter)
A professional-grade text processing suite for copywriters and developers.
*   **8 Conversion Modes:** Sentence case, lower case, UPPER CASE, Capitalized Case, Title Case (smart filtering), aLtErNaTiNg cAsE, InVeRsE CaSe, and URL Slug-ify.
*   **Live Statistics:** Real-time character and word counting.
*   **Persistence:** Automatically saves your last input to namespaced storage.
*   **Action Suite:** Quick Copy-to-Clipboard, Download as `.txt`, and Clear.

### 5. 🎨 Color (Advanced Picker & Palette)
A professional-grade color management system with screen-picking capabilities.
*   **EyeDropper API:** High-precision pixel picking from anywhere on your screen.
*   **Live Mode:** Interactive element highlighter to grab CSS background colors directly from the page.
*   **History & Favorites:** Store the last 20 picked colors with drag-and-drop reordering for favorites.
*   **Custom Naming:** Assign names to colors (e.g., "Brand Primary") for better organization.

### 6. 🔍 Font (Advanced Finder)
Identify and analyze typography on any webpage with surgical precision.
*   **Shadow DOM Isolation:** The UI is completely encapsulated, ensuring no style conflicts with host websites.
*   **Dual-Layer Positioning:** Hover tooltips follow the viewport, while pinned cards scroll naturally with content.
*   **Multi-Mode Pinning:** Capture and compare multiple font data cards simultaneously.
*   **Detailed Metrics:** View Family, Size, Weight, Line-height, and Hex color.

### 7. ⚡ WP Quick Tools
The Swiss-army knife for WordPress and Elementor developers.
*   **Aggressive NC Tools:** Bypass server-side caches (Cloudflare/Varnish) using a 50-character random string, timestamped versions, and debug parameters.
*   **Elementor Optimization:** Toggle the Elementor loader panel visibility per-domain.
*   **Environment Toggling:** Fast access to `/wp-admin/`, site-health, and diagnostic tools.
*   **Instant Diagnostics:** Built-in deep links to Google PageSpeed and DNS propagation checkers.

### 🔑 Pass Gen
Secure, entropy-based credential generator with visual feedback.
*   **Extended Security:** Support for up to 128-character complex passwords.
*   **Mouse-Wheel Support:** Intuitive length adjustment via scrolling.

---

## 🛠️ Technical Architecture

SparkDev Pro is built with a focus on performance, scalability, and clean data management.

### 🏗️ UI Framework (ITCSS + BEM)
The extension uses a professional CSS architecture:
*   **01 Settings:** Global tokens and brand variables.
*   **02 Generic:** Resets and base element styling.
*   **04 Components:** Modular, BEM-namespaced UI elements (`sd-c-*`).

### 🚀 Performance & Scalability
*   **Dynamic Lazy-Loading:** Module templates and scripts are loaded "Just-in-Time" when a tab is activated, reducing initial memory footprint.
*   **Modular Content Scripts:** Feature-specific logic (Font, Color, WebP) is split into isolated scripts for better stability and easier debugging.
*   **Service Worker Migration:** Heavy storage cleanup and migration logic run only during installation/updates via the background service worker.

### 💾 Namespaced Storage
Data is managed via a professional namespaced architecture in `chrome.storage.local`:
*   **`app_state`:** Global UI preferences.
*   **`mod_*`:** Isolated storage for each module (e.g., `mod_text`, `mod_clamp`).

---

## 🚀 Installation

### Local Setup (Developer Mode)
1. Clone the repository or download the folder.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** (top right).
4. Click **"Load unpacked"** and select the `sparkdev-pro` directory.

---

**License**: MIT | Built with ❤️ for the Developer Community.
