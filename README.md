# Website Time Tracker - Chrome Extension

A Chrome extension that helps you track time spent on different websites and take notes. Get insights into your browsing habits with visual analytics and manage notes for each website.

## Features

- 🕒 **Real-time Website Tracking**: Automatically tracks time spent on each website
- 📊 **Visual Analytics**: View your browsing data through interactive charts
  - Daily View: See time spent in the last 7 days
  - Weekly View: View time distribution over 4 weeks
  - Total Time: Pie chart showing overall website usage
- 📝 **Note Taking**: Add and manage notes for each website
- 💾 **Export Options**: Export individual notes or all notes as text files
- 🎨 **Clean UI**: User-friendly interface with intuitive controls

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

### Time Tracking
- The extension automatically starts tracking when you browse websites
- Click the extension icon to view time spent on different websites
- Time is displayed in hours and minutes for easy reading

### Taking Notes
1. Click the 📝 icon next to any website
2. Enter your notes in the text area
3. Click "Save Note" to store your notes
4. Use "Export Note" to download individual notes

### Viewing Analytics
1. Click "Show Analytics" to open the analytics dashboard
2. Switch between different views:
   - Daily View
   - Weekly View
   - Total Time
3. Hover over charts to see detailed information

### Exporting Data
- Use "Export Note" button for individual website notes
- Click "Export All Notes" to download all notes as a single file

## Files Structure
website-time-tracker/
├── manifest.json # Extension configuration
├── background.js # Background tracking logic
├── popup.html # Main extension interface
├── popup.js # UI and interaction logic
└── chart.min.js # Custom charting functionality

## Technical Details

- Built with vanilla JavaScript
- Uses Chrome Extension APIs
- Custom-built charting system
- Local storage for data persistence
- Modular code structure

## Privacy

- All data is stored locally on your device
- No data is sent to external servers
- No tracking or analytics collection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have suggestions:
1. Check the [Issues](https://github.com/Aniketdhar810/Time-tracker-extension/issues) page
2. Create a new issue with detailed information
3. Provide steps to reproduce the problem

---

Made with ❤️ 
