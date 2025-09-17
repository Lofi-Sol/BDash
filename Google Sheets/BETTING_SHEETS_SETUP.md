# Betting Data Google Sheets Integration - Setup Guide

This guide will walk you through setting up Google Sheets integration to save all betting data from your dashboard.

## Overview

The integration provides:
- **Real-time bet saving** - All bets are automatically saved to Google Sheets
- **Comprehensive tracking** - Player info, bet details, odds, status, timestamps
- **Data analysis** - Built-in statistics and reporting capabilities
- **Manual management** - Update bet statuses, view all betting activity
- **Backup & recovery** - All data safely stored in Google Sheets

## Prerequisites

- A Google account with access to Google Sheets
- Your existing betting dashboard
- The Google Apps Script code from `betting_data_updater.gs`

## Setup Steps

### Step 1: Create Google Sheet

1. **Create a new Google Sheet** or use an existing one
2. **Name it** something like "Torn Betting Data" or "BDash Betting Tracker"
3. **Keep the sheet open** (required for Apps Script)

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. **Delete the default code** and paste the code from `betting_data_updater.gs`
3. **Save the script** with name "Betting Data Updater"
4. **Click Save** (Ctrl+S or Cmd+S)

### Step 3: Deploy as Web App

1. In Apps Script, click **Deploy > New deployment**
2. **Type**: Web app
3. **Execute as**: Me (your email)
4. **Who has access**: Anyone (for dashboard integration)
5. **Click Deploy**
6. **Copy the web app URL** - you'll need this for the dashboard

### Step 4: Test the Setup

1. **Test the API**:
   - In Apps Script, select `testBettingSetup` from function dropdown
   - Click **Run** (▶️)
   - Check execution log for success message
   - Check your Google Sheet for the "Betting Data" tab

2. **Test the web app**:
   - Open the web app URL in a new tab
   - You should see: `{"success":true,"message":"Betting Data API is running"}`

### Step 5: Update Dashboard Integration

1. **Open your dashboard** (`bettingdashboard.html`)
2. **Find the `saveBetToServer` function** (around line 4330)
3. **Replace the function** with the new Google Sheets integration code
4. **Update the web app URL** with your deployed URL

## Data Structure

The Google Sheet will contain these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Date | When bet was placed | 2024-01-16 14:30:00 |
| Bet ID | Unique bet identifier | ABC12345 |
| Player ID | Torn player ID | 3520571 |
| Player Name | Player name | VanillaScoop |
| War ID | War identifier | 30923 |
| Faction ID | Faction identifier | 31764 |
| Faction Name | Faction name | 39th Street Warriors |
| Xanax Amount | Amount of Xanax bet | 2 |
| Bet Amount ($) | Dollar value | $1,489,966 |
| Odds | Betting odds | 2.5 |
| Status | Bet status | pending |
| Client Timestamp | When bet was placed (client) | 1756862761 |
| Server Timestamp | When saved to sheet | 2024-01-16T14:30:00.000Z |

## Features

### Automatic Features
- ✅ **Real-time saving** - Bets saved immediately when placed
- ✅ **Data validation** - Ensures data integrity
- ✅ **Error handling** - Graceful failure with fallback to localStorage
- ✅ **Duplicate prevention** - Unique bet IDs prevent duplicates

### Manual Features
- ✅ **Status updates** - Manually update bet status (pending → confirmed → won/lost)
- ✅ **Statistics** - View betting statistics and win rates
- ✅ **Data export** - Export data for analysis
- ✅ **Search & filter** - Find specific bets or players

## Usage Examples

### View All Bets
Simply open the Google Sheet to see all betting activity in real-time.

### Update Bet Status
```javascript
// In Apps Script, run this function
updateBetStatus('ABC12345', 'won');
```

### Get Betting Statistics
```javascript
// In Apps Script, run this function
const stats = getBettingStats();
console.log(stats);
```

### Manual Bet Entry
You can also manually add bets directly in the Google Sheet if needed.

## Troubleshooting

### Common Issues

1. **"No active spreadsheet found"**
   - Make sure you're running the script from within a Google Sheet
   - Keep the sheet open when testing

2. **"Web app not accessible"**
   - Check deployment permissions (should be "Anyone")
   - Verify the web app URL is correct

3. **"Bets not saving from dashboard"**
   - Check browser console for error messages
   - Verify the web app URL in the dashboard code
   - Test the web app URL directly in browser

4. **"Sheet not found"**
   - The script will automatically create the "Betting Data" sheet
   - Make sure you have edit permissions on the Google Sheet

### Testing Steps

1. **Test API Connection**:
   ```
   Run: testBettingSetup()
   Expected: Success message and test bet in sheet
   ```

2. **Test Web App**:
   ```
   Visit: [Your Web App URL]
   Expected: {"success":true,"message":"Betting Data API is running"}
   ```

3. **Test Dashboard Integration**:
   ```
   Place a bet in dashboard
   Expected: Bet appears in Google Sheet within seconds
   ```

## Security Notes

- The web app is set to "Anyone" access for dashboard integration
- All data is stored in your personal Google account
- Consider using "Anyone with the link" if you want to restrict access
- The API doesn't require authentication (suitable for betting data)

## Next Steps

After setup:
1. **Test with a few bets** from your dashboard
2. **Verify data appears** in the Google Sheet
3. **Set up monitoring** to ensure bets are being saved
4. **Create charts** in Google Sheets for betting analytics
5. **Share the sheet** with team members if needed

## Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify the web app deployment settings
3. Test each component individually
4. Check browser console for JavaScript errors
