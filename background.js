let activeTabId;
let activeUrl;
let startTime;
const timeSpent = {};

// Function to update active tab information
async function updateActiveTab(tabId) {
  if (activeUrl && startTime) {
    const elapsed = Date.now() - startTime;
    timeSpent[activeUrl] = (timeSpent[activeUrl] || 0) + elapsed;
  }

  const tab = await chrome.tabs.get(tabId);
  // Check if tab.url is valid
  if (tab.url && tab.url.startsWith('http')) { // Only process valid URLs
    activeTabId = tab.id;
    activeUrl = new URL(tab.url).hostname;
    startTime = Date.now();
  } else {
    activeTabId = null;
    activeUrl = null;
    startTime = null;
  }
}

// Listen for tab activation events
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateActiveTab(activeInfo.tabId);
});

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    await updateActiveTab(tabId);
  }
});

// Save data when extension is suspended/unloaded
chrome.runtime.onSuspend.addListener(() => {
  if (activeUrl && startTime) {
    const elapsed = Date.now() - startTime;
    timeSpent[activeUrl] = (timeSpent[activeUrl] || 0) + elapsed;
    chrome.storage.local.set({ timeSpent });
  }
});
