(function() {
  window.initSettings = function() {
    const settingRightClick = document.getElementById('settingRightClick');
    const settingCopyLinkText = document.getElementById('settingCopyLinkText');
    const settingAdvancedPicker = document.getElementById('settingAdvancedPicker');

    async function init() {
      // Load current settings
      chrome.storage.local.get(['mod_settings'], (result) => {
        const settings = result.mod_settings || {};
        settingRightClick.checked = !!settings.enableRightClick;
        settingCopyLinkText.checked = !!settings.enableCopyLinkText;
        settingAdvancedPicker.checked = !!settings.enableAdvancedPicker;
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
