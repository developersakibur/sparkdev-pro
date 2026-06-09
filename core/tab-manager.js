const FEATURES = [
  { 
    id: 'tab-clamp', 
    label: 'Clamp', 
    desc: 'Fluid Typography', 
    template: 'modules/clamp/template.html',
    script: 'modules/clamp/script.js',
    init: () => window.initClamp && window.initClamp(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14v3a2 2 0 0 0 2 2h3"></path><path d="M17 19h3a2 2 0 0 0 2-2v-3"></path><path d="M22 10V7a2 2 0 0 0-2-2h-3"></path><path d="M7 5H4a2 2 0 0 0-2 2v3"></path><path d="M12 9v6"></path><path d="M9 12h6"></path></svg>'
  },
  { 
    id: 'tab-webp', 
    label: 'WebP', 
    desc: 'Image Optimizer', 
    template: 'modules/webp/template.html',
    script: 'modules/webp/script.js',
    init: () => window.initWebP && window.initWebP(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
  },
  { 
    id: 'tab-color', 
    label: 'Color', 
    desc: 'EyeDropper Tool', 
    template: 'modules/color/template.html',
    script: 'modules/color/script.js',
    init: () => window.initColor && window.initColor(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"></path><path d="M3 21v-3l9-9"></path><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z"></path></svg>'
  },
  { 
    id: 'tab-font', 
    label: 'Font', 
    desc: 'Style Finder', 
    template: 'modules/font/template.html',
    script: 'modules/font/script.js',
    init: () => window.initFont && window.initFont(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>'
  },
  { 
    id: 'tab-wp', 
    label: 'WP Tools', 
    desc: 'Quick Shortcuts', 
    template: 'modules/wp-tools/template.html',
    script: 'modules/wp-tools/script.js',
    init: () => window.initWP && window.initWP(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>'
  },
  { 
    id: 'tab-svg', 
    label: 'Svg', 
    desc: 'Icon Vault', 
    template: 'modules/svg/template.html',
    script: 'modules/svg/script.js',
    init: () => window.initSvg && window.initSvg(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 1.97V21a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5.43a2 2 0 0 0-1.62-1.97z"></path><path d="M12 22V11"></path><path d="M8 14h8"></path></svg>'
  },
  { 
    id: 'tab-text', 
    label: 'Text', 
    desc: 'Case Transformer', 
    template: 'modules/text/template.html',
    script: 'modules/text/script.js',
    init: () => window.initText && window.initText(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18.1H3"/></svg>'
  },
  { 
    id: 'tab-notepad', 
    label: 'Notepad', 
    desc: 'SparkPad Editor', 
    template: 'modules/notepad/template.html',
    script: 'modules/notepad/script.js',
    init: () => window.initNotepad && window.initNotepad(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
  },
  { 
    id: 'tab-pass', 
    label: 'Pass', 
    desc: 'Secure Generator', 
    template: 'modules/pass/template.html',
    script: 'modules/pass/script.js',
    init: () => window.initPass && window.initPass(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
  },
  { 
    id: 'tab-settings', 
    label: 'Settings', 
    desc: 'App Preferences', 
    template: 'modules/settings/template.html',
    script: 'modules/settings/script.js',
    init: () => window.initSettings && window.initSettings(),
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const tabsNav = document.getElementById('tabsNav');
  const featureGrid = document.getElementById('featureGrid');
  const welcomePage = document.getElementById('welcome-page');
  const mainApp = document.getElementById('main-app');
  const appContent = document.getElementById('app-content');
  const homeBtn = document.getElementById('homeBtn');

  let currentOrder = [];
  const loadedModules = new Set();

  async function init() {
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
        <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--sd-color-black); border-radius: 6px; color: var(--sd-color-cyan); flex-shrink: 0; pointer-events: none;">
          ${feature.icon.replace('width="24"', 'width="16"').replace('height="24"', 'height="16"')}
        </div>
        <div style="flex: 1; min-width: 0; text-align: left; pointer-events: none;">
          <h3 style="font-size: 12px; font-weight: 600; color: var(--sd-color-text-primary); margin-bottom: 0;">${feature.label}</h3>
          <p style="font-size: 9px; color: var(--sd-color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${feature.desc}</p>
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

    // Load template and script if not already loaded
    if (!loadedModules.has(tabId)) {
      try {
        // 1. Fetch and inject template
        const response = await fetch(feature.template);
        const html = await response.text();
        const wrapper = document.createElement('div');
        wrapper.id = tabId;
        wrapper.className = 'tab-content';
        wrapper.innerHTML = html;
        appContent.appendChild(wrapper);
        
        // 2. Dynamically load script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = feature.script;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });

        // 3. Initialize the script logic
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
