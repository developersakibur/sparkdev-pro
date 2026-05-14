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
      { id: 'shield', label: 'Shield', draw: (s) => `M${s/2},0 L${s},${s*0.2} V${s*0.6} C${s},${s*0.9} ${s/2},${s} ${s/2},${s} C${s/2},${s} 0,${s*0.9} 0,${s*0.6} V${s*0.2} Z` }
    ];

    let selectedShapeId = 'squircle';
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
      bgEnabled: document.getElementById('svgBgEnabled'),
      bgColor1: document.getElementById('svgBgColor1'),
      bgHex1: document.getElementById('svgBgHex1'),
      bgColor2: document.getElementById('svgBgColor2'),
      bgHex2: document.getElementById('svgBgHex2'),
      bgGradient: document.getElementById('svgBgGradient'),
      gradType: 'linear',
      gradAngle: document.getElementById('svgGradAngle'),
      gradStop1: document.getElementById('svgGradStop1'),
      gradStop2: document.getElementById('svgGradStop2'),
      padding: document.getElementById('svgBgPadding'),
      rotation: document.getElementById('svgBgRotation'),
      opacity: document.getElementById('svgBgOpacity'),
      shadowEnabled: document.getElementById('svgShadowEnabled'),
      shadowColor: document.getElementById('svgShadowColor'),
      shadowBlur: document.getElementById('svgShadowBlur'),
      shadowOffsetX: document.getElementById('svgShadowOffsetX'),
      shadowOffsetY: document.getElementById('svgShadowOffsetY'),
      shadowOpacity: document.getElementById('svgShadowOpacity')
    };

    function init() {
      buildShapePicker();
      attachEvents();
      updatePreview();
    }

    function attachEvents() {
      const allInputs = document.querySelectorAll('#tab-svg input, #tab-svg textarea');
      allInputs.forEach(el => el.addEventListener('input', updatePreview));
      
      els.copyBtn.addEventListener('click', copyToClipboard);
      els.downloadBtn.addEventListener('click', downloadSvg);
      els.clearBtn.addEventListener('click', () => { els.input.value = ''; updatePreview(); });

      // Sync color pickers with hex inputs
      [['iconColor', 'iconHex'], ['bgColor1', 'bgHex1'], ['bgColor2', 'bgHex2'], ['shadowColor', 'shadowHex']].forEach(([p, h]) => {
        const picker = els[p] || document.getElementById(els[p]?.id); // Handle dynamic lookups
        const hex = els[h] || document.getElementById(els[h]?.id);
        if (picker && hex) {
          picker.addEventListener('input', () => { hex.value = picker.value; updatePreview(); });
          hex.addEventListener('input', () => { if (/^#[0-9A-F]{6}$/i.test(hex.value)) { picker.value = hex.value; updatePreview(); } });
        }
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
        });
      });

      // Accordion logic
      document.querySelectorAll('#tab-svg .sd-c-setting-item__header').forEach(h => h.addEventListener('click', e => {
        if (e.target.closest('.sd-c-toggle')) return;
        const c = h.nextElementSibling;
        c.style.display = c.style.display === 'none' ? 'flex' : 'none';
      }));
    }

    function buildShapePicker() {
      els.shapeGrid.innerHTML = '';
      SHAPES.forEach(shape => {
        const btn = document.createElement('button');
        btn.className = 'sd-c-btn sd-c-btn--secondary sd-u-p-1' + (shape.id === selectedShapeId ? ' active' : '');
        btn.innerHTML = `<svg viewBox="0 0 100 100" width="24" height="24" style="fill:none; stroke:${shape.id === selectedShapeId ? '#00ffff' : '#52525b'}; stroke-width:8;"><path d="${shape.draw(80, 10)}" transform="translate(10,10)"/></svg>`;
        btn.addEventListener('click', () => {
          selectedShapeId = shape.id;
          document.querySelectorAll('#svgShapeGrid .sd-c-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updatePreview();
        });
        els.shapeGrid.appendChild(btn);
      });
    }

    function parseSvg(raw) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) return null;

      // Extract paths and other elements
      const content = Array.from(svg.children).map(child => {
        if (els.colorEnabled.checked) {
          child.setAttribute('fill', els.iconColor.value);
          if (child.hasAttribute('stroke') && child.getAttribute('stroke') !== 'none') {
            child.setAttribute('stroke', els.iconColor.value);
          }
        }
        return child.outerHTML;
      }).join('');

      // Get viewbox or fallback
      let vb = svg.getAttribute('viewBox');
      if (!vb) {
        const w = svg.getAttribute('width') || 100;
        const h = svg.getAttribute('height') || 100;
        vb = `0 0 ${w} ${h}`;
      }
      const [, , vbw, vbh] = vb.split(/\s+/).map(Number);
      
      return { content, vbw, vbh };
    }

    function generateFullSvg() {
      const raw = els.input.value.trim();
      if (!raw) return null;

      const parsed = parseSvg(raw);
      if (!parsed) return null;

      const size = 512;
      const pad = parseInt(els.padding.value);
      const iconSize = size - (pad * 2);
      const scale = Math.min(iconSize / parsed.vbw, iconSize / parsed.vbh);
      const tx = (size - parsed.vbw * scale) / 2;
      const ty = (size - parsed.vbh * scale) / 2;

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

      const shapePath = SHAPES.find(s => s.id === selectedShapeId)?.draw(size, size * 0.12) || '';
      const bgOpacity = parseInt(els.opacity.value) / 100;
      const rotation = parseInt(els.rotation.value);

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <defs>${defs}</defs>
        ${els.bgEnabled.checked ? `<path d="${shapePath}" style="${bgStyle} opacity:${bgOpacity}; ${els.shadowEnabled.checked ? 'filter:url(#shadow);' : ''}"/>` : ''}
        <g transform="translate(${tx}, ${ty}) scale(${scale}) rotate(${rotation}, ${parsed.vbw/2}, ${parsed.vbh/2})">
          ${parsed.content}
        </g>
      </svg>`;
    }

    function updatePreview() {
      // Update value labels
      ['gradAngle', 'gradStop1', 'gradStop2', 'padding', 'rotation', 'opacity', 'shadowBlur', 'shadowOpacity', 'shadowOffsetX', 'shadowOffsetY'].forEach(id => {
        const valEl = document.getElementById(`svg${id.charAt(0).toUpperCase() + id.slice(1)}Val`);
        const input = els[id] || document.getElementById('svg' + id.charAt(0).toUpperCase() + id.slice(1));
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
      a.download = 'sparkdev-icon.svg';
      a.click();
      URL.revokeObjectURL(url);
    }

    init();
  };
})();
