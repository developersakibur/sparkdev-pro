(function() {
  // --- Constants & Shapes ---
  const SHAPES = [
    { id: 'square', label: 'Square', draw: (c, s) => drawRoundedRect(c, s, s * 0.12) },
    { id: 'squircle', label: 'Squircle', draw: (c, s) => drawRoundedRect(c, s, s * 0.32) },
    { id: 'circle', label: 'Circle', draw: (c, s) => { c.arc(0, 0, s / 2, 0, Math.PI * 2); } },
    { id: 'triangle', label: 'Triangle', draw: (c, s) => drawPolygon(c, s, 3, -Math.PI / 2) },
    { id: 'roundedtri', label: 'Round Tri', draw: (c, s) => drawRoundedPoly(c, s, 3, -Math.PI / 2, s * 0.12) },
    { id: 'pentagon', label: 'Pentagon', draw: (c, s) => drawPolygon(c, s, 5, -Math.PI / 2) },
    { id: 'hexagon', label: 'Hexagon', draw: (c, s) => drawPolygon(c, s, 6, 0) },
    { id: 'heptagon', label: 'Heptagon', draw: (c, s) => drawPolygon(c, s, 7, -Math.PI / 2) },
    { id: 'octagon', label: 'Octagon', draw: (c, s) => drawPolygon(c, s, 8, Math.PI / 8) },
    { id: 'diamond', label: 'Diamond', draw: (c, s) => drawPolygon(c, s, 4, 0) },
    { id: 'star', label: 'Star', draw: (c, s) => drawStar(c, s, 5) },
    { id: 'shield', label: 'Shield', draw: (c, s) => drawShield(c, s) },
    { id: 'bookmark', label: 'Bookmark', draw: (c, s) => drawBookmark(c, s) },
    { id: 'seal', label: 'Seal', draw: (c, s) => drawStar(c, s, 12, 0.82) },
    { id: 'cross', label: 'Cross', draw: (c, s) => drawCross(c, s) },
  ];

  let selectedShape = 'squircle';
  let parsedSvg = null;
  let aspectRatio = 1;
  let ignoreNextSize = false;

  // --- DOM Elements ---
  const svgInput = document.getElementById('svgInput');
  const svgClearBtn = document.getElementById('svgClearBtn');
  const previewBox = document.getElementById('svgPreviewBox');
  const filenameDisplay = document.getElementById('svgFilenameDisplay');
  
  // Settings Toggles
  const colorEnabled = document.getElementById('svgColorEnabled');
  const sizeEnabled = document.getElementById('svgSizeEnabled');
  const bgEnabled = document.getElementById('svgBgEnabled');
  const strokeEnabled = document.getElementById('svgStrokeEnabled');
  const shadowEnabled = document.getElementById('svgShadowEnabled');

  // Specific Inputs
  const colorPicker = document.getElementById('svgColorPicker');
  const colorHex = document.getElementById('svgColorHex');
  const sizeW = document.getElementById('svgSizeW');
  const sizeH = document.getElementById('svgSizeH');
  const lockARInput = document.querySelector('#svgLockAR input');
  const presetBtns = document.querySelectorAll('#tab-svg .preset-btn');
  const shapeGrid = document.getElementById('svgShapeGrid');
  const bgPadding = document.getElementById('svgBgPadding');
  const bgPaddingVal = document.getElementById('svgBgPaddingVal');
  const bgColor1 = document.getElementById('svgBgColor1');
  const bgHex1 = document.getElementById('svgBgHex1');
  const bgOpacity = document.getElementById('svgBgOpacity');
  const bgOpacityVal = document.getElementById('svgBgOpacityVal');
  const strokeColor = document.getElementById('svgStrokeColor');
  const strokeHex = document.getElementById('svgStrokeHex');
  const strokeWidth = document.getElementById('svgStrokeWidth');
  const strokeWidthVal = document.getElementById('svgStrokeWidthVal');
  const shadowBlur = document.getElementById('svgShadowBlur');
  const shadowBlurVal = document.getElementById('svgShadowBlurVal');

  const downloadBtn = document.getElementById('svgDownloadBtn');
  const svgResetColor = document.getElementById('svgResetColor');

  // --- Persistence ---
  function saveSettings() {
    const settings = {
      colorEnabled: colorEnabled.checked,
      sizeEnabled: sizeEnabled.checked,
      bgEnabled: bgEnabled.checked,
      strokeEnabled: strokeEnabled.checked,
      shadowEnabled: shadowEnabled.checked,
      colorHex: colorHex.value,
      sizeW: sizeW.value,
      sizeH: sizeH.value,
      lockAR: lockARInput.checked,
      selectedShape: selectedShape,
      bgPadding: bgPadding.value,
      bgColor1: bgColor1.value,
      bgOpacity: bgOpacity.value,
      strokeColor: strokeColor.value,
      strokeWidth: strokeWidth.value,
      shadowBlur: shadowBlur.value
    };
    chrome.storage.local.set({ svgSettings: settings });
  }

  function loadSettings() {
    chrome.storage.local.get(['svgSettings'], (result) => {
      if (result.svgSettings) {
        const s = result.svgSettings;
        colorEnabled.checked = s.colorEnabled ?? true;
        sizeEnabled.checked = s.sizeEnabled ?? false;
        bgEnabled.checked = s.bgEnabled ?? false;
        strokeEnabled.checked = s.strokeEnabled ?? false;
        shadowEnabled.checked = s.shadowEnabled ?? false;
        
        colorHex.value = s.colorHex ?? '#7c6aff';
        colorPicker.value = colorHex.value;
        
        sizeW.value = s.sizeW ?? '';
        sizeH.value = s.sizeH ?? '';
        lockARInput.checked = s.lockAR ?? true;
        selectedShape = s.selectedShape ?? 'squircle';
        
        bgPadding.value = s.bgPadding ?? 20;
        bgPaddingVal.textContent = bgPadding.value;
        
        bgColor1.value = s.bgColor1 ?? '#1a1a20';
        bgHex1.value = bgColor1.value;
        
        bgOpacity.value = s.bgOpacity ?? 100;
        bgOpacityVal.textContent = bgOpacity.value + '%';
        
        strokeColor.value = s.strokeColor ?? '#ffffff';
        strokeHex.value = strokeColor.value;
        
        strokeWidth.value = s.strokeWidth ?? 2;
        strokeWidthVal.textContent = strokeWidth.value;
        
        shadowBlur.value = s.shadowBlur ?? 10;
        shadowBlurVal.textContent = shadowBlur.value;

        // Trigger UI updates
        initAccordions();
        buildShapePicker();
        updatePreview();
      } else {
        initAccordions();
        buildShapePicker();
      }
    });
  }

  // --- Shape Drawing Helpers ---
  function drawPolygon(ctx, size, sides, startAngle = 0) {
    const r = size / 2;
    ctx.moveTo(Math.cos(startAngle) * r, Math.sin(startAngle) * r);
    for (let i = 1; i <= sides; i++) {
      const a = startAngle + (i * Math.PI * 2 / sides);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  }

  function drawRoundedRect(ctx, size, radius) {
    const h = size / 2;
    ctx.moveTo(-h + radius, -h);
    ctx.lineTo(h - radius, -h);
    ctx.arcTo(h, -h, h, -h + radius, radius);
    ctx.lineTo(h, h - radius);
    ctx.arcTo(h, h, h - radius, h, radius);
    ctx.lineTo(-h + radius, h);
    ctx.arcTo(-h, h, -h, h - radius, radius);
    ctx.lineTo(-h, -h + radius);
    ctx.arcTo(-h, -h, -h + radius, -h, radius);
    ctx.closePath();
  }

  function drawRoundedPoly(ctx, size, sides, startAngle, radius) {
    const r = size / 2 * 0.9;
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const a = startAngle + (i * Math.PI * 2 / sides);
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    ctx.moveTo((pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2);
    for (let i = 0; i < pts.length; i++) {
      const curr = pts[i], next = pts[(i + 1) % pts.length];
      const midX = (curr[0] + next[0]) / 2, midY = (curr[1] + next[1]) / 2;
      ctx.quadraticCurveTo(curr[0], curr[1], midX, midY);
    }
    ctx.closePath();
  }

  function drawStar(ctx, size, points, innerRatio = 0.45) {
    const outerR = size / 2;
    const innerR = outerR * innerRatio;
    const step = Math.PI / points;
    ctx.moveTo(0, -outerR);
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = i * step - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  }

  function drawShield(ctx, size) {
    const h = size / 2;
    ctx.moveTo(0, -h);
    ctx.lineTo(h * 0.85, -h * 0.6);
    ctx.lineTo(h * 0.85, h * 0.1);
    ctx.quadraticCurveTo(h * 0.85, h * 0.7, 0, h);
    ctx.quadraticCurveTo(-h * 0.85, h * 0.7, -h * 0.85, h * 0.1);
    ctx.lineTo(-h * 0.85, -h * 0.6);
    ctx.closePath();
  }

  function drawBookmark(ctx, size) {
    const h = size / 2;
    ctx.moveTo(-h * 0.75, -h);
    ctx.lineTo(h * 0.75, -h);
    ctx.lineTo(h * 0.75, h * 0.7);
    ctx.lineTo(0, h);
    ctx.lineTo(-h * 0.75, h * 0.7);
    ctx.closePath();
  }

  function drawCross(ctx, size) {
    const h = size / 2, t = h * 0.32;
    ctx.moveTo(-t, -h); ctx.lineTo(t, -h);
    ctx.lineTo(t, -t); ctx.lineTo(h, -t);
    ctx.lineTo(h, t); ctx.lineTo(t, t);
    ctx.lineTo(t, h); ctx.lineTo(-t, h);
    ctx.lineTo(-t, t); ctx.lineTo(-h, t);
    ctx.lineTo(-h, -t); ctx.lineTo(-t, -t);
    ctx.closePath();
  }

  // --- Accordion Logic ---
  function initAccordions() {
    const toggles = [
      { toggle: colorEnabled, content: 'svgColorContent' },
      { toggle: sizeEnabled, content: 'svgSizeContent' },
      { toggle: bgEnabled, content: 'svgBgContent' },
      { toggle: strokeEnabled, content: 'svgStrokeContent' },
      { toggle: shadowEnabled, content: 'svgShadowContent' }
    ];

    toggles.forEach(({ toggle, content }) => {
      const contentEl = document.getElementById(content);
      toggle.addEventListener('change', () => {
        if (toggle.checked) {
          contentEl.classList.add('active');
        } else {
          contentEl.classList.remove('active');
        }
        updatePreview();
        saveSettings();
      });
      // Initial state
      if (toggle.checked) contentEl.classList.add('active');
      else contentEl.classList.remove('active');
    });
  }

  // --- Shape Picker ---
  function buildShapePicker() {
    shapeGrid.innerHTML = '';
    SHAPES.forEach(shape => {
      const btn = document.createElement('button');
      btn.className = 'shape-btn' + (shape.id === selectedShape ? ' active' : '');
      btn.title = shape.label;

      const mc = document.createElement('canvas');
      mc.width = 24; mc.height = 24;
      const cx = mc.getContext('2d');
      cx.translate(12, 12);
      cx.beginPath();
      shape.draw(cx, 20);
      cx.fillStyle = shape.id === selectedShape ? '#00ffff' : '#3a3a50';
      cx.fill();

      btn.appendChild(mc);
      btn.addEventListener('click', () => {
        selectedShape = shape.id;
        document.querySelectorAll('#tab-svg .shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildShapePicker(); // Redraw
        updatePreview();
        saveSettings();
      });
      shapeGrid.appendChild(btn);
    });
  }

  // --- Filename & Size Detect ---
  function detectFilename(s) {
    try {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const el = doc.querySelector('svg'); if (!el) return 'icon';
      const cls = el.getAttribute('class') || '';
      const m = cls.match(/(?:lucide-|icon-|ic-|svg-)([a-z0-9-]+)/i);
      if (m) return m[1];
      const id = el.getAttribute('id'); if (id && id.trim()) return id.trim().replace(/\s+/g, '-');
      return 'icon';
    } catch { return 'icon'; }
  }

  function getOriginalSize(s) {
    try {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const el = doc.querySelector('svg'); if (!el) return { w: 24, h: 24 };
      let w = parseFloat(el.getAttribute('width')), h = parseFloat(el.getAttribute('height'));
      if (!w || !h) { const vb = el.getAttribute('viewBox'); if (vb) { const p = vb.trim().split(/[\s,]+/); if (p.length === 4) { w = parseFloat(p[2]); h = parseFloat(p[3]); } } }
      return { w: w || 24, h: h || 24 };
    } catch { return { w: 24, h: 24 }; }
  }

  // --- Rendering ---
  function applyIconMods(svgString) {
    const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
    const el = doc.querySelector('svg'); if (!el) return svgString;
    if (colorEnabled.checked) {
      const hex = colorHex.value;
      doc.querySelectorAll('*').forEach(n => {
        ['stroke', 'fill', 'color'].forEach(a => { if (n.getAttribute(a) === 'currentColor') n.setAttribute(a, hex); });
        const st = n.getAttribute('style') || ''; if (st.includes('currentColor')) n.setAttribute('style', st.replace(/currentColor/g, hex));
      });
      el.style.color = hex;
    }
    if (sizeEnabled.checked) {
      const w = parseInt(sizeW.value) || null, h = parseInt(sizeH.value) || null;
      if (w) el.setAttribute('width', w); if (h) el.setAttribute('height', h);
    }
    return new XMLSerializer().serializeToString(doc.documentElement);
  }

  function renderComposite(canvasSize) {
    return new Promise((resolve, reject) => {
      if (!parsedSvg) return reject('no svg');
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize; canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      const padding = parseInt(bgPadding.value);
      const opacity = parseInt(bgOpacity.value) / 100;
      const doBackground = bgEnabled.checked;
      const doStroke = strokeEnabled.checked;
      const doShadow = shadowEnabled.checked;

      const cx = canvasSize / 2, cy = canvasSize / 2;

      if (doBackground) {
        ctx.save();
        ctx.translate(cx, cy);
        if (doShadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = parseInt(shadowBlur.value);
          ctx.shadowOffsetY = 4;
        }
        ctx.beginPath();
        const shapeSize = canvasSize * 0.94;
        const shapeObj = SHAPES.find(s => s.id === selectedShape);
        if (shapeObj) shapeObj.draw(ctx, shapeSize);
        ctx.fillStyle = hexToRgba(bgColor1.value, opacity);
        ctx.fill();
        if (doStroke) {
          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = strokeColor.value;
          ctx.lineWidth = parseInt(strokeWidth.value) * (canvasSize / 256);
          ctx.stroke();
        }
        ctx.restore();
      }

      const modSvg = applyIconMods(parsedSvg);
      const iconArea = canvasSize - padding * (canvasSize / 100) * 2;
      const iconDoc = new DOMParser().parseFromString(modSvg, 'image/svg+xml');
      const iconEl = iconDoc.querySelector('svg');
      iconEl.setAttribute('width', iconArea);
      iconEl.setAttribute('height', iconArea);
      const finalSvg = new XMLSerializer().serializeToString(iconEl);
      const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const offset = (canvasSize - iconArea) / 2;
        ctx.drawImage(img, offset, offset, iconArea, iconArea);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject('img load fail'); };
      img.src = url;
    });
  }

  function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function updatePreview() {
    const raw = svgInput.value.trim();
    if (!raw) {
      parsedSvg = null;
      previewBox.innerHTML = '<span class="preview-hint">Paste SVG</span>';
      filenameDisplay.textContent = '—';
      return;
    }
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    if (doc.querySelector('parsererror')) {
      previewBox.innerHTML = '<span class="preview-hint" style="color: #f87171;">Invalid SVG</span>';
      parsedSvg = null; return;
    }
    parsedSvg = raw;
    const orig = getOriginalSize(raw); aspectRatio = orig.w / orig.h;
    if (!sizeEnabled.checked) { sizeW.placeholder = orig.w; sizeH.placeholder = orig.h; }
    filenameDisplay.textContent = detectFilename(raw) + '.svg';

    renderComposite(100).then(canvas => {
      previewBox.innerHTML = '';
      previewBox.appendChild(canvas);
    });
  }

  // --- Events ---
  svgInput.addEventListener('input', updatePreview);
  svgClearBtn.addEventListener('click', () => { svgInput.value = ''; updatePreview(); });

  svgResetColor.addEventListener('click', () => {
    colorHex.value = '#7c6aff';
    colorPicker.value = '#7c6aff';
    updatePreview();
    saveSettings();
  });

  colorPicker.addEventListener('input', () => { colorHex.value = colorPicker.value; updatePreview(); saveSettings(); });
  colorHex.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(colorHex.value)) { colorPicker.value = colorHex.value; updatePreview(); saveSettings(); } });
  
  bgColor1.addEventListener('input', () => { bgHex1.value = bgColor1.value; updatePreview(); saveSettings(); });
  bgHex1.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(bgHex1.value)) { bgColor1.value = bgHex1.value; updatePreview(); saveSettings(); } });
  
  strokeColor.addEventListener('input', () => { strokeHex.value = strokeColor.value; updatePreview(); saveSettings(); });
  strokeHex.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(strokeHex.value)) { strokeColor.value = strokeHex.value; updatePreview(); saveSettings(); } });

  bgPadding.addEventListener('input', () => { bgPaddingVal.textContent = bgPadding.value; updatePreview(); saveSettings(); });
  bgOpacity.addEventListener('input', () => { bgOpacityVal.textContent = bgOpacity.value + '%'; updatePreview(); saveSettings(); });
  strokeWidth.addEventListener('input', () => { strokeWidthVal.textContent = strokeWidth.value; updatePreview(); saveSettings(); });
  shadowBlur.addEventListener('input', () => { shadowBlurVal.textContent = shadowBlur.value; updatePreview(); saveSettings(); });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseInt(btn.dataset.size);
      sizeEnabled.checked = true; sizeW.value = s; sizeH.value = s;
      presetBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
      document.getElementById('svgSizeContent').classList.add('active');
      updatePreview();
      saveSettings();
    });
  });

  sizeW.addEventListener('input', () => {
    if (lockARInput.checked && !ignoreNextSize) { const w = parseFloat(sizeW.value); if (w) { ignoreNextSize = true; sizeH.value = Math.round(w / aspectRatio); ignoreNextSize = false; } }
    updatePreview();
    saveSettings();
  });
  sizeH.addEventListener('input', () => {
    if (lockARInput.checked && !ignoreNextSize) { const h = parseFloat(sizeH.value); if (h) { ignoreNextSize = true; sizeW.value = Math.round(h * aspectRatio); ignoreNextSize = false; } }
    updatePreview();
    saveSettings();
  });

  lockARInput.addEventListener('change', saveSettings);

  downloadBtn.addEventListener('click', () => {
    if (!parsedSvg) return;
    const exportSize = sizeEnabled.checked ? (parseInt(sizeW.value) || 256) : 256;
    const finalSvg = buildFinalSvg(exportSize);
    const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const name = detectFilename(parsedSvg) + '.svg';
    chrome.downloads.download({ url, filename: name, saveAs: false }, () => URL.revokeObjectURL(url));
  });

  function buildFinalSvg(exportSize) {
    const padding = parseInt(bgPadding.value);
    const opacity = parseInt(bgOpacity.value) / 100;
    const doBackground = bgEnabled.checked;
    const doStroke = strokeEnabled.checked;
    const doShadow = shadowEnabled.checked;
    const sW = parseInt(strokeWidth.value);
    const shBlur = parseInt(shadowBlur.value);

    let defs = '';
    if (doShadow) {
      defs = `<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="${shBlur/2}" flood-opacity="0.4"/></filter></defs>`;
    }

    let bgMarkup = '';
    if (doBackground) {
      const shapePoints = getShapePoints(selectedShape, exportSize);
      bgMarkup = `<path d="${shapePoints}" fill="${bgColor1.value}" fill-opacity="${opacity}" ${doShadow ? 'filter="url(#shadow)"' : ''} ${doStroke ? `stroke="${strokeColor.value}" stroke-width="${sW}"` : ''}/>`;
    }

    const modSvg = applyIconMods(parsedSvg);
    const iconDoc = new DOMParser().parseFromString(modSvg, 'image/svg+xml');
    const iconEl = iconDoc.querySelector('svg');
    const iconSize = exportSize - padding * (exportSize / 100) * 2;
    const offset = (exportSize - iconSize) / 2;
    
    iconEl.setAttribute('x', offset);
    iconEl.setAttribute('y', offset);
    iconEl.setAttribute('width', iconSize);
    iconEl.setAttribute('height', iconSize);
    
    const iconContent = new XMLSerializerToString().serializeToString(iconEl);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${exportSize}" height="${exportSize}" viewBox="0 0 ${exportSize} ${exportSize}">${defs}${bgMarkup}${iconContent}</svg>`;
  }

  function XMLSerializerToString() {
    this.serializeToString = function(node) {
      return new XMLSerializer().serializeToString(node);
    }
  }

  function getShapePoints(shapeId, size) {
    const cx = size / 2, cy = size / 2, r = size / 2 * 0.94;
    function polyPts(sides, startAngle = 0) {
      let d = '';
      for (let i = 0; i < sides; i++) {
        const a = startAngle + (i * Math.PI * 2 / sides);
        d += (i === 0 ? 'M' : 'L') + (cx + Math.cos(a) * r).toFixed(2) + ',' + (cy + Math.sin(a) * r).toFixed(2);
      }
      return d + 'Z';
    }
    switch (shapeId) {
      case 'square': return roundedRectPath(cx - r, cy - r, r * 2, r * 2, r * 0.12);
      case 'squircle': return roundedRectPath(cx - r, cy - r, r * 2, r * 2, r * 0.32);
      case 'circle': return `M${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy}`;
      case 'triangle': return polyPts(3, -Math.PI / 2);
      case 'star': return starPath(cx, cy, r, r * 0.45, 5);
      default: return polyPts(6, 0);
    }
  }

  function roundedRectPath(x, y, w, h, rx) {
    return `M${x + rx},${y} L${x + w - rx},${y} Q${x + w},${y} ${x + w},${y + rx} L${x + w},${y + h - rx} Q${x + w},${y + h} ${x + w - rx},${y + h} L${x + rx},${y + h} Q${x},${y + h} ${x},${y + h - rx} L${x},${y + rx} Q${x},${y} ${x + rx},${y} Z`;
  }

  function starPath(cx, cy, outerR, innerR, points) {
    const step = Math.PI / points; let d = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = i * step - Math.PI / 2;
      d += (i === 0 ? 'M' : 'L') + (cx + Math.cos(a) * r).toFixed(2) + ',' + (cy + Math.sin(a) * r).toFixed(2);
    }
    return d + 'Z';
  }

  loadSettings();
})();
