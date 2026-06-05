// --- SparkDev Advanced Picker Engine ---
// Inspired by ColorZilla, built for SparkDev Pro

let advancedPickerActive = false;
let apStatusPanel = null;
let apMagnifier = null;
let apScreenshotCanvas = null;
let apScreenshotCtx = null;
let apZoomRatio = window.devicePixelRatio || 1;
let apLastX = 0;
let apLastY = 0;
let apIsUpdating = false;
let apRAfId = null;

async function startAdvancedPicker() {
  if (advancedPickerActive) return;
  advancedPickerActive = true;

  // 1. Initial Setup (Scroll remains enabled)
  createAPStatusPanel();
  createAPMagnifier();
  await updateAPScreenshot();

  // 2. Setup Listeners
  document.addEventListener('mousemove', handleAPMouseMove, true);
  document.addEventListener('click', handleAPClick, true);
  document.addEventListener('keydown', handleAPKeyDown, true);
  window.addEventListener('scroll', handleAPScroll, { passive: true, capture: true });
  document.body.style.cursor = 'crosshair';
}

function stopAdvancedPicker() {
  if (!advancedPickerActive) return;
  advancedPickerActive = false;

  document.removeEventListener('mousemove', handleAPMouseMove, true);
  document.removeEventListener('click', handleAPClick, true);
  document.removeEventListener('keydown', handleAPKeyDown, true);
  window.removeEventListener('scroll', handleAPScroll, true);

  removeAPUI();
  document.body.style.cursor = '';
}

async function updateAPScreenshot() {
  if (apIsUpdating) return;
  apIsUpdating = true;
  
  const response = await chrome.runtime.sendMessage({ action: 'takeScreenshot' });
  if (response && response.ok) {
    await prepareScreenshotCanvas(response.dataUrl);
  }
  apIsUpdating = false;
}

let scrollTimeout = null;
function handleAPScroll() {
  if (!advancedPickerActive) return;

  // Hide magnifier during scroll for better UX (like ColorZilla)
  if (apMagnifier) apMagnifier.style.display = 'none';

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(async () => {
    await updateAPScreenshot();
    // Re-trigger UI update at last known mouse position
    refreshAPUI(apLastX, apLastY);
  }, 100); // 100ms debounce
}

async function prepareScreenshotCanvas(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      apScreenshotCanvas = document.createElement('canvas');
      apScreenshotCanvas.width = img.width;
      apScreenshotCanvas.height = img.height;
      apScreenshotCtx = apScreenshotCanvas.getContext('2d', { willReadFrequently: true });
      apScreenshotCtx.drawImage(img, 0, 0);
      resolve();
    };
    img.src = dataUrl;
  });
}

function createAPStatusPanel() {
  if (apStatusPanel) return;
  apStatusPanel = document.createElement('div');
  apStatusPanel.id = 'sd-ap-status-panel';
  apStatusPanel.style.cssText = `
    position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
    background: #1a1a1a; color: white; padding: 6px 14px; border-radius: 20px;
    font-family: 'Inter', system-ui, sans-serif; font-size: 12px; z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 1px solid #333;
    display: flex; align-items: center; gap: 10px; pointer-events: none;
  `;
  apStatusPanel.innerHTML = `
    <span style="color: #00f2ff; font-weight: 700;">ADVANCED PICKER</span>
    <span id="sd-ap-info">Hover to explore, Click to pick</span>
    <div id="sd-ap-preview" style="width: 14px; height: 14px; border-radius: 3px; border: 1px solid #555; display: none;"></div>
    <span id="sd-ap-hex" style="font-family: 'JetBrains Mono', monospace; font-weight: 600;"></span>
  `;
  document.documentElement.appendChild(apStatusPanel);
}

function createAPMagnifier() {
  if (apMagnifier) return;
  apMagnifier = document.createElement('div');
  apMagnifier.id = 'sd-ap-magnifier';
  apMagnifier.style.cssText = `
    position: fixed; width: 120px; height: 120px;
    border: 4px solid #fff; border-radius: 50%; overflow: hidden;
    box-shadow: 0 0 20px rgba(0,0,0,0.5); z-index: 2147483646;
    pointer-events: none; display: none; background: #000;
    transition: border-color 0.15s ease, box-shadow 0.25s ease;
  `;
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  apMagnifier.appendChild(canvas);
  document.documentElement.appendChild(apMagnifier);
}

