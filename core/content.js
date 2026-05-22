chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
});

let livePickerActive = false;
let lastHoveredElement = null;
let originalOutline = '';

function startLivePicker() {
  if (livePickerActive) return;
  livePickerActive = true;
  document.addEventListener('mousemove', handleLiveHover);
  document.addEventListener('click', handleLiveClick, true);
  
  // Add a cursor style to the body
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
    el.style.outline = '2px solid #00f2ff'; // SparkDev Cyan
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

function rgbToHex(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) {
    // Check for rgba
    const matchRgba = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (matchRgba && parseFloat(matchRgba[4]) === 0) return null; // Transparent
    if (matchRgba) return `#${hexPart(matchRgba[1])}${hexPart(matchRgba[2])}${hexPart(matchRgba[3])}`;
    return null;
  }
  return `#${hexPart(match[1])}${hexPart(match[2])}${hexPart(match[3])}`;
}

function hexPart(v) {
  return parseInt(v).toString(16).padStart(2, '0');
}

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
  // First try at maxQuality
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
    
    // 1. Try search params
    const searchParams = urlObj.searchParams;
    for (const [key, value] of searchParams) {
      if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(value)) {
        base = value.split('/').pop().split('.').shift();
        break;
      }
    }

    // 2. Try path if search params failed
    if (!base) {
      const last = path.split('/').filter(Boolean).pop() || '';
      const dot  = last.lastIndexOf('.');
      base = dot !== -1 ? last.slice(0, dot) : last;
    }

    // Cleanup: remove common useless names and encoded chars
    if (base.toLowerCase() === 'download' || base.length < 2 || base.includes('%')) {
      base = '';
    }
  } catch {}

  const now = new Date();
  const dd  = String(now.getDate()).padStart(2,'0');
  const mm  = String(now.getMonth()+1).padStart(2,'0');
  const yyyy = now.getFullYear();
  const hh  = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  const ss  = String(now.getSeconds()).padStart(2,'0');
  const ms  = String(now.getMilliseconds()).padStart(3,'0');
  const ts  = `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}-${ms}`;

  if (base) {
    // Trim to 50 chars
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
