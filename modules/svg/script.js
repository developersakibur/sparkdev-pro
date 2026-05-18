(function() {
  'use strict';
  window.initSvg = function() {
    const SHAPES = [
      { id: 'none', label: 'None', draw: () => '' },
      { id: 'square', label: 'Square', draw: (s, r) => `M${r},0 h${s-2*r} a${r},${r} 0 0 1 ${r},${r} v${s-2*r} a${r},${r} 0 0 1 -${r},${r} h${-(s-2*r)} a${r},${r} 0 0 1 -${r},-${r} v${-(s-2*r)} a${r},${r} 0 0 1 ${r},-${r} z` },
      { id: 'squircle', label: 'Squircle', draw: (s) => {
          const r = s * 0.32;
          return `M${r},0 h${s-2*r} c${r*0.6},0 ${r},${r*0.4} ${r},${r} v${s-2*r} c0,${r*0.6} ${-r*0.4},${r} ${-r},${r} h${-(s-2*r)} c${-r*0.6},0 ${-r},${-r*0.4} ${-r},${-r} v${-(s-2*r)} c0,${-r*0.6} ${r*0.4},${-r} ${r},${-r} z`;
      }},
      { id: 'circle', label: 'Circle', draw: (s) => `M${s/2},0 a${s/2},${s/2} 0 1 1 0,${s} a${s/2},${s/2} 0 1 1 0,-${s} z` },
      { id: 'shield', label: 'Shield', draw: (s) => `M${s/2},0 L${s},${s*0.2} V${s*0.6} C${s},${s*0.9} ${s/2},${s} ${s/2},${s} C${s/2},${s} 0,${s*0.9} 0,${s*0.6} V${s*0.2} Z` },
      { id: 'hexagon', label: 'Hexagon', draw: (s) => `M${s/2},0 L${s},${s*0.25} V${s*0.75} L${s/2},${s} L0,${s*0.75} V${s*0.25} Z` },
      { id: 'octagon', label: 'Octagon', draw: (s) => `M${s*0.3},0 H${s*0.7} L${s},${s*0.3} V${s*0.7} L${s*0.7},${s} H${s*0.3} L0,${s*0.7} V${s*0.3} Z` },
      { id: 'diamond', label: 'Diamond', draw: (s) => `M${s/2},0 L${s},${s/2} L${s/2},${s} L0,${s/2} Z` },
      { id: 'triangle', label: 'Triangle', draw: (s) => `M${s/2},0 L${s},${s} H0 Z` },
      { id: 'heart', label: 'Heart', draw: (s) => `M${s/2},${s*0.3} C${s/2},${s*0.3} ${s*0.4},0 0,${s*0.3} C0,${s*0.6} ${s/2},${s} ${s/2},${s} C${s/2},${s} ${s},${s*0.6} ${s},${s*0.3} C${s},0 ${s/2},${s*0.3} ${s/2},${s*0.3} Z` },
      { id: 'star', label: 'Star', draw: (s) => `M${s/2},0 L${s*0.65},${s*0.35} L${s},${s*0.4} L${s*0.75},${s*0.65} L${s*0.8},${s} L${s/2},${s*0.8} L${s*0.2},${s} L${s*0.25},${s*0.65} L0,${s*0.4} L${s*0.35},${s*0.35} Z` },
      { id: 'capsule', label: 'Capsule', draw: (s) => `M${s*0.25},0 H${s*0.75} A${s*0.25},${s*0.5} 0 0 1 ${s*0.75},${s} H${s*0.25} A${s*0.25},${s*0.5} 0 0 1 ${s*0.25},0 Z` },
      { id: 'leaf', label: 'Leaf', draw: (s) => `M${s},0 C${s},0 ${s},${s} 0,${s} C0,${s} 0,0 ${s},0 Z` },
      { id: 'blob1', label: 'Blob 1', draw: (s) => `M${s*0.8},${s*0.2} C${s},${s*0.4} ${s*0.9},${s*0.8} ${s*0.6},${s*0.9} C${s*0.3},${s} 0,${s*0.8} 0,${s*0.5} C0,${s*0.2} ${s*0.4},0 ${s*0.8},${s*0.2} Z` },
      { id: 'blob2', label: 'Blob 2', draw: (s) => `M${s*0.7},0.1 C${s*0.9},0.2 ${s},0.5 ${s*0.9},0.7 C${s*0.8},0.9 ${s*0.5},${s} ${s*0.3},0.9 C0.1,0.8 0,0.5 0.1,0.3 C0.2,0.1 0.4,0 0.7,0.1 Z`.replace(/0\./g, (s*0.1).toString()) },
      { id: 'chat', label: 'Chat', draw: (s) => `M0,0 H${s} V${s*0.8} H${s*0.3} L0,${s} Z` },
      { id: 'tag', label: 'Tag', draw: (s) => `M0,${s*0.2} L${s*0.7},${s*0.2} L${s},${s/2} L${s*0.7},${s*0.8} L0,${s*0.8} Z` },
      { id: 'cloud', label: 'Cloud', draw: (s) => `M${s*0.25},${s*0.8} A${s*0.2},${s*0.2} 0 0 1 ${s*0.25},${s*0.4} A${s*0.25},${s*0.25} 0 0 1 ${s*0.75},${s*0.4} A${s*0.2},${s*0.2} 0 0 1 ${s*0.75},${s*0.8} Z` },
      { id: 'ticket', label: 'Ticket', draw: (s) => `M0,0 H${s} V${s*0.3} A${s*0.1},${s*0.1} 0 0 0 ${s},${s*0.7} V${s} H0 V${s*0.7} A${s*0.1},${s*0.1} 0 0 0 0,${s*0.3} Z` },
      { id: 'round-rect', label: 'Round Rect', draw: (s) => `M${s*0.2},0 H${s*0.8} A${s*0.2},${s*0.2} 0 0 1 ${s},${s*0.2} V${s*0.8} A${s*0.2},${s*0.2} 0 0 1 ${s*0.8},${s} H${s*0.2} A${s*0.2},${s*0.2} 0 0 1 0,${s*0.8} V${s*0.2} A${s*0.2},${s*0.2} 0 0 1 ${s*0.2},0 Z` }
    ];

    let selectedShapeId = 'squircle';
    let arLocked = true;
    let baseWidth = 0, baseHeight = 0;

    const els = {
      input: document.getElementById('svgInput'),
      preview: document.getElementById('svgPreviewBox'),
      shapeGrid: document.getElementById('svgShapeGrid'),
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
      gradType: 'linear',
      gradAngle: document.getElementById('svgGradAngle'),
      gradStop1: document.getElementById('svgGradStop1'),
      gradStop2: document.getElementById('svgGradStop2'),
      bgPadding: document.getElementById('svgBgPadding'),
      bgRotation: document.getElementById('svgBgRotation'),
      bgOpacity: document.getElementById('svgBgOpacity'),
      shapeEnabled: document.getElementById('svgShapeEnabled'),
      shadowEnabled: document.getElementById('svgShadowEnabled'),
      shadowColor: document.getElementById('svgShadowColor'),
      shadowHex: document.getElementById('svgShadowHex'),
      shadowBlur: document.getElementById('svgShadowBlur'),
      shadowOffsetX: document.getElementById('svgShadowOffsetX'),
      shadowOffsetY: document.getElementById('svgShadowOffsetY'),
      shadowOpacity: document.getElementById('svgShadowOpacity')
    };

    function init() {
      buildShapePicker();
      attachEvents();
      loadSettings();
      updatePreview();
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
      els.lockAR.addEventListener('click', () => {
        arLocked = !arLocked;
        els.lockAR.style.color = arLocked ? 'var(--sd-color-cyan)' : 'var(--sd-color-text-muted)';
        els.lockAR.querySelector('input').checked = arLocked;
      });

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

    function buildShapePicker() {
      els.shapeGrid.innerHTML = '';
      SHAPES.forEach(shape => {
        const btn = document.createElement('button');
        btn.className = 'sd-c-btn sd-c-btn--secondary sd-u-p-1' + (shape.id === selectedShapeId ? ' active' : '');
        btn.style.height = '40px';
        btn.innerHTML = `<svg viewBox="0 0 100 100" width="20" height="24" style="fill:none; stroke:${shape.id === selectedShapeId ? '#00ffff' : '#52525b'}; stroke-width:8;"><path d="${shape.draw(80, 10)}" transform="translate(10,10)"/></svg>`;
        btn.addEventListener('click', () => {
          selectedShapeId = shape.id;
          document.querySelectorAll('#svgShapeGrid .sd-c-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updatePreview();
          saveSettings();
        });
        els.shapeGrid.appendChild(btn);
      });
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

      const shapePath = (els.shapeEnabled.checked && selectedShapeId !== 'none') ? SHAPES.find(s => s.id === selectedShapeId)?.draw(size, size * 0.12) : null;
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
      ['gradAngle', 'gradStop1', 'gradStop2', 'bgPadding', 'bgRotation', 'bgOpacity', 'shadowBlur', 'shadowOpacity', 'shadowOffsetX', 'shadowOffsetY'].forEach(id => {
        const valEl = document.getElementById(`svg${id.charAt(0).toUpperCase() + id.slice(1)}Val`);
        const input = els[id];
        if (valEl && input) {
          valEl.textContent = input.value + (id.includes('Opacity') || id.includes('Stop') ? '%' : id.includes('Angle') || id.includes('Rotation') ? '°' : '');
        }
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
        selectedShapeId,
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
        const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote h-6 w-6 text-primary/60 mb-4" aria-hidden="true"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path></svg>`;

        if (!s) {
          els.input.value = defaultSvg;
          els.bgEnabled.checked = false;
          els.shapeEnabled.checked = false;

          // Open Color & Size by default on first load
          const colorItem = document.getElementById('svgColorItem');
          colorItem.classList.add('is-open');
          document.getElementById('svgColorContent').style.display = 'flex';

          updatePreview();
          return;
        }

        els.input.value = s.input || defaultSvg;
        selectedShapeId = s.selectedShapeId || 'squircle';
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
        els.shadowEnabled.checked = s.shadowEnabled ?? false;
        els.shadowColor.value = s.shadowColor || '#000000';
        els.shadowHex.value = s.shadowHex || '#000000';
        els.shadowBlur.value = s.shadowBlur || 10;
        els.shadowOffsetX.value = s.shadowOffsetX || 0;
        els.shadowOffsetY.value = s.shadowOffsetY || 4;
        els.shadowOpacity.value = s.shadowOpacity || 40;

        // Restore accordion state: only open Color if nothing else is specified or if s.isOpen (optional future feature)
        // For now, let's just make sure only Color is open on startup unless we implement per-item storage
        const colorItem = document.getElementById('svgColorItem');
        colorItem.classList.add('is-open');
        document.getElementById('svgColorContent').style.display = 'flex';

        els.gradientSection.style.display = els.bgGradient.checked ? 'flex' : 'none';
        els.lockAR.style.color = arLocked ? 'var(--sd-color-cyan)' : 'var(--sd-color-text-muted)';
        els.lockAR.querySelector('input').checked = arLocked;
        
        document.querySelectorAll('#svgGradientSettings .sd-c-segmented__btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.type === els.gradType);
        });
        document.getElementById('svgGradTypeVal').textContent = els.gradType.charAt(0).toUpperCase() + els.gradType.slice(1);
        document.getElementById('svgGradAngleRow').style.display = els.gradType === 'linear' ? 'block' : 'none';

        buildShapePicker();
        updatePreview();
      });
    }

    init();
  };
})();
