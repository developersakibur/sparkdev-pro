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
  fontFinderHost.style.position = 'static'; 
  document.body.appendChild(fontFinderHost);

  fontFinderShadow = fontFinderHost.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .sd-fixed-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647; }
    .sd-absolute-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483646; }
    .sd-tooltip {
      position: fixed; pointer-events: none; background: rgba(10, 10, 10, 0.95); color: #fff;
      padding: 12px 16px; border-radius: 12px; font-size: 12px; font-family: Inter, system-ui, sans-serif;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1); line-height: 1.5;
      backdrop-filter: blur(12px); z-index: 100; min-width: 180px; display: none;
    }
    .sd-tooltip__title { font-weight: 800; color: #00f2ff; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sd-tooltip__grid { display: grid; grid-template-columns: auto 1fr; gap: 4px 16px; }
    .sd-tooltip__label { color: rgba(255,255,255,0.5); font-size: 11px; }
    .sd-tooltip__value { font-family: monospace; font-weight: 600; color: #eee; }
    .sd-overlay { position: fixed; pointer-events: none; background: rgba(0, 242, 255, 0.1); border: 1.5px solid #00f2ff; border-radius: 4px; z-index: 50; transition: all 0.1s ease; box-sizing: border-box; display: none; }
    .sd-pinned-card { position: absolute; pointer-events: auto; background: rgba(15, 15, 15, 0.98); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 200; min-width: 200px; font-family: Inter, sans-serif; color: #fff; backdrop-filter: blur(10px); }
    .sd-pinned-card__close { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; border-radius: 50%; background: rgba(255,255,255,0.05); font-size: 14px; }
    .sd-pinned-card__close:hover { background: rgba(255,0,0,0.2); color: #ff4d4d; }
    .sd-exit-btn { position: fixed; top: 20px; right: 20px; padding: 10px 18px; background: #ff4d4d; color: #fff; border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer; pointer-events: auto; z-index: 2147483647; box-shadow: 0 4px 15px rgba(255, 77, 77, 0.4); display: flex; align-items: center; gap: 8px; border: none; transition: all 0.2s ease; font-family: Inter, sans-serif; }
    .sd-exit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 77, 77, 0.5); background: #ff3333; }
  `;
  fontFinderShadow.appendChild(style);

  const fixedLayer = document.createElement('div');
  fixedLayer.className = 'sd-fixed-layer';
  fontFinderShadow.appendChild(fixedLayer);

  const exitBtn = document.createElement('button');
  exitBtn.className = 'sd-exit-btn';
  exitBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Exit Font Finder`;
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
  
  const gap = 15;
  const tooltipWidth = fontTooltip.offsetWidth;
  const tooltipHeight = fontTooltip.offsetHeight;
  let left = e.clientX + gap;
  let top = e.clientY + gap;

  if (left + tooltipWidth > window.innerWidth - 10) left = e.clientX - tooltipWidth - gap;
  if (top + tooltipHeight > window.innerHeight - 10) top = e.clientY - tooltipHeight - gap;

  left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
  top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
  fontTooltip.style.left = left + 'px';
  fontTooltip.style.top = top + 'px';
}

function handleFontClick(e) {
  if (!fontFinderActive) return;
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

function pinFontCard(data, x, y) {
  const absoluteLayer = fontFinderShadow.getElementById('sd-absolute-layer');
  if (!absoluteLayer) return;

  const card = document.createElement('div');
  card.className = 'sd-pinned-card';
  card.style.visibility = 'hidden';
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

  const gap = 10;
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;
  const viewportX = x - window.scrollX;
  const viewportY = y - window.scrollY;
  let finalX = x + gap;
  let finalY = y + gap;

  if (viewportX + gap + cardWidth > window.innerWidth - 20) finalX = x - cardWidth - gap;
  if (viewportY + gap + cardHeight > window.innerHeight - 20) finalY = y - cardHeight - gap;

  finalX = Math.max(window.scrollX + 10, Math.min(finalX, window.scrollX + window.innerWidth - cardWidth - 10));
  finalY = Math.max(window.scrollY + 10, Math.min(finalY, window.scrollY + window.innerHeight - cardHeight - 10));

  card.style.left = finalX + 'px';
  card.style.top = finalY + 'px';
  card.style.visibility = 'visible';
  pinnedTooltips.push(card);
}
