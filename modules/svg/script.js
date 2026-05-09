(function() {
  'use strict';

  // --- Shape Definitions ---
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

  let selectedShapeId = 'squircle';

  // --- Shape drawing helpers ---
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

  // --- UI Elements ---
  const svgInput = document.getElementById('svgInput');
  const svgClearBtn = document.getElementById('svgClearBtn');
  const svgPreviewBox = document.getElementById('svgPreviewBox');
  const svgColorEnabled = document.getElementById('svgColorEnabled');
  const svgColorPicker = document.getElementById('svgColorPicker');
  const svgColorHex = document.getElementById('svgColorHex');
  const svgResetColor = document.getElementById('svgResetColor');
  const svgSizeW = document.getElementById('svgSizeW');
  const svgSizeH = document.getElementById('svgSizeH');
  const svgLockAR = document.getElementById('svgLockAR');
  const svgShapeEnabled = document.getElementById('svgShapeEnabled');
  const svgShapeGrid = document.getElementById('svgShapeGrid');
  const svgBgEnabled = document.getElementById('svgBgEnabled');
  const svgBgPadding = document.getElementById('svgBgPadding');
  const svgBgPaddingVal = document.getElementById('svgBgPaddingVal');
  const svgBgRotation = document.getElementById('svgBgRotation');
  const svgBgRotationVal = document.getElementById('svgBgRotationVal');
  const svgBgColor1 = document.getElementById('svgBgColor1');
  const svgBgHex1 = document.getElementById('svgBgHex1');
  const svgBgGradient = document.getElementById('svgBgGradient');
  const svgGradientSettings = document.getElementById('svgGradientSettings');
  const svgBgColor2 = document.getElementById('svgBgColor2');
  const svgBgHex2 = document.getElementById('svgBgHex2');
  const svgGradTypeVal = document.getElementById('svgGradTypeVal');
  const typeBtns = document.querySelectorAll('#tab-svg .type-btn');
  const svgGradAngle = document.getElementById('svgGradAngle');
  const svgGradAngleVal = document.getElementById('svgGradAngleVal');
  const svgGradStop1 = document.getElementById('svgGradStop1');
  const svgGradStop1Val = document.getElementById('svgGradStop1Val');
  const svgGradStop2 = document.getElementById('svgGradStop2');
  const svgGradStop2Val = document.getElementById('svgGradStop2Val');
  const svgBgOpacity = document.getElementById('svgBgOpacity');
  const svgBgOpacityVal = document.getElementById('svgBgOpacityVal');
  const svgShadowEnabled = document.getElementById('svgShadowEnabled');
  const svgShadowColor = document.getElementById('svgShadowColor');
  const svgShadowHex = document.getElementById('svgShadowHex');
  const svgShadowBlur = document.getElementById('svgShadowBlur');
  const svgShadowBlurVal = document.getElementById('svgShadowBlurVal');
  const svgShadowSpread = document.getElementById('svgShadowSpread');
  const svgShadowSpreadVal = document.getElementById('svgShadowSpreadVal');
  const svgShadowOffsetX = document.getElementById('svgShadowOffsetX');
  const svgShadowOffsetXVal = document.getElementById('svgShadowOffsetXVal');
  const svgShadowOffsetY = document.getElementById('svgShadowOffsetY');
  const svgShadowOffsetYVal = document.getElementById('svgShadowOffsetYVal');
  const svgShadowOpacity = document.getElementById('svgShadowOpacity');
  const svgShadowOpacityVal = document.getElementById('svgShadowOpacityVal');
  const svgDownloadBtn = document.getElementById('svgDownloadBtn');
  const svgCopyBtn = document.getElementById('svgCopyBtn');

  // --- State ---
  let parsedSvg = null;
  let aspectRatio = 1;
  let ignoreNextSize = false;
  let selectedGradType = 'linear';

  // --- Accordions ---
  function initAccordions() {
    const items = document.querySelectorAll('#tab-svg .svg-setting-item');
    items.forEach(item => {
      const header = item.querySelector('.row-header');
      const content = item.querySelector('.row-content');
      if (!header || !content) return;
      
      // Initial state: Open Color by default
      if (item.querySelector('#svgColorEnabled')) {
        content.classList.add('active');
      }

      header.addEventListener('click', (e) => {
        // Prevent toggle switches and other inputs from triggering accordion
        if (e.target.closest('.toggle-switch') || e.target.closest('input') || e.target.closest('button')) return;
        
        const isActive = content.classList.contains('active');
        if (isActive) {
          content.classList.remove('active');
        } else {
          content.classList.add('active');
        }
      });
    });
  }

  // --- Utilities ---
  function updateTrackFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    const fill = slider.parentElement.querySelector('.track-fill-preview');
    if (fill) fill.style.width = percent + '%';
  }

  function detectFilename(s) {
    try {
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      const el = doc.querySelector('svg'); if (!el) return 'icon';
      const cls = el.getAttribute('class') || '';
      const m = cls.match(/(?:lucide-|icon-|ic-|svg-)([a-z0-9-]+)/i);
      if (m) return m[1];
      const id = el.getAttribute('id'); if (id && id.trim()) return id.trim().replace(/\s+/g, '-');
      const lbl = el.getAttribute('aria-label'); if (lbl && lbl.trim()) return lbl.trim().toLowerCase().replace(/\s+/g, '-');
      const title = el.querySelector('title'); if (title && title.textContent.trim()) return title.textContent.trim().toLowerCase().replace(/\s+/g, '-');
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

  function applyIconMods(svgString) {
    const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
    const el = doc.querySelector('svg'); if (!el) return svgString;
    if (svgColorEnabled.checked) {
      const hex = svgColorHex.value;
      doc.querySelectorAll('*').forEach(n => {
        ['stroke', 'fill', 'color'].forEach(a => { if (n.getAttribute(a) === 'currentColor') n.setAttribute(a, hex); });
        const st = n.getAttribute('style') || ''; if (st.includes('currentColor')) n.setAttribute('style', st.replace(/currentColor/g, hex));
      });
      el.style.color = hex;

      const w = parseInt(svgSizeW.value) || null, h = parseInt(svgSizeH.value) || null;
      if (w) el.setAttribute('width', w); if (h) el.setAttribute('height', h);
    }
    return new XMLSerializer().serializeToString(doc.documentElement);
  }

  function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // --- Rendering ---
  function renderComposite(canvasSize) {
    return new Promise((resolve, reject) => {
      if (!parsedSvg) return reject('no svg');
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize; canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      const padding = parseInt(svgBgPadding.value);
      const rotation = parseInt(svgBgRotation.value) * Math.PI / 180;
      const opacity = parseInt(svgBgOpacity.value) / 100;
      const doGradient = svgBgGradient.checked;
      const col1 = svgBgColor1.value, col2 = svgBgColor2.value;
      const stop1 = parseInt(svgGradStop1.value) / 100;
      const stop2 = parseInt(svgGradStop2.value) / 100;
      const gradAngle = parseInt(svgGradAngle.value);
      
      const doShadow = svgShadowEnabled.checked;
      const shCol = svgShadowColor.value, shBlur = parseInt(svgShadowBlur.value);
      const shSpread = parseInt(svgShadowSpread.value);
      const shX = parseInt(svgShadowOffsetX.value), shY = parseInt(svgShadowOffsetY.value);
      const shOp = parseInt(svgShadowOpacity.value) / 100;
      const doBackground = svgBgEnabled.checked;

      const cx = canvasSize / 2, cy = canvasSize / 2;

      if (doBackground) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        if (doShadow) {
          ctx.shadowColor = hexToRgba(shCol, shOp);
          ctx.shadowBlur = shBlur;
          ctx.shadowOffsetX = shX;
          ctx.shadowOffsetY = shY;
        }

        const shapeSize = (canvasSize * 0.94) + (shSpread * 2);
        if (svgShapeEnabled.checked) {
          ctx.beginPath();
          const shapeObj = SHAPES.find(s => s.id === selectedShapeId);
          if (shapeObj) shapeObj.draw(ctx, shapeSize);
        }

        if (doGradient) {
          let grad;
          if (selectedGradType === 'linear') {
            const angleRad = (gradAngle - 90) * Math.PI / 180;
            const r = shapeSize / 2;
            const x1 = Math.cos(angleRad) * r;
            const y1 = Math.sin(angleRad) * r;
            const x2 = -x1;
            const y2 = -y1;
            grad = ctx.createLinearGradient(x2, y2, x1, y1);
          } else {
            grad = ctx.createRadialGradient(0, 0, 0, 0, 0, shapeSize / 2);
          }
          grad.addColorStop(stop1, hexToRgba(col1, opacity));
          grad.addColorStop(stop2, hexToRgba(col2, opacity));
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = hexToRgba(col1, opacity);
        }
        ctx.fill();
        ctx.restore();
      }

      const modSvg = applyIconMods(parsedSvg);
      const iconArea = canvasSize - padding * 2;
      const iconDoc = new DOMParser().parseFromString(modSvg, 'image/svg+xml');
      const iconEl = iconDoc.querySelector('svg');
      iconEl.setAttribute('width', iconArea);
      iconEl.setAttribute('height', iconArea);
      const finalSvg = new XMLSerializer().serializeToString(iconEl);
      const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, padding, padding, iconArea, iconArea);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject('img load fail'); };
      img.src = url;
    });
  }

  function updatePreview() {
    const raw = svgInput.value.trim();
    if (!raw) {
      parsedSvg = null;
      svgPreviewBox.innerHTML = '<span class="preview-hint">Paste SVG</span>';
      return;
    }
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    if (doc.querySelector('parsererror')) {
      svgPreviewBox.innerHTML = '<span class="preview-hint" style="color:#f87171">Invalid</span>';
      parsedSvg = null; return;
    }
    parsedSvg = raw;
    const orig = getOriginalSize(raw); aspectRatio = orig.w / orig.h;
    if (!svgColorEnabled.checked) { svgSizeW.placeholder = orig.w; svgSizeH.placeholder = orig.h; }

    renderComposite(80).then(canvas => {
      svgPreviewBox.innerHTML = '';
      svgPreviewBox.appendChild(canvas);
    }).catch(err => {
      console.error('Preview error:', err);
      svgPreviewBox.innerHTML = '<span class="preview-hint" style="color:#f87171">Error</span>';
    });
  }

  // --- Build final SVG for download ---
  function buildFinalSvg() {
    if (!parsedSvg) return null;
    const exportSize = svgColorEnabled.checked ? (parseInt(svgSizeW.value) || 256) : 256;
    const padding = parseInt(svgBgPadding.value) * (exportSize / 80);
    const rotation = parseInt(svgBgRotation.value);
    const opacity = parseInt(svgBgOpacity.value) / 100;
    const doGradient = svgBgGradient.checked;
    const col1 = svgBgColor1.value, col2 = svgBgColor2.value;
    const stop1 = parseInt(svgGradStop1.value) / 100;
    const stop2 = parseInt(svgGradStop2.value) / 100;
    const gradAngle = parseInt(svgGradAngle.value);
    
    const doShadow = svgShadowEnabled.checked;
    const shCol = svgShadowColor.value, shBlur = parseInt(svgShadowBlur.value);
    const shSpread = parseInt(svgShadowSpread.value);
    const shX = parseInt(svgShadowOffsetX.value), shY = parseInt(svgShadowOffsetY.value);
    const shOp = parseInt(svgShadowOpacity.value) / 100;
    const doBackground = svgBgEnabled.checked;

    const modSvg = applyIconMods(parsedSvg);
    const iconDoc = new DOMParser().parseFromString(modSvg, 'image/svg+xml');
    const iconEl = iconDoc.querySelector('svg');
    const iconSize = exportSize - padding * 2;
    iconEl.setAttribute('width', iconSize);
    iconEl.setAttribute('height', iconSize);
    const iconContent = new XMLSerializer().serializeToString(iconEl);

    const shapePoints = getShapePath(selectedShapeId, exportSize + (shSpread * 2));

    let fillAttr;
    let defsExtra = '';

    if (doGradient) {
      const gradId = 'svg-bg-grad-' + Date.now();
      fillAttr = `fill="url(#${gradId})"`;
      if (selectedGradType === 'linear') {
        const angleRad = (gradAngle - 90) * Math.PI / 180;
        const x1 = (Math.cos(angleRad + Math.PI) * 50 + 50).toFixed(2) + '%';
        const y1 = (Math.sin(angleRad + Math.PI) * 50 + 50).toFixed(2) + '%';
        const x2 = (Math.cos(angleRad) * 50 + 50).toFixed(2) + '%';
        const y2 = (Math.sin(angleRad) * 50 + 50).toFixed(2) + '%';
        defsExtra = `<linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="${stop1 * 100}%" stop-color="${col1}" stop-opacity="${opacity}"/><stop offset="${stop2 * 100}%" stop-color="${col2}" stop-opacity="${opacity}"/></linearGradient>`;
      } else {
        defsExtra = `<radialGradient id="${gradId}" cx="50%" cy="50%" r="50%"><stop offset="${stop1 * 100}%" stop-color="${col1}" stop-opacity="${opacity}"/><stop offset="${stop2 * 100}%" stop-color="${col2}" stop-opacity="${opacity}"/></radialGradient>`;
      }
    } else {
      fillAttr = `fill="${col1}" fill-opacity="${opacity}"`;
    }

    const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${exportSize}" height="${exportSize}" viewBox="0 0 ${exportSize} ${exportSize}">
  <defs>
    ${defsExtra}
    ${doShadow ? `<filter id="svg-shf" x="-50%" y="-50%" width="200%" height="200%">
      <feMorphology in="SourceAlpha" result="spread" operator="dilate" radius="${shSpread}"/>
      <feDropShadow in="spread" dx="${shX}" dy="${shY}" stdDeviation="${shBlur / 2}" flood-color="${shCol}" flood-opacity="${shOp}"/>
    </filter>` : ''}
  </defs>
  ${doBackground ? `<g transform="rotate(${rotation},${exportSize / 2},${exportSize / 2})" ${doShadow ? 'filter="url(#svg-shf)"' : ''}>
    <path d="${shapePoints}" ${fillAttr}/>
  </g>` : ''}
  <g transform="translate(${padding},${padding})">
    ${iconContent}
  </g>
</svg>`;
    return out;
  }

  function getShapePath(shapeId, size) {
    const cx = size / 2, cy = size / 2, r = size / 2 * 0.94;
    function poly(sides, startAngle = 0) {
      let d = '';
      for (let i = 0; i < sides; i++) {
        const a = startAngle + (i * Math.PI * 2 / sides);
        d += (i === 0 ? 'M' : 'L') + (cx + Math.cos(a) * r).toFixed(2) + ',' + (cy + Math.sin(a) * r).toFixed(2);
      }
      return d + 'Z';
    }
    switch (shapeId) {
      case 'square': return rect(cx - r, cy - r, r * 2, r * 2, r * 0.12);
      case 'squircle': return rect(cx - r, cy - r, r * 2, r * 2, r * 0.32);
      case 'circle': return `M${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy}`;
      case 'triangle': return poly(3, -Math.PI / 2);
      case 'star': return star(cx, cy, r, r * 0.45, 5);
      default: return poly(4, 0);
    }
  }

  function rect(x, y, w, h, rx) {
    return `M${x + rx},${y} L${x + w - rx},${y} Q${x + w},${y} ${x + w},${y + rx} L${x + w},${y + h - rx} Q${x + w},${y + h} ${x + w - rx},${y + h} L${x + rx},${y + h} Q${x},${y + h} ${x},${y + h - rx} L${x},${y + rx} Q${x},${y} ${x + rx},${y} Z`;
  }

  function star(cx, cy, outerR, innerR, points) {
    const step = Math.PI / points; let d = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = i * step - Math.PI / 2;
      d += (i === 0 ? 'M' : 'L') + (cx + Math.cos(a) * r).toFixed(2) + ',' + (cy + Math.sin(a) * r).toFixed(2);
    }
    return d + 'Z';
  }

  // --- Controls ---
  function wireSlider(el, valEl, suffix = '') {
    updateTrackFill(el);
    el.addEventListener('input', () => { 
      valEl.textContent = el.value + suffix; 
      updateTrackFill(el);
      updatePreview(); 
    });
  }

  function wireColor(picker, hex) {
    picker.addEventListener('input', () => { hex.value = picker.value; updatePreview(); });
    hex.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) { picker.value = hex.value; updatePreview(); } });
  }

  function init() {
    wireSlider(svgBgPadding, svgBgPaddingVal, '');
    wireSlider(svgBgRotation, svgBgRotationVal, '°');
    wireSlider(svgBgOpacity, svgBgOpacityVal, '%');
    wireSlider(svgGradAngle, svgGradAngleVal, '°');
    wireSlider(svgGradStop1, svgGradStop1Val, '%');
    wireSlider(svgGradStop2, svgGradStop2Val, '%');
    wireSlider(svgShadowBlur, svgShadowBlurVal, '');
    wireSlider(svgShadowSpread, svgShadowSpreadVal, '');
    wireSlider(svgShadowOffsetX, svgShadowOffsetXVal, '');
    wireSlider(svgShadowOffsetY, svgShadowOffsetYVal, '');
    wireSlider(svgShadowOpacity, svgShadowOpacityVal, '%');

    wireColor(svgColorPicker, svgColorHex);
    wireColor(svgBgColor1, svgBgHex1);
    wireColor(svgBgColor2, svgBgHex2);
    wireColor(svgShadowColor, svgShadowHex);

    svgBgGradient.addEventListener('change', () => {
      svgGradientSettings.style.display = svgBgGradient.checked ? 'flex' : 'none';
      updatePreview();
    });

    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedGradType = btn.dataset.type;
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        svgGradTypeVal.textContent = selectedGradType === 'linear' ? 'Linear' : 'Radial';
        svgGradAngleRow.style.display = selectedGradType === 'linear' ? 'flex' : 'none';
        updatePreview();
      });
    });

    [svgColorEnabled, svgBgEnabled, svgShadowEnabled, svgShapeEnabled].forEach(t => t.addEventListener('change', updatePreview));

    svgClearBtn.addEventListener('click', () => { svgInput.value = ''; updatePreview(); });
    svgResetColor.addEventListener('click', () => { svgColorEnabled.checked = false; svgColorPicker.value = '#ffffff'; svgColorHex.value = '#ffffff'; updatePreview(); });

    svgSizeW.addEventListener('input', () => {
      if (svgLockAR.querySelector('input').checked && !ignoreNextSize) {
        const w = parseFloat(svgSizeW.value); if (w) { ignoreNextSize = true; svgSizeH.value = Math.round(w / aspectRatio); ignoreNextSize = false; }
      }
      updatePreview();
    });
    svgSizeH.addEventListener('input', () => {
      if (svgLockAR.querySelector('input').checked && !ignoreNextSize) {
        const h = parseFloat(svgSizeH.value); if (h) { ignoreNextSize = true; svgSizeW.value = Math.round(h * aspectRatio); ignoreNextSize = false; }
      }
      updatePreview();
    });

    svgInput.addEventListener('input', updatePreview);
    initAccordions();
    buildShapePicker();

    // Downloads & Copy
    svgDownloadBtn.addEventListener('click', () => {
      if (!parsedSvg) return;
      const out = buildFinalSvg();
      const blob = new Blob([out], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url, filename: detectFilename(parsedSvg) + '.svg' });
    });

    svgCopyBtn.addEventListener('click', () => {
      if (!parsedSvg) return;
      const out = buildFinalSvg();
      navigator.clipboard.writeText(out).then(() => {
        const oldText = svgCopyBtn.textContent;
        svgCopyBtn.textContent = 'Copied!';
        svgCopyBtn.classList.add('btn-success');
        setTimeout(() => {
          svgCopyBtn.textContent = oldText;
          svgCopyBtn.classList.remove('btn-success');
        }, 2000);
      });
    });
  }

  // Build Shape Picker
  function buildShapePicker() {
    svgShapeGrid.innerHTML = '';
    SHAPES.forEach(shape => {
      const btn = document.createElement('button');
      btn.className = 'shape-btn' + (shape.id === selectedShapeId ? ' active' : '');
      const mc = document.createElement('canvas');
      mc.width = 24; mc.height = 24;
      const cx = mc.getContext('2d');
      cx.translate(12, 12);
      cx.beginPath();
      shape.draw(cx, 20);
      cx.fillStyle = shape.id === selectedShapeId ? '#00ffff' : '#3a3a50';
      cx.fill();
      btn.appendChild(mc);
      btn.addEventListener('click', () => {
        selectedShapeId = shape.id;
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildShapePicker(); // refresh icons
        updatePreview();
      });
      svgShapeGrid.appendChild(btn);
    });
  }

  init();
})();
