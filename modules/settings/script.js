(function() {
  window.initSettings = function() {
    const settingRightClick = document.getElementById('settingRightClick');
    const settingCopyLinkText = document.getElementById('settingCopyLinkText');
    const settingAdvancedPicker = document.getElementById('settingAdvancedPicker');

    async function init() {
      // Load current settings
      chrome.storage.local.get(['mod_settings'], (result) => {
        const settings = result.mod_settings || {};
        
        // Ensure defaults if not set
        if (settings.enableCopyLinkText === undefined) settings.enableCopyLinkText = true;
        if (settings.enableAdvancedPicker === undefined) settings.enableAdvancedPicker = true;
        
        settingRightClick.checked = !!settings.enableRightClick;
        settingCopyLinkText.checked = !!settings.enableCopyLinkText;
        settingAdvancedPicker.checked = !!settings.enableAdvancedPicker;
        
        // Save defaults if modified
        chrome.storage.local.set({ mod_settings: settings });
      });

      // Add listeners
      settingRightClick.addEventListener('change', () => saveSettings());
      settingCopyLinkText.addEventListener('change', () => saveSettings());
      settingAdvancedPicker.addEventListener('change', () => saveSettings());
    }

    function saveSettings() {
      const settings = {
        enableRightClick: settingRightClick.checked,
        enableCopyLinkText: settingCopyLinkText.checked,
        enableAdvancedPicker: settingAdvancedPicker.checked
      };
      chrome.storage.local.set({ mod_settings: settings });
    }

    init();
  };
})();
