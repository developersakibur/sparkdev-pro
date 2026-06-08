(function() {
  'use strict';
  window.initSvg = function() {
    let currentShape = 'circle'; 
    let blobSeed = Math.random();
    let arLocked = true;
    let baseWidth = 0, baseHeight = 0;

    const els = {
      input: document.getElementById('svgInput'),
      preview: document.getElementById('svgPreviewBox'),
      copyBtn: document.getElementById('svgCopyBtn'),
      downloadBtn: document.getElementById('svgDownloadBtn'),
      clearBtn: document.getElementById('svgClearBtn'),
      colorEnabled: document.getElementById('svgColorEnabled'),
      iconColor: document.getElementById('svgColorPicker'),
      iconHex: document.getElementById('svgColorHex'),
      resetColor: document.getElementById('svgResetColor'),
      sizeW: document.getElementById('svgSizeW'),
      sizeH: document.getElementById('svgSizeH'),
      lockAR: document.getElementById('svgLockAR'),
      bgEnabled: document.getElementById('svgBgEnabled'),
      bgColor1: document.getElementById('svgBgColor1'),
      bgHex1: document.getElementById('svgBgHex1'),
      bgGradient: document.getElementById('svgBgGradient'),
      gradientSection: document.getElementById('svgGradientSettings'),
      bgColor2: document.getElementById('svgBgColor2'),
      bgHex2: document.getElementById('svgBgHex2'),
      gradType: 'linear',
      gradAngle: document.getElementById('svgGradAngle'),
      gradStop1: document.getElementById('svgGradStop1'),
      gradStop2: document.getElementById('svgGradStop2'),
      bgPadding: document.getElementById('svgBgPadding'),
      bgRotation: document.getElementById('svgBgRotation'),
      bgOpacity: document.getElementById('svgBgOpacity'),
      shapeEnabled: document.getElementById('svgShapeEnabled'),
      shapePicker: document.getElementById('svgShapePicker'),
      polyControls: document.getElementById('svgPolygonControls'),
      blobControls: document.getElementById('svgBlobControls'),
      shapeRoundness: document.getElementById('svgShapeRoundness'),
      shapeComplexity: document.getElementById('svgShapeComplexity'),
      shapeContrast: document.getElementById('svgShapeContrast'),
      shuffleBlob: document.getElementById('svgShuffleBlob'),
      shadowEnabled: document.getElementById('svgShadowEnabled'),
      shadowColor: document.getElementById('svgShadowColor'),
      shadowHex: document.getElementById('svgShadowHex'),
      shadowBlur: document.getElementById('svgShadowBlur'),
      shadowOffsetX: document.getElementById('svgShadowOffsetX'),
      shadowOffsetY: document.getElementById('svgShadowOffsetY'),
      shadowOpacity: document.getElementById('svgShadowOpacity')
    };

    function init() {
      attachEvents();
      loadSettings();
    }

    function attachEvents() {
      const allInputs = document.querySelectorAll('#tab-svg input, #tab-svg textarea');
      allInputs.forEach(el => el.addEventListener('input', (e) => {
        if (e.target.id === 'svgSizeW' || e.target.id === 'svgSizeH') return; 
        updatePreview();
        saveSettings();
      }));
      
      els.copyBtn.addEventListener('click', copyToClipboard);
      els.downloadBtn.addEventListener('click', downloadSvg);
      els.clearBtn.addEventListener('click', () => { els.input.value = ''; updatePreview(); saveSettings(); });
      
      els.resetColor.addEventListener('click', () => {
        els.iconColor.value = '#ffffff';
        els.iconHex.value = '#ffffff';
        updatePreview();
        saveSettings();
      });

      [['iconColor', 'iconHex'], ['bgColor1', 'bgHex1'], ['bgColor2', 'bgHex2'], ['shadowColor', 'shadowHex']].forEach(([p, h]) => {
        const picker = els[p];
        const hex = els[h];
        if (picker && hex) {
          picker.addEventListener('input', () => { hex.value = picker.value; updatePreview(); saveSettings(); });
          hex.addEventListener('input', () => { if (/^#[0-9A-F]{6}$/i.test(hex.value)) { picker.value = hex.value; updatePreview(); saveSettings(); } });
        }
      });

      els.sizeW.addEventListener('input', () => {
        if (arLocked && baseWidth > 0) {
          els.sizeH.value = Math.round(els.sizeW.value * (baseHeight / baseWidth));
        }
        updatePreview();
        saveSettings();
      });
      els.sizeH.addEventListener('input', () => {
        if (arLocked && baseHeight > 0) {
          els.sizeW.value = Math.round(els.sizeH.value * (baseWidth / baseHeight));
        }
        updatePreview();
        saveSettings();
      });
      const lockARInput = els.lockAR.querySelector('input');
      lockARInput.addEventListener('change', () => {
        arLocked = lockARInput.checked;
        els.lockAR.style.color = arLocked ? 'var(--sd-color-cyan)' : 'var(--sd-color-text-muted)';
        saveSettings();
      });

      // Gradient type buttons
      document.querySelectorAll('#svgGradientSettings .sd-c-segmented__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#svgGradientSettings .sd-c-segmented__btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          els.gradType = btn.dataset.type;
          document.getElementById('svgGradTypeVal').textContent = btn.textContent;
          document.getElementById('svgGradAngleRow').style.display = els.gradType === 'linear' ? 'block' : 'none';
          updatePreview();
          saveSettings();
        });
      });

      els.bgGradient.addEventListener('change', () => {
        els.gradientSection.style.display = els.bgGradient.checked ? 'flex' : 'none';
        updatePreview();
        saveSettings();
      });

      // Shape Picker
      els.shapePicker.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          els.shapePicker.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentShape = btn.dataset.shape;
          
          els.polyControls.style.display = (currentShape !== 'blob' && currentShape !== 'circle') ? 'flex' : 'none';
          els.blobControls.style.display = currentShape === 'blob' ? 'flex' : 'none';
          
          updatePreview();
          saveSettings();
        });
      });

      els.shuffleBlob.addEventListener('click', () => {
        blobSeed = Math.random();
        updatePreview();
        saveSettings();
      });

      // Accordion logic
      document.querySelectorAll('#tab-svg .sd-c-setting-item__header').forEach(h => h.addEventListener('click', e => {
        if (e.target.closest('.sd-c-toggle')) return;
        const item = h.closest('.sd-c-setting-item');
        const content = item.querySelector('.sd-c-setting-item__content');
        
        document.querySelectorAll('#tab-svg .sd-c-setting-item').forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.sd-c-setting-item__content').style.display = 'none';
          }
        });

        const isOpen = item.classList.toggle('is-open');
        content.style.display = isOpen ? 'flex' : 'none';
      }));
    }

    function getPolygonPath(size, sides, roundnessPercent) {
      const center = size / 2;
      const radius = size / 2;
      const points = [];
      const roundness = (radius * (roundnessPercent / 100)) * 0.5;

      let startAngle = -Math.PI / 2;
      if (sides === 4) startAngle -= Math.PI / 4;

      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides + startAngle;
        points.push({
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle)
        });
      }

      if (roundness <= 0) {
        return `M${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L${p.x},${p.y}`).join(' ') + 'Z';
      }

      let path = "";
      for (let i = 0; i < sides; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % sides];
        const p3 = points[(i + 2) % sides];

        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);

        const x1 = p2.x - roundness * Math.cos(angle1);
        const y1 = p2.y - roundness * Math.sin(angle1);
        const x2 = p2.x + roundness * Math.cos(angle2);
        const y2 = p2.y + roundness * Math.sin(angle2);

        if (i === 0) path += `M${p1.x + roundness * Math.cos(angle1)},${p1.y + roundness * Math.sin(angle1)}`;
        path += ` L${x1},${y1} Q${p2.x},${p2.y} ${x2},${y2}`;
      }
      return path + "Z";
    }

    function getBlobPath(size, complexity, contrast, seed) {
      const center = size / 2;
      const radius = size / 2.1; // Fill more space, leaving a small buffer
      const points = [];
      const rng = (i) => {
        const x = Math.sin(seed + i) * 10000;
        return x - Math.floor(x);
      };

      for (let i = 0; i < complexity; i++) {
        const angle = (i * 2 * Math.PI) / complexity;
        const distortion = 1 + (rng(i) - 0.5) * (contrast / 100) * 0.8; 
        const r = radius * distortion;
        points.push({
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle)
        });
      }

      // Cubic Hermite Spline for smooth closure
      let path = `M${points[0].x},${points[0].y}`;
      for (let i = 0; i < complexity; i++) {
        const p0 = points[(i + complexity - 1) % complexity];
        const p1 = points[i];
        const p2 = points[(i + 1) % complexity];
        const p3 = points[(i + 2) % complexity];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return path + "Z";
    }

    function parseSvg(raw) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return null;

      const applyColors = (node) => {
        if (els.colorEnabled.checked) {
          if (node.hasAttribute('fill') && node.getAttribute('fill') !== 'none') {
            node.setAttribute('fill', els.iconColor.value);
          }
          if (node.hasAttribute('stroke') && node.getAttribute('stroke') !== 'none') {
            node.setAttribute('stroke', els.iconColor.value);
          }
          if (!node.hasAttribute('fill') && !node.hasAttribute('stroke') && ['path', 'circle', 'rect', 'polygon', 'ellipse'].includes(node.tagName.toLowerCase())) {
            node.setAttribute('fill', els.iconColor.value);
          }
        }
        Array.from(node.children).forEach(applyColors);
      };

      Array.from(svg.children).forEach(applyColors);

      let vb = svg.getAttribute('viewBox');
      if (!vb) {
        const w = parseFloat(svg.getAttribute('width')) || 100;
        const h = parseFloat(svg.getAttribute('height')) || 100;
        vb = `0 0 ${w} ${h}`;
      }
      const parts = vb.split(/[\s,]+/).filter(Boolean).map(Number);
      const [vbx, vby, vbw, vbh] = parts;
      
      if (vbw !== baseWidth || vbh !== baseHeight) {
        baseWidth = vbw;
        baseHeight = vbh;
        if (!els.sizeW.value) els.sizeW.value = Math.round(vbw);
        if (!els.sizeH.value) els.sizeH.value = Math.round(vbh);
      }

      return { content: svg.innerHTML, vbx, vby, vbw, vbh };
    }

    function generateFullSvg() {
      const raw = els.input.value.trim();
      if (!raw) return null;

      const parsed = parseSvg(raw);
      if (!parsed) return null;

      const size = 512;
      const pad = parseInt(els.bgPadding.value);
      const iconSize = size - (pad * 2);
      const scale = Math.min(iconSize / parsed.vbw, iconSize / parsed.vbh);
      const tx = (size - parsed.vbw * scale) / 2 - (parsed.vbx * scale);
      const ty = (size - parsed.vbh * scale) / 2 - (parsed.vby * scale);

      let defs = '';
      let bgStyle = '';

      if (els.bgEnabled.checked) {
        if (els.bgGradient.checked) {
          if (els.gradType === 'linear') {
            const angle = parseInt(els.gradAngle.value);
            const x1 = 50 + 50 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = 50 + 50 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = 50 + 50 * Math.cos((angle + 90) * Math.PI / 180);
            const y2 = 50 + 50 * Math.sin((angle + 90) * Math.PI / 180);
            defs += `<linearGradient id="bgGrad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
              <stop offset="${els.gradStop1.value}%" stop-color="${els.bgColor1.value}" />
              <stop offset="${els.gradStop2.value}%" stop-color="${els.bgColor2.value}" />
            </linearGradient>`;
          } else {
            defs += `<radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="${els.gradStop1.value}%" stop-color="${els.bgColor1.value}" />
              <stop offset="${els.gradStop2.value}%" stop-color="${els.bgColor2.value}" />
            </radialGradient>`;
          }
          bgStyle = 'fill:url(#bgGrad);';
        } else {
          bgStyle = `fill:${els.bgColor1.value};`;
        }
      }

      if (els.shadowEnabled.checked) {
        const blur = parseInt(els.shadowBlur.value);
        const ox = parseInt(els.shadowOffsetX.value);
        const oy = parseInt(els.shadowOffsetY.value);
        const op = parseInt(els.shadowOpacity.value) / 100;
        defs += `<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="${ox}" dy="${oy}" stdDeviation="${blur}" flood-color="${els.shadowColor.value}" flood-opacity="${op}"/>
        </filter>`;
      }

      let shapePath = null;
      if (els.shapeEnabled.checked) {
        if (currentShape === 'circle') {
          shapePath = `M ${size/2}, 0 a ${size/2},${size/2} 0 1,1 0,${size} a ${size/2},${size/2} 0 1,1 0,-${size}`;
        } else if (currentShape === 'blob') {
          shapePath = getBlobPath(size, parseInt(els.shapeComplexity.value), parseInt(els.shapeContrast.value), blobSeed);
        } else {
          const sidesMap = { square: 4, pentagon: 5, hexagon: 6, octagon: 8 };
          shapePath = getPolygonPath(size, sidesMap[currentShape] || 4, parseInt(els.shapeRoundness.value));
        }
      }

      const bgOpacity = parseInt(els.bgOpacity.value) / 100;
      const rotation = parseInt(els.bgRotation.value);

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${els.sizeW.value || size}" height="${els.sizeH.value || size}">
        <defs>${defs}</defs>
        ${(els.bgEnabled.checked && shapePath) ? `<path d="${shapePath}" style="${bgStyle} opacity:${bgOpacity}; ${els.shadowEnabled.checked ? 'filter:url(#shadow);' : ''}"/>` : ''}
        <g transform="translate(${tx}, ${ty}) scale(${scale}) rotate(${rotation}, ${parsed.vbw/2 + parsed.vbx}, ${parsed.vbh/2 + parsed.vby})">
          ${parsed.content}
        </g>
      </svg>`;
    }

    function updatePreview() {
      // Labels
      const labelMappings = [
        ['gradAngle', '°'], ['gradStop1', '%'], ['gradStop2', '%'], 
        ['bgPadding', ''], ['bgRotation', '°'], ['bgOpacity', '%'],
        ['shapeRoundness', '%'], 
        ['shapeComplexity', ''], ['shapeContrast', '%'],
        ['shadowBlur', ''], ['shadowOpacity', '%'], ['shadowOffsetX', ''], ['shadowOffsetY', '']
      ];
      
      labelMappings.forEach(([id, suffix]) => {
        const valEl = document.getElementById(`svg${id.charAt(0).toUpperCase() + id.slice(1)}Val`);
        const input = els[id];
        if (valEl && input) valEl.textContent = input.value + suffix;
      });

      const fullSvg = generateFullSvg();
      if (!fullSvg) {
        els.preview.innerHTML = '<span class="sd-u-color-dim" style="font-size: 11px;">Paste SVG</span>';
        return;
      }
      els.preview.innerHTML = fullSvg;
      const svgEl = els.preview.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        svgEl.style.display = 'block';
      }
    }

    function copyToClipboard() {
      const fullSvg = generateFullSvg();
      if (!fullSvg) return;
      navigator.clipboard.writeText(fullSvg).then(() => {
        const originalText = els.copyBtn.textContent;
        els.copyBtn.textContent = 'Copied!';
        setTimeout(() => els.copyBtn.textContent = originalText, 1000);
      });
    }

    function downloadSvg() {
      const fullSvg = generateFullSvg();
      if (!fullSvg) return;
      const blob = new Blob([fullSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sparkdev-mod.svg';
      a.click();
      URL.revokeObjectURL(url);
    }

    function saveSettings() {
      const settings = {
        input: els.input.value,
        currentShape,
        blobSeed,
        colorEnabled: els.colorEnabled.checked,
        iconColor: els.iconColor.value,
        iconHex: els.iconHex.value,
        sizeW: els.sizeW.value,
        sizeH: els.sizeH.value,
        arLocked,
        bgEnabled: els.bgEnabled.checked,
        bgColor1: els.bgColor1.value,
        bgHex1: els.bgHex1.value,
        bgGradient: els.bgGradient.checked,
        bgColor2: els.bgColor2.value,
        bgHex2: els.bgHex2.value,
        gradType: els.gradType,
        gradAngle: els.gradAngle.value,
        gradStop1: els.gradStop1.value,
        gradStop2: els.gradStop2.value,
        bgPadding: els.bgPadding.value,
        bgRotation: els.bgRotation.value,
        bgOpacity: els.bgOpacity.value,
        shapeEnabled: els.shapeEnabled.checked,
        shapeRoundness: els.shapeRoundness.value,
        shapeComplexity: els.shapeComplexity.value,
        shapeContrast: els.shapeContrast.value,
        shadowEnabled: els.shadowEnabled.checked,
        shadowColor: els.shadowColor.value,
        shadowHex: els.shadowHex.value,
        shadowBlur: els.shadowBlur.value,
        shadowOffsetX: els.shadowOffsetX.value,
        shadowOffsetY: els.shadowOffsetY.value,
        shadowOpacity: els.shadowOpacity.value
      };
      chrome.storage.local.set({ mod_svg: settings });
    }

    function loadSettings() {
      chrome.storage.local.get(['mod_svg'], (res) => {
        const s = res.mod_svg;
        const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote" aria-hidden="true"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path></svg>`;

        if (!s) {
          els.input.value = defaultSvg;
          els.bgEnabled.checked = false;
          els.shapeEnabled.checked = false;
          updatePreview();
          return;
        }

        els.input.value = s.input || defaultSvg;
        currentShape = s.currentShape || 'circle';
        blobSeed = s.blobSeed || Math.random();
        els.colorEnabled.checked = s.colorEnabled ?? true;
        els.iconColor.value = s.iconColor || '#ffffff';
        els.iconHex.value = s.iconHex || '#ffffff';
        els.sizeW.value = s.sizeW || '';
        els.sizeH.value = s.sizeH || '';
        arLocked = s.arLocked ?? true;
        els.bgEnabled.checked = s.bgEnabled ?? false;
        els.bgColor1.value = s.bgColor1 || '#1a1a20';
        els.bgHex1.value = s.bgHex1 || '#1a1a20';
        els.bgGradient.checked = s.bgGradient ?? false;
        els.bgColor2.value = s.bgColor2 || '#00ffff';
        els.bgHex2.value = s.bgHex2 || '#00ffff';
        els.gradType = s.gradType || 'linear';
        els.gradAngle.value = s.gradAngle || 180;
        els.gradStop1.value = s.gradStop1 || 0;
        els.gradStop2.value = s.gradStop2 || 100;
        els.bgPadding.value = s.bgPadding || 20;
        els.bgRotation.value = s.bgRotation || 0;
        els.bgOpacity.value = s.bgOpacity || 100;
        els.shapeEnabled.checked = s.shapeEnabled ?? false;
        els.shapeRoundness.value = s.shapeRoundness || 10;
        els.shapeComplexity.value = s.shapeComplexity || 6;
        els.shapeContrast.value = s.shapeContrast || 30;
        els.shadowEnabled.checked = s.shadowEnabled ?? false;
        els.shadowColor.value = s.shadowColor || '#000000';
        els.shadowHex.value = s.shadowHex || '#000000';
        els.shadowBlur.value = s.shadowBlur || 10;
        els.shadowOffsetX.value = s.shadowOffsetX || 0;
        els.shadowOffsetY.value = s.shadowOffsetY || 4;
        els.shadowOpacity.value = s.shadowOpacity || 40;

        // UI States
        els.gradientSection.style.display = els.bgGradient.checked ? 'flex' : 'none';
        els.lockAR.style.color = arLocked ? 'var(--sd-color-cyan)' : 'var(--sd-color-text-muted)';
        els.lockAR.querySelector('input').checked = arLocked;
        
        els.shapePicker.querySelectorAll('button').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.shape === currentShape);
        });
        
        els.polyControls.style.display = (currentShape !== 'blob' && currentShape !== 'circle') ? 'flex' : 'none';
        els.blobControls.style.display = currentShape === 'blob' ? 'flex' : 'none';

        document.querySelectorAll('#svgGradientSettings .sd-c-segmented__btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.type === els.gradType);
        });
        document.getElementById('svgGradTypeVal').textContent = els.gradType.charAt(0).toUpperCase() + els.gradType.slice(1);
        document.getElementById('svgGradAngleRow').style.display = els.gradType === 'linear' ? 'block' : 'none';

        updatePreview();
      });
    }

    init();
  };
})();
