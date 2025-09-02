# Torn Wars Google Sheets Updater - Setup Guide

This guide will walk you through setting up an automated system that updates a Google Sheets file with Torn war information every Tuesday at 12:15 PM UTC.

## Overview

The system consists of two main approaches:

1. **Google Apps Script + Webhook** (Recommended for simplicity)
2. **Python Script + Direct API** (More control, requires service account, **creates weekly sheets**)

## Prerequisites

- A Torn API key
- A Google account with access to Google Sheets
- A GitHub repository (for GitHub Actions)

## Option 1: Google Apps Script + Webhook (Recommended)

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Note the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### Step 2: Set up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Replace the default code with the contents of `torn_wars_updater.gs`
3. Save the project with a name like "Torn Wars Updater"

### Step 3: Set up the Webhook

1. In the Apps Script editor, add the code from `webhook_endpoint.gs`
2. Go to **Deploy > New deployment**
3. Choose **Web app** as the type
4. Set **Execute as** to **Me**
5. Set **Who has access** to **Anyone**
6. Click **Deploy**
7. Copy the **Web app URL** - this is your webhook URL

### Step 4: Configure Torn API Key

1. In Apps Script, go to **Project Settings**
2. Under **Script Properties**, click **Add script property**
3. Set **Property** to `TORN_API_KEY`
4. Set **Value** to your Torn API key
5. Click **OK**

### Step 5: Test the Setup

1. In Apps Script, run the `testApiConnection()` function
2. You should see a success message with the number of wars found

### Step 6: Set up GitHub Actions

