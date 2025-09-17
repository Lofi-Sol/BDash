/**
 * Configuration file for Google Sheets integration
 * Update these settings after setting up your Google Apps Script
 */

// Google Sheets Configuration
const GOOGLE_SHEETS_CONFIG = {
    // Replace this with your actual Google Apps Script web app URL
    // You'll get this URL after deploying your script as a web app
    WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
    
    // Sheet configuration
    SHEET_NAME: 'Betting Data',
    
    // API settings
    TIMEOUT: 10000, // 10 seconds timeout for API calls
    RETRY_ATTEMPTS: 3, // Number of retry attempts if API fails
    
    // Fallback settings
    FALLBACK_TO_LOCALSTORAGE: true, // Save to localStorage if Google Sheets fails
    SHOW_ERROR_NOTIFICATIONS: true, // Show user notifications for errors
};

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GOOGLE_SHEETS_CONFIG;
} else if (typeof window !== 'undefined') {
    window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;
}
