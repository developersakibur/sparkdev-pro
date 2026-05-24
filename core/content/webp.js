// --- WebP Compressor Logic ---
async function convertImageToWebP(imageUrl, maxSizeKB, quality) {
  const targetBytes = (maxSizeKB || 150) * 1024;
  const maxQuality  = (quality || 75) / 100;

  const blob        = await fetchImage(imageUrl);
  const bitmap      = await createImageBitmap(blob);
  const canvas      = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext('2d').drawImage(bitmap, 0, 0);

  const resultBlob  = await binarySearch(canvas, targetBytes, maxQuality);
  const dataUrl     = await blobToDataUrl(resultBlob);
  const filename    = buildFilename(imageUrl);

  return { dataUrl, filename };
}

async function fetchImage(url) {
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error('Fetch failed');
  return res.blob();
}

async function binarySearch(canvas, targetBytes, maxQuality) {
  let blob = await canvas.convertToBlob({ type: 'image/webp', quality: maxQuality });
  if (blob.size <= targetBytes) return blob;

  let lo = 0.01, hi = maxQuality, best = blob;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    blob = await canvas.convertToBlob({ type: 'image/webp', quality: mid });
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

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function buildFilename(url) {
  let base = '';
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    for (const [key, value] of searchParams) {
      if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(value)) {
        base = value.split('/').pop().split('.').shift();
        break;
      }
    }
    if (!base) {
      const last = path.split('/').filter(Boolean).pop() || '';
      const dot  = last.lastIndexOf('.');
      base = dot !== -1 ? last.slice(0, dot) : last;
    }
    if (base.toLowerCase() === 'download' || base.length < 2 || base.includes('%')) {
      base = '';
    }
  } catch {}

  const now = new Date();
  const ts  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;

  if (base) {
    const cleanBase = base.substring(0, 50).replace(/[^a-z0-9_-]/gi, '_');
    return `${cleanBase}_${ts}.webp`;
  }
  return `img_${ts}.webp`;
}
