(async function () {
  let currentUrl = "";
  let baseUrl = "";
  let domain = "";
  let currentWindow = null;
  let tabPosition = "after";

  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab;
  }

  async function getCurrentWindow() {
    return await chrome.windows.getCurrent();
  }

  async function loadTabPosition() {
    try {
      const result = await chrome.storage.local.get(["tabPosition"]);
      tabPosition = result.tabPosition || "after";
      return tabPosition;
    } catch (e) {
      tabPosition = "after";
      return "after";
    }
  }

  async function saveTabPosition(position) {
    try {
      tabPosition = position;
      await chrome.storage.local.set({ tabPosition: position });
      return true;
    } catch (e) {
      return false;
    }
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  }

  function generateNoCacheParam() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 50; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function addNoCacheParam(url) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("nocache", generateNoCacheParam());
    return urlObj.toString();
  }

  async function clearCacheOnly(url) {
    try {
      const urlObj = new URL(url);
      await chrome.browsingData.removeCache({
        origins: [urlObj.origin],
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateTabPositionButtons(position) {
    const beforeBtn = document.getElementById("beforeBtn");
    const afterBtn = document.getElementById("afterBtn");

    if (beforeBtn && afterBtn) {
      beforeBtn.classList.remove("active");
      afterBtn.classList.remove("active");

      if (position === "before") {
        beforeBtn.classList.add("active");
      } else {
        afterBtn.classList.add("active");
      }
    }
  }

  async function openInNewTab(url) {
    const tab = await getCurrentTab();
    const position = tabPosition;
    const index = position === "before" ? tab.index : tab.index + 1;

    await chrome.tabs.create({
      url: url,
      index: index,
      windowId: currentWindow.id,
    });
  }

  async function init() {
    const tab = await getCurrentTab();
    currentWindow = await getCurrentWindow();
    currentUrl = tab.url;

    if (!currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
      const container = document.querySelector("#tab-wp .container");
      if (container) {
        container.innerHTML = '<div class="toast" style="position:static; transform:none; animation:none; margin:20px;">Please use on a website</div>';
      }
      return;
    }

    const urlObj = new URL(currentUrl);
    baseUrl = urlObj.origin;
    domain = urlObj.hostname;

    await loadTabPosition();
    updateTabPositionButtons(tabPosition);

    // Before button handler
    document.getElementById("beforeBtn")?.addEventListener("click", async () => {
      if (await saveTabPosition("before")) {
        updateTabPositionButtons("before");
        showToast("← Tabs: Before");
      }
    });

    // After button handler
    document.getElementById("afterBtn")?.addEventListener("click", async () => {
      if (await saveTabPosition("after")) {
        updateTabPositionButtons("after");
        showToast("→ Tabs: After");
      }
    });

    // Link click handlers
    document.querySelectorAll(".link-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const url = item.getAttribute("data-url");
        await openInNewTab(baseUrl + url);
      });
    });

    // Tool Handlers
    document.getElementById("dnsCheckerBtn")?.addEventListener("click", () => openInNewTab(`https://dnschecker.org/#A/${domain}`));
    document.getElementById("viewWebsiteBtn")?.addEventListener("click", () => openInNewTab(baseUrl));
    document.getElementById("websiteIncognitoBtn")?.addEventListener("click", () => {
      chrome.windows.create({ url: baseUrl, incognito: true });
    });
    document.getElementById("pageSpeedBtn")?.addEventListener("click", () => openInNewTab(`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(currentUrl)}`));

    document.getElementById("normalVisitBtn")?.addEventListener("click", async () => {
      const noCacheUrl = addNoCacheParam(currentUrl);
      await clearCacheOnly(currentUrl);
      chrome.tabs.update(tab.id, { url: noCacheUrl });
      window.close();
    });

    document.getElementById("incognitoBtn")?.addEventListener("click", async () => {
      const noCacheUrl = addNoCacheParam(currentUrl);
      await clearCacheOnly(currentUrl);
      chrome.windows.create({ url: noCacheUrl, incognito: true });
    });

    document.getElementById("copyUrlBtn")?.addEventListener("click", async () => {
      const tab = await getCurrentTab();
      const url = tab.url;

      if (url.includes("freepik.com")) {
        // Freepik Extraction Logic
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const meta = document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="og:image"]');
            let imgUrl = meta ? (meta.getAttribute('content') || "") : "";
            if (!imgUrl) {
              const imgs = Array.from(document.images || []);
              if (imgs.length) {
                imgs.sort((a, b) => (b.naturalWidth || 0) - (a.naturalWidth || 0));
                imgUrl = imgs[0].src || "";
              }
            }
            if (imgUrl) return imgUrl.split("?")[0] + "?w=2000";
            return null;
          }
        });

        const hqUrl = results?.[0]?.result;
        if (hqUrl) {
          await navigator.clipboard.writeText(hqUrl);
          const watermarkRemoverUrl = `https://www.watermarkremover.io/?url=${encodeURIComponent(hqUrl)}`;
          chrome.windows.create({ url: watermarkRemoverUrl, incognito: true });
          showToast("✓ Image Link Copied & Opening Tool");
        } else {
          showToast("❌ No Image Found");
        }
      } else if (url.includes("watermarkremover.io")) {
        // WatermarkRemover Download Logic
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async () => {
            const blobImgs = Array.from(document.querySelectorAll('img')).filter(img => img.src && img.src.startsWith('blob:'));
            if (blobImgs.length === 0) {
              alert("Wait for processing to complete...");
              return;
            }
            const blobUrl = blobImgs.length >= 2 ? blobImgs[1].src : blobImgs[0].src;
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `freepik-no-watermark-${Date.now()}.png`;
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
          }
        });
        showToast("✓ Download Started");
      } else {
        // Default Copy URL Logic
        navigator.clipboard.writeText(url);
        showToast("✓ URL Copied");
      }
    });
  }

  init();
})();