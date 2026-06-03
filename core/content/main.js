chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[SparkDev Content] Message received:', msg.action);

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
