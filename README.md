# 🚀 SparkDev Pro: The Unified Developer Workspace

[![Version](https://img.shields.io/badge/version-1.7.0-cyan.svg)](https://github.com/developersakibur/sparkdev-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Chrome%20|%20Edge-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)

**SparkDev Pro** is a high-performance, modular toolkit designed for modern web developers and designers. It unifies essential tools into a single, professional, and customizable workspace.

---

## 🏗️ Smart Workspace (Customizable UI)
SparkDev Pro features a **Dynamic Module System**.
*   **Drag & Drop Reordering:** Tailor the home screen to your workflow. Long-press and drag any module card on the welcome page to change the default order of tabs and icons.
*   **Just-In-Time Loading:** Modules are loaded only when you need them, ensuring a lightning-fast and memory-efficient experience.
*   **Persistence:** Your custom module order and active tab state are automatically saved across browser sessions.

---

## 💎 Core Modules (01 - 10)

### 01. 📐 Clamp Generator (Fluid Typography)
Create perfectly fluid design systems using the CSS `clamp()` function.
*   **Features:** Linear mapping engine, negative value support (`calc(-1 * clamp())`), and a real-time viewport preview slider.
*   **How to Use:** Enter your **Max Size**; the tool suggests a **Min Size** based on your preset. Adjust viewport widths in the config panel (cog icon) and click the result to copy.

### 02. 🖼️ WebP Pro (Batch Optimizer)
High-efficiency batch image conversion and compression powered by `OffscreenCanvas`.
*   **Features:** Intelligent binary-search compression to hit specific KB targets, batch processing, and ZIP archive management.
*   **How to Use:** Drag and drop images into the optimizer, set your target Quality/Size, and hit "Convert & Download".

### 03. 🎨 Color (Advanced Picker)
A high-precision color management suite.
*   **Features:** Dual-mode picking (Native EyeDropper or Zoomed Live Picker), 20-slot history, favorites management, and custom color naming.
*   **How to Use:** Click "Pick Color" to sample from any webpage. Use the history table to favorite or rename colors for your brand palette.

### 04. 🔍 Font (Style Finder)
Identify and analyze typography on any webpage with surgical precision.
*   **Features:** Shadow DOM isolation to prevent style leaks, hover inspection, and "Pinned Cards" for comparing multiple fonts.
*   **How to Use:** Enable the finder and hover over text. Click to pin a style card for permanent reference during your design process.

### 05. ⚡ WP Tools (Quick Shortcuts)
A dedicated toolkit for WordPress administrators and developers.
*   **Features:** Aggressive cache-busting (No-Cache visit), Elementor loader toggling, and instant access to diagnostic tools (PageSpeed, DNS).
*   **How to Use:** Click "WP-Admin" to jump to the dashboard or use "NC Normal" to view the current page with fresh parameters.

### 06. 🛡️ SVG Vault (Icon Modulator)
Transform flat icons into brand-ready assets in seconds.
*   **Features:** Shape morphing (Polygon/Blob), advanced gradients (Linear/Radial), and native SVG filters (Shadow/Blur).
*   **How to Use:** Paste your raw SVG code, choose a background shape or filter, and export the optimized SVG code or file.

### 07. 🔠 Text Transformer (Case Converter)
Professional-grade text processing for copywriters and developers.
*   **Features:** 8 conversion modes (Sentence, Title Case, Slug-ify, etc.) and real-time character/word statistics.
*   **How to Use:** Paste text into the workspace and click any conversion button; the result is automatically copied to your clipboard.

### 08. 📝 SparkPad (Rich Note Manager)
A dedicated document editor for capturing requirements and project ideas.
*   **Features:** Rich text formatting (Bold, Italic, Colors), bullet lists, auto-persistence, and HTML export.
*   **How to Use:** Type freely; your notes save instantly. Use the export icon to download your notes as a formatted `.html` file.

### 09. 🔑 Pass (Secure Generator)
Generate cryptographically secure passwords and keys.
*   **Features:** Customizable length, character sets (Uppercase, Numbers, Symbols), and one-click copy.
*   **How to Use:** Adjust your security requirements using the toggles and click the generated string to copy it securely.

### 10. ⚙️ Settings (App Preferences)
Global controls for your workspace experience.
*   **Features:** Toggle the Advanced Picker, enable right-click bypass, and manage "Copy Link Text" context menu integration.
*   **How to Use:** Adjust toggles to customize how SparkDev Pro interacts with the websites you visit.

---

## 🏗️ Technical Architecture
*   **UI Framework:** Strictly follows **ITCSS** (Settings → Generic → Layout → Components → Utilities) with **BEM** namespacing (`sd-c-*`).
*   **Performance:** Utilizes Service Workers and `OffscreenCanvas` for heavy computations without blocking the UI thread.
*   **Privacy:** All processing happens locally on your machine. No data is sent to external servers.

---

**License**: MIT | Built for the Developer Community | **Version 1.7.0**
