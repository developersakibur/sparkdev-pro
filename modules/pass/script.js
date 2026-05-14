(function() {
  window.initPass = function() {
    const passDisplay = document.getElementById("passDisplay"), regenBtn = document.getElementById("regenPassBtn");
    const passLength = document.getElementById("passLength"), upperToggle = document.getElementById("passUpper");
    const lowerToggle = document.getElementById("passLower"), numberToggle = document.getElementById("passNumbers"), symbolToggle = document.getElementById("passSymbols");

    const CHARS = { u: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", l: "abcdefghijklmnopqrstuvwxyz", n: "0123456789", s: "!@#$%^&*()_+" };

    function gen() {
      let charset = "";
      if (upperToggle.checked) charset += CHARS.u;
      if (lowerToggle.checked) charset += CHARS.l;
      if (numberToggle.checked) charset += CHARS.n;
      if (symbolToggle.checked) charset += CHARS.s;
      if (!charset) { passDisplay.textContent = "Pick an option"; return; }

      let pass = "";
      const len = parseInt(passLength.value) || 16;
      for (let i = 0; i < len; i++) pass += charset.charAt(Math.floor(Math.random() * charset.length));
      passDisplay.textContent = pass;
    }

    regenBtn.addEventListener("click", gen);
    passDisplay.addEventListener("click", () => {
      navigator.clipboard.writeText(passDisplay.textContent).then(() => {
        passDisplay.classList.add("sd-c-well--success");
        setTimeout(() => passDisplay.classList.remove("sd-c-well--success"), 1000);
      });
    });

    [upperToggle, lowerToggle, numberToggle, symbolToggle, passLength].forEach(el => el.addEventListener("change", gen));
    gen();
  };
})();
