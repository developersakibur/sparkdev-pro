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
let fontTooltip = null;
let isMultiMode = false;

function startFontFinder(multi = false) {
  console.log('[SparkDev Font] Starting finder...');
  if (fontFinderActive) stopFontFinder();
  
  fontFinderActive = true;
  isMultiMode = multi;
  
  document.addEventListener('mousemove', handleFontHover);
  document.addEventListener('click', handleFontClick, true);
  document.body.style.cursor = 'help';
  createFontTooltip();
}

function stopFontFinder() {
  console.log('[SparkDev Font] Stopping finder...');
  fontFinderActive = false;
  document.removeEventListener('mousemove', handleFontHover);
  document.removeEventListener('click', handleFontClick, true);
  if (fontTooltip) {
    fontTooltip.remove();
    fontTooltip = null;
  }
  document.body.style.cursor = '';
}

function createFontTooltip() {
  if (document.getElementById('sd-font-tooltip')) return;
  console.log('[SparkDev Font] Creating tooltip element...');
  fontTooltip = document.createElement('div');
  fontTooltip.id = 'sd-font-tooltip';
  Object.assign(fontTooltip.style, {
    position: 'fixed',
    zIndex: '2147483647',
    pointerEvents: 'none',
    backgroundColor: 'rgba(10, 10, 10, 0.98)',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
    border: '1px solid rgba(255,255,255,0.15)',
    lineHeight: '1.5',
    display: 'none',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 0.1s ease'
  });
  document.body.appendChild(fontTooltip);
}

function handleFontHover(e) {
  if (!fontFinderActive || !fontTooltip) return;
  
  const el = document.elementFromPoint(e.clientX, e.clientY);
  
  if (!el || !el.innerText || !el.innerText.trim()) {
    fontTooltip.style.display = 'none';
    return;
  }

  const style = window.getComputedStyle(el);
  const family = style.fontFamily.split(',')[0].replace(/['"]/g, '');
  const size = style.fontSize;
  const weight = style.fontWeight;
  const lh = style.lineHeight !== 'normal' ? style.lineHeight : (parseFloat(size) * 1.2).toFixed(0) + 'px';
  const color = (rgbToHex(style.color) || style.color).toUpperCase();

  fontTooltip.innerHTML = `
    <div style="font-weight: 800; color: #00f2ff; font-size: 13px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">${family}</div>
    <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px;">
      <span style="color: #aaa;">Size:</span> <span style="font-family: monospace; font-weight: 600;">${size}</span>
      <span style="color: #aaa;">Weight:</span> <span style="font-family: monospace; font-weight: 600;">${weight}</span>
      <span style="color: #aaa;">L.Height:</span> <span style="font-family: monospace; font-weight: 600;">${lh}</span>
      <span style="color: #aaa;">Color:</span> <span style="font-family: monospace; font-weight: 600; color: ${color}">${color}</span>
    </div>
    ${isMultiMode ? '<div style="margin-top: 8px; font-size: 9px; color: #00f2ff; opacity: 0.8; text-align: center;">Click to Capture</div>' : ''}
  `;

  fontTooltip.style.display = 'block';
  
  let left = e.clientX + 15;
  let top = e.clientY + 15;

  const tooltipWidth = fontTooltip.offsetWidth;
  const tooltipHeight = fontTooltip.offsetHeight;

  if (left + tooltipWidth > window.innerWidth - 20) left = e.clientX - tooltipWidth - 15;
  if (top + tooltipHeight > window.innerHeight - 20) top = e.clientY - tooltipHeight - 15;

  fontTooltip.style.left = left + 'px';
  fontTooltip.style.top = top + 'px';
}

function handleFontClick(e) {
  if (!fontFinderActive) return;
  e.preventDefault();
  e.stopPropagation();

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el) {
    console.log('[SparkDev Font] Element clicked, capturing styles...');
    const style = window.getComputedStyle(el);
    const fontData = {
      family: style.fontFamily.split(',')[0].replace(/['"]/g, ''),
      size: style.fontSize,
      weight: style.fontWeight,
      lh: style.lineHeight !== 'normal' ? style.lineHeight : (parseFloat(style.fontSize) * 1.2).toFixed(0) + 'px',
      color: (rgbToHex(style.color) || style.color).toUpperCase()
    };
    
    chrome.runtime.sendMessage({ action: 'fontPicked', fontData });

    if (!isMultiMode) {
      stopFontFinder();
      chrome.runtime.sendMessage({ action: 'stopFontFinderUI' });
    }
  }
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
