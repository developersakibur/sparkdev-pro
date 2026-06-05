(function() {
  window.initClamp = function() {
    const DEFAULT_CONFIGS = {
      text: { minValue: 14, minVp: 16, maxValue: 30, maxVp: 48 },
      spacing: { minValue: 15, minVp: 20, maxValue: 55, maxVp: 100 }
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
    let configs = JSON.parse(JSON.stringify(DEFAULT_CONFIGS));
    let viewport = { ...DEFAULT_VIEWPORT };
    let saveTimeout = null;

    async function init() {
      await loadSettings();
      applyConfigsToRadios();
      applyViewportValues();

      // Ensure main inputs are empty on load for zero-friction
      maxSizeEl.value = "";
      minSizeEl.value = "";

      // Restore last selected type
      chrome.storage.local.get(['app_state'], (res) => {
        const type = res.app_state?.lastClampType || 'text';
        const radio = document.querySelector(`#tab-clamp input[value="${type}"]`);
        if (radio) {
          radio.checked = true;
          loadConfigInputs(type);
        }
        updateClamp();
      });
    }

    async function loadSettings() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['mod_clamp'], (result) => {
          const settings = result.mod_clamp || {};
          let needsSave = false;

          if (settings.propertyConfigs) {
            // Handle legacy "padding" key migration
            if (settings.propertyConfigs.padding) {
              if (!settings.propertyConfigs.spacing) settings.propertyConfigs.spacing = settings.propertyConfigs.padding;
              delete settings.propertyConfigs.padding;
              needsSave = true;
            }
            configs = { ...DEFAULT_CONFIGS, ...settings.propertyConfigs };
            delete configs.padding;
          }

          if (settings.viewportSettings) viewport = settings.viewportSettings;
          if (settings.configPanelOpen) {
            configToggle.checked = true;
            configSection.style.display = 'flex';
          }

          if (needsSave) saveSettings();
          resolve();
        });
      });
    }

    function saveSettings() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        chrome.storage.local.get(['mod_clamp'], (res) => {
          const settings = res.mod_clamp || {};
          
          const cleanConfigs = {
            text: configs.text,
            spacing: configs.spacing
          };

          settings.propertyConfigs = cleanConfigs;
          settings.viewportSettings = viewport;
          settings.configPanelOpen = configToggle.checked;
          chrome.storage.local.set({ mod_clamp: settings });
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
      
      const inputs = {
        minValue: configMinValue,
        minVp: configMinVp,
        maxValue: configMaxValue,
        maxVp: configMaxVp
      };

      Object.keys(inputs).forEach(key => {
        if (!inputs[key].value.trim()) {
          inputs[key].value = DEFAULT_CONFIGS[type][key];
        }
      });

      configs[type] = {
        minValue: parseInt(configMinValue.value) || DEFAULT_CONFIGS[type].minValue,
        minVp: parseInt(configMinVp.value) || DEFAULT_CONFIGS[type].minVp,
        maxValue: parseInt(configMaxValue.value) || DEFAULT_CONFIGS[type].maxValue,
        maxVp: parseInt(configMaxVp.value) || DEFAULT_CONFIGS[type].maxVp
      };
      applyConfigsToRadios();
      saveSettings();
      updateMinSize();
    }

    function updateMinSize() {
      const val = maxSizeEl.value.trim();
      if (!val || val === "-") {
        minSizeEl.value = "";
        updateClamp();
        return;
      }

      const maxPx = parseFloat(val);
      const isNeg = maxPx < 0;
      const absMax = Math.abs(maxPx);
      
      const selectedRadio = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
      if (isNaN(maxPx) || !selectedRadio) return;
      
      const type = selectedRadio.value;
      const config = configs[type];
      const rangeIn = config.maxVp - config.minVp;
      const rangeOut = config.maxValue - config.minValue;
      
      // Calculate suggestion based on absolute value
      let suggestion = config.minValue + ((absMax - config.minVp) / rangeIn) * rangeOut;
      suggestion = Math.max(1, Math.round(suggestion));
      
      // Apply the original sign
      minSizeEl.value = isNeg ? -suggestion : suggestion; 
      updateClamp();
    }

    function updateClamp() {
      const minVW = parseFloat(minVWEl.value), maxVW = parseFloat(maxVWEl.value);
      let minPx = parseFloat(minSizeEl.value), maxPx = parseFloat(maxSizeEl.value);
      
      if (isNaN(minVW) || isNaN(maxVW) || isNaN(minPx) || isNaN(maxPx) || minVW === maxVW) {
        resultEl.textContent = "0px, 0.00px + 0.00vw, 0px";
        currentClampValue = "clamp(0px, 0px, 0px)";
        return;
      }

      const isNeg = maxPx < 0;
      const aMin = Math.abs(minPx);
      const aMax = Math.abs(maxPx);

      const slope = (aMax - aMin) / (maxVW - minVW);
      const intercept = aMin - slope * minVW;
      
      const inner = `${Math.min(aMin, aMax)}px, ${intercept.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${Math.max(aMin, aMax)}px`;
      
      if (isNeg) {
        resultEl.textContent = `-1*(${inner})`;
        currentClampValue = `calc(-1 * clamp(${inner}))`;
      } else {
        resultEl.textContent = inner;
        currentClampValue = `clamp(${inner})`;
      }
      
      updateSliderPreview();
    }

    function updateSliderPreview() {
      const minVW = parseFloat(minVWEl.value), maxVW = parseFloat(maxVWEl.value);
      const vw = parseFloat(vpPreviewSlider.value);
      vpPreviewSlider.min = minVW; vpPreviewSlider.max = maxVW;
      const percent = (vw - minVW) / (maxVW - minVW) * 100;
      sliderTrackFill.style.width = Math.max(0, Math.min(100, percent)) + "%";
      sliderCurrentVp.textContent = vw;
      
      const minPx = Math.abs(parseFloat(minSizeEl.value)) || 0;
      const maxPx = Math.abs(parseFloat(maxSizeEl.value)) || 0;
      const slope = (maxPx - minPx) / (maxVW - minVW);
      const intercept = minPx - slope * minVW;
      sliderCurrentClamp.textContent = (intercept + slope * vw).toFixed(2);
    }

    maxSizeEl.addEventListener("input", updateMinSize);

    // Scroll/Wheel support (Jump to 20 if empty, allow negatives)
    maxSizeEl.addEventListener("wheel", (e) => {
      e.preventDefault();
      let val = parseInt(maxSizeEl.value);
      if (isNaN(val)) {
        val = 20;
      } else {
        val = e.deltaY < 0 ? val + 1 : val - 1;
      }
      maxSizeEl.value = val;
      updateMinSize();
    }, { passive: false });

    minSizeEl.addEventListener("input", updateClamp);
    
    [minVWEl, maxVWEl].forEach(el => el.addEventListener("input", () => {
      if (!minVWEl.value.trim()) minVWEl.value = DEFAULT_VIEWPORT.minWidth;
      if (!maxVWEl.value.trim()) maxVWEl.value = DEFAULT_VIEWPORT.maxWidth;
      viewport.minWidth = parseInt(minVWEl.value);
      viewport.maxWidth = parseInt(maxVWEl.value);
      saveSettings();
      updateMinSize();
    }));
    
    radioButtons.forEach(r => r.addEventListener("change", () => { 
      loadConfigInputs(r.value); 
      updateMinSize(); 
      chrome.storage.local.get(['app_state'], (res) => {
        const state = res.app_state || {};
        state.lastClampType = r.value;
        chrome.storage.local.set({ app_state: state });
      });
    }));

    [configMinValue, configMinVp, configMaxValue, configMaxVp].forEach(el => el.addEventListener("input", () => {
      saveConfigFromInputs();
      updateMinSize();
    }));
    configToggle.addEventListener("change", () => { configSection.style.display = configToggle.checked ? 'flex' : 'none'; saveSettings(); });
    
    resultEl.addEventListener("click", () => {
      navigator.clipboard.writeText(currentClampValue).then(() => {
        const originalText = resultEl.textContent;
        resultEl.textContent = "Copied to Clipboard!";
        resultEl.classList.add("sd-c-well--success");
        setTimeout(() => {
          resultEl.textContent = originalText;
          resultEl.classList.remove("sd-c-well--success");
        }, 1000);
      });
    });
    
    vpPreviewSlider.addEventListener("input", updateSliderPreview);

    init();
  };
})();
