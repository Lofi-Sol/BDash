# Torn Xanax Logs Tracker - Setup Guide

This guide will walk you through setting up an automated system that tracks Xanax (ID 206) "Item receive" logs from Torn 4 times a day.

## Overview

The system automatically:
- Pulls Torn logs 4 times daily (6 AM, 12 PM, 6 PM, 12 AM UTC)
- Filters for "Item receive" logs containing Xanax (ID 206)
- Stores data in a Google Sheet with the following columns:
  - Log ID (unique identifier)
  - Date (formatted timestamp)
  - Timestamp (Unix timestamp)
  - Sender ID
  - Quantity
  - Message
  - Log Entry ID
  - Category
  - Last Updated

## Prerequisites

- A Torn API key
- A Google account with access to Google Sheets
- The Google Apps Script code provided above

## Setup Steps

### Step 1: Create Google Sheet

1. Create a new Google Sheet
2. Name it something like "Torn Xanax Logs Tracker"
3. Keep the sheet open (required for Apps Script)

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default code and paste the provided script
3. Save the script with a name like "Torn Xanax Logs Updater"

### Step 3: Set Torn API Key

1. In Apps Script, go to **Project Settings** (gear icon)
2. Under **Script Properties**, click **Add script property**
3. **Property**: `TORN_API_KEY`
4. **Value**: Your Torn API key
5. Click **Save**

### Step 4: Test the Setup

1. In Apps Script, run the `testApiConnection()` function
2. Check the execution logs to ensure API connection works
3. If successful, run `manualUpdate()` to test data fetching

### Step 5: Set Up Automation

1. In Apps Script, run the `setupTriggers()` function
2. This creates 4 daily triggers at 6 AM, 12 PM, 6 PM, and 12 AM UTC
3. Verify triggers are created in **Triggers** section

## Data Structure

The Google Sheet will contain:

| Column | Description | Example |
|--------|-------------|---------|
| Log ID | Unique log entry identifier | nGYPJScViWsuHJrOYFzr |
| Date | Formatted date/time | 2024-01-16 12:30:00 |
| Timestamp | Unix timestamp | 1756862761 |
| Sender ID | ID of sender | 3269031 |
| Quantity | Number of Xanax received | 1 |
| Message | Message from sender | "3" |
| Log Entry ID | Torn log ID | 4103 |
| Category | Log category | Item sending |
| Last Updated | When row was added | 2024-01-16 12:30:00 |

## Features

### Automatic Updates
- Runs 4 times daily automatically
- Only adds new logs (prevents duplicates)
- Maintains data integrity

### Data Filtering
- Only captures "Item receive" logs
- Only includes logs with Xanax (ID 206)
- Ignores other item types and log categories

### Sheet Management
- Automatically creates sheet if it doesn't exist
- Proper formatting and headers
- Alternating row colors for readability
- Auto-sized columns

## Testing

### Manual Testing
1. Run `manualUpdate()` to test data fetching
2. Run `testApiConnection()` to verify API access
3. Check execution logs for any errors

### Trigger Testing
1. Check **Triggers** section in Apps Script
2. Verify 4 daily triggers are set up
3. Monitor execution history

## Troubleshooting

### Common Issues

#### "Torn API key not found" Error
- Ensure you've set the `TORN_API_KEY` script property
- Check that the API key is valid

#### "No active spreadsheet found" Error
- Make sure you're running the script from within a Google Sheet
- Ensure the sheet is open and accessible

#### "Torn API Error" Messages
- Check your Torn API key permissions
- Verify the API key hasn't expired
- Check Torn's API status

#### No Data Appearing
- Verify the script is running at scheduled times
- Check execution logs for errors
- Ensure your Torn account has "Item receive" logs

### Debug Functions

- `testApiConnection()`: Tests API connectivity
- `manualUpdate()`: Manually triggers update
- `clearAllData()`: Clears all data (keeps headers)

## Maintenance

- The system automatically runs 4 times daily
- No manual intervention required
- Monitor execution logs for any failures
- Keep your Torn API key up to date

## Security Considerations

- Never share your Torn API key
- The script only reads your Torn logs
- No sensitive data is stored beyond what's in the logs
- Consider API key rotation for security

## Customization

You can modify the script to:
- Change update frequency (modify `setupTriggers()`)
- Track different items (change `XANAX_ITEM_ID`)
- Add more data fields
- Modify sheet formatting

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review execution logs in Apps Script
3. Verify your Torn API key is valid
4. Ensure the Google Sheet is accessible
5. Test with manual functions first

## Quick Start Checklist

- [ ] Create new Google Sheet
- [ ] Open Apps Script and paste code
- [ ] Set Torn API key as script property
- [ ] Test API connection with `testApiConnection()`
- [ ] Test manual update with `manualUpdate()`
- [ ] Set up automatic triggers with `setupTriggers()`
- [ ] Verify triggers are created
- [ ] Monitor first few automatic runs

## Example Data

Based on your sample logs, the sheet will capture entries like:

| Log ID | Date | Timestamp | Sender ID | Quantity | Message | Log Entry ID | Category | Last Updated |
|--------|------|-----------|-----------|----------|---------|--------------|----------|--------------|
| nGYPJScViWsuHJrOYFzr | 2024-01-16 12:30:00 | 1756862761 | 3269031 | 1 | 3 | 4103 | Item sending | 2024-01-16 12:30:00 |
| oUo8zA4nqYS511qDpaGK | 2024-01-16 12:30:00 | 1756862749 | 3269031 | 1 | 2 | 4103 | Item sending | 2024-01-16 12:30:00 |
| jEQgfKWYp13G28IJ1OA | 2024-01-16 12:30:00 | 1756862738 | 3269031 | 1 | 1 | 4103 | Item sending | 2024-01-16 12:30:00 |

The system will automatically filter out non-Xanax logs and only track the "Item receive" entries with ID 206.
