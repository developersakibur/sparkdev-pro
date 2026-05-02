# 🚀 SparkDev Pro: The Unified Developer Workspace

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Chrome%20|%20Edge%20|%20Brave-orange.svg)

**SparkDev Pro** is a premium, modular browser extension designed to eliminate context-switching. It consolidates high-performance utilities for responsive design, image optimization, WordPress management, and security into a single, elegant interface.

---

## 💎 Core Modules & Detailed Use Cases

### 1. 📐 CSS clamp() Fluid Generator
*Precision-engineered responsive typography and spacing.*

- **The Problem**: Standard media queries lead to "jumpy" layouts and bloated CSS.
- **The Solution**: Uses the `clamp()` function to create fluid values that scale perfectly between two viewports.
- **Detailed Use Case**: 
    - **Typography**: Define a font-size that is exactly `16px` on mobile (320px) and `48px` on desktop (1920px). The generator calculates the exact viewport-unit formula.
    - **Responsive Padding**: Set dynamic gaps that shrink gracefully on smaller screens without writing dozens of breakpoints.
- **Pro Feature**: Supports negative value logic, automatically wrapping results in `calc(-1 * clamp(...))` for complex layout shifts.

### 2. 🖼️ WebP Converter Pro
*The gold standard for browser-native image optimization.*

- **The Problem**: High-quality images slow down LCP (Largest Contentful Paint) and SEO rankings.
- **The Solution**: Converts PNG/JPG to WebP using **Binary Search Compression** to find the sweet spot between file size and visual fidelity.
- **Detailed Use Case**:
    - **Batch Optimization**: Upload 20 raw product images and convert them all to optimized WebP in seconds.
    - **Size Targets**: Need a hero image under 100KB? Set the limit, and the tool will iteratively compress until the target is met.
- **Privacy Focus**: Zero server uploads. All processing happens in your browser's RAM, ensuring sensitive assets never leave your machine.

### 3. 🛠️ WP Quick Tools
*The ultimate Swiss-army knife for WordPress developers.*

- **The Problem**: Navigating deep into WP-Admin or dealing with stubborn caching is a daily friction point.
- **The Solution**: One-click shortcuts and advanced DOM extraction tools.
- **Detailed Use Case**:
    - **NC (No-Cache) Browsing**: Visit a client's site with cache-busting headers to see real-time changes instantly.
    - **Asset Extraction**: Extract high-res links from sites like Freepik and integrate directly with watermark removal workflows.
    - **Speed Analysis**: Instant deep-links to Google PageSpeed Insights and DNS records for the current active tab.

### 4. 🔐 Secure Password Generator
*Cryptographically secure credentials on demand.*

- **The Problem**: Weak passwords are the #1 vulnerability in web development.
- **The Solution**: Leverages `window.crypto.getRandomValues()`—the industry standard for hardware-backed randomness.
- **Detailed Use Case**:
    - **Database Setup**: Quickly generate a 32-character complex string for `.env` files or database users.
    - **Client Handoff**: Generate secure temporary passwords for client staging sites with one click.
- **UX Features**: Scroll-wheel adjustment for length and instant visual feedback on copy.

---

## 🛠 Installation & Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/developersakibur/sparkdev-pro.git
   ```
2. **Open Extensions**: Navigate to `chrome://extensions/` in your browser.
3. **Enable Developer Mode**: Toggle the switch in the top-right corner.
4. **Load Unpacked**: Click the **"Load unpacked"** button and select the project root folder.
5. **Pin for Success**: Pin SparkDev Pro to your toolbar for instant access to your new workspace.

---

## 📂 Architectural Philosophy

SparkDev Pro follows a **Modular Plugin Architecture**:
- **Atomic Modules**: Each feature in `/modules` is self-contained with its own logic and style, preventing "spaghetti code."
- **Scoped Styles**: CSS is strictly scoped to tab IDs, ensuring zero style bleeding between tools.
- **Performance First**: Minimal dependencies. No heavy frameworks—just pure, optimized Vanilla JS and CSS.

---

## 📋 Version Update Notes

### [v1.1.0] - 2026-05-03
- **Added**: New **Secure Password Generator** module with entropy-based randomness.
- **Enhanced**: Added scroll-wheel support for numeric inputs in Clamp and Pass modules.
- **Improved**: UI polish—hidden spin buttons on all numeric inputs for a cleaner, professional look.
- **Fix**: Initialized default values in the Clamp generator to prevent empty-field errors on first load.

### [v1.0.0] - 2026-04-28
- **Launch**: Initial release featuring Clamp Generator, WebP Converter, and WP Quick Tools.
- **Core**: Implementation of the custom tab-switching engine.

---

## 👨‍💻 Author & Contribution

**Created by [Sakibur Rahman](https://github.com/developersakibur)**

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
**License**: MIT | Built with ❤️ for the Developer Community.
