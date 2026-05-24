(function() {
  window.initColor = function() {
    const pickColorBtn = document.getElementById('pickColorBtn');
    const colorHistoryBody = document.getElementById('colorHistoryBody');
    const noHistoryEl = document.getElementById('noHistory');
    const historyCountEl = document.getElementById('historyCount');
    const liveModeToggle = document.getElementById('liveModeToggle');

    let history = [];
    let draggedId = null;

    async function sendMessageToTab(payload) {
      return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]) return resolve({ ok: false });
          
          chrome.tabs.sendMessage(tabs[0].id, payload, (response) => {
            if (chrome.runtime.lastError) {
              console.log('[SparkDev Color] Content script missing, injecting...');
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: [
                  'core/content/utils.js',
                  'core/content/color.js',
                  'core/content/font.js',
                  'core/content/webp.js',
                  'core/content/wp.js',
                  'core/content/main.js'
                ]
              }, () => {
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabs[0].id, payload, (res) => resolve(res));
                }, 100);
              });
            } else {
              resolve(response);
            }
          });
        });
      });
    }

    async function init() {
      await loadHistory();
      renderHistory();

      pickColorBtn.addEventListener('click', async () => {
        if (!window.EyeDropper) {
          alert('Your browser does not support the EyeDropper API');
          return;
        }

        const eyeDropper = new EyeDropper();
        try {
          const result = await eyeDropper.open();
          const hex = result.sRGBHex.toUpperCase();
          copyToClipboard(hex);
          addToHistory(hex);
        } catch (err) {
          console.log('Color picking cancelled or failed:', err);
        }
      });

      liveModeToggle.addEventListener('change', () => {
        const enabled = liveModeToggle.checked;
        sendMessageToTab({ action: 'toggleLivePicker', enabled });
        saveSettings();
      });

      // Listen for colors picked from the content script
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'liveColorPicked') {
          copyToClipboard(msg.hex);
          addToHistory(msg.hex);
        }
      });
    }

    async function loadHistory() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['mod_color'], (result) => {
          const data = result.mod_color || {};
          let rawHistory = data.history || [];
          
          history = rawHistory.map(item => ({
            id: item.id || item.date || Date.now() + Math.random(),
            hex: item.hex,
            name: item.name || '',
            isFavorite: !!item.isFavorite,
            order: item.order || 0
          }));

          if (data.liveModeEnabled) {
            liveModeToggle.checked = true;
          }

          if (rawHistory.some(item => !item.id)) {
            saveHistory();
          }

          resolve();
        });
      });
    }

    async function saveHistory() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['mod_color'], (res) => {
          const data = res.mod_color || {};
          data.history = history;
          chrome.storage.local.set({ mod_color: data }, () => {
            resolve();
          });
        });
      });
    }

    async function saveSettings() {
      chrome.storage.local.get(['mod_color'], (res) => {
        const data = res.mod_color || {};
        data.liveModeEnabled = liveModeToggle.checked;
        chrome.storage.local.set({ mod_color: data });
      });
    }

    function addToHistory(hex) {
      const existingIdx = history.findIndex(item => item.hex === hex && !item.isFavorite);
      if (existingIdx !== -1) {
        const item = history.splice(existingIdx, 1)[0];
        item.id = Date.now();
        history.unshift(item);
      } else {
        history.unshift({
          id: Date.now(),
          hex: hex,
          name: '',
          isFavorite: false,
          order: 0
        });
      }
      
      cleanUpHistory();
      saveHistory();
      renderHistory();
    }

    function cleanUpHistory() {
      const favorites = history.filter(item => item.isFavorite);
      const nonFavorites = history.filter(item => !item.isFavorite);
      const limitedNonFavorites = nonFavorites.slice(0, 20);
      history = [...favorites, ...limitedNonFavorites];
    }

    function toggleFavorite(id) {
      const item = history.find(i => i.id === id);
      if (!item) return;

      item.isFavorite = !item.isFavorite;
      
      if (item.isFavorite) {
        const favorites = history.filter(i => i.isFavorite && i.id !== id);
        const maxOrder = favorites.reduce((max, i) => Math.max(max, i.order || 0), 0);
        item.order = maxOrder + 1;
      } else {
        item.order = 0;
        item.id = Date.now();
      }

      cleanUpHistory();
      saveHistory();
      renderHistory();
    }

    function updateName(id, name) {
      const item = history.find(i => i.id === id);
      if (item) {
        item.name = name;
        saveHistory();
      }
    }

    function renderHistory() {
      const favorites = history.filter(item => item.isFavorite).sort((a, b) => (a.order || 0) - (b.order || 0));
      const nonFavorites = history.filter(item => !item.isFavorite).sort((a, b) => b.id - a.id);
      
      const allItems = [...favorites, ...nonFavorites];

      if (allItems.length === 0) {
        noHistoryEl.style.display = 'block';
        colorHistoryBody.innerHTML = '';
        historyCountEl.textContent = '0 + 0 = 0';
        return;
      }

      noHistoryEl.style.display = 'none';
      historyCountEl.textContent = `${favorites.length} + ${nonFavorites.length} = ${favorites.length + nonFavorites.length}`;
      
      colorHistoryBody.innerHTML = allItems.map((item) => `
        <tr class="${item.isFavorite ? 'is-favorite' : ''}" draggable="true" data-id="${item.id}" data-fav="${item.isFavorite}">
          <td class="drag-handle-cell">
            <div class="drag-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="19" r="1.5"/><circle cx="12" cy="19" r="1.5"/><circle cx="19" cy="19" r="1.5"/>
              </svg>
            </div>
          </td>
          <td>
            <div class="color-preview-circle" style="background-color: ${item.hex}"></div>
          </td>
          <td>
            <span class="color-hex-text">${item.hex}</span>
          </td>
          <td>
            <input type="text" class="color-name-input" placeholder="Name..." value="${item.name || ''}" data-id="${item.id}">
          </td>
          <td style="text-align: center;">
            <button class="color-action-btn ${item.isFavorite ? 'is-fav' : ''}" data-id="${item.id}" title="${item.isFavorite ? 'Unfavorite' : 'Favorite'}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="${item.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </td>
          <td style="text-align: center;">
            <button class="color-action-btn copy-btn" data-hex="${item.hex}" title="Copy HEX">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </td>
        </tr>
      `).join('');

      attachEventListeners();
    }

    function attachEventListeners() {
      colorHistoryBody.querySelectorAll('.color-action-btn:not(.copy-btn)').forEach(btn => {
        btn.addEventListener('click', () => toggleFavorite(parseInt(btn.dataset.id)));
      });

      colorHistoryBody.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => copyToClipboard(btn.dataset.hex, btn));
      });

      colorHistoryBody.querySelectorAll('.color-name-input').forEach(input => {
        input.addEventListener('blur', () => updateName(parseInt(input.dataset.id), input.value));
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') input.blur();
        });
      });

      const rows = colorHistoryBody.querySelectorAll('tr');
      rows.forEach(row => {
        row.addEventListener('dragstart', (e) => {
          draggedId = parseInt(row.dataset.id);
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          const draggingRow = colorHistoryBody.querySelector('.dragging');
          if (row !== draggingRow) {
            if (row.dataset.fav === draggingRow.dataset.fav) {
              row.classList.add('drag-over');
            }
          }
        });

        row.addEventListener('dragleave', () => {
          row.classList.remove('drag-over');
        });

        row.addEventListener('drop', (e) => {
          e.preventDefault();
          row.classList.remove('drag-over');
          
          const draggingRow = colorHistoryBody.querySelector('.dragging');
          if (draggedId === null || draggedId === parseInt(row.dataset.id) || row.dataset.fav !== draggingRow.dataset.fav) return;

          const fromIdx = history.findIndex(i => i.id === draggedId);
          const toIdx = history.findIndex(i => i.id === parseInt(row.dataset.id));

          if (fromIdx !== -1 && toIdx !== -1) {
            const [movedItem] = history.splice(fromIdx, 1);
            history.splice(toIdx, 0, movedItem);
            
            if (movedItem.isFavorite) {
              const favorites = history.filter(i => i.isFavorite);
              favorites.forEach((fav, idx) => {
                fav.order = idx + 1;
              });
            }

            saveHistory();
            renderHistory();
          }
        });

        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          draggedId = null;
        });
      });
    }

    function copyToClipboard(text, btn = null) {
      navigator.clipboard.writeText(text).then(() => {
        if (btn) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--sd-color-success);"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 1000);
        } else {
          const originalText = pickColorBtn.querySelector('span').textContent;
          pickColorBtn.querySelector('span').textContent = `Copied: ${text}`;
          pickColorBtn.classList.add('sd-c-btn--success');
          setTimeout(() => {
            pickColorBtn.querySelector('span').textContent = originalText;
            pickColorBtn.classList.remove('sd-c-btn--success');
          }, 1500);
        }
      });
    }

    init();
  };
})();
