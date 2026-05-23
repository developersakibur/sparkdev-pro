chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[SparkDev Content] Message received:', msg.action);

  if (msg.action === 'convertAndDownload') {
    convertImageToWebP(msg.imageUrl, msg.maxSizeKB, msg.quality)
      .then(({ dataUrl, filename }) => {
        chrome.runtime.sendMessage({ action: 'downloadWebP', dataUrl, filename });
        sendResponse({ ok: true });
      })
      .catch(err => {
        console.error('[WebP Compressor]', err);
        sendResponse({ ok: false });
      });
    return true;
  }

  if (msg.action === 'toggleElementorLoader') {
    const existing = document.getElementById('sparkdev-hide-elementor-loader');
    if (msg.enabled) {
      if (!existing) {
        const style = document.createElement('style');
        style.id = 'sparkdev-hide-elementor-loader';
        style.textContent = '#elementor-panel-state-loading { display: none !important; }';
        document.documentElement.appendChild(style);
      }
    } else {
      existing?.remove();
    }
    sendResponse({ ok: true });
  }

  if (msg.action === 'toggleLivePicker') {
    if (msg.enabled) {
      startLivePicker();
    } else {
      stopLivePicker();
    }
    sendResponse({ ok: true });
  }

  if (msg.action === 'toggleFontFinder') {
    console.log('[SparkDev Font] Toggling finder:', msg.enabled, 'Multi:', msg.multi);
    if (msg.enabled) {
      startFontFinder(msg.multi);
    } else {
      stopFontFinder();
    }
    sendResponse({ ok: true });
  }
});

// --- Live Color Picker ---
let livePickerActive = false;
let lastHoveredElement = null;
let originalOutline = '';

function startLivePicker() {
  if (livePickerActive) return;
  livePickerActive = true;
  document.addEventListener('mousemove', handleLiveHover);
  document.addEventListener('click', handleLiveClick, true);
  document.body.style.cursor = 'crosshair';
}

function stopLivePicker() {
  if (!livePickerActive) return;
  livePickerActive = false;
  document.removeEventListener('mousemove', handleLiveHover);
  document.removeEventListener('click', handleLiveClick, true);
  if (lastHoveredElement) {
    lastHoveredElement.style.outline = originalOutline;
  }
  document.body.style.cursor = '';
}

function handleLiveHover(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el === lastHoveredElement) return;
  if (lastHoveredElement) {
    lastHoveredElement.style.outline = originalOutline;
  }
  lastHoveredElement = el;
  if (el) {
    originalOutline = el.style.outline;
    el.style.outline = '2px solid #00f2ff';
  }
}

function handleLiveClick(e) {
  if (!livePickerActive) return;
  e.preventDefault();
  e.stopPropagation();
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el) {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const hex = rgbToHex(bgColor);
    if (hex) {
      chrome.runtime.sendMessage({ action: 'liveColorPicked', hex: hex.toUpperCase() });
    }
  }
}

// --- Font Finder ---
let fontFinderActive = false;
let fontFinderHost = null;
let fontFinderShadow = null;
let fontTooltip = null;
let fontOverlay = null;
let isMultiMode = false;
let pinnedTooltips = [];

function startFontFinder(multi = false) {
  console.log('[SparkDev Font] Starting finder...');
  if (fontFinderActive) stopFontFinder();
  
  fontFinderActive = true;
  isMultiMode = multi;
  
  document.addEventListener('mousemove', handleFontHover);
  document.addEventListener('click', handleFontClick, true);
  document.body.style.cursor = 'crosshair';
  initFontFinderUI();
}

function stopFontFinder() {
  console.log('[SparkDev Font] Stopping finder...');
  fontFinderActive = false;
  document.removeEventListener('mousemove', handleFontHover);
  document.removeEventListener('click', handleFontClick, true);
  
  if (fontFinderHost) {
    fontFinderHost.remove();
    fontFinderHost = null;
    fontFinderShadow = null;
    fontTooltip = null;
    fontOverlay = null;
  }
  
  pinnedTooltips.forEach(t => t.remove());
  pinnedTooltips = [];
  
  document.body.style.cursor = '';
}

