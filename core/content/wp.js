// --- Elementor Loader Hider ---
(async function() {
  const domain = window.location.hostname;
  try {
    const result = await chrome.storage.local.get(['mod_wp_tools']);
    const settings = result.mod_wp_tools?.elementorHideSettings || {};
    if (settings[domain]) {
      const style = document.createElement('style');
      style.id = 'sparkdev-hide-elementor-loader';
      style.textContent = '#elementor-panel-state-loading { display: none !important; }';
      document.documentElement.appendChild(style);
    }
  } catch (e) {
    console.error('[SparkDev Pro]', e);
  }
})();
