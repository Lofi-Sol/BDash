# 🌪️ Torn API Tester

A modern, beautiful web-based tool for testing Torn API endpoints for both Version 1 and Version 2. Features a sleek design with intuitive field selection and comprehensive testing capabilities.

![Torn API Tester](https://img.shields.io/badge/Status-Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎨 Modern Design
- **Glass Morphism UI**: Semi-transparent containers with backdrop blur effects
- **Gradient Backgrounds**: Beautiful purple-blue gradient theme
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Custom Typography**: Clean Inter font for optimal readability

### 🔧 Version 1 API Support
- **Base URL**: `https://api.torn.com/{section}/{id}?selections={selections}&key={key}`
- **Interactive Field Selection**: Click-to-select fields with visual feedback
- **Available Sections**: User, Property, Faction, Company, Market
- **Dynamic Field Lists**: Real-time field updates based on selected section
- **Quick Actions**: Select All, Clear All, and Common Fields presets

### 🚀 Version 2 API Support
- **Base URL**: `https://api.torn.com/v2`
- **RESTful Endpoints**: Organized by category (User, Faction, Market, Property, Key)
- **Bearer Token Authentication**: Secure API key handling via Authorization header
- **Path Parameters**: JSON format for dynamic endpoint parameters
- **Comprehensive Endpoint Coverage**: All major Torn API v2 endpoints

### 📊 Enhanced Testing Features
- **Real-time Response Display**: Formatted JSON with syntax highlighting
- **Response Time Tracking**: Shows API request duration
- **Request History**: Tracks last 10 API calls with timestamps
- **Error Handling**: Detailed error messages and status indicators
- **Loading States**: Beautiful spinner animations during requests

## 🛠️ Installation & Usage

### Quick Start
1. **Download**: Save `index.html` to your local machine
2. **Open**: Double-click the file or open it in your web browser
3. **Get API Key**: Obtain your Torn API key from your Torn account
4. **Start Testing**: Begin testing API endpoints immediately

### Getting an API Key
1. Log in to your Torn account
2. Navigate to **Settings** → **API Access**
3. Generate a new API key
4. Copy the key and use it in the tester

## 📖 How to Use

### Version 1 API Testing

#### Step-by-Step Guide:
1. **Enter API Key**: Paste your Torn API key in the designated field
2. **Select Section**: Choose from User, Property, Faction, Company, or Market
3. **Choose Fields**: 
   - Click on individual fields to select/deselect them
   - Use "Common Fields" for popular selections
   - Use "Select All" to choose all available fields
   - Use "Clear All" to remove all selections
4. **Enter ID** (Optional): Leave empty for your own data, or enter a specific ID
5. **Test Endpoint**: Click "🚀 Test Endpoint" to make the API request
6. **View Results**: Check the formatted response and request history

#### Available Sections & Fields:

**User Section** (`/user`)
- Basic profile, stats, inventory, attacks, properties, skills, money, etc.
- 50+ available fields including: `basic`, `profile`, `skills`, `personalstats`, `money`, `properties`, `attacks`, `education`, `honors`, `medals`, `merits`, `battlestats`, `workstats`, `crimes`, `messages`, `events`, `travel`, `stocks`, `bazaar`, `itemmarket`, `forumfeed`, `forumfriends`, `forumposts`, `forumthreads`, `gym`, `education`, `jobpoints`, `jobranks`, `refills`, `cooldowns`, `bars`, `weaponexp`, `networth`, `timestamp`, and more.

**Property Section** (`/property`)
- Property information, lookup, timestamp
- Fields: `lookup`, `property`, `timestamp`

**Faction Section** (`/faction`)
- Faction data, members, wars, chains, territory, etc.
- 40+ available fields including: `basic`, `members`, `chain`, `territory`, `attacks`, `wars`, `applications`, `balance`, `upgrades`, `armor`, `weapons`, `drugs`, `medical`, `boosters`, `cesium`, `currency`, `donations`, `fundsnews`, `hof`, `news`, `positions`, `rackets`, `raids`, `rankedwars`, `reports`, `revives`, `search`, `stats`, `territorywars`, `warfare`, and more.

**Company Section** (`/company`)
- Company information, employees, stock, news
- Fields: `applications`, `companies`, `detailed`, `employees`, `lookup`, `news`, `profile`, `stock`, `timestamp`

**Market Section** (`/market`)
- Market listings, bazaar, properties, rentals
- Fields: `bazaar`, `itemmarket`, `lookup`, `pointsmarket`, `properties`, `rentals`, `timestamp`

### Version 2 API Testing

#### Step-by-Step Guide:
1. **Enter API Key**: Paste your Torn API key in the designated field
2. **Select Endpoint**: Choose from the comprehensive dropdown list
3. **Add Parameters** (if needed): Enter JSON format parameters for path variables
4. **Test Endpoint**: Click "🚀 Test Endpoint" to make the API request
5. **View Results**: Check the formatted response and request history

#### Available Endpoint Categories:

**User Endpoints**
- `GET /user/attacks` - Get your detailed attacks
- `GET /user/basic` - Get your basic profile information
- `GET /user/{id}/basic` - Get basic profile for specific user
- `GET /user/bounties` - Get bounties placed on you
- `GET /user/battlestats` - Get your battlestats
- `GET /user/education` - Get your education information
- `GET /user/honors` - Get your achieved honors
- `GET /user/money` - Get your current wealth
- `GET /user/personalstats` - Get your personal stats
- `GET /user/properties` - Get your own properties
- `GET /user/skills` - Get your skills

**Faction Endpoints**
- `GET /faction/applications` - Get your faction's applications
- `GET /faction/basic` - Get your faction's basic details
- `GET /faction/{id}/basic` - Get a faction's basic details
- `GET /faction/members` - Get a list of your faction's members
- `GET /faction/chain` - Get your faction's current chain
- `GET /faction/territory` - Get a list of your faction's territories

**Market Endpoints**
- `GET /market/bazaar` - Get bazaar directory
- `GET /market/{id}/itemmarket` - Get item market listings
- `GET /market/{propertyTypeId}/properties` - Get properties market listings

**Property Endpoints**
- `GET /property/{id}/property` - Get a specific property

**Key Endpoints**
- `GET /key/info` - Get current key info
- `GET /key/log` - Get current key log history

## 🎯 Quick Actions

### Version 1 API Quick Actions:
- **Select All**: Instantly selects all available fields for the current section
- **Clear All**: Removes all selected fields
- **Common Fields**: Pre-selects the most commonly used fields for each section

### Common Field Presets:
- **User**: `basic`, `profile`, `skills`, `personalstats`, `money`, `properties`
- **Faction**: `basic`, `members`, `chain`, `territory`
- **Property**: `property`
- **Company**: `profile`, `employees`
- **Market**: `bazaar`, `itemmarket`

## 📊 Response Features

### Response Display:
- **Formatted JSON**: Beautifully formatted and syntax-highlighted JSON responses
- **Response Time**: Shows how long each API request took
- **Status Indicators**: Clear success/error states with visual icons
- **Scrollable Results**: Large responses contained in scrollable areas
- **Copy-Friendly**: Easy to copy response data

### Request History:
- **Last 10 Requests**: Tracks your recent API calls
- **Timestamps**: Shows when each request was made
- **Status Tracking**: Success/error status for each request
- **Clickable History**: Click on history items for future enhancements

## 🔒 Security & Privacy

### API Key Handling:
- **Local Storage**: API keys are not stored or transmitted
- **Secure Requests**: Direct API calls to Torn servers
- **No Data Collection**: No user data is collected or stored
- **Client-Side Only**: All processing happens in your browser

### Best Practices:
- Keep your API key secure and don't share it
- Use appropriate API key permissions
- Be mindful of API rate limits
- Test with small data sets first

## 🎨 Design Features

### Visual Elements:
- **Gradient Backgrounds**: Beautiful purple-blue gradients
- **Glass Morphism**: Semi-transparent containers with blur effects
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Custom Scrollbars**: Styled scrollbars throughout the interface
- **Responsive Layout**: Adapts to all screen sizes

### Interactive Elements:
- **Hover Effects**: Visual feedback on all interactive elements
- **Loading States**: Beautiful spinner animations
- **Field Selection**: Click-to-select with visual feedback
- **Status Indicators**: Clear success/error states
- **Smooth Transitions**: Fluid animations throughout

## 🚀 Performance Features

### Optimization:
- **Fast Loading**: Optimized for quick page loads
- **Efficient Requests**: Minimal overhead for API calls
- **Responsive Design**: Smooth performance on all devices
- **Memory Efficient**: Clean memory management

### Browser Compatibility:
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Works on older browsers with basic functionality

## 📁 File Structure

```
Torn API Tester/
├── index.html          # Main application file
└── README.md          # This documentation
```

## 🔧 Technical Details

### Built With:
- **HTML5**: Semantic markup and modern features
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Google Fonts**: Inter font for optimal typography

### API Integration:
- **Fetch API**: Modern HTTP requests
- **JSON Handling**: Native JSON parsing and formatting
- **Error Handling**: Comprehensive error catching and display
- **CORS Support**: Handles cross-origin requests properly

## 🤝 Contributing

### Development:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Suggestions:
- Report bugs or issues
- Suggest new features
- Improve documentation
- Enhance the design

## �� License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Torn API**: For providing comprehensive API documentation
- **Inter Font**: Google Fonts for beautiful typography
- **CSS Gradients**: For beautiful visual effects
- **Modern Web Standards**: For enabling advanced features

## 📞 Support

### Getting Help:
- Check the Torn API documentation
- Review common field combinations
- Test with simple endpoints first
- Verify your API key permissions

### Troubleshooting:
- **API Key Issues**: Ensure your key has proper permissions
- **Rate Limiting**: Wait between requests if hitting limits
- **Network Issues**: Check your internet connection
- **Browser Issues**: Try a different browser or clear cache

---

**Happy Testing! 🚀**

*Built with ❤️ for the Torn community*