function initFontFinderUI() {
  if (document.getElementById('sd-font-finder-host')) return;
  
  fontFinderHost = document.createElement('div');
  fontFinderHost.id = 'sd-font-finder-host';
  // Host itself is just a container, children will handle positioning
  fontFinderHost.style.position = 'static'; 
  document.body.appendChild(fontFinderHost);

  fontFinderShadow = fontFinderHost.attachShadow({ mode: 'open' });

  // Styles for the shadow root
  const style = document.createElement('style');
  style.textContent = `
    .sd-fixed-layer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    }
    .sd-absolute-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483646;
    }
    .sd-tooltip {
      position: fixed;
      pointer-events: none;
      background: rgba(10, 10, 10, 0.95);
      color: #fff;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
      line-height: 1.5;
      backdrop-filter: blur(12px);
      z-index: 100;
      min-width: 180px;
      display: none;
    }
    .sd-tooltip__title {
      font-weight: 800;
      color: #00f2ff;
      font-size: 14px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sd-tooltip__grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 16px;
    }
    .sd-tooltip__label { color: rgba(255,255,255,0.5); font-size: 11px; }
    .sd-tooltip__value { font-family: monospace; font-weight: 600; color: #eee; }
    
    .sd-overlay {
      position: fixed;
      pointer-events: none;
      background: rgba(0, 242, 255, 0.1);
      border: 1.5px solid #00f2ff;
      border-radius: 4px;
      z-index: 50;
      transition: all 0.1s ease;
      box-sizing: border-box;
      display: none;
    }
    
    .sd-pinned-card {
      position: absolute;
      pointer-events: auto;
      background: rgba(15, 15, 15, 0.98);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 200;
      min-width: 200px;
      font-family: Inter, sans-serif;
      color: #fff;
      backdrop-filter: blur(10px);
    }
    .sd-pinned-card__close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #888;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      font-size: 14px;
    }
    .sd-pinned-card__close:hover { background: rgba(255,0,0,0.2); color: #ff4d4d; }

    .sd-exit-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 18px;
      background: #ff4d4d;
      color: #fff;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      pointer-events: auto;
      z-index: 2147483647;
      box-shadow: 0 4px 15px rgba(255, 77, 77, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;
      transition: all 0.2s ease;
      font-family: Inter, sans-serif;
    }
    .sd-exit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 77, 77, 0.5);
      background: #ff3333;
    }
    .sd-exit-btn:active {
      transform: translateY(0);
    }
  `;
  fontFinderShadow.appendChild(style);

  const fixedLayer = document.createElement('div');
  fixedLayer.className = 'sd-fixed-layer';
  fontFinderShadow.appendChild(fixedLayer);

  // Add Exit Button
  const exitBtn = document.createElement('button');
  exitBtn.className = 'sd-exit-btn';
  exitBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    Exit Font Finder
  `;
  exitBtn.onclick = () => {
    stopFontFinder();
    chrome.runtime.sendMessage({ action: 'stopFontFinderUI' });
  };
  fixedLayer.appendChild(exitBtn);

  const absoluteLayer = document.createElement('div');
  absoluteLayer.className = 'sd-absolute-layer';
  absoluteLayer.id = 'sd-absolute-layer';
  fontFinderShadow.appendChild(absoluteLayer);

  fontOverlay = document.createElement('div');
  fontOverlay.className = 'sd-overlay';
  fixedLayer.appendChild(fontOverlay);

  fontTooltip = document.createElement('div');
  fontTooltip.className = 'sd-tooltip';
  fixedLayer.appendChild(fontTooltip);
}

function handleFontHover(e) {
  if (!fontFinderActive || !fontTooltip || !fontOverlay) return;
  
  const el = document.elementFromPoint(e.clientX, e.clientY);
  
  if (!el || !el.innerText || !el.innerText.trim() || el.closest('#sd-font-finder-host')) {
    fontTooltip.style.display = 'none';
    fontOverlay.style.display = 'none';
    return;
  }

  const rect = el.getBoundingClientRect();
  fontOverlay.style.top = rect.top + 'px';
  fontOverlay.style.left = rect.left + 'px';
  fontOverlay.style.width = rect.width + 'px';
  fontOverlay.style.height = rect.height + 'px';
  fontOverlay.style.display = 'block';

  const style = window.getComputedStyle(el);
  const family = style.fontFamily.split(',')[0].replace(/['"]/g, '');
  const size = style.fontSize;
  const weight = style.fontWeight;
  const lh = style.lineHeight !== 'normal' ? style.lineHeight : (parseFloat(size) * 1.2).toFixed(0) + 'px';
  const color = (rgbToHex(style.color) || style.color).toUpperCase();

  fontTooltip.innerHTML = `
    <div class="sd-tooltip__title">${family}</div>
    <div class="sd-tooltip__grid">
      <span class="sd-tooltip__label">Size:</span> <span class="sd-tooltip__value">${size}</span>
      <span class="sd-tooltip__label">Weight:</span> <span class="sd-tooltip__value">${weight}</span>
      <span class="sd-tooltip__label">L.Height:</span> <span class="sd-tooltip__value">${lh}</span>
      <span class="sd-tooltip__label">Color:</span> <span class="sd-tooltip__value" style="color: ${color}">${color}</span>
    </div>
  `;

  fontTooltip.style.display = 'block';
  
  // Smart Positioning
  const gap = 15;
  const tooltipWidth = fontTooltip.offsetWidth;
  const tooltipHeight = fontTooltip.offsetHeight;
  
  let left = e.clientX + gap;
  let top = e.clientY + gap;

  // Horizontal check
  if (left + tooltipWidth > window.innerWidth - 10) {
    left = e.clientX - tooltipWidth - gap;
  }
  // Vertical check
  if (top + tooltipHeight > window.innerHeight - 10) {
    top = e.clientY - tooltipHeight - gap;
  }

  // Final safety bounds
  left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
  top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));

  fontTooltip.style.left = left + 'px';
  fontTooltip.style.top = top + 'px';
}

function handleFontClick(e) {
  if (!fontFinderActive) return;
  
  // Use e.composedPath() to detect clicks inside Shadow DOM
  const path = e.composedPath();
  if (path.some(el => el.id === 'sd-font-finder-host')) return;

  e.preventDefault();
  e.stopPropagation();

  const el = document.elementFromPoint(e.clientX, e.clientY);
    const style = window.getComputedStyle(el);
    const fontData = {
      family: style.fontFamily.split(',')[0].replace(/['"]/g, ''),
      size: style.fontSize,
      weight: style.fontWeight,
      lh: style.lineHeight !== 'normal' ? style.lineHeight : (parseFloat(style.fontSize) * 1.2).toFixed(0) + 'px',
      color: (rgbToHex(style.color) || style.color).toUpperCase()
    };
    
    chrome.runtime.sendMessage({ action: 'fontPicked', fontData });

    if (isMultiMode) {
      pinFontCard(fontData, e.pageX, e.pageY);
    } else {
      stopFontFinder();
      chrome.runtime.sendMessage({ action: 'stopFontFinderUI' });
    }
  }
}

function pinFontCard(data, x, y) {
  const absoluteLayer = fontFinderShadow.getElementById('sd-absolute-layer');
  if (!absoluteLayer) return;

  const card = document.createElement('div');
  card.className = 'sd-pinned-card';
  card.style.visibility = 'hidden'; // Hide to calculate dimensions
  
  card.innerHTML = `
    <div class="sd-pinned-card__close">×</div>
    <div class="sd-tooltip__title" style="margin-right: 20px;">${data.family}</div>
    <div class="sd-tooltip__grid">
      <span class="sd-tooltip__label">Size:</span> <span class="sd-tooltip__value">${data.size}</span>
      <span class="sd-tooltip__label">Weight:</span> <span class="sd-tooltip__value">${data.weight}</span>
      <span class="sd-tooltip__label">Line:</span> <span class="sd-tooltip__value">${data.lh}</span>
      <span class="sd-tooltip__label">Color:</span> <span class="sd-tooltip__value" style="color: ${data.color}">${data.color}</span>
    </div>
  `;
  
  card.querySelector('.sd-pinned-card__close').onclick = () => {
    card.remove();
    pinnedTooltips = pinnedTooltips.filter(t => t !== card);
  };
  
  absoluteLayer.appendChild(card);

  // Smart positioning logic
  const gap = 10;
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;
  
  // Calculate viewport-relative click position
  const viewportX = x - window.scrollX;
  const viewportY = y - window.scrollY;
  
  let finalX = x + gap;
  let finalY = y + gap;

  // Horizontal flip
  if (viewportX + gap + cardWidth > window.innerWidth - 20) {
    finalX = x - cardWidth - gap;
  }
  // Vertical flip
  if (viewportY + gap + cardHeight > window.innerHeight - 20) {
    finalY = y - cardHeight - gap;
  }

  // Document boundaries safety
  finalX = Math.max(window.scrollX + 10, Math.min(finalX, window.scrollX + window.innerWidth - cardWidth - 10));
  finalY = Math.max(window.scrollY + 10, Math.min(finalY, window.scrollY + window.innerHeight - cardHeight - 10));

  card.style.left = finalX + 'px';
  card.style.top = finalY + 'px';
  card.style.visibility = 'visible';
  
  pinnedTooltips.push(card);
}



function rgbToHex(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) {
    const matchRgba = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (matchRgba && parseFloat(matchRgba[4]) === 0) return null;
    if (matchRgba) return `#${hexPart(matchRgba[1])}${hexPart(matchRgba[2])}${hexPart(matchRgba[3])}`;
    return null;
  }
  return `#${hexPart(match[1])}${hexPart(match[2])}${hexPart(match[3])}`;
}

