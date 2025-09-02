# ⚔️ Ranked Wars Tracker

A beautiful, modern web application for tracking ranked wars across Torn factions. Built with the same stunning design as the Torn API Tester, this tool provides real-time insights into ongoing and recent ranked wars.

![Ranked Wars Tracker](https://img.shields.io/badge/Status-Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎨 Modern Design
- **Glass Morphism UI**: Semi-transparent containers with backdrop blur effects
- **Gradient Backgrounds**: Beautiful purple-blue gradient theme matching the API tester
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Cards**: Beautiful war cards with hover effects and animations

### 📊 War Tracking
- **Real-time Data**: Fetch current ranked wars using Torn API v2
- **Comprehensive Display**: Shows faction details, scores, and war statistics
- **Status Indicators**: Clear visual indicators for active, finished, and preparing wars
- **Winner Highlighting**: Automatically highlights winning factions
- **Duration Tracking**: Shows war duration and timing information

### 📈 Statistics Dashboard
- **War Counts**: Total, active, and finished wars
- **Score Analytics**: Total and average scores across all wars
- **Real-time Updates**: Auto-refresh every 5 minutes
- **Visual Charts**: Beautiful stat cards with gradient backgrounds

### 🔧 API Integration
- **Torn API v2**: Uses the latest Torn API endpoints
- **Flexible Queries**: Fetch all wars or specific faction wars
- **Secure Authentication**: Bearer token authentication
- **Error Handling**: Comprehensive error messages and status display

## 🛠️ Installation & Usage

### Quick Start
1. **Download**: Save `index.html` to your local machine
2. **Open**: Double-click the file or open it in your web browser
3. **Get API Key**: Obtain your Torn API key from your Torn account
4. **Start Tracking**: Enter your API key and fetch ranked wars data

### Getting an API Key
1. Log in to your Torn account
2. Navigate to **Settings** → **API Access**
3. Generate a new API key
4. Copy the key and use it in the tracker

## 📖 How to Use

### Basic Usage
1. **Enter API Key**: Paste your Torn API key in the designated field
2. **Optional Faction ID**: Leave empty to fetch all ranked wars, or enter a specific faction ID
3. **Fetch Data**: Click "🚀 Fetch Ranked Wars" to retrieve the data
4. **View Results**: Browse through the war cards and statistics

### Advanced Features
- **Auto-refresh**: Data automatically refreshes every 5 minutes
- **Manual Refresh**: Click the floating refresh button or use the refresh button
- **Clear Data**: Use the clear button to reset the form and data
- **Error Handling**: Clear error messages for troubleshooting

## 📊 Data Display

### War Cards
Each ranked war is displayed as a beautiful card showing:

**Header Information:**
- War ID number
- Current status (Active, Finished, Preparing)

**Faction Comparison:**
- Faction names and IDs
- Current scores
- Member counts
- Visual winner/loser highlighting

**War Details:**
- Start and end dates
- Duration calculation
- Total combined score

### Statistics Dashboard
The statistics section shows:
- **Total Wars**: Number of all ranked wars
- **Active Wars**: Currently ongoing wars
- **Finished Wars**: Completed wars
- **Total Score**: Combined score across all wars
- **Average Score**: Average score per war

### Status Indicators
- **🟢 Active**: Currently ongoing wars
- **🔴 Finished**: Completed wars
- **🟡 Preparing**: Wars that haven't started yet

## 🎨 Design Features

### Visual Elements
- **Gradient Backgrounds**: Beautiful purple-blue gradients matching the API tester
- **Glass Morphism**: Semi-transparent containers with blur effects
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Custom Scrollbars**: Styled scrollbars throughout the interface
- **Responsive Layout**: Adapts to all screen sizes

### Interactive Elements
- **Hover Effects**: Visual feedback on all interactive elements
- **Loading States**: Beautiful spinner animations
- **War Cards**: Interactive cards with hover effects
- **Status Indicators**: Clear success/error states
- **Smooth Transitions**: Fluid animations throughout

## 🔒 Security & Privacy

### API Key Handling
- **Local Storage**: API keys are not stored or transmitted
- **Secure Requests**: Direct API calls to Torn servers
- **No Data Collection**: No user data is collected or stored
- **Client-Side Only**: All processing happens in your browser

### Best Practices
- Keep your API key secure and don't share it
- Use appropriate API key permissions
- Be mindful of API rate limits
- Test with small data sets first

## �� Performance Features

### Optimization
- **Fast Loading**: Optimized for quick page loads
- **Efficient Requests**: Minimal overhead for API calls
- **Responsive Design**: Smooth performance on all devices
- **Memory Efficient**: Clean memory management

### Auto-refresh
- **5-minute Intervals**: Automatically refreshes data every 5 minutes
- **Manual Override**: Can be manually refreshed at any time
- **Smart Updates**: Only refreshes when data exists

## 📁 File Structure

```
RankedwarTest/
├── index.html          # Main application file
└── README.md          # This documentation
```

## 🔧 Technical Details

### Built With
- **HTML5**: Semantic markup and modern features
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Google Fonts**: Inter font for optimal typography

### API Integration
- **Torn API v2**: Uses `/faction/rankedwars` endpoint
- **Fetch API**: Modern HTTP requests
- **JSON Handling**: Native JSON parsing and formatting
- **Error Handling**: Comprehensive error catching and display
- **CORS Support**: Handles cross-origin requests properly

### Endpoints Used
- `GET /faction/rankedwars` - Get all ranked wars
- `GET /faction/{id}/rankedwars` - Get ranked wars for specific faction

## 🎯 Use Cases

### For Faction Leaders
- Track ongoing wars and their progress
- Monitor faction performance
- Analyze war statistics and trends
- Plan strategies based on current war status

### For Players
- Stay informed about faction activities
- Track war progress and outcomes
- Understand faction performance
- Monitor war statistics

### For Researchers
- Analyze ranked war patterns
- Study faction performance over time
- Track war statistics and trends
- Monitor Torn's war system

## 🤝 Contributing

### Development
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Suggestions
- Report bugs or issues
- Suggest new features
- Improve documentation
- Enhance the design

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Torn API**: For providing comprehensive API documentation
- **Inter Font**: Google Fonts for beautiful typography
- **CSS Gradients**: For beautiful visual effects
- **Modern Web Standards**: For enabling advanced features

## 📞 Support

### Getting Help
- Check the Torn API documentation
- Review the error messages for troubleshooting
- Test with different faction IDs
- Verify your API key permissions

### Troubleshooting
- **API Key Issues**: Ensure your key has proper permissions
- **Rate Limiting**: Wait between requests if hitting limits
- **Network Issues**: Check your internet connection
- **Browser Issues**: Try a different browser or clear cache
- **No Data**: Some factions may not have recent ranked wars

---

**Happy War Tracking! ⚔️**

*Built with ❤️ for the Torn community*
