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

    // --- Tab Position Logic ---
    const beforeBtn = document.getElementById('beforeBtn');
    const afterBtn = document.getElementById('afterBtn');
    const wpSection = document.getElementById('wpSection');

    const setPosition = (pos, save = true) => {
      beforeBtn.classList.toggle('active', pos === 'before');
      afterBtn.classList.toggle('active', pos === 'after');
      wpSection.style.display = pos === 'after' ? 'grid' : 'none';
      if (save) {
        chrome.storage.local.get(['mod_wp_tools'], (res) => {
          const s = res.mod_wp_tools || {};
          s.tabPosition = pos;
          chrome.storage.local.set({ mod_wp_tools: s });
        });
      }
    };

    chrome.storage.local.get(['mod_wp_tools'], (res) => {
      const s = res.mod_wp_tools || {};
      setPosition(s.tabPosition || 'after', false);
    });

    beforeBtn?.addEventListener('click', () => setPosition('before'));
    afterBtn?.addEventListener('click', () => setPosition('after'));

    // --- Elementor Loader Logic ---
    const loaderToggle = document.getElementById('elementorLoaderToggle');
    if (loaderToggle && domain) {
      chrome.storage.local.get(['mod_wp_tools'], (result) => {
        const settings = result.mod_wp_tools?.elementorHideSettings || {};
        loaderToggle.checked = !!settings[domain];
      });

      loaderToggle.addEventListener('change', async (e) => {
        const result = await chrome.storage.local.get(['mod_wp_tools']);
        const mod_settings = result.mod_wp_tools || {};
        const settings = mod_settings.elementorHideSettings || {};
        if (e.target.checked) {
          settings[domain] = true;
        } else {
          delete settings[domain];
        }
        mod_settings.elementorHideSettings = settings;
        await chrome.storage.local.set({ mod_wp_tools: mod_settings });
        
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
