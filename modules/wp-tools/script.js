(async function () {
  window.initWP = async function() {
    const getCurrentTab = async () => { 
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); 
      return tab; 
    };

    let currentTab = await getCurrentTab();
    let domain = '';
    try {
      domain = new URL(currentTab.url).hostname;
    } catch (e) {}

    // --- Tab Position Logic ---
    const beforeBtn = document.getElementById('beforeBtn');
    const afterBtn = document.getElementById('afterBtn');
    
    let currentTabPos = 'after';

    const setPosition = (pos, save = true) => {
      currentTabPos = pos;
      beforeBtn.classList.toggle('active', pos === 'before');
      afterBtn.classList.toggle('active', pos === 'after');
      
      if (save) {
        chrome.storage.local.get(['mod_wp_tools'], (res) => {
          const s = res.mod_wp_tools || {};
          s.tabPosition = pos;
          chrome.storage.local.set({ mod_wp_tools: s });
        });
      }
    };

    async function sendMessageToTab(payload) {
      return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]) return resolve({ ok: false });
          
          chrome.tabs.sendMessage(tabs[0].id, payload, (response) => {
            if (chrome.runtime.lastError) {
              console.log('[SparkDev WP] Content script missing, injecting...');
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

    chrome.storage.local.get(['mod_wp_tools'], (res) => {
      const s = res.mod_wp_tools || {};
      setPosition(s.tabPosition || 'after', false);
    });

    beforeBtn?.addEventListener('click', () => setPosition('before'));
    afterBtn?.addEventListener('click', () => setPosition('after'));

    // Helper to open tabs based on position
    const createTab = async (url) => {
      const t = await getCurrentTab();
      const index = currentTabPos === 'before' ? t.index : t.index + 1;
      chrome.tabs.create({ url, index });
    };

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
        sendMessageToTab({ action: 'toggleElementorLoader', enabled: e.target.checked });
      });
    }

    // --- Quick Links ([data-url]) ---
    document.querySelectorAll('[data-url]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const t = await getCurrentTab();
        const url = new URL(t.url);
        createTab(url.origin + btn.dataset.url);
      });
    });

    // --- External Tools ---
    document.getElementById('pageSpeedBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      createTab(`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(t.url)}`);
    });

    document.getElementById('dnsCheckerBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      const d = new URL(t.url).hostname;
      createTab(`https://dnschecker.org/#A/${d}`);
    });

    // --- Navigation Tools ---
    document.getElementById('viewWebsiteBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      createTab(new URL(t.url).origin);
    });

    document.getElementById('websiteIncognitoBtn')?.addEventListener('click', async () => {
      const t = await getCurrentTab();
      chrome.windows.create({ url: new URL(t.url).origin, incognito: true });
    });

    // --- No-Cache (NC) Tools ---
    const generateRandomStr = (len) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    };

    const openNoCache = async (incognito = false) => {
      const t = await getCurrentTab();
      const url = new URL(t.url);
      
      // Advanced cache busting with 50-char random string and multiple params
      url.searchParams.set('nc', generateRandomStr(50));
      url.searchParams.set('ver', Date.now());
      url.searchParams.set('dnu', generateRandomStr(12));

      if (incognito) {
        chrome.windows.create({ url: url.toString(), incognito: true });
      } else {
        createTab(url.toString());
      }
    };

    document.getElementById('normalVisitBtn')?.addEventListener('click', () => openNoCache(false));
    document.getElementById('incognitoBtn')?.addEventListener('click', () => openNoCache(true));
  };
})();
