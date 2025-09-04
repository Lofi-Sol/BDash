# 🎯 BDash Ultimate Guide - Data Flow & Commands

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Data Flow Diagram](#data-flow-diagram)
4. [Google Sheets Setup](#google-sheets-setup)
5. [GitHub Actions Workflows](#github-actions-workflows)
6. [Python Scripts](#python-scripts)
7. [Dashboard Integration](#dashboard-integration)
8. [Commands & Usage](#commands--usage)
9. [Troubleshooting](#troubleshooting)
10. [API Keys & Secrets](#api-keys--secrets)

---

## 🎯 Project Overview

**BDash** is an automated Torn Wars betting dashboard system that:
- Fetches real-time war data from Torn API
- Processes and stores data in Google Sheets
- Randomly selects wars for betting analysis
- Exports data to JSON for dashboard consumption
- Provides automated scheduling and notifications

### Key Components:
- **Google Sheets**: Data storage and processing
- **Google Apps Script**: Automated sheet management
- **GitHub Actions**: Scheduled data updates and exports
- **Python Scripts**: Data processing and API interactions
- **HTML Dashboard**: Betting analysis interface

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Torn API      │───▶│  Google Sheets   │───▶│  GitHub Actions │
│                 │    │                  │    │                 │
│ • Wars Data     │    │ • Torn Wars Data │    │ • Auto Export   │
│ • Faction Info  │    │ • Random Sample  │    │ • JSON Updates  │
│ • Historical    │    │ • Xanax Logs     │    │ • Scheduling    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Apps Script     │    │  JSON Data      │
                       │                  │    │                 │
                       │ • Random Select  │    │ • Repository    │
                       │ • Data Processing│    │ • Dashboard     │
                       │ • Notifications  │    │ • Real-time     │
                       └──────────────────┘    └─────────────────┘
```

---

## 📊 Data Flow Diagram

### Weekly Schedule (Tuesdays):
```
1:00 PM UTC ──────────────────────────────────────────────────────
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Random Wars Selector (Google Apps Script)                     │
│  • Filters unstarted wars (Duration = "0m")                    │
│  • Randomly selects 10 wars                                    │
│  • Fetches faction statistics from Torn API                    │
│  • Creates "Random Wars Sample" sheet                          │
│  • Sends email notifications                                   │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
2:00 PM UTC ──────────────────────────────────────────────────────
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions: Export Random Wars Sample                     │
│  • Reads "Random Wars Sample" sheet                            │
│  • Exports data to JSON format                                 │
│  • Commits and pushes to repository                            │
│  • Updates Data/random_wars_sample.json                        │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard Integration                                          │
│  • Loads JSON from GitHub repository                           │
│  • Displays betting analysis                                   │
│  • Real-time data access                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Daily Schedule:
```
12:00 PM UTC (Daily) ────────────────────────────────────────────
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions: Update Torn Wars                              │
│  • Fetches latest wars from Torn API                           │
│  • Updates "Torn Wars Data (Apps Script)" sheet                │
│  • Processes faction statistics                                │
│  • Sends Discord notifications (Tuesdays only)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Google Sheets Setup

### Sheet Structure:

#### 1. **Torn Wars Data (Apps Script)**
- **Purpose**: Main data storage for all wars
- **Columns**: 20 columns including war details, faction info, and statistics
- **Update Frequency**: Daily at 12:00 PM UTC
- **Data Source**: Torn API rankedwars endpoint

#### 2. **Random Wars Sample**
- **Purpose**: Randomly selected wars for betting analysis
- **Columns**: 25 columns (includes enhanced faction statistics)
- **Update Frequency**: Tuesdays at 1:00 PM UTC
- **Data Source**: Filtered from "Torn Wars Data (Apps Script)"

#### 3. **Torn Xanax Logs**
- **Purpose**: Track Xanax item receive logs
- **Update Frequency**: 4 times daily
- **Data Source**: Torn API user logs endpoint

### Apps Script Files:
- `torn_wars_apps_script.gs` - Main wars data updater
- `random_wars_selector.gs` - Random wars selection
- `torn_xanax_logs_updater.gs` - Xanax logs tracking
- `webhook_endpoint.gs` - Webhook for external triggers

---

## ⚙️ GitHub Actions Workflows

### 1. **update-torn-wars-python.yml**
```yaml
Schedule: Daily at 12:00 PM UTC
Purpose: Update main wars data
Trigger: schedule + manual
```

**Steps:**
1. Checkout code
2. Setup Python 3.11
3. Install dependencies (requests, gspread, google-auth)
4. Run `update_torn_wars.py`
5. Send Discord notifications (Tuesdays only)

### 2. **export-random-wars-sample.yml**
```yaml
Schedule: Tuesdays at 2:00 PM UTC
Purpose: Export Random Wars Sample to JSON
Trigger: schedule + manual
```

**Steps:**
1. Checkout code with write permissions
2. Setup Python 3.11
3. Install dependencies
4. Run `export_random_wars_sample.py`
5. Commit and push JSON file
6. Log completion

---

## 🐍 Python Scripts

### 1. **update_torn_wars.py**
**Purpose**: Main wars data updater
**Usage**:
```bash
python Actions/update_torn_wars.py \
  --torn-api-key "YOUR_API_KEY" \
  --spreadsheet-id "YOUR_SPREADSHEET_ID" \
  --discord-webhook "YOUR_WEBHOOK_URL"
```

**Features**:
- Fetches wars data from Torn API
- Calculates faction statistics
- Creates weekly sheets with date labels
- Sends Discord notifications
- Cleans up old sheets (keeps 8 weeks)

### 2. **export_random_wars_sample.py**
**Purpose**: Export Random Wars Sample to JSON
**Usage**:
```bash
python Actions/export_random_wars_sample.py \
  --spreadsheet-id "YOUR_SPREADSHEET_ID" \
  --output "Data/random_wars_sample.json"
```

**Features**:
- Reads from "Random Wars Sample" sheet
- Exports to structured JSON format
- Includes metadata and timestamps
- Error handling and logging

---

## 🎨 Dashboard Integration

### Loading Data:
```javascript
// Load Random Wars Sample data
fetch('https://raw.githubusercontent.com/Lofi-Sol/BDash/main/Data/random_wars_sample.json')
  .then(response => response.json())
  .then(data => {
    console.log(`Loaded ${data.count} wars from ${data.source}`);
    
    // Process each war
    data.data.forEach(war => {
      console.log(`War ${war['War ID']}: ${war['Faction 1 Name']} vs ${war['Faction 2 Name']}`);
      console.log(`Faction 1 Win Rate: ${war['Faction 1 Win Rate']}`);
      console.log(`Faction 2 Win Rate: ${war['Faction 2 Win Rate']}`);
    });
  });
```

### Data Structure:
```json
{
  "data": [
    {
      "War ID": "12345",
      "Status": "Active",
      "Faction 1 Name": "Example Faction",
      "Faction 1 Win Rate": "75%",
      "Faction 2 Win Rate": "60%",
      // ... all other columns
    }
  ],
  "count": 10,
  "exported_at": "2024-01-15T14:00:00Z",
  "source": "Random Wars Sample",
  "status": "success"
}
```

---

## 🛠️ Commands & Usage

### Local Development:

#### 1. **Test Torn Wars Update**
```bash
cd /Users/damola/Desktop/BDash
python Actions/update_torn_wars.py \
  --torn-api-key "$TORN_API_KEY" \
  --spreadsheet-id "$SPREADSHEET_ID" \
  --discord-webhook "$DISCORD_WEBHOOK"
```

#### 2. **Test Random Wars Export**
```bash
python Actions/export_random_wars_sample.py \
  --spreadsheet-id "$SPREADSHEET_ID"
```

#### 3. **Manual GitHub Actions Trigger**
```bash
# Via GitHub CLI (if installed)
gh workflow run "Update Torn Wars in Google Sheets (Python)"
gh workflow run "Export Random Wars Sample to JSON"
```

### Google Apps Script Commands:

#### 1. **Run Random Wars Selection**
```javascript
// In Apps Script editor
selectRandomWars()
```

#### 2. **Setup Scheduling**
```javascript
// Setup Tuesday 1:00 PM UTC schedule
setupRandomWarsSchedule()
```

#### 3. **Check Sheet Info**
```javascript
// Get source sheet information
getSourceSheetInfo()
```

### Git Commands:

#### 1. **Update Repository**
```bash
git add .
git commit -m "Update: [description]"
git push origin main
```

#### 2. **Check Status**
```bash
git status
git log --oneline -5
```

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. **GitHub Actions Permission Denied**
**Error**: `Permission to Lofi-Sol/BDash.git denied to github-actions[bot]`
**Solution**: Ensure workflow has `permissions: contents: write`

#### 2. **Google Sheets API Errors**
**Error**: `Torn API key not found`
**Solution**: Check GitHub secrets are properly set:
- `GOOGLE_CREDENTIALS_JSON`
- `TORN_API_KEY`
- `GOOGLE_SPREADSHEET_ID`

#### 3. **Empty Random Wars Sample**
**Error**: No data in Random Wars Sample sheet
**Solution**: 
- Check if Random Wars Selector ran successfully
- Verify there are unstarted wars (Duration = "0m")
- Run `getSourceSheetInfo()` in Apps Script

#### 4. **JSON Export Fails**
**Error**: Export script fails
**Solution**:
- Check if "Random Wars Sample" sheet exists
- Verify Google credentials are valid
- Check Apps Script execution logs

### Debug Commands:

#### 1. **Check Sheet Data**
```javascript
// In Apps Script
getSourceSheetInfo()
```

#### 2. **Test Faction Data**
```javascript
// Test specific faction
testFactionData(937)
```

#### 3. **Manual Export Test**
```bash
# Test export locally
python Actions/export_random_wars_sample.py \
  --spreadsheet-id "YOUR_ID" \
  --google-creds "Auth/bdash-470901-682ae45b8f94.json"
```

---

## 🔐 API Keys & Secrets

### Required GitHub Secrets:

#### 1. **GOOGLE_CREDENTIALS_JSON**
- **Purpose**: Google Sheets API authentication
- **Format**: JSON service account key
- **Source**: Google Cloud Console

#### 2. **TORN_API_KEY**
- **Purpose**: Torn API access
- **Format**: String
- **Source**: Torn.com API settings

#### 3. **GOOGLE_SPREADSHEET_ID**
- **Purpose**: Target spreadsheet identifier
- **Format**: String from Google Sheets URL
- **Source**: Google Sheets URL

#### 4. **DISCORD_WEBHOOK_URL** (Optional)
- **Purpose**: Discord notifications
- **Format**: Webhook URL
- **Source**: Discord server settings

### Local Environment Variables:
```bash
export TORN_API_KEY="your_torn_api_key"
export GOOGLE_CREDENTIALS_JSON='{"type": "service_account", ...}'
export GOOGLE_SPREADSHEET_ID="your_spreadsheet_id"
export DISCORD_WEBHOOK_URL="your_webhook_url"
```

---

## 📅 Schedule Summary

| Time (UTC) | Component | Action | Frequency |
|------------|-----------|--------|-----------|
| 12:00 PM | GitHub Actions | Update Torn Wars | Daily |
| 1:00 PM | Apps Script | Random Wars Selection | Tuesday |
| 2:00 PM | GitHub Actions | Export to JSON | Tuesday |
| Every 6h | Apps Script | Xanax Logs Update | Daily |

---

## 🚀 Quick Start Commands

### 1. **Initial Setup**
```bash
# Clone repository
git clone https://github.com/Lofi-Sol/BDash.git
cd BDash

# Install dependencies
pip install -r Actions/requirements.txt

# Set environment variables
export TORN_API_KEY="your_key"
export GOOGLE_CREDENTIALS_JSON='{"type": "service_account", ...}'
export GOOGLE_SPREADSHEET_ID="your_id"
```

### 2. **Test Everything**
```bash
# Test wars update
python Actions/update_torn_wars.py --torn-api-key "$TORN_API_KEY" --spreadsheet-id "$GOOGLE_SPREADSHEET_ID"

# Test export
python Actions/export_random_wars_sample.py --spreadsheet-id "$GOOGLE_SPREADSHEET_ID"

# Check results
cat Data/random_wars_sample.json
```

### 3. **Deploy to GitHub**
```bash
git add .
git commit -m "Initial setup complete"
git push origin main
```

---

## 📞 Support & Resources

### Documentation Files:
- `Google Sheets/SETUP_GUIDE.md` - Google Sheets setup
- `Google Sheets/RANDOM_WARS_SELECTOR_SETUP.md` - Random wars setup
- `Data/README.md` - JSON data structure
- `Testing Space/` - Test tools and utilities

### Key URLs:
- **Repository**: https://github.com/Lofi-Sol/BDash
- **JSON Data**: https://raw.githubusercontent.com/Lofi-Sol/BDash/main/Data/random_wars_sample.json
- **GitHub Actions**: https://github.com/Lofi-Sol/BDash/actions

### Contact:
- **Email**: oowol003@gmail.com (for notifications)
- **Discord**: Configured via webhook for automated updates

---

*Last Updated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')*
*Version: 1.0*
