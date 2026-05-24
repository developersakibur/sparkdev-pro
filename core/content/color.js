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