function removeAPUI() {
  if (apStatusPanel) apStatusPanel.remove();
  if (apMagnifier) apMagnifier.remove();
  apStatusPanel = null;
  apMagnifier = null;
}

function handleAPMouseMove(e) {
  if (!advancedPickerActive) return;
  apLastX = e.clientX;
  apLastY = e.clientY;
  
  if (apRAfId) cancelAnimationFrame(apRAfId);
  apRAfId = requestAnimationFrame(() => refreshAPUI(apLastX, apLastY));
}

function refreshAPUI(clientX, clientY) {
  if (!advancedPickerActive) return;

  // 1. Update Magnifier Position & Content
  if (apMagnifier && apScreenshotCanvas && !apIsUpdating) {
    apMagnifier.style.display = 'block';
    apMagnifier.style.left = (clientX - 60) + 'px';
    apMagnifier.style.top = (clientY - 60) + 'px';

    const ctx = apMagnifier.querySelector('canvas').getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Zoom math
    const zoomSize = 10;
    const sx = (clientX * apZoomRatio) - (zoomSize / 2);
    const sy = (clientY * apZoomRatio) - (zoomSize / 2);

    ctx.clearRect(0, 0, 120, 120);
    ctx.drawImage(apScreenshotCanvas, sx, sy, zoomSize, zoomSize, 0, 0, 120, 120);

    // Draw Crosshair
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 0); ctx.lineTo(60, 120);
    ctx.moveTo(0, 60); ctx.lineTo(120, 60);
    ctx.stroke();

    // 2. Update Status Panel & Magnifier Border/Shadow
    if (apScreenshotCtx) {
      const pixel = apScreenshotCtx.getImageData(clientX * apZoomRatio, clientY * apZoomRatio, 1, 1).data;
      const r = pixel[0], g = pixel[1], b = pixel[2];
      const hex = rgbToHex(`rgb(${r},${g},${b})`);
      if (hex) {
        apMagnifier.style.borderColor = hex;
        
        // Dynamic Shadow: Light color -> Dark shadow, Dark color -> Light glow
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness > 128) {
          apMagnifier.style.boxShadow = '0 0 20px rgba(0,0,0,0.6)';
        } else {
          apMagnifier.style.boxShadow = `0 0 20px ${hex}88, 0 0 10px rgba(255,255,255,0.2)`;
        }

        if (apStatusPanel) {
          apStatusPanel.querySelector('#sd-ap-preview').style.backgroundColor = hex;
          apStatusPanel.querySelector('#sd-ap-preview').style.display = 'block';
          apStatusPanel.querySelector('#sd-ap-hex').textContent = hex.toUpperCase();
        }
      }
    }
  }
}

function handleAPClick(e) {
  if (!advancedPickerActive) return;
  e.preventDefault();
  e.stopPropagation();

  if (apScreenshotCtx) {
    const pixel = apScreenshotCtx.getImageData(e.clientX * apZoomRatio, e.clientY * apZoomRatio, 1, 1).data;
    const hex = rgbToHex(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`).toUpperCase();
    navigator.clipboard.writeText(hex);
    chrome.runtime.sendMessage({ action: 'colorPicked', hex: hex });
  }

  stopAdvancedPicker();
}

function handleAPKeyDown(e) {
  if (e.key === 'Escape') stopAdvancedPicker();
}

function isInternalAPElement(el) {
  return el.id === 'sd-ap-status-panel' || el.id === 'sd-ap-magnifier' || apStatusPanel?.contains(el) || apMagnifier?.contains(el);
}

// SparkDev Utilities (Redundant but safe for isolation)
function rgbToHex(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  const hexPart = (v) => parseInt(v).toString(16).padStart(2, '0');
  return `#${hexPart(match[1])}${hexPart(match[2])}${hexPart(match[3])}`;
}

// Global Export
window.startLivePicker = startAdvancedPicker;
window.stopLivePicker = stopAdvancedPicker;
