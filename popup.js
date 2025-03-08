document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('timeSpent', ({ timeSpent }) => {
        const container = document.getElementById('analytics');
        container.innerHTML = ''; // Clear "Loading..." text
        for (const [url, ms] of Object.entries(timeSpent || {})) {
            const div = document.createElement('div');
            div.className = 'website-entry';
            div.textContent = `${url}: ${(ms / 1000 / 60).toFixed(2)} minutes`;
            container.appendChild(div);
        }
    });
});