1. In your GitHub repository, go to **Settings > Secrets and variables > Actions**
2. Add a new repository secret:
   - **Name**: `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value**: The webhook URL from Step 3
3. Copy the workflow file `.github/workflows/update-torn-wars.yml` to your repository
4. The workflow will automatically run every Tuesday at 12:15 PM UTC

## Option 2: Python Script + Direct API (Weekly Sheets)

**This option automatically creates a new sheet every week with date labeling!**

### Key Features:
- **Weekly Sheets**: Creates a new sheet every Tuesday (e.g., "Torn Wars Data - 2024-01-16")
- **Automatic Cleanup**: Keeps the 8 most recent weekly sheets, deletes older ones
- **Date Tracking**: Each sheet shows when it was created and what data it represents
- **Full Automation**: Runs every Tuesday at 12:15 PM UTC via GitHub Actions

### Step 1: Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API** and **Google Drive API**
4. Go to **IAM & Admin > Service Accounts**
5. Click **Create Service Account**
6. Give it a name like "Torn Wars Updater"
7. Click **Create and Continue**
8. Skip role assignment, click **Continue**
9. Click **Done**
10. Click on the service account you just created
11. Go to **Keys** tab
12. Click **Add Key > Create new key**
13. Choose **JSON** format
14. Download the JSON file

### Step 2: Share Google Sheet

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from the JSON file) with **Editor** access
4. Click **Send**

### Step 3: Set up GitHub Actions

1. In your GitHub repository, go to **Settings > Secrets and variables > Actions**
2. Add these repository secrets:
   - **Name**: `TORN_API_KEY`
     **Value**: Your Torn API key
   - **Name**: `GOOGLE_CREDENTIALS_JSON`
     **Value**: The entire contents of the service account JSON file
   - **Name**: `GOOGLE_SPREADSHEET_ID`
     **Value**: Your Google Sheet ID
3. Copy the workflow file `.github/workflows/update-torn-wars-python.yml` to your repository

### Step 4: Understanding Weekly Sheets

The system will automatically:

1. **Every Tuesday at 12:15 PM UTC**: Create a new sheet with the current week's date
2. **Sheet Naming**: Format will be "Torn Wars Data - YYYY-MM-DD" (e.g., "Torn Wars Data - 2024-01-16")
3. **Data Structure**: Each sheet contains:
   - **Row 1**: Sheet creation timestamp
   - **Row 2**: Data representation date
   - **Row 3**: Empty row
   - **Row 4**: Headers
   - **Row 5+**: War data
4. **Automatic Cleanup**: Keeps only the 8 most recent weekly sheets to prevent clutter

## Testing

### Manual Testing

#### Google Apps Script Method:
1. In Apps Script, run the `manualUpdate()` function
2. Check your Google Sheet for updated data

#### Python Method:
1. Install dependencies: `pip install -r Actions/requirements.txt`
2. Run: `python Actions/update_torn_wars.py --torn-api-key YOUR_KEY --spreadsheet-id YOUR_SHEET_ID`
3. **Note**: This will create a new weekly sheet if run manually

### GitHub Actions Testing

1. Go to your repository's **Actions** tab
2. Find the "Update Torn Wars (Python)" workflow
3. Click **Run workflow** to test manually

## Troubleshooting

### Common Issues

#### "API Key not found" Error
- Ensure you've set the `TORN_API_KEY` script property in Apps Script
- Check that the API key is valid by testing it in your browser

#### "No active spreadsheet found" Error
- Make sure you're running the script from within a Google Sheet
- Ensure the sheet is open and accessible

#### "Failed to authenticate with Google" Error
- Check that your service account JSON is properly formatted
- Ensure the service account has access to the Google Sheet
- Verify that the Google Sheets API is enabled

#### "Torn API Error" Messages
- Check your Torn API key permissions
- Verify the API key hasn't expired
- Check Torn's API status page

#### Weekly Sheet Issues
- **Too many sheets**: The system automatically keeps only 8 recent sheets
- **Sheet naming conflicts**: Each week gets a unique date-based name
- **Missing data**: Check that the service account has Editor permissions

### Debug Information

The system includes comprehensive logging:
- Check Apps Script logs in the **Executions** tab
- GitHub Actions logs show detailed execution information
- Python script includes verbose logging for weekly sheet creation

## Data Structure

### Google Apps Script Method:
The Google Sheet will contain the following columns:

| Column | Description |
|--------|-------------|
| War ID | Unique identifier for the war |
| Status | Preparing/Active/Finished |
| Start Date | When the war began |
| End Date | When the war ended (if finished) |
| Duration | How long the war lasted |
| Target Score | Score needed to win |
| Faction 1 ID | First faction's ID |
| Faction 1 Name | First faction's name |
| Faction 1 Score | First faction's score |
| Faction 1 Chain | First faction's chain |
| Faction 2 ID | Second faction's ID |
| Faction 2 Name | Second faction's name |
| Faction 2 Score | Second faction's score |
| Faction 2 Chain | Second faction's chain |
| Total Score | Combined score of both factions |
| Winner Faction ID | ID of the winning faction |
| Last Updated | When this row was last updated |

### Python Method (Weekly Sheets):
Each weekly sheet contains:

| Row | Content |
|-----|---------|
| 1 | Sheet creation timestamp |
| 2 | Data representation date |
| 3 | Empty row |
| 4 | Headers (same as above) |
| 5+ | War data |

## Security Considerations

- Never commit API keys or credentials to your repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate your Torn API key
- Monitor your Google Cloud Console for unusual activity
- Consider limiting service account permissions to only what's necessary

## Maintenance

- The system automatically runs every Tuesday at 12:15 PM UTC
- **Weekly sheets are created automatically** with date labeling
- **Old sheets are automatically cleaned up** (keeps 8 most recent)
- You can manually trigger updates using the workflow dispatch feature
- Monitor GitHub Actions for any failures
- Check the Google Sheet regularly to ensure new weekly sheets are being created
- Keep your Torn API key and Google credentials up to date

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in GitHub Actions and Apps Script
3. Verify all API keys and credentials are correct
4. Ensure all required APIs are enabled in Google Cloud Console
5. For weekly sheet issues, check the service account permissions and sheet access
