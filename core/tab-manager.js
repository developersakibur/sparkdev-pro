document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  // Load last active tab
  chrome.storage.local.get(['activeTab'], (result) => {
    if (result.activeTab) {
      switchTab(result.activeTab);
    }
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
      chrome.storage.local.set({ activeTab: tabId });
    });
  });

  function switchTab(tabId) {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    const activeTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);

    if (activeTab && activeContent) {
      activeTab.classList.add('active');
      activeContent.classList.add('active');
      
      // Scroll active tab into view
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }
});
