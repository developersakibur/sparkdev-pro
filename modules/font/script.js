(function() {
  window.initFont = function() {
    const startFontFinderBtn = document.getElementById('startFontFinderBtn');
    const fontClearBtn = document.getElementById('fontClearBtn');
    const fontHistoryBody = document.getElementById('fontHistoryBody');
    const noFontHistoryEl = document.getElementById('noFontHistory');

    let history = [];
    let isFinderActive = false;

    async function sendMessageToTab(payload) {
      return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]) return resolve({ ok: false });
          
          chrome.tabs.sendMessage(tabs[0].id, payload, (response) => {
            if (chrome.runtime.lastError) {
              // Script not found, inject it manually
              console.log('[SparkDev Font] Content script missing, injecting...');
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
                // Try again after a short delay
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

      startFontFinderBtn.addEventListener('click', () => {
        isFinderActive = !isFinderActive;
        updateUI();
        
        sendMessageToTab({ 
          action: 'toggleFontFinder', 
          enabled: isFinderActive,
          multi: true
        });
      });

      fontClearBtn.addEventListener('click', () => {
        if (history.length === 0) return;
        if (confirm('Clear all captured font history?')) {
          history = [];
          saveHistory();
          renderHistory();
        }
      });

      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'fontPicked') {
          // No need to manually add to history here, storage listener will handle it
          setTimeout(loadAndRender, 100); 
        }
        if (msg.action === 'stopFontFinderUI') {
          isFinderActive = false;
          updateUI();
        }
      });

      // Sync UI when storage changes (background saves new fonts)
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.mod_font) {
          loadAndRender();
        }
      });
    }

    async function loadAndRender() {
      await loadHistory();
      renderHistory();
    }

    function updateUI() {
      if (isFinderActive) {
        startFontFinderBtn.querySelector('span').textContent = 'Stop Font Finder';
      } else {
        startFontFinderBtn.querySelector('span').textContent = 'Start Font Finder';
      }
    }

    async function loadHistory() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['mod_font'], (result) => {
          const data = result.mod_font || {};
          history = data.history || [];
          resolve();
        });
      });
    }

    async function saveHistory() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['mod_font'], (res) => {
          const data = res.mod_font || {};
          data.history = history;
          chrome.storage.local.set({ mod_font: data }, () => resolve());
        });
      });
    }

    function addToHistory(fontData) {
      if (history.length > 0) {
        const last = history[0];
        if (last.family === fontData.family && 
            last.size === fontData.size && 
            last.weight === fontData.weight && 
            last.color === fontData.color) {
          return;
        }
      }

      history.unshift({
        id: Date.now(),
        ...fontData
      });

      if (history.length > 50) history = history.slice(0, 50);

      saveHistory();
      renderHistory();
    }

    function renderHistory() {
      if (history.length === 0) {
        noFontHistoryEl.style.display = 'block';
        fontHistoryBody.innerHTML = '';
        return;
      }

      noFontHistoryEl.style.display = 'none';
      
      fontHistoryBody.innerHTML = history.map((item, index) => `
        <tr>
          <td class="sd-u-p-0 sd-u-text-center sd-u-color-muted" style="padding-left: 10px;">${history.length - index}</td>
          <td><span class="font-family-text" title="${item.family}">${item.family}</span></td>
          <td class="font-detail-text">${item.size}</td>
          <td class="font-detail-text">${item.weight}</td>
          <td class="font-detail-text">${item.lh}</td>
          <td class="font-detail-text" style="color: ${item.color}; padding-right: 10px;">${item.color}</td>
        </tr>
      `).join('');
    }

    init();
  };
})();
