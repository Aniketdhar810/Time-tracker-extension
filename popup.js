document.addEventListener('DOMContentLoaded', () => {
    try {
        chrome.storage.local.get(['timeSpent', 'siteNotes'], ({ timeSpent, siteNotes = {} }) => {
            const container = document.getElementById('analytics');
            
            if (chrome.runtime.lastError) {
                container.innerHTML = `<div class="website-entry error">Error: ${chrome.runtime.lastError.message}</div>`;
                return;
            }

            container.innerHTML = '';

            if (!timeSpent || Object.keys(timeSpent).length === 0) {
                container.innerHTML = '<div class="website-entry">No data recorded yet</div>';
                return;
            }

            // Sort websites by time spent
            const sortedEntries = Object.entries(timeSpent)
                .sort(([, a], [, b]) => b - a);

            for (const [url, ms] of sortedEntries) {
                try {
                    const div = document.createElement('div');
                    div.className = 'website-entry';
                    
                    const siteInfo = document.createElement('div');
                    siteInfo.className = 'site-info';

                    let timeString;
                    if (ms < 60000) {
                        timeString = `${Math.round(ms / 1000)}s`;
                    } else if (ms < 3600000) {
                        timeString = `${Math.round(ms / 60000)}m`;
                    } else {
                        const hours = Math.floor(ms / 3600000);
                        const minutes = Math.round((ms % 3600000) / 60000);
                        timeString = `${hours}h ${minutes}m`;
                    }
                    
                    siteInfo.innerHTML = `
                        <span>${url}: ${timeString}</span>
                        <span class="add-note-btn" title="Add/Edit Note">📝</span>
                    `;
                    div.appendChild(siteInfo);

                    // Create note area
                    const noteArea = document.createElement('div');
                    noteArea.className = 'note-area';
                    noteArea.innerHTML = `
                        <textarea class="note-textarea" placeholder="Enter your notes here...">${siteNotes[url] || ''}</textarea>
                        <div class="button-group">
                            <button class="save-note-btn">Save Note</button>
                            <button class="export-btn">Export Note</button>
                        </div>
                    `;
                    div.appendChild(noteArea);

                    // Add event listeners
                    const noteBtn = siteInfo.querySelector('.add-note-btn');
                    noteBtn.addEventListener('click', () => {
                        noteArea.style.display = noteArea.style.display === 'none' ? 'block' : 'none';
                    });

                    const saveNoteBtn = noteArea.querySelector('.save-note-btn');
                    saveNoteBtn.addEventListener('click', () => {
                        const note = noteArea.querySelector('.note-textarea').value;
                        chrome.storage.local.get(['siteNotes'], ({ siteNotes = {} }) => {
                            siteNotes[url] = note;
                            chrome.storage.local.set({ siteNotes }, () => {
                                alert('Note saved!');
                            });
                        });
                    });

                    const exportNoteBtn = noteArea.querySelector('.export-btn');
                    exportNoteBtn.addEventListener('click', () => {
                        const note = noteArea.querySelector('.note-textarea').value;
                        if (!note) {
                            alert('No note to export!');
                            return;
                        }
                        exportNote(url, note);
                    });

                    container.appendChild(div);
                } catch (error) {
                    console.error(`Error processing entry for ${url}:`, error);
                }
            }

            // Add button handlers
            document.getElementById('exportAll').addEventListener('click', () => {
                chrome.storage.local.get(['siteNotes'], ({ siteNotes = {} }) => {
                    if (Object.keys(siteNotes).length === 0) {
                        alert('No notes to export!');
                        return;
                    }
                    exportAllNotes(siteNotes);
                });
            });

            document.getElementById('showAnalytics').addEventListener('click', showAnalyticsModal);
            document.querySelector('.close-btn').addEventListener('click', hideAnalyticsModal);

            // Add tab button handlers
            document.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab-button').forEach(btn => 
                        btn.classList.remove('active'));
                    e.target.classList.add('active');
                    updateChart(e.target.dataset.view);
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('analytics');
        container.innerHTML = `<div class="website-entry error">Error loading data: ${error.message}</div>`;
    }
});

function exportNote(url, note) {
    const blob = new Blob([`Notes for ${url}:\n\n${note}`], { type: 'text/plain' });
    const url_object = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_object;
    a.download = `notes_${url.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url_object);
}

function exportAllNotes(siteNotes) {
    let content = '=== Website Notes ===\n\n';
    for (const [url, note] of Object.entries(siteNotes)) {
        if (note) {
            content += `### ${url} ###\n${note}\n\n`;
        }
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_website_notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'block';
    updateChart('daily');
}

function hideAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'none';
}

function updateChart(viewType) {
    chrome.storage.local.get(['timeSpent'], ({ timeSpent }) => {
        if (!timeSpent) return;

        const canvas = document.getElementById('analyticsChart');
        const ctx = canvas.getContext('2d');

        // Clear previous chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (viewType === 'total') {
            drawTotalChart(ctx, timeSpent);
        } else {
            drawBarChart(ctx, timeSpent, viewType === 'daily' ? 7 : 28);
        }
    });
}

function drawBarChart(ctx, timeSpent, days) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;

    // Calculate total time per day
    const dailyTotals = {};
    const now = new Date();
    
    // Initialize days
    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        dailyTotals[dateStr] = 0;
    }

    // Sum up time spent
    Object.values(timeSpent).forEach(ms => {
        const date = new Date().toLocaleDateString();
        dailyTotals[date] = (dailyTotals[date] || 0) + ms;
    });

    const values = Object.values(dailyTotals);
    const labels = Object.keys(dailyTotals);
    const maxValue = Math.max(...values, 1);
    const barWidth = (width - 2 * padding) / values.length - 10;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw bars
    values.forEach((value, i) => {
        const x = padding + i * (barWidth + 10);
        const barHeight = ((height - 2 * padding) * value) / maxValue;
        const y = height - padding - barHeight;

        ctx.fillStyle = '#36A2EB';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw label
        ctx.save();
        ctx.translate(x + barWidth/2, height - padding + 10);
        ctx.rotate(-Math.PI/4);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.fillText(labels[i], 0, 0);
        ctx.restore();

        // Draw value
        const hours = (value / 3600000).toFixed(1);
        ctx.textAlign = 'center';
        ctx.fillText(`${hours}h`, x + barWidth/2, y - 5);
    });
}

function drawTotalChart(ctx, timeSpent) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const total = Object.values(timeSpent).reduce((sum, ms) => sum + ms, 0);
    let startAngle = 0;

    Object.entries(timeSpent).forEach(([url, ms], i) => {
        const sliceAngle = (2 * Math.PI * ms) / total;
        const endAngle = startAngle + sliceAngle;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][i % 4];
        ctx.fill();

        // Draw label
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius + 20);
        const labelY = centerY + Math.sin(midAngle) * (radius + 20);
        
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        const hours = (ms / 3600000).toFixed(1);
        ctx.fillText(`${url}: ${hours}h`, labelX, labelY);

        startAngle = endAngle;
    });
}
