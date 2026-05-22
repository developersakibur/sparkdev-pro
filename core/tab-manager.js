const FEATURES = [
  { 
    id: 'tab-clamp', 
    label: 'Clamp', 
    desc: 'Fluid Typography', 
    template: 'modules/clamp/template.html',
    init: () => window.initClamp && window.initClamp(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14v3a2 2 0 0 0 2 2h3"></path><path d="M17 19h3a2 2 0 0 0 2-2v-3"></path><path d="M22 10V7a2 2 0 0 0-2-2h-3"></path><path d="M7 5H4a2 2 0 0 0-2 2v3"></path><path d="M12 9v6"></path><path d="M9 12h6"></path></svg>'
  },
  { 
    id: 'tab-webp', 
    label: 'WebP', 
    desc: 'Image Optimizer', 
    template: 'modules/webp/template.html',
    init: () => window.initWebP && window.initWebP(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
  },
  { 
    id: 'tab-svg', 
    label: 'Svg', 
    desc: 'Icon Vault', 
    template: 'modules/svg/template.html',
    init: () => window.initSvg && window.initSvg(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 1.97V21a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5.43a2 2 0 0 0-1.62-1.97z"></path><path d="M12 22V11"></path><path d="M8 14h8"></path></svg>'
  },
  { 
    id: 'tab-wp', 
    label: 'WP Tools', 
    desc: 'Quick Shortcuts', 
    template: 'modules/wp-tools/template.html',
    init: () => window.initWP && window.initWP(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>'
  },
  { 
    id: 'tab-pass', 
    label: 'Pass', 
    desc: 'Secure Generator', 
    template: 'modules/pass/template.html',
    init: () => window.initPass && window.initPass(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
  },
  { 
    id: 'tab-color', 
    label: 'Color', 
    desc: 'EyeDropper Tool', 
    template: 'modules/color/template.html',
    init: () => window.initColor && window.initColor(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"></path><path d="M3 21v-3l9-9"></path><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z"></path></svg>'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const tabsNav = document.getElementById('tabsNav');
  const featureGrid = document.getElementById('featureGrid');
  const welcomePage = document.getElementById('welcome-page');
  const mainApp = document.getElementById('main-app');
  const appContent = document.getElementById('app-content');
  const homeBtn = document.getElementById('homeBtn');

  async function migrateAndCleanupStorage() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, async (allData) => {
        const newState = {
          app_state: allData.app_state || {},
          mod_webp: allData.mod_webp || {},
          mod_wp_tools: allData.mod_wp_tools || {},
          mod_clamp: allData.mod_clamp || {},
          mod_color: allData.mod_color || {}
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
        const keysToRemove = Object.keys(allData).filter(key => 
          !['app_state', 'mod_webp', 'mod_wp_tools', 'mod_clamp', 'mod_pass', 'mod_svg', 'mod_color'].includes(key)
        );

        // 3. Save clean state and clear old garbage
        await chrome.storage.local.set(newState);
        if (keysToRemove.length > 0) {
          await chrome.storage.local.remove(keysToRemove);
        }
        resolve();
      });
    });
  }

  let currentOrder = [];
  const loadedModules = new Set();

  async function init() {
    await migrateAndCleanupStorage();
    chrome.storage.local.get(['app_state'], (result) => {
      const state = result.app_state || {};
      const featureOrder = state.featureOrder;

      if (featureOrder && featureOrder.length === FEATURES.length) {
        currentOrder = featureOrder.map(id => FEATURES.find(f => f.id === id)).filter(Boolean);
      } else {
        currentOrder = [...FEATURES];
      }
      renderAll();

      if (state.activeTab) {
        switchTab(state.activeTab);
      }
    });

    homeBtn.addEventListener('click', showWelcome);
  }

  function renderAll() {
    renderTabs();
    renderGrid();
  }

  function renderTabs() {
    tabsNav.innerHTML = '';
    currentOrder.forEach(feature => {
      const btn = document.createElement('button');
      btn.className = 'sd-c-tabs__btn';
      btn.setAttribute('data-tab', feature.id);
      btn.textContent = feature.label;
      btn.addEventListener('click', () => switchTab(feature.id));
      tabsNav.appendChild(btn);
    });
  }

  let draggedId = null;

  function renderGrid() {
    featureGrid.innerHTML = '';
    currentOrder.forEach((feature, index) => {
      const card = document.createElement('div');
      card.className = 'sd-c-feature-card';
      card.draggable = true;
      card.dataset.id = feature.id;
      card.innerHTML = `
        <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--sd-color-black); border-radius: 8px; color: var(--sd-color-cyan); flex-shrink: 0; pointer-events: none;">
          ${feature.icon}
        </div>
        <div style="flex: 1; min-width: 0; text-align: left; pointer-events: none;">
          <h3 style="font-size: 13px; font-weight: 600; color: var(--sd-color-text-primary); margin-bottom: 2px;">${feature.label}</h3>
          <p style="font-size: 10px; color: var(--sd-color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${feature.desc}</p>
        </div>
      `;
      
      card.addEventListener('click', () => switchTab(feature.id));

      // Drag and Drop Logic
      card.addEventListener('dragstart', (e) => {
        draggedId = feature.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (draggedId === feature.id) return;

        const fromIndex = currentOrder.findIndex(f => f.id === draggedId);
        const toIndex = currentOrder.findIndex(f => f.id === feature.id);

        const [movedItem] = currentOrder.splice(fromIndex, 1);
        currentOrder.splice(toIndex, 0, movedItem);

        renderAll();
        
        chrome.storage.local.get(['app_state'], (res) => {
          const state = res.app_state || {};
          state.featureOrder = currentOrder.map(f => f.id);
          chrome.storage.local.set({ app_state: state });
        });
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      featureGrid.appendChild(card);
    });
  }

  async function switchTab(tabId) {
    const feature = FEATURES.find(f => f.id === tabId);
    if (!feature) return;

    welcomePage.style.display = 'none';
    mainApp.style.display = 'flex';

    // Load template if not already loaded
    if (!loadedModules.has(tabId)) {
      try {
        const response = await fetch(feature.template);
        const html = await response.text();
        const wrapper = document.createElement('div');
        wrapper.id = tabId;
        wrapper.className = 'tab-content';
        wrapper.innerHTML = html;
        appContent.appendChild(wrapper);
        
        // Initialize the script logic
        feature.init();
        loadedModules.add(tabId);
      } catch (err) {
        console.error(`Failed to load module: ${tabId}`, err);
      }
    }

    // Toggle active classes
    document.querySelectorAll('.sd-c-tabs__btn').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tabId));
    
    const activeTab = document.querySelector(`.sd-c-tabs__btn[data-tab="${tabId}"]`);
    if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    chrome.storage.local.get(['app_state'], (res) => {
      const state = res.app_state || {};
      state.activeTab = tabId;
      chrome.storage.local.set({ app_state: state });
    });
  }

  function showWelcome() {
    welcomePage.style.display = 'flex';
    mainApp.style.display = 'none';
    document.querySelectorAll('.sd-c-tabs__btn').forEach(t => t.classList.remove('active'));
    homeBtn.classList.add('active');
    
    chrome.storage.local.get(['app_state'], (res) => {
      const state = res.app_state || {};
      delete state.activeTab;
      chrome.storage.local.set({ app_state: state });
    });
  }

  init();
});
