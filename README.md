# 🚀 SparkDev Pro: The Unified Developer Workspace

[![Version](https://img.shields.io/badge/version-1.3.0-cyan.svg)](https://github.com/developersakibur/sparkdev-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Chrome%20|%20Edge-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)

**SparkDev Pro** is a high-performance, modular toolkit designed for modern web developers and designers. It unifies essential tools—fluid typography generation, image optimization, SVG modulation, and WordPress administration—into a single, professional workspace.

---

## 💎 Core Modules

### 1. 📐 Clamp Generator (Fluid Typography)
An advanced tool for creating perfectly fluid design systems.
- **Linear Mapping Engine:** Automatically suggests Min/Max values based on professional design ratios.
- **Negative Support:** Full support for negative fluid design (margins/offsets) with professional `calc(-1 * clamp())` output.
- **Infinite Scroll:** Frictionless input management with mouse-wheel support starting from industry defaults.
- **Presets:** Independent "Text" and "Spacing" configurations that persist across sessions.

### 2. 🖼️ WebP Pro (Batch Optimizer)
High-efficiency image conversion powered by `OffscreenCanvas`.
- **Intelligent Compression:** Uses binary-search logic to hit specific KB targets while maximizing quality.
- **Standardized Naming:** Filenames follow `[name]_YYYY-MM-DD_HH-MM-SS` format with automatic special character cleaning.
- **ZIP Management:** Bundles optimized assets into a single archive with custom prefix naming (e.g., `prefix_YYYY-MM-DD.zip`).
- **Live Summary:** Real-time dashboard showing total files, original weight, and storage space saved.

### 3. 🛡️ SVG Vault (Icon Modulator)
Transform flat icons into brand-ready assets in seconds.
- **Container Shaping:** Wrap any SVG path into Square, Squircle, Circle, or Shield geometries.
- **Dynamic Coloration:** Automatically parses and replaces fill/stroke attributes with your primary brand colors.
- **Visual Filters:** Native SVG `feDropShadow` integration with blur and offset controls.
- **Export Ready:** One-click Copy-to-Clipboard or `.svg` download.

### 4. ⚡ WP Quick Tools
The Swiss-army knife for WordPress developers.
- **Intelligent Tab Indexing:** Choose to open new tools "Before" or "After" the current tab using native Chrome indexing logic.
- **Elementor Optimization:** Per-domain persistence for hiding the Elementor loader panel.
- **Environment Toggling:** Fast access to `/wp-admin/`, migration tools, and site-health diagnostics.
- **Instant Diagnostics:** Built-in deep links to Google PageSpeed and DNS propagation checkers.

### 5. 🔑 Pass Gen
Secure, entropy-based credential generator.
- **Extended Security:** Support for up to 128-character complex passwords.
- **Settings Persistence:** Automatic local storage save for length and character set preferences.
- **Interactive UI:** Responsive box-type design with mouse-wheel support for length adjustment and instant regeneration.
- **Visual Feedback:** Clipboard confirmation with color-coded success states.

---

## 🛠️ Technical Architecture

SparkDev Pro is built with a focus on performance, scalability, and clean data management.

### 🏗️ UI Framework (ITCSS + BEM)
The extension uses a professional CSS architecture following the **Inverted Triangle CSS** methodology:
- **01 Settings:** Global tokens and brand variables.
- **02 Generic:** Resets and base element styling.
- **03 Layout:** Flexible grid and shell management.
- **04 Components:** Modular, BEM-namespaced UI elements (`sd-c-*`).
- **05 Utilities:** High-specificity helper classes (`sd-u-*`).

### 💾 Namespaced Storage
Data is managed via a **Professional Namespaced Architecture** in `chrome.storage.local`:
- **`app_state`:** Global UI preferences (active tabs, feature order).
- **`mod_*`:** Isolated storage for each module, preventing key collisions and enabling atomic updates.

---

## 🚀 Installation & Development

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/developersakibur/sparkdev-pro.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** (top right).
4. Click **"Load unpacked"** and select the project directory.

### Project Structure
```text
├── core/           # Tab management, Background workers, Content scripts
├── modules/        # Isolated features (HTML/JS/CSS per tool)
├── assets/         # Icons, Libraries (JSZip, etc.)
└── styles/         # ITCSS Framework
```

---

## 🤝 Contribution
Contributions are what make the developer community such an amazing place.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**License**: MIT | Built with ❤️ for the Developer Community.
