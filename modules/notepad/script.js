(function() {
  window.initNotepad = function() {
    const editor = document.getElementById('npEditor');
    const status = document.getElementById('npStatus');
    const wordCount = document.getElementById('npWordCount');
    const colorPicker = document.getElementById('npColorPicker');
    const clearBtn = document.getElementById('npClearBtn');
    const downloadBtn = document.getElementById('npDownloadBtn');
    
    let saveTimeout = null;

    async function init() {
      // Load saved note
      chrome.storage.local.get(['mod_notepad'], (res) => {
        if (res.mod_notepad && res.mod_notepad.content) {
          editor.innerHTML = res.mod_notepad.content;
          updateStats();
        }
      });

      attachToolbarEvents();
      attachEditorEvents();
    }

    function attachToolbarEvents() {
      document.querySelectorAll('.np-toolbar__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cmd = btn.dataset.cmd;
          let val = null;

          if (cmd === 'createLink') {
            val = prompt('Enter URL:');
            if (!val) return;
          }

          document.execCommand(cmd, false, val);
          editor.focus();
          saveNote();
        });
      });

      colorPicker.addEventListener('input', () => {
        document.execCommand('foreColor', false, colorPicker.value);
        saveNote();
      });

      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your note?')) {
          editor.innerHTML = '';
          saveNote();
        }
      });

      downloadBtn.addEventListener('click', () => {
        const content = editor.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spark-note-${new Date().toLocaleDateString().replace(/\//g, '-')}.html`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    function attachEditorEvents() {
      editor.addEventListener('input', () => {
        status.textContent = 'Saving...';
        updateStats();
        saveNote();
      });

      // Handle Tab key
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
      });
      
      // Handle Paste as plain text or handle images later
      editor.addEventListener('paste', (e) => {
        // Future: Handle image pasting here
      });
    }

    function updateStats() {
      const text = editor.innerText.trim();
      const words = text ? text.split(/\s+/).length : 0;
      wordCount.textContent = `${words} words`;
    }

    function saveNote() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const content = editor.innerHTML;
        chrome.storage.local.set({ 
          mod_notepad: { content: content } 
        }, () => {
          status.textContent = 'All changes saved';
        });
      }, 500);
    }

    init();
  };
})();
