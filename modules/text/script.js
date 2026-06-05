(function() {
  window.initText = function() {
    const textInput = document.getElementById('textInput');
    const charCountEl = document.getElementById('textCharCount');
    const wordCountEl = document.getElementById('textWordCount');
    const copyBtn = document.getElementById('textCopyBtn');
    const downloadBtn = document.getElementById('textDownloadBtn');
    const clearBtn = document.getElementById('textClearBtn');
    const feedbackEl = document.getElementById('textFeedback');
    const conversionBtns = document.querySelectorAll('.text-conv-btn');

    const SMALL_WORDS = ["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet"];

    const CONVERSIONS = {
      sentence: (text) => {
        let res = text.toLowerCase();
        res = res.charAt(0).toUpperCase() + res.slice(1);
        return res.replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
      },
      lower: (text) => text.toLowerCase(),
      upper: (text) => text.toUpperCase(),
      capitalized: (text) => text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      alternating: (text) => {
        let res = "", isUpper = false;
        for (let char of text) {
          if (/[a-zA-Z]/.test(char)) {
            res += isUpper ? char.toUpperCase() : char.toLowerCase();
            isUpper = !isUpper;
          } else res += char;
        }
        return res;
      },
      title: (text) => text.toLowerCase().split(' ').map((w, i) => {
        if (i === 0 || !SMALL_WORDS.includes(w)) return w.charAt(0).toUpperCase() + w.slice(1);
        return w;
      }).join(' '),
      inverse: (text) => text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
      slug: (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
    };

    function updateStats() {
      const text = textInput.value;
      charCountEl.textContent = text.length;
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      wordCountEl.textContent = text.trim().length === 0 ? 0 : words.length;
    }

    function showFeedback(msg, isError = false) {
      feedbackEl.textContent = msg;
      feedbackEl.classList.remove('sd-u-hide', 'sd-c-well--success', 'sd-c-well--error');
      feedbackEl.classList.add(isError ? 'sd-c-well--error' : 'sd-c-well--success');
      setTimeout(() => feedbackEl.classList.add('sd-u-hide'), 2000);
    }

    async function saveState() {
      chrome.storage.local.get(['mod_text'], (res) => {
        const data = res.mod_text || {};
        data.lastText = textInput.value;
        chrome.storage.local.set({ mod_text: data });
      });
    }

    async function loadState() {
      chrome.storage.local.get(['mod_text'], (res) => {
        const data = res.mod_text || {};
        if (data.lastText) {
          textInput.value = data.lastText;
          updateStats();
        }
      });
    }

    textInput.addEventListener('input', () => {
      updateStats();
      saveState();
    });

    conversionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.case;
        if (!textInput.value.trim()) return showFeedback("Enter some text first!", true);
        
        textInput.value = CONVERSIONS[type](textInput.value);
        updateStats();
        saveState();
        showFeedback(`${btn.textContent} applied!`);
      });
    });

    copyBtn.addEventListener('click', () => {
      if (!textInput.value) return showFeedback("Nothing to copy!", true);
      navigator.clipboard.writeText(textInput.value).then(() => {
        showFeedback("Copied to clipboard!");
      });
    });

    downloadBtn.addEventListener('click', () => {
      const text = textInput.value;
      if (!text) return showFeedback("Nothing to download!", true);
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `spark-text-${ts}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showFeedback("Download started!");
    });

    clearBtn.addEventListener('click', () => {
      if (!textInput.value) return;
      textInput.value = "";
      updateStats();
      saveState();
      showFeedback("Text cleared");
    });

    loadState();
  };
})();
