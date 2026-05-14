(async function () {
  window.initWP = async function() {
    const getCurrentTab = async () => { 
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); 
      return tab; 
    };

    const tab = await getCurrentTab();
    let domain = '';
    try {
      domain = new URL(tab.url).hostname;
    } catch (e) {}

    // --- Elementor Loader Logic ---
    const loaderToggle = document.getElementById('elementorLoaderToggle');
    if (loaderToggle && domain) {
      chrome.storage.local.get(['elementorHideSettings'], (result) => {
        const settings = result.elementorHideSettings || {};
        loaderToggle.checked = !!settings[domain];
      });

      loaderToggle.addEventListener('change', async (e) => {
        const result = await chrome.storage.local.get(['elementorHideSettings']);
        const settings = result.elementorHideSettings || {};
        if (e.target.checked) {
          settings[domain] = true;
        } else {
          delete settings[domain];
        }
        await chrome.storage.local.set({ elementorHideSettings: settings });
        
        // Notify tab to apply/remove immediately
        chrome.tabs.sendMessage(tab.id, { action: 'toggleElementorLoader', enabled: e.target.checked });
      });
    }

    // --- Quick Links ([data-url]) ---
    document.querySelectorAll('[data-url]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const t = await getCurrentTab();
        const url = new URL(t.url);
        chrome.tabs.create({ url: url.origin + btn.dataset.url });
      });
    });

    // --- External Tools ---
    document.getElementById('pageSpeedBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      chrome.tabs.create({ url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(t.url)}` });
    });

    document.getElementById('dnsCheckerBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      const d = new URL(t.url).hostname;
      chrome.tabs.create({ url: `https://dnschecker.org/#A/${d}` });
    });

    // --- Navigation Tools ---
    document.getElementById('viewWebsiteBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      chrome.tabs.create({ url: new URL(t.url).origin });
    });

    document.getElementById('websiteIncognitoBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      chrome.windows.create({ url: new URL(t.url).origin, incognito: true });
    });

    // --- No-Cache (NC) Tools ---
    const openNoCache = async (incognito = false) => {
      const t = await getCurrentTab();
      const url = new URL(t.url);
      url.searchParams.set('nc', Date.now());
      if (incognito) {
        chrome.windows.create({ url: url.toString(), incognito: true });
      } else {
        chrome.tabs.create({ url: url.toString() });
      }
    };

    document.getElementById('normalVisitBtn')?.addEventListener('click', () => openNoCache(false));
    document.getElementById('incognitoBtn')?.addEventListener('click', () => openNoCache(true));

    // --- Freepik Tool ---
    const copyBtn = document.getElementById('copyUrlBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const t = await getCurrentTab();
        navigator.clipboard.writeText(t.url);
        copyBtn.textContent = 'URL Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy URL | Freepik Tool', 1000);
      });
    }
  };
})();
