# Torn Wars Apps Script Setup Guide

This guide will walk you through setting up the Google Apps Script version of the Torn Wars tracker to compare with your existing GitHub Actions implementation.

## Overview

The Apps Script version provides:
- **15-minute updates** (vs. weekly GitHub Actions)
- **Same data structure** as your existing setup
- **Built-in comparison tools** to evaluate both approaches
- **Independent operation** that won't interfere with GitHub Actions

## Prerequisites

- A Torn API key (same one used for Xanax logs)
- A Google account with access to Google Sheets
- The Google Apps Script code from `torn_wars_apps_script.gs`

## Setup Steps

### Step 1: Create or Open Google Sheet

1. **Option A**: Use the same Google Sheet as your Xanax logs tracker
2. **Option B**: Create a new Google Sheet for wars comparison
3. Keep the sheet open (required for Apps Script)

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Click the **+** button next to "Files" to create a new script
3. Name it "Torn Wars Apps Script"
4. Delete the default code and paste the code from `torn_wars_apps_script.gs`
5. Save the script (Ctrl+S or Cmd+S)

### Step 3: Verify API Key

Since you already set up the `TORN_API_KEY` for your Xanax logs, this should work automatically. If not:

1. In Apps Script, go to **Project Settings** (gear icon)
2. Under **Script Properties**, verify `TORN_API_KEY` exists
3. If missing, add it with your Torn API key

### Step 4: Test the Setup

1. **Test API Connection**:
   - Select `testApiConnection` from the function dropdown
   - Click **Run** (▶️)
   - Check execution log for success message

2. **Test Manual Update**:
   - Select `manualUpdate` from the function dropdown
   - Click **Run**
   - Check your Google Sheet for the new "Torn Wars Data (Apps Script)" tab

### Step 5: Set Up Automation

1. **Create Triggers**:
   - Select `setupTriggers` from the function dropdown
   - Click **Run**
   - This creates a trigger that runs every 15 minutes

2. **Verify Triggers**:
   - Go to **Triggers** section (clock icon ⏰ in left sidebar)
   - Confirm you see a trigger for `updateTornWarsSheet` running every 15 minutes

## Data Structure

The Apps Script version creates a sheet with identical structure to your GitHub Actions version:

| Column | Description | Example |
|--------|-------------|---------|
| War ID | Unique war identifier | 12345 |
| Status | Preparing/Active/Finished | Active |
| Start Date | When war began | 2024-01-16 12:00:00 |
| End Date | When war ended | 2024-01-16 18:00:00 |
| Duration | War length | 6h 0m |
| Target Score | Score needed to win | 1000 |
| Faction 1 ID | First faction ID | 12345 |
| Faction 1 Name | First faction name | Example Faction |
| Faction 1 Score | First faction score | 500 |
| Faction 1 Chain | First faction chain | 25 |
| Faction 2 ID | Second faction ID | 67890 |
| Faction 2 Name | Second faction name | Other Faction |
| Faction 2 Score | Second faction score | 300 |
| Faction 2 Chain | Second faction chain | 15 |
| Total Score | Combined score | 800 |
| Winner Faction ID | Winning faction ID | 12345 |
| Last Updated | When row was updated | 2024-01-16 12:15:00 |

## Comparison Features

### Built-in Comparison Function

Run `compareWithGitHubActions()` to compare both approaches:

1. **Select the function** from the dropdown
2. **Click Run**
3. **Check execution log** for comparison results

The function will show:
- Number of wars in each sheet
- Any differences between the two approaches
- Whether both systems are working correctly

### Manual Comparison

You can also manually compare:

1. **Sheet Names**:
   - GitHub Actions: "Torn Wars Data"
   - Apps Script: "Torn Wars Data (Apps Script)"

2. **Update Frequency**:
   - GitHub Actions: Weekly (Tuesday 12:15 PM UTC)
   - Apps Script: Every 15 minutes

3. **Data Freshness**:
   - Check "Last Updated" timestamps in both sheets
   - Apps Script should show much more recent updates

