# Torn Wars Google Sheets Updater

Automatically update Google Sheets with Torn war information every Tuesday at 12:15 PM UTC using GitHub Actions.

## 🎯 What This Does

This system automatically fetches war data from the Torn API and updates a Google Sheets file with comprehensive information about:
- Active and finished wars
- Faction details and scores
- War statistics and durations
- Real-time updates every Tuesday
- **NEW: Weekly sheets with date labeling (Python method)**

## 🚀 Quick Start

Choose your preferred method:

### Option 1: Google Apps Script + Webhook (Recommended)
- **Pros**: Simple setup, no external dependencies
- **Cons**: Limited to Google's execution environment
- **Setup**: See [Google Apps Script Setup Guide](Google%20Sheets/SETUP_GUIDE.md#option-1-google-apps-script--webhook-recommended)

### Option 2: Python Script + Direct API ⭐ **Weekly Sheets**
- **Pros**: Full control, better error handling, local testing, **creates new sheet every week**
- **Cons**: Requires Google Cloud service account setup
- **Features**: 
  - New sheet every Tuesday with date label (e.g., "Torn Wars Data - 2024-01-16")
  - Automatic cleanup of old sheets (keeps 8 most recent)
  - Historical data tracking by week
- **Setup**: See [Python Setup Guide](Google%20Sheets/SETUP_GUIDE.md#option-2-python-script--direct-api-weekly-sheets)

## 📁 Project Structure

```
BDash/
├── Actions/                          # GitHub Actions workflows
│   ├── .github/workflows/           # Workflow definitions
│   ├── update_torn_wars.py          # Python updater script (weekly sheets)
│   └── requirements.txt              # Python dependencies
├── Google Sheets/                    # Google Apps Script files
│   ├── torn_wars_updater.gs         # Main updater script
│   ├── webhook_endpoint.gs          # Webhook endpoint
│   └── SETUP_GUIDE.md               # Detailed setup instructions
└── Testing Space/                    # Testing tools
    └── Torn War Tester/             # HTML tester for Torn API
```

## 🔧 Prerequisites

- **Torn API Key**: Get from [Torn API Settings](https://www.torn.com/preferences.php#tab=api)
- **Google Account**: Access to Google Sheets
- **GitHub Repository**: For GitHub Actions automation

## 📊 Data Structure

### Standard Method (Google Apps Script)
The Google Sheet will automatically contain 17 columns including:
- War ID, Status, Start/End Dates, Duration
- Faction details (names, scores, chains)
- Target scores, total scores, winners
- Last updated timestamps

### Weekly Sheets Method (Python) ⭐ **NEW**
Each week gets a new sheet with:
- **Sheet Name**: "Torn Wars Data - YYYY-MM-DD"
- **Row 1**: Sheet creation timestamp
- **Row 2**: Data representation date
- **Row 4**: Headers
- **Row 5+**: War data
- **Automatic Cleanup**: Keeps 8 most recent weekly sheets

## ⏰ Automation Schedule

- **Frequency**: Every Tuesday at 12:15 PM UTC
- **Trigger**: GitHub Actions cron schedule
- **Data Source**: Torn API rankedwars endpoint
- **Output**: 
  - Google Apps Script: Updates existing sheet
  - Python: Creates new weekly sheet + cleanup

## 🛡️ Security Features

- API keys stored in GitHub Secrets
- Google credentials encrypted
- No sensitive data in code
- Secure webhook authentication

## 🧪 Testing

### Test Torn API Connection
Use the HTML tester in `Testing Space/Torn War Tester/` to verify your API key works.

### Test Google Sheets Update
Both methods include manual testing functions to verify the setup.

### Test Weekly Sheets (Python Method)
- Run manually to see weekly sheet creation
- Check automatic cleanup of old sheets

## 📚 Documentation

- **[Complete Setup Guide](Google%20Sheets/SETUP_GUIDE.md)** - Step-by-step instructions
- **[Google Apps Script Reference](Google%20Sheets/torn_wars_updater.gs)** - Code documentation
- **[Python Script Reference](Actions/update_torn_wars.py)** - Python implementation with weekly sheets

## 🚨 Troubleshooting

Common issues and solutions are covered in the [Setup Guide](Google%20Sheets/SETUP_GUIDE.md#troubleshooting).

## 🤝 Contributing

Feel free to submit issues or improvements. The system is designed to be modular and extensible.

## 📄 License

This project is open source. Use responsibly and respect Torn's API terms of service.

## 🔗 Links

- [Torn API Documentation](https://api.torn.com/)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Note**: This system respects Torn's API rate limits and is designed for personal use. Please ensure compliance with Torn's terms of service.

**Weekly Sheets Feature**: The Python method automatically creates a new sheet every Tuesday, perfect for tracking war data over time and maintaining historical records.
