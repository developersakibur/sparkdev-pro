# SparkDev Pro - Unified Developer Extension

**SparkDev Pro** is a high-performance, modular Chrome Extension designed for modern web workflows. It merges three specialized tools into a single, tabbed interface, reducing clutter and increasing productivity for developers, designers, and WordPress specialists.

---

## 🚀 Key Features

### 1. CSS clamp() Generator
*A sophisticated tool for fluid typography and responsive design.*
- **Fluid Calculations**: Automatically calculates the optimal CSS `clamp()` function based on your viewport settings.
- **Smart Presets**: Built-in configurations for "Text" and "Spacing" (Padding/Margins).
- **Live Preview Slider**: Test how your values change in real-time as you simulate different viewport widths.
- **Negative Value Support**: Handles complex layouts by automatically formatting negative values using `calc(-1 * clamp(...))`.
- **One-Click Copy**: Instantly copy the generated code to your clipboard.

### 2. WebP Converter Pro
*The ultimate browser-based image optimization tool.*
- **Batch Processing**: Drag and drop multiple images to convert them simultaneously.
- **Binary Search Compression**: Uses an advanced algorithm to find the highest possible quality that stays under your specified KB limit.
- **Quality Control**: Adjustable slider (1% to 100%) for fine-tuning output.
- **Smart ZIP Export**: Automatically bundles multiple converted images into a timestamped `.zip` file for easy management.
- **Privacy First**: All conversion happens locally in your browser—no images are ever uploaded to a server.

### 3. WP Quick Tools (WordPress & Analysis)
*Essential shortcuts for WordPress management and web analysis.*
- **Dashboard Shortcuts**: Quick links to `/wp-admin/` and common plugin pages like All-in-One Migration.
- **Cache Bypassing (NC Mode)**: Visit any site with "No Cache" parameters and cleared browser cache with one click.
- **Advanced Extraction**: 
    - **Freepik Tool**: Extracts high-quality image links directly and opens them in specialized watermark removal tools.
    - **WatermarkRemover.io Integration**: Automates the download of processed images.
- **Domain Analysis**: Integrated DNS checking and Google PageSpeed Insights analysis.

---

## 🛠 Installation Guide

1. **Download**: Clone or download this project to your local machine.
2. **Open Extensions**: In Google Chrome, go to `chrome://extensions/`.
3. **Developer Mode**: Toggle the **Developer mode** switch in the top-right corner.
4. **Load Unpacked**: Click the **Load unpacked** button and select the `merged-extension` folder.
5. **Pin it**: Find "Dev Toolbox Pro" in your extension puzzle menu and pin it for quick access.

---

## 📂 Professional Folder Structure

The project follows a modular, scalable architecture:

- **`/core`**: Houses the extension's heartbeat (Background workers, Content scripts, and Tab Management).
- **`/modules`**: Contains isolated features. Each module is self-contained with its own `script.js` (logic) and `style.css` (design).
- **`/assets`**: Central repository for icons and shared JavaScript libraries like `jszip`.
- **`/root`**: The main entry point (`popup.html`) and global layout styles (`popup.css`).

---

## 👨‍💻 For Developers
If you wish to modify or add new features, please refer to the [DEVELOPER.md](./DEVELOPER.md) file for a detailed architectural breakdown and scoping guidelines.

---
**Author**: [developersakibur]  
**Version**: 1.0.0  
**License**: MIT
