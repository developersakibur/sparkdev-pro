(function() {
  window.initWebP = function() {
    let files = [];
    const drop = document.getElementById('drop'), fileIn = document.getElementById('fileIn'), fileList = document.getElementById('fileList');
    const qualitySlider = document.getElementById('qualitySlider'), qVal = document.getElementById('qVal');
    const maxSizeInp = document.getElementById('maxSizeWebP'), zipToggle = document.getElementById('zipToggle');
    const convertBtn = document.getElementById('convertBtn'), summary = document.getElementById('summary');

    chrome.storage.local.get(['mod_webp'], r => {
      const settings = r.mod_webp || {};
      if (settings.maxSizeKB) maxSizeInp.value = settings.maxSizeKB;
      if (settings.quality) { qualitySlider.value = settings.quality; qVal.textContent = settings.quality + '%'; }
      zipToggle.checked = settings.zipEnabled !== undefined ? settings.zipEnabled : true;
    });

    const resetFiles = () => {
      files.forEach(f => {
        f.status = 'pending';
        f.blob = null;
        f.finalSize = 0;
      });
      render();
    };

    const save = () => {
      chrome.storage.local.get(['mod_webp'], (res) => {
        const settings = res.mod_webp || {};
        settings.maxSizeKB = maxSizeInp.value;
        settings.quality = qualitySlider.value;
        settings.zipEnabled = zipToggle.checked;
        chrome.storage.local.set({ mod_webp: settings });
      });
    };

    qualitySlider.addEventListener('input', () => { 
      qVal.textContent = qualitySlider.value + '%'; 
      save();
      resetFiles();
    });

    [maxSizeInp, zipToggle].forEach(el => el.addEventListener('change', () => {
      save();
      if (el.id !== 'zipToggle') resetFiles();
    }));

    fileIn.addEventListener('change', e => { addFiles(e.target.files); fileIn.value = ''; });
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); });

    function addFiles(raw) {
      Array.from(raw).filter(f => f.type.startsWith('image/')).forEach(f => {
        if (!files.find(x => x.file.name === f.name)) files.push({ file: f, status: 'pending', blob: null, finalSize: 0 });
      });
      render();
    }

    function formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function updateSummary() {
      if (!files.length) {
        summary.classList.add('sd-u-hide');
        return;
      }
      summary.classList.remove('sd-u-hide');
      
      const count = files.length;
      const origSize = files.reduce((acc, f) => acc + f.file.size, 0);
      const finalSize = files.reduce((acc, f) => acc + (f.finalSize || 0), 0);
      const saved = origSize > 0 && finalSize > 0 ? Math.max(0, Math.round((1 - finalSize / origSize) * 100)) : 0;

      document.getElementById('sCount').textContent = count;
      document.getElementById('sOrig').textContent = formatSize(origSize);
      document.getElementById('sFinal').textContent = finalSize > 0 ? formatSize(finalSize) : '--';
      document.getElementById('sSaved').textContent = saved + '%';
    }

    function truncateFilename(name, limit = 30) {
      if (name.length <= limit) return name;
      const chars = Math.floor((limit - 3) / 2);
      return name.slice(0, chars) + '...' + name.slice(-chars);
    }

    function render() {
      if (!files.length) {
        fileList.innerHTML = '<div class="sd-u-text-center sd-u-color-dim" style="font-size: 11px; padding: 15px; border: 1px dashed var(--sd-color-border); border-radius: 8px;">No images selected yet</div>';
        updateSummary();
        convertBtn.disabled = true;
        return;
      }
      fileList.innerHTML = '';
      files.forEach((f, i) => {
        const el = document.createElement('div');
        el.className = 'webp-file-item';

        el.innerHTML = `
          <img id="th${i}" src=""/>
          <div class="webp-file-info">
            <div class="webp-file-name" title="${f.file.name}">
              ${truncateFilename(f.file.name)}
            </div>
            <div class="webp-file-size" id="st${i}">
              ${f.status === 'done' ? '✓ ' + formatSize(f.finalSize) : formatSize(f.file.size)}
            </div>
          </div>
          <button class="webp-remove-btn" data-i="${i}" title="Remove">×</button>
        `;
        fileList.appendChild(el);
        const r = new FileReader(); r.onload = e => document.getElementById(`th${i}`).src = e.target.result; r.readAsDataURL(f.file);
      });
      fileList.querySelectorAll('button').forEach(b => b.addEventListener('click', e => { 
        files.splice(+e.target.dataset.i, 1); 
        render(); 
      }));
      updateSummary();
      convertBtn.disabled = false;
    }

    const toBlobPromise = (canvas, quality) => new Promise(res => canvas.toBlob(res, 'image/webp', quality));

    async function binarySearch(canvas, targetBytes, maxQuality) {
      let blob = await toBlobPromise(canvas, maxQuality);
      if (blob.size <= targetBytes) return blob;

      let lo = 0.01, hi = maxQuality, best = blob;
      for (let i = 0; i < 15; i++) {
        const mid = (lo + hi) / 2;
        blob = await toBlobPromise(canvas, mid);
        if (blob.size <= targetBytes) {
          best = blob;
          lo = mid;
        } else {
          hi = mid;
        }
        if (hi - lo < 0.01) break;
      }
      return best;
    }

    convertBtn.addEventListener('click', async () => {
      convertBtn.disabled = true;
      convertBtn.textContent = '⏳ Processing...';
      
      const targetBytes = (parseInt(maxSizeInp.value) || 100) * 1024;
      const maxQuality = (parseInt(qualitySlider.value) || 75) / 100;

      for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'done') continue;
        files[i].status = 'working';
        document.getElementById(`st${i}`).textContent = 'Converting...';

        try {
          const canvas = document.createElement('canvas');
          const img = await new Promise((res, rej) => { 
            const im = new Image(); 
            im.onload = () => res(im); 
            im.onerror = rej;
            im.src = URL.createObjectURL(files[i].file); 
          });
          
          canvas.width = img.width; 
          canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          
          files[i].blob = await binarySearch(canvas, targetBytes, maxQuality);
          files[i].finalSize = files[i].blob.size;
          files[i].status = 'done';
          
          document.getElementById(`st${i}`).textContent = '✓ ' + formatSize(files[i].finalSize);
          updateSummary();
        } catch (err) {
          console.error('Failed to convert', files[i].file.name, err);
          files[i].status = 'error';
          document.getElementById(`st${i}`).textContent = 'Error';
        }
      }

      const doneFiles = files.filter(f => f.status === 'done');
      if (doneFiles.length > 0) {
        if (zipToggle.checked && doneFiles.length > 1 && window.JSZip) {
          const zip = new JSZip();
          doneFiles.forEach(f => {
            const name = f.file.name.split('.')[0] + '.webp';
            zip.file(name, f.blob);
          });
          const content = await zip.generateAsync({ type: 'blob' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = `sparkdev_webp_${Date.now()}.zip`;
          a.click();
        } else {
          doneFiles.forEach(f => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(f.blob);
            a.download = f.file.name.split('.')[0] + '.webp';
            a.click();
          });
        }
      }

      convertBtn.textContent = 'Convert & Download'; 
      convertBtn.disabled = false;
    });
  };
})();