function hexPart(v) {
  return parseInt(v).toString(16).padStart(2, '0');
}

// --- WebP Compressor Logic ---
async function convertImageToWebP(imageUrl, maxSizeKB, quality) {
  const targetBytes = (maxSizeKB || 150) * 1024;
  const maxQuality  = (quality || 75) / 100;

  const blob        = await fetchImage(imageUrl);
  const bitmap      = await createImageBitmap(blob);
  const canvas      = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext('2d').drawImage(bitmap, 0, 0);

  const resultBlob  = await binarySearch(canvas, targetBytes, maxQuality);
  const dataUrl     = await blobToDataUrl(resultBlob);
  const filename    = buildFilename(imageUrl);

  return { dataUrl, filename };
}

async function fetchImage(url) {
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error('Fetch failed');
  return res.blob();
}

async function binarySearch(canvas, targetBytes, maxQuality) {
  let blob = await canvas.convertToBlob({ type: 'image/webp', quality: maxQuality });
  if (blob.size <= targetBytes) return blob;

  let lo = 0.01, hi = maxQuality, best = blob;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    blob = await canvas.convertToBlob({ type: 'image/webp', quality: mid });
    if (blob.size <= targetBytes) {
      best = blob;
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 0.01) break;
  }
  return best;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function buildFilename(url) {
  let base = '';
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    for (const [key, value] of searchParams) {
      if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(value)) {
        base = value.split('/').pop().split('.').shift();
        break;
      }
    }
    if (!base) {
      const last = path.split('/').filter(Boolean).pop() || '';
      const dot  = last.lastIndexOf('.');
      base = dot !== -1 ? last.slice(0, dot) : last;
    }
    if (base.toLowerCase() === 'download' || base.length < 2 || base.includes('%')) {
      base = '';
    }
  } catch {}

  const now = new Date();
  const ts  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;

  if (base) {
    const cleanBase = base.substring(0, 50).replace(/[^a-z0-9_-]/gi, '_');
    return `${cleanBase}_${ts}.webp`;
  }
  return `img_${ts}.webp`;
}

// --- Elementor Loader Hider ---
(async function() {
  const domain = window.location.hostname;
  try {
    const result = await chrome.storage.local.get(['mod_wp_tools']);
    const settings = result.mod_wp_tools?.elementorHideSettings || {};
    if (settings[domain]) {
      const style = document.createElement('style');
      style.id = 'sparkdev-hide-elementor-loader';
      style.textContent = '#elementor-panel-state-loading { display: none !important; }';
      document.documentElement.appendChild(style);
    }
  } catch (e) {
    console.error('[SparkDev Pro]', e);
  }
})();
