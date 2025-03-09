let activeTabId;
let activeUrl;
let startTime;
let timeSpent = {};

// Load saved data when extension starts
chrome.storage.local.get(['timeSpent'], (data) => {
    if (data.timeSpent) {
        timeSpent = data.timeSpent;
    }
});

// Function to update active tab information
async function updateActiveTab(tabId) {
    try {
        if (activeUrl && startTime) {
            const elapsed = Date.now() - startTime;
            if (!timeSpent[activeUrl]) {
                timeSpent[activeUrl] = 0;
            }
            timeSpent[activeUrl] += elapsed;
            await chrome.storage.local.set({ timeSpent });
        }

        const tab = await chrome.tabs.get(tabId);
        if (tab.url && tab.url.startsWith('http')) {
            activeTabId = tab.id;
            activeUrl = new URL(tab.url).hostname;
            startTime = Date.now();
        } else {
            activeTabId = null;
            activeUrl = null;
            startTime = null;
        }
    } catch (error) {
        console.error('Error updating active tab:', error);
    }
}

// Listen for tab activation events
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await updateActiveTab(activeInfo.tabId);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.status === 'complete') {
        await updateActiveTab(tabId);
    }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        if (activeUrl && startTime) {
            const elapsed = Date.now() - startTime;
            timeSpent[activeUrl] = (timeSpent[activeUrl] || 0) + elapsed;
            await chrome.storage.local.set({ timeSpent });
            startTime = null;
        }
    } else {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            await updateActiveTab(tabs[0].id);
        }
    }
});

// Update time periodically
setInterval(async () => {
    if (activeUrl && startTime) {
        const elapsed = Date.now() - startTime;
        timeSpent[activeUrl] = (timeSpent[activeUrl] || 0) + elapsed;
        startTime = Date.now();
        await chrome.storage.local.set({ timeSpent });
    }
}, 60000);

// Save data when extension is suspended
chrome.runtime.onSuspend.addListener(async () => {
    if (activeUrl && startTime) {
        const elapsed = Date.now() - startTime;
        timeSpent[activeUrl] = (timeSpent[activeUrl] || 0) + elapsed;
        await chrome.storage.local.set({ timeSpent });
    }
});
