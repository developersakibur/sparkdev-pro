(function() {
  // DOM Elements
  const passDisplay = document.getElementById("passDisplay");
  const regenBtn = document.getElementById("regenPassBtn");
  const passLength = document.getElementById("passLength");
  const upperToggle = document.getElementById("passUpper");
  const lowerToggle = document.getElementById("passLower");
  const numberToggle = document.getElementById("passNumbers");
  const symbolToggle = document.getElementById("passSymbols");

  const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
  };

  function generatePassword() {
    let charset = "";
    if (upperToggle.checked) charset += CHAR_SETS.upper;
    if (lowerToggle.checked) charset += CHAR_SETS.lower;
    if (numberToggle.checked) charset += CHAR_SETS.numbers;
    if (symbolToggle.checked) charset += CHAR_SETS.symbols;

    if (charset === "") {
      passDisplay.innerHTML = '<span style="color: #f87171; font-size: 13px;">Pick an option</span>';
      return;
    }

    let length = parseInt(passLength.value) || 16;
    if (length < 8) length = 8;
    if (length > 64) length = 64;

    let password = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset.charAt(array[i] % charset.length);
    }

    passDisplay.textContent = password;
  }

  function copyToClipboard() {
    const password = passDisplay.textContent;
    if (!password || password === "Click Regenerate" || password.includes("Pick an option")) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(password)
        .then(() => showCopiedState())
        .catch(() => fallbackCopy(password));
    } else {
      fallbackCopy(password);
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
    passDisplay.classList.add("copied");
    setTimeout(() => {
      passDisplay.classList.remove("copied");
    }, 1000);
  }

  // Event Listeners
  regenBtn.addEventListener("click", generatePassword);
  passDisplay.addEventListener("click", copyToClipboard);
  
  // Update on input/change
  [upperToggle, lowerToggle, numberToggle, symbolToggle, passLength].forEach(el => {
    el.addEventListener("input", generatePassword);
    el.addEventListener("change", generatePassword);
  });

  // Handle number input wheel
    passLength.addEventListener("wheel", (e) => {
    if (document.activeElement === passLength) {
      e.preventDefault();
      const val = parseInt(passLength.value) || 16;
      const newVal = e.deltaY < 0 ? Math.min(64, val + 1) : Math.max(8, val - 1);
      passLength.value = newVal;
      generatePassword();
    }
  });

  // Initial generation
  generatePassword();
})();
