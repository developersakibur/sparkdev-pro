(function() {
  'use strict';
  window.initSvg = function() {
    const els = {
      input: document.getElementById('svgInput'),
      preview: document.getElementById('svgPreviewBox'),
      downloadBtn: document.getElementById('svgDownloadBtn'),
      clearBtn: document.getElementById('svgClearBtn')
    };

    function init() {
      attachEvents();
    }

    function attachEvents() {
      els.input.addEventListener('input', () => {
        updatePreview();
        saveSettings();
      });
      els.downloadBtn.addEventListener('click', downloadSvg);
      
      els.clearBtn.addEventListener('click', () => {
        els.input.value = '';
        updatePreview();
        saveSettings();
      });
    }

    function updatePreview() {
      const raw = els.input.value.trim();
      if (!raw) {
        els.preview.innerHTML = '<span class="sd-u-color-dim" style="font-size: 11px;">Paste SVG to preview</span>';
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) {
        els.preview.innerHTML = '<span class="sd-u-color-dim" style="font-size: 11px; color: var(--sd-color-error) !important;">Invalid SVG</span>';
        return;
      }

      els.preview.innerHTML = '';
      els.preview.appendChild(svg);
      
      const svgEl = els.preview.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        svgEl.style.maxWidth = '100%';
        svgEl.style.maxHeight = '100%';
        svgEl.style.display = 'block';
      }
    }

    function downloadSvg() {
      const raw = els.input.value.trim();
      if (!raw) return;
      const blob = new Blob([raw], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'original.svg';
      a.click();
      URL.revokeObjectURL(url);
    }

    function saveSettings() {
      chrome.storage.local.set({ mod_svg_raw: els.input.value });
    }

    init();
  };
})();
