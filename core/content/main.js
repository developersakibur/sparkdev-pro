let currentSettings = { enableRightClick: false };
let lastContextTarget = null;

// Initial settings load
chrome.storage.local.get(['mod_settings'], (res) => {
  currentSettings = res.mod_settings || {};
  if (currentSettings.enableRightClick) enableBypass();
});

// Capture right-click target for Copy Link Text
document.addEventListener('contextmenu', (e) => {
  lastContextTarget = e.target;
}, true);

function enableBypass() {
  window.addEventListener('contextmenu', (e) => {
    if (currentSettings.enableRightClick) {
      e.stopPropagation();
    }
  }, true);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[SparkDev Content] Message received:', msg.action);

  if (msg.action === 'updateSettings') {
    currentSettings = msg.settings;
    sendResponse({ ok: true });
  }

  if (msg.action === 'copyLinkText') {
    if (lastContextTarget) {
      const link = lastContextTarget.closest('a');
      if (link) {
        const text = link.innerText.trim();
        if (text) {
          navigator.clipboard.writeText(text);
          console.log('[SparkDev] Copied link text:', text);
        }
      }
    }
    sendResponse({ ok: true });
  }

  if (msg.action === 'convertAndDownload') {
    if (typeof convertImageToWebP === 'function') {
      convertImageToWebP(msg.imageUrl, msg.maxSizeKB, msg.quality)
        .then(({ dataUrl, filename }) => {
          chrome.runtime.sendMessage({ action: 'downloadWebP', dataUrl, filename });
          sendResponse({ ok: true });
        })
        .catch(err => {
          console.error('[WebP Compressor]', err);
          sendResponse({ ok: false });
        });
    }
    return true;
  }

  if (msg.action === 'toggleLivePicker') {
    if (typeof startLivePicker === 'function') {
      if (msg.enabled) startLivePicker();
      else stopLivePicker();
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false, error: 'Advanced picker not loaded' });
    }
    return true;
  }

  if (msg.action === 'toggleFontFinder') {
    if (typeof startFontFinder === 'function') {
      if (msg.enabled) startFontFinder(msg.multi);
      else stopFontFinder();
    }
    sendResponse({ ok: true });
  }
});
