chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveAsWebP',
    title: 'Save as WebP',
    contexts: ['image']
  });

  // Storage Migration & Cleanup Logic
  chrome.storage.local.get(null, async (allData) => {
    const newState = {
      app_state: allData.app_state || {},
      mod_webp: allData.mod_webp || {},
      mod_wp_tools: allData.mod_wp_tools || {},
      mod_clamp: allData.mod_clamp || {},
      mod_color: allData.mod_color || {},
      mod_font: allData.mod_font || {},
      mod_text: allData.mod_text || {}
    };

    // 1. Migrate loose keys if namespaced objects are empty
    if (!newState.app_state.featureOrder && allData.featureOrder) newState.app_state.featureOrder = allData.featureOrder;
    if (!newState.app_state.activeTab && allData.activeTab) newState.app_state.activeTab = allData.activeTab;
    
    if (!newState.mod_webp.quality && allData.quality) newState.mod_webp.quality = allData.quality;
    if (!newState.mod_webp.maxSizeKB && allData.maxSizeKB) newState.mod_webp.maxSizeKB = allData.maxSizeKB;
    if (allData.zipEnabled !== undefined) newState.mod_webp.zipEnabled = allData.zipEnabled;

    if (!newState.mod_wp_tools.elementorHideSettings && allData.elementorHideSettings) newState.mod_wp_tools.elementorHideSettings = allData.elementorHideSettings;
    if (!newState.mod_wp_tools.tabPosition && allData.tabPosition) newState.mod_wp_tools.tabPosition = allData.tabPosition;

    // 2. Determine keys to remove (everything except our new namespaces)
    const namespaces = ['app_state', 'mod_webp', 'mod_wp_tools', 'mod_clamp', 'mod_pass', 'mod_svg', 'mod_color', 'mod_font', 'mod_text'];
    const keysToRemove = Object.keys(allData).filter(key => !namespaces.includes(key));

    // 3. Save clean state and clear old garbage
    await chrome.storage.local.set(newState);
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
    }
    console.log('[SparkDev Pro] Storage migration complete.');
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
          { 
            target: { tabId: tab.id }, 
            files: [
              'core/content/utils.js',
              'core/content/color.js',
              'core/content/font.js',
              'core/content/webp.js',
              'core/content/wp.js',
              'core/content/main.js'
            ] 
          },
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

  if (msg.action === 'takeScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 100 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ ok: true, dataUrl: dataUrl });
      }
    });
    return true; // Keep channel open for async response
  }

  if (msg.action === 'colorPicked') {
    chrome.storage.local.get(['mod_color'], (res) => {
      const data = res.mod_color || {};
      const history = data.history || [];
      const hex = msg.hex.toUpperCase();

      // Simple deduplication for recent picks
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

      // Keep only top 20 non-favorites
      const favorites = history.filter(item => item.isFavorite);
      const nonFavorites = history.filter(item => !item.isFavorite).slice(0, 20);
      data.history = [...favorites, ...nonFavorites];

      chrome.storage.local.set({ mod_color: data }, () => {
        sendResponse({ ok: true });
      });
    });
    return true;
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
  
  if (msg.action === 'colorPicked') {
    chrome.storage.local.get(['mod_color'], (res) => {
      const data = res.mod_color || {};
      const history = data.history || [];
      const hex = msg.hex.toUpperCase();

      // Simple deduplication for recent picks
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

      // Keep only top 20 non-favorites
      const favorites = history.filter(item => item.isFavorite);
      const nonFavorites = history.filter(item => !item.isFavorite).slice(0, 20);
      data.history = [...favorites, ...nonFavorites];

      chrome.storage.local.set({ mod_color: data }, () => {
        sendResponse({ ok: true });
      });
    });
    return true;
  }
  
  return true;
});
