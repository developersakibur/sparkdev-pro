chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveAsWebP',
    title: 'Save as WebP',
    contexts: ['image']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'saveAsWebP') return;
  if (!info.srcUrl) return;

  // Load settings then send to content script
  chrome.storage.local.get(['mod_webp'], (stored) => {
    const settings = stored.mod_webp || {};
    const payload = {
      action:    'convertAndDownload',
      imageUrl:  info.srcUrl,
      maxSizeKB: settings.maxSizeKB || 50,
      quality:   settings.quality   || 25
    };

    chrome.tabs.sendMessage(tab.id, payload, (res) => {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, files: ['content.js'] },
          () => setTimeout(() => chrome.tabs.sendMessage(tab.id, payload), 300)
        );
      }
    });
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'downloadWebP') {
    chrome.downloads.download({ url: msg.dataUrl, filename: msg.filename, saveAs: false });
    sendResponse({ ok: true });
  }

  if (msg.action === 'fontPicked') {
    chrome.storage.local.get(['mod_font'], (res) => {
      const data = res.mod_font || {};
      const history = data.history || [];
      
      // Prevent duplicate consecutive entries
      if (history.length > 0) {
        const last = history[0];
        if (last.family === msg.fontData.family && 
            last.size === msg.fontData.size && 
            last.weight === msg.fontData.weight && 
            last.color === msg.fontData.color) {
          return sendResponse({ ok: true });
        }
      }

      history.unshift({ id: Date.now(), ...msg.fontData });
      if (history.length > 50) history.splice(50);
      
      data.history = history;
      chrome.storage.local.set({ mod_font: data }, () => {
        sendResponse({ ok: true });
      });
    });
    return true; // Keep channel open for async response
  }
  
  return true;
});
