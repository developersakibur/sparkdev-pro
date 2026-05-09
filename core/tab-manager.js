const FEATURES = [
  { 
    id: 'tab-clamp', 
    label: 'Clamp', 
    desc: 'Fluid Typography', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14v3a2 2 0 0 0 2 2h3"></path><path d="M17 19h3a2 2 0 0 0 2-2v-3"></path><path d="M22 10V7a2 2 0 0 0-2-2h-3"></path><path d="M7 5H4a2 2 0 0 0-2 2v3"></path><path d="M12 9v6"></path><path d="M9 12h6"></path></svg>'
  },
  { 
    id: 'tab-webp', 
    label: 'WebP', 
    desc: 'Image Optimizer', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
  },
  { 
    id: 'tab-svg', 
    label: 'Svg', 
    desc: 'Icon Vault', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 1.97V21a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5.43a2 2 0 0 0-1.62-1.97z"></path><path d="M12 22V11"></path><path d="M8 14h8"></path></svg>'
  },
  { 
    id: 'tab-wp', 
    label: 'WP Tools', 
    desc: 'Quick Shortcuts', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>'
  },
  { 
    id: 'tab-pass', 
    label: 'Pass', 
    desc: 'Secure Generator', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const tabsNav = document.getElementById('tabsNav');
  const featureGrid = document.getElementById('featureGrid');
  const welcomePage = document.getElementById('welcome-page');
  const mainApp = document.getElementById('main-app');
  const homeBtn = document.getElementById('homeBtn');

  let currentOrder = [];

  // --- Core Functions ---

  function init() {
    chrome.storage.local.get(['featureOrder'], (result) => {
      if (result.featureOrder && result.featureOrder.length === FEATURES.length) {
        currentOrder = result.featureOrder.map(id => FEATURES.find(f => f.id === id)).filter(Boolean);
      } else {
        currentOrder = [...FEATURES];
      }
      renderAll();
    });

    homeBtn.addEventListener('click', () => {
      showWelcome();
    });
  }

  function renderAll() {
    renderTabs();
    renderGrid();
  }

  function renderTabs() {
    // Remove existing dynamic tabs
    const dynamicTabs = tabsNav.querySelectorAll('.tab-btn:not(#homeBtn)');
    dynamicTabs.forEach(t => t.remove());

    currentOrder.forEach(feature => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.setAttribute('data-tab', feature.id);
      btn.textContent = feature.label;
      btn.addEventListener('click', () => {
        switchTab(feature.id);
        chrome.storage.local.set({ activeTab: feature.id });
      });
      tabsNav.appendChild(btn);
    });
  }

  function renderGrid() {
    featureGrid.innerHTML = '';
    currentOrder.forEach(feature => {
      const card = document.createElement('div');
      card.className = 'feature-card';
      card.setAttribute('data-tab', feature.id);
      card.setAttribute('draggable', 'true');
      
      card.innerHTML = `
        <div class="card-icon">${feature.icon}</div>
        <div class="card-info">
          <h3>${feature.label}</h3>
          <p>${feature.desc}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        switchTab(feature.id);
        chrome.storage.local.set({ activeTab: feature.id });
      });

      // --- Drag & Drop ---
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', feature.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        saveNewOrder();
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingCard = document.querySelector('.dragging');
        if (!draggingCard || draggingCard === card) return;

        const rect = card.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        
        if (e.clientX < midpoint) {
          featureGrid.insertBefore(draggingCard, card);
        } else {
          featureGrid.insertBefore(draggingCard, card.nextSibling);
        }
      });

      featureGrid.appendChild(card);
    });
  }

  function saveNewOrder() {
    const cards = Array.from(featureGrid.querySelectorAll('.feature-card'));
    const newIds = cards.map(c => c.getAttribute('data-tab'));
    
    // Update memory
    currentOrder = newIds.map(id => FEATURES.find(f => f.id === id));
    
    // Save to storage
    chrome.storage.local.set({ featureOrder: newIds });
    
    // Update tabs
    renderTabs();
    
    // Maintain active state if in main app
    if (mainApp.style.display === 'block') {
      chrome.storage.local.get(['activeTab'], (res) => {
        if (res.activeTab) switchTab(res.activeTab);
      });
    }
  }

  function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    welcomePage.style.display = 'none';
    mainApp.style.display = 'block';

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    const activeTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);

    if (activeTab && activeContent) {
      activeTab.classList.add('active');
      activeContent.classList.add('active');
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function showWelcome() {
    welcomePage.style.display = 'flex';
    mainApp.style.display = 'none';
    
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    homeBtn.classList.add('active');
  }

  init();
});
