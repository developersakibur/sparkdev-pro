(function() {
  window.initPass = function() {
    const passDisplay = document.getElementById("passDisplay"), regenBtn = document.getElementById("regenPassBtn");
    const passLength = document.getElementById("passLength"), upperToggle = document.getElementById("passUpper");
    const lowerToggle = document.getElementById("passLower"), numberToggle = document.getElementById("passNumbers"), symbolToggle = document.getElementById("passSymbols");

    const CHARS = { u: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", l: "abcdefghijklmnopqrstuvwxyz", n: "0123456789", s: "!@#$%^&*()_+" };

    function loadSettings() {
      chrome.storage.local.get(['mod_pass'], (res) => {
        const s = res.mod_pass || {};
        if (s.length) passLength.value = s.length;
        if (s.upper !== undefined) upperToggle.checked = s.upper;
        if (s.lower !== undefined) lowerToggle.checked = s.lower;
        if (s.numbers !== undefined) numberToggle.checked = s.numbers;
        if (s.symbols !== undefined) symbolToggle.checked = s.symbols;
        gen();
      });
    }

    function saveSettings() {
      const settings = {
        length: passLength.value,
        upper: upperToggle.checked,
        lower: lowerToggle.checked,
        numbers: numberToggle.checked,
        symbols: symbolToggle.checked
      };
      chrome.storage.local.set({ mod_pass: settings });
    }

    function gen() {
      let charset = "";
      if (upperToggle.checked) charset += CHARS.u;
      if (lowerToggle.checked) charset += CHARS.l;
      if (numberToggle.checked) charset += CHARS.n;
      if (symbolToggle.checked) charset += CHARS.s;
      
      if (!charset) { 
        passDisplay.textContent = "Pick an option"; 
        return; 
      }

      let pass = "";
      const len = parseInt(passLength.value) || 16;
      for (let i = 0; i < len; i++) pass += charset.charAt(Math.floor(Math.random() * charset.length));
      passDisplay.textContent = pass;
    }

    regenBtn.addEventListener("click", gen);
    passDisplay.addEventListener("click", () => {
      if (passDisplay.textContent === "Pick an option") return;
      navigator.clipboard.writeText(passDisplay.textContent).then(() => {
        passDisplay.classList.add("sd-c-well--success");
        setTimeout(() => passDisplay.classList.remove("sd-c-well--success"), 1000);
      });
    });

    [upperToggle, lowerToggle, numberToggle, symbolToggle, passLength].forEach(el => {
      el.addEventListener("input", () => {
        gen();
        saveSettings();
      });
    });

    passLength.addEventListener("wheel", (e) => {
      e.preventDefault();
      let val = parseInt(passLength.value);
      if (isNaN(val)) val = 16;
      else val = e.deltaY < 0 ? val + 1 : val - 1;
      
      // Clamp between min and max
      val = Math.max(8, Math.min(128, val));
      
      passLength.value = val;
      gen();
      saveSettings();
    }, { passive: false });

    loadSettings();
  };
})();
