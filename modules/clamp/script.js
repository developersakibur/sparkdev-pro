(function() {
  window.initClamp = function() {
    const DEFAULT_CONFIGS = {
      text: { minValue: 14, minVp: 16, maxValue: 30, maxVp: 48 },
      padding: { minValue: 15, minVp: 20, maxValue: 55, maxVp: 100 }
    };
    const DEFAULT_VIEWPORT = { minWidth: 375, maxWidth: 1440 };

    const minVWEl = document.getElementById("minWidth");
    const maxVWEl = document.getElementById("maxWidth");
    const minSizeEl = document.getElementById("minSize");
    const maxSizeEl = document.getElementById("maxSizeClamp");
    const resultEl = document.getElementById("resultClamp");
    const radioButtons = document.querySelectorAll('#tab-clamp input[name="propertyType"]');
    const configMinValue = document.getElementById("configMinValue");
    const configMinVp = document.getElementById("configMinVp");
    const configMaxValue = document.getElementById("configMaxValue");
    const configMaxVp = document.getElementById("configMaxVp");
    const configToggle = document.getElementById("configToggle");
    const configSection = document.querySelector("#tab-clamp .config-section");
    const vpPreviewSlider = document.getElementById("vpPreviewSlider");
    const sliderTrackFill = document.getElementById("sliderTrackFill");
    const sliderCurrentVp = document.getElementById("sliderCurrentVp");
    const sliderCurrentClamp = document.getElementById("sliderCurrentClamp");

    let currentClampValue = "";
    let configs = { ...DEFAULT_CONFIGS };
    let viewport = { ...DEFAULT_VIEWPORT };
    let saveTimeout = null;

    async function init() {
      await loadSettings();
      applyConfigsToRadios();
      applyViewportValues();
      const selectedRadio = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
      if (selectedRadio) loadConfigInputs(selectedRadio.value);
      updateMinSize();
    }

    async function loadSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['propertyConfigs', 'viewportSettings', 'configPanelOpen'], (result) => {
          if (result.propertyConfigs) configs = result.propertyConfigs;
          if (result.viewportSettings) viewport = result.viewportSettings;
          if (result.configPanelOpen) {
            configToggle.checked = true;
            configSection.style.display = 'flex';
          }
          resolve();
        });
      });
    }

    function saveSettings() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        chrome.storage.sync.set({ 
          propertyConfigs: configs,
          viewportSettings: viewport,
          configPanelOpen: configToggle.checked
        });
      }, 300);
    }

    function applyViewportValues() {
      minVWEl.value = viewport.minWidth;
      maxVWEl.value = viewport.maxWidth;
    }

    function applyConfigsToRadios() {
      radioButtons.forEach((radio) => {
        const type = radio.value;
        const config = configs[type];
        if (config) {
          radio.dataset.minVp = config.minVp;
          radio.dataset.maxVp = config.maxVp;
          radio.dataset.minValue = config.minValue;
          radio.dataset.maxValue = config.maxValue;
        }
      });
    }

    function loadConfigInputs(type) {
      const config = configs[type];
      if (config) {
        configMinValue.value = config.minValue;
        configMinVp.value = config.minVp;
        configMaxValue.value = config.maxValue;
        configMaxVp.value = config.maxVp;
      }
    }

    function saveConfigFromInputs() {
      const selectedRadio = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
      if (!selectedRadio) return;
      const type = selectedRadio.value;
      configs[type] = {
        minValue: parseInt(configMinValue.value) || 1,
        minVp: parseInt(configMinVp.value) || 1,
        maxValue: parseInt(configMaxValue.value) || 1,
        maxVp: parseInt(configMaxVp.value) || 1
      };
      applyConfigsToRadios();
      saveSettings();
      updateMinSize();
    }

    function updateMinSize() {
      const maxPx = parseFloat(maxSizeEl.value);
      const selectedRadio = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
      if (isNaN(maxPx) || !selectedRadio) return;
      
      const type = selectedRadio.value;
      const config = configs[type];
      const ratio = (maxPx - config.minValue) / (config.maxValue - config.minValue);
      const minPx = config.minValue + ratio * (config.maxValue - config.minValue);
      
      // Simpler default if calc fails
      minSizeEl.value = Math.round(maxPx * 0.7); 
      updateClamp();
    }

    function updateClamp() {
      const minVW = parseFloat(minVWEl.value), maxVW = parseFloat(maxVWEl.value);
      const minPx = parseFloat(minSizeEl.value), maxPx = parseFloat(maxSizeEl.value);
      if (isNaN(minVW) || isNaN(maxVW) || isNaN(minPx) || isNaN(maxPx) || minVW === maxVW) return;

      const slope = (maxPx - minPx) / (maxVW - minVW);
      const intercept = minPx - slope * minVW;
      const inner = `${Math.min(minPx, maxPx)}px, ${intercept.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${Math.max(minPx, maxPx)}px`;
      currentClampValue = `clamp(${inner})`;
      resultEl.textContent = inner;
      updateSliderPreview();
    }

    function updateSliderPreview() {
      const minVW = parseFloat(minVWEl.value), maxVW = parseFloat(maxVWEl.value);
      const vw = parseFloat(vpPreviewSlider.value);
      vpPreviewSlider.min = minVW; vpPreviewSlider.max = maxVW;
      const percent = (vw - minVW) / (maxVW - minVW) * 100;
      sliderTrackFill.style.width = Math.max(0, Math.min(100, percent)) + "%";
      sliderCurrentVp.textContent = vw;
      
      const slope = (parseFloat(maxSizeEl.value) - parseFloat(minSizeEl.value)) / (maxVW - minVW);
      const intercept = parseFloat(minSizeEl.value) - slope * minVW;
      sliderCurrentClamp.textContent = (intercept + slope * vw).toFixed(2);
    }

    maxSizeEl.addEventListener("input", updateMinSize);
    minSizeEl.addEventListener("input", updateClamp);
    [minVWEl, maxVWEl].forEach(el => el.addEventListener("input", () => {
      viewport.minWidth = parseInt(minVWEl.value);
      viewport.maxWidth = parseInt(maxVWEl.value);
      saveSettings();
      updateClamp();
    }));
    radioButtons.forEach(r => r.addEventListener("change", () => { loadConfigInputs(r.value); updateMinSize(); }));
    [configMinValue, configMinVp, configMaxValue, configMaxVp].forEach(el => el.addEventListener("input", saveConfigFromInputs));
    configToggle.addEventListener("change", () => { configSection.style.display = configToggle.checked ? 'flex' : 'none'; saveSettings(); });
    resultEl.addEventListener("click", () => {
      navigator.clipboard.writeText(currentClampValue).then(() => {
        resultEl.classList.add("sd-c-well--success");
        setTimeout(() => resultEl.classList.remove("sd-c-well--success"), 1000);
      });
    });
    vpPreviewSlider.addEventListener("input", updateSliderPreview);

    init();
  };
})();
