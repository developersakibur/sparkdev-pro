(function() {
  const BRAND_NAME = "developersakibur";

  // Default configurations
  const DEFAULT_CONFIGS = {
    text: { minValue: 14, minVp: 16, maxValue: 30, maxVp: 48 },
    padding: { minValue: 15, minVp: 20, maxValue: 55, maxVp: 100 }
  };

  const DEFAULT_VIEWPORT = {
    minWidth: 375,
    maxWidth: 1440
  };

  // DOM Elements
  const minVWEl = document.getElementById("minWidth");
  const maxVWEl = document.getElementById("maxWidth");
  const minSizeEl = document.getElementById("minSize");
  const maxSizeEl = document.getElementById("maxSizeClamp"); // Updated ID
  const resultEl = document.getElementById("resultClamp"); // Updated ID
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

  // Initialize
  async function init() {
    await loadSettings();
    applyConfigsToRadios();
    applyViewportValues();
    const selectedRadio = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
    if (selectedRadio) loadConfigInputs(selectedRadio.value);
    updateMinSize();
  }

  // Load all settings from chrome.storage.sync
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['propertyConfigs', 'viewportSettings', 'configPanelOpen'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          resolve();
          return;
        }
        
        if (result.propertyConfigs) {
          configs = result.propertyConfigs;
        }
        
        if (result.viewportSettings) {
          viewport = result.viewportSettings;
        }
        
        if (result.configPanelOpen) {
          configToggle.checked = true;
          configSection.style.display = 'block';
        }
        
        resolve();
      });
    });
  }

  // Save settings to chrome.storage.sync (debounced)
  function saveSettings() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      chrome.storage.sync.set({ 
        propertyConfigs: configs,
        viewportSettings: viewport,
        configPanelOpen: configToggle.checked
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Save error:', chrome.runtime.lastError);
        }
      });
    }, 300);
  }

  // Apply viewport values to inputs
  function applyViewportValues() {
    minVWEl.value = viewport.minWidth;
    maxVWEl.value = viewport.maxWidth;
  }

  // Apply configs to radio data attributes
  function applyConfigsToRadios() {
    radioButtons.forEach((radio) => {
      const type = radio.value;
      const config = configs[type];
      if (config) {
        radio.dataset.minVp = config.minVp;
        radio.dataset.maxVp = config.maxVp;
        radio.dataset.minValue = config.minValue;
        radio.dataset.maxValue = config.maxValue;
        radio.dataset.smallSubtract = config.minValue - config.minVp;
      }
    });
  }

  // Load config inputs for selected radio
  function loadConfigInputs(type) {
    const config = configs[type];
    if (config) {
      configMinValue.value = config.minValue;
      configMinVp.value = config.minVp;
      configMaxValue.value = config.maxValue;
      configMaxVp.value = config.maxVp;
    }
  }

  // Save config from inputs (with auto-reset on empty)
  function saveConfigFromInputs() {
    const selectedRadio = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
    const type = selectedRadio.value;
    
    const minValueInput = configMinValue.value.trim();
    const minVpInput = configMinVp.value.trim();
    const maxValueInput = configMaxValue.value.trim();
    const maxVpInput = configMaxVp.value.trim();

    // Check if all inputs are empty - auto reset to defaults
    if (!minValueInput && !minVpInput && !maxValueInput && !maxVpInput) {
      configs[type] = { ...DEFAULT_CONFIGS[type] };
      applyConfigsToRadios();
      loadConfigInputs(type);
      saveSettings();
      updateMinSize();
      return;
    }

    const minValue = parseInt(minValueInput) || 1;
    const minVp = parseInt(minVpInput) || 1;
    const maxValue = parseInt(maxValueInput) || 1;
    const maxVp = parseInt(maxVpInput) || 1;

    configs[type] = { minVp, maxVp, minValue, maxValue };
    
    // Update radio data attributes
    selectedRadio.dataset.minVp = minVp;
    selectedRadio.dataset.maxVp = maxVp;
    selectedRadio.dataset.minValue = minValue;
    selectedRadio.dataset.maxValue = maxValue;
    selectedRadio.dataset.smallSubtract = minValue - minVp;

    saveSettings();
    updateMinSize();
  }

  // Save viewport settings
  function saveViewportSettings() {
    const minInput = minVWEl.value.trim();
    const maxInput = maxVWEl.value.trim();

    // Check if both are empty - reset to defaults
    if (!minInput && !maxInput) {
      viewport = { ...DEFAULT_VIEWPORT };
      applyViewportValues();
      saveSettings();
      updateMinSize();
      return;
    }

    viewport.minWidth = parseInt(minInput) || DEFAULT_VIEWPORT.minWidth;
    viewport.maxWidth = parseInt(maxInput) || DEFAULT_VIEWPORT.maxWidth;

    saveSettings();
    updateMinSize();
  }

  // Get mobile size calculation
  function getMobileSize(desktopPx, propertyType) {
    const isNegative = desktopPx < 0;
    const absPx = Math.abs(desktopPx);
    
    const selectedRadio = document.querySelector(`#tab-clamp input[name="propertyType"][value="${propertyType}"]`);
    
    if (!selectedRadio || !selectedRadio.dataset.minVp) {
      const result = Math.round(absPx * 0.75);
      return isNegative ? -result : result;
    }
    
    const minVP = parseInt(selectedRadio.dataset.minVp);
    const maxVP = parseInt(selectedRadio.dataset.maxVp);
    const minValue = parseInt(selectedRadio.dataset.minValue);
    const maxValue = parseInt(selectedRadio.dataset.maxValue);
    const smallSubtract = Math.abs(minVP - minValue);
    
    let result;
    if (absPx < minVP) {
      result = absPx - smallSubtract;
    } else {
      const ratio = (absPx - minVP) / (maxVP - minVP);
      result = minValue + ratio * (maxValue - minValue);
    }
    
    const finalResult = Math.round(result);
    return isNegative ? -finalResult : finalResult;
  }

  function updateMinSize() {
    const maxPxValue = maxSizeEl.value.trim();
    const selectedPropertyEl = document.querySelector('#tab-clamp input[name="propertyType"]:checked');
    if (!selectedPropertyEl) return;
    const selectedProperty = selectedPropertyEl.value;

    if (maxPxValue !== "") {
      const maxPx = parseFloat(maxPxValue);
      const calculatedMin = getMobileSize(maxPx, selectedProperty);
      minSizeEl.value = calculatedMin;
      updateClamp();
    }
  }

  function updateClamp() {
    const minVWValue = minVWEl.value.trim();
    const maxVWValue = maxVWEl.value.trim();
    const minPxValue = minSizeEl.value.trim();
    const maxPxValue = maxSizeEl.value.trim();

    resultEl.classList.remove("copied");

    if (minVWValue === "" || maxVWValue === "" || minPxValue === "" || maxPxValue === "") {
      resultEl.innerHTML = '<span class="error-message">Enter values</span>';
      currentClampValue = "";
      return;
    }

    const minVW = parseFloat(minVWValue);
    const maxVW = parseFloat(maxVWValue);
    const minPx = parseFloat(minPxValue);
    const maxPx = parseFloat(maxPxValue);

    if (maxVW === minVW) {
      resultEl.innerHTML = '<span class="error-message">Viewport widths must differ</span>';
      currentClampValue = "";
      return;
    }

    const bothNegative = minPx < 0 && maxPx < 0;

    if (bothNegative) {
      const absMinPx = Math.abs(minPx);
      const absMaxPx = Math.abs(maxPx);
      const slope = (absMaxPx - absMinPx) / (maxVW - minVW);
      const vwVal = (slope * 100).toFixed(2);
      const interceptPx = absMinPx - slope * minVW;
      const actualMin = Math.min(absMinPx, absMaxPx);
      const actualMax = Math.max(absMinPx, absMaxPx);
      const innerValuePositive = `${actualMin}px, ${interceptPx.toFixed(2)}px + ${vwVal}vw, ${actualMax}px`;
      currentClampValue = `calc(-1 * clamp(${innerValuePositive}))`;
      resultEl.textContent = `-1 * (${innerValuePositive})`;
    } else {
      const slope = (maxPx - minPx) / (maxVW - minVW);
      const vwVal = (slope * 100).toFixed(2);
      const interceptPx = minPx - slope * minVW;
      const actualMin = Math.min(minPx, maxPx);
      const actualMax = Math.max(minPx, maxPx);
      const innerValue = `${actualMin}px, ${interceptPx.toFixed(2)}px + ${vwVal}vw, ${actualMax}px`;
      currentClampValue = `clamp(${innerValue})`;
      resultEl.textContent = innerValue;
    }
    updateSliderPreview();
  }

  function copyClamp() {
    if (!currentClampValue) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentClampValue)
        .then(() => showCopiedState())
        .catch(() => fallbackCopy(currentClampValue));
    } else {
      fallbackCopy(currentClampValue);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopiedState();
    } catch (err) {}
    document.body.removeChild(textArea);
  }

  function showCopiedState() {
    resultEl.classList.add("copied");
    setTimeout(() => {
      resultEl.classList.remove("copied");
    }, 1500);
  }

  function toggleConfigPanel() {
    if (configToggle.checked) {
      configSection.style.display = 'block';
    } else {
      configSection.style.display = 'none';
    }
    saveSettings();
  }

  // Event Listeners
  maxSizeEl.addEventListener("input", updateMinSize);
  minSizeEl.addEventListener("input", updateClamp);
  minVWEl.addEventListener("input", saveViewportSettings);
  maxVWEl.addEventListener("input", saveViewportSettings);

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      loadConfigInputs(radio.value);
      updateMinSize();
    });
  });

  configMinValue.addEventListener("input", saveConfigFromInputs);
  configMinVp.addEventListener("input", saveConfigFromInputs);
  configMaxValue.addEventListener("input", saveConfigFromInputs);
  configMaxVp.addEventListener("input", saveConfigFromInputs);
  configToggle.addEventListener("change", toggleConfigPanel);
  resultEl.addEventListener("click", copyClamp);

  function handleWheel(e, inputEl) {
    if (document.activeElement === inputEl) {
      e.preventDefault();
      const currentValue = parseInt(inputEl.value) || 0;
      const min = parseInt(inputEl.min);
      const max = parseInt(inputEl.max);
      let newValue = e.deltaY < 0 ? currentValue + 1 : currentValue - 1;
      if (!isNaN(min)) newValue = Math.max(min, newValue);
      if (!isNaN(max)) newValue = Math.min(max, newValue);
      inputEl.value = newValue;
      inputEl.dispatchEvent(new Event('input'));
    }
  }

  function calcClampAtVp(vw) {
    const minPx = parseFloat(minSizeEl.value);
    const maxPx = parseFloat(maxSizeEl.value);
    const minVW = parseFloat(minVWEl.value) || DEFAULT_VIEWPORT.minWidth;
    const maxVW = parseFloat(maxVWEl.value) || DEFAULT_VIEWPORT.maxWidth;
    if (isNaN(minPx) || isNaN(maxPx)) return "—";
    const slope = (maxPx - minPx) / (maxVW - minVW);
    const intercept = minPx - slope * minVW;
    const preferred = intercept + slope * vw;
    const clampMin = Math.min(minPx, maxPx);
    const clampMax = Math.max(minPx, maxPx);
    return Math.min(Math.max(preferred, clampMin), clampMax).toFixed(2);
  }

  function updateSliderPreview() {
    const minVW = parseFloat(minVWEl.value) || DEFAULT_VIEWPORT.minWidth;
    const maxVW = parseFloat(maxVWEl.value) || DEFAULT_VIEWPORT.maxWidth;
    const vw = parseFloat(vpPreviewSlider.value);
    vpPreviewSlider.min = minVW;
    vpPreviewSlider.max = maxVW;
    const percent = (vw - minVW) / (maxVW - minVW) * 100;
    sliderTrackFill.style.width = Math.max(0, Math.min(100, percent)) + "%";
    sliderCurrentVp.textContent = vw;
    sliderCurrentClamp.textContent = calcClampAtVp(vw);
  }

  minSizeEl.addEventListener("wheel", (e) => handleWheel(e, minSizeEl));
  maxSizeEl.addEventListener("wheel", (e) => handleWheel(e, maxSizeEl));
  configMinValue.addEventListener("wheel", (e) => handleWheel(e, configMinValue));
  configMinVp.addEventListener("wheel", (e) => handleWheel(e, configMinVp));
  configMaxValue.addEventListener("wheel", (e) => handleWheel(e, configMaxValue));
  configMaxVp.addEventListener("wheel", (e) => handleWheel(e, configMaxVp));
  minVWEl.addEventListener("wheel", (e) => handleWheel(e, minVWEl));
  maxVWEl.addEventListener("wheel", (e) => handleWheel(e, maxVWEl));
  vpPreviewSlider.addEventListener("input", updateSliderPreview);

  init();
})();