## Testing and Validation

### Initial Testing

1. **Run both systems**:
   - GitHub Actions: Wait for next Tuesday run or trigger manually
   - Apps Script: Run `manualUpdate()` immediately

2. **Compare results**:
   - Check war counts match
   - Verify data structure is identical
   - Confirm no interference between systems

### Ongoing Monitoring

1. **Check execution logs** in Apps Script
2. **Monitor trigger execution** in Triggers section
3. **Compare data freshness** between sheets
4. **Run comparison function** periodically

## Troubleshooting

### Common Issues

#### "Torn API key not found" Error
- Ensure `TORN_API_KEY` script property exists
- Check that the API key is valid
- Verify you're using the same script project

#### "No active spreadsheet found" Error
- Make sure you're running from within a Google Sheet
- Ensure the sheet is open and accessible
- Check that Apps Script is connected to the correct sheet

#### "Torn API Error" Messages
- Check your Torn API key permissions
- Verify the API key hasn't expired
- Check Torn's API status

#### No Data Appearing
- Verify the script is running at scheduled times
- Check execution logs for errors
- Ensure your Torn account has active wars

#### Sheet Creation Issues
- Check if sheet name conflicts exist
- Verify Apps Script has permission to create sheets
- Ensure the spreadsheet is not protected

### Debug Functions

- `testApiConnection()`: Tests API connectivity
- `manualUpdate()`: Manually triggers update
- `clearAllData()`: Clears all data (keeps headers)
- `compareWithGitHubActions()`: Compares with GitHub Actions data

## Performance Comparison

### GitHub Actions Advantages
- **Weekly sheets**: Historical data preservation
- **External execution**: Runs even when Google Sheets is closed
- **Advanced logging**: GitHub Actions execution history
- **Service account**: More secure credential management

### Apps Script Advantages
- **Frequent updates**: 15-minute vs. weekly
- **Real-time data**: Near-instant updates
- **Integrated**: Runs within Google ecosystem
- **Simpler setup**: No external dependencies
- **Cost-effective**: No GitHub Actions minutes consumed

### When to Use Each

**Use GitHub Actions when**:
- You need historical data preservation
- Weekly updates are sufficient
- You want external execution
- You prefer Python-based processing

**Use Apps Script when**:
- You need real-time updates
- 15-minute frequency is required
- You want integrated Google ecosystem
- Simpler setup is preferred

## Maintenance

### Apps Script Maintenance
- **Automatic execution**: Runs every 15 minutes
- **No manual intervention**: Fully automated
- **Monitor logs**: Check execution history regularly
- **API key rotation**: Update when needed

### Comparison Maintenance
- **Regular checks**: Run comparison function weekly
- **Data validation**: Ensure both systems produce identical results
- **Performance monitoring**: Track execution times and success rates
- **Decision making**: Use comparison data to choose best approach

## Quick Start Checklist

- [ ] Create/open Google Sheet
- [ ] Set up Apps Script with `torn_wars_apps_script.gs`
- [ ] Verify API key exists
- [ ] Test API connection with `testApiConnection()`
- [ ] Test manual update with `manualUpdate()`
- [ ] Set up automatic triggers with `setupTriggers()`
- [ ] Verify triggers are created
- [ ] Run comparison with `compareWithGitHubActions()`
- [ ] Monitor first few automatic runs
- [ ] Compare results with GitHub Actions data

## Next Steps

After setup:

1. **Let both systems run** for at least a week
2. **Compare data quality** and update frequency
3. **Evaluate performance** and reliability
4. **Choose the best approach** for your needs
5. **Scale up** the preferred solution

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review execution logs in Apps Script
3. Verify your Torn API key is valid
4. Ensure the Google Sheet is accessible
5. Test with manual functions first
6. Compare with your working GitHub Actions setup

The Apps Script version gives you a perfect opportunity to evaluate both approaches side-by-side and choose the one that works best for your Torn wars tracking needs!
