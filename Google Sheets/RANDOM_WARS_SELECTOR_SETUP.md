# Random Wars Selector - Setup Guide

This guide explains how to set up and use the Random Wars Selector script that randomly selects 10 wars from your Torn Wars Data sheet that haven't started yet (Duration = "0m") and creates a new sheet with the selected data.

## Overview

The Random Wars Selector script:
- Reads data from the "Torn Wars Data (Apps Script)" sheet
- **Filters for wars that haven't started yet** (Duration = "0m")
- Randomly selects 10 unstarted wars (or fewer if less than 10 unstarted wars exist)
- **Fetches historical faction data** from Torn API for all selected factions
- Creates a new sheet called "Random Wars Sample" with enhanced data including:
  - Original war data
  - Faction historical statistics (Wars Won, Wars Lost, Win Rate)
- Maintains all the original formatting and hyperlinks

## Setup Instructions

### 1. Add the Script to Your Google Sheets

1. Open your Google Sheets document that contains the "Torn Wars Data (Apps Script)" sheet
2. Go to **Extensions** → **Apps Script**
3. In the Apps Script editor, create a new script file:
   - Click the **+** button next to "Files"
   - Select **Script**
   - Name it `random_wars_selector.gs`
4. Copy the entire contents of the `random_wars_selector.gs` file into this new script
5. Save the script (Ctrl+S or Cmd+S)

### 2. Run the Script

#### Option A: Manual Execution
1. In the Apps Script editor, select the `selectRandomWars` function from the function dropdown
2. Click the **Run** button (▶️)
3. Grant permissions when prompted
4. The script will create a new sheet called "Random Wars Sample" with 10 randomly selected wars

#### Option B: Using the Manual Function
1. Select the `runRandomWarsSelection` function from the function dropdown
2. Click the **Run** button
3. This function provides additional logging and returns detailed results

### 3. Verify Results

After running the script:
1. Return to your Google Sheets document
2. You should see a new sheet called "Random Wars Sample"
3. The sheet will contain:
   - Headers in green (to distinguish from the source sheet)
   - Up to 10 randomly selected wars with all their data
   - Properly formatted dates and times
   - Hyperlinked faction names

## Available Functions

### Main Functions

- **`selectRandomWars()`** - Main function that performs the random selection and sheet creation
- **`runRandomWarsSelection()`** - Manual execution function with enhanced logging

### Scheduling Functions

- **`setupRandomWarsSchedule()`** - Set up automatic execution every Tuesday at 1:00 PM UTC
- **`removeRandomWarsSchedule()`** - Remove the scheduled trigger
- **`getTriggerInfo()`** - Get information about existing triggers

### Utility Functions

- **`getSourceSheetInfo()`** - Get information about the source sheet (number of wars available, etc.)
- **`deleteRandomWarsSheet()`** - Delete the "Random Wars Sample" sheet if it exists

### Debug Functions

- **`testFactionData(factionId)`** - Test faction data retrieval for a specific faction ID
- **`testMultipleFactions()`** - Test faction data for multiple sample factions
- **`quickTest()`** - Quick test of faction 9100 (The Black Hand) to verify functionality

## Automatic Scheduling

### Set Up Weekly Automation

To automatically run the random wars selection every Tuesday at 1:00 PM UTC:

1. In the Apps Script editor, select the `setupRandomWarsSchedule` function
2. Click the **Run** button (▶️)
3. Grant permissions when prompted
4. The script will now automatically run every Tuesday at 1:00 PM UTC

### Manage Scheduling

- **Check existing triggers**: Run `getTriggerInfo()` to see current scheduled triggers
- **Remove scheduling**: Run `removeRandomWarsSchedule()` to stop automatic execution
- **Re-setup scheduling**: Run `setupRandomWarsSchedule()` again to update the schedule

### Schedule Details

- **Frequency**: Every Tuesday
- **Time**: 1:00 PM UTC (13:00)
- **Function**: Runs `selectRandomWars()` automatically
- **Overwrites**: Each run will overwrite the previous "Random Wars Sample" sheet
- **Email Notifications**: Automatically sends email to oowol003@gmail.com with results

## Configuration

You can modify these constants at the top of the script:

```javascript
const SOURCE_SHEET_NAME = 'Torn Wars Data (Apps Script)';  // Name of source sheet
const TARGET_SHEET_NAME = 'Random Wars Sample';            // Name of target sheet
const NUM_WARS_TO_SELECT = 10;                             // Number of wars to select
const NOTIFICATION_EMAIL = 'oowol003@gmail.com';          // Email for notifications
```

## How It Works

1. **Data Reading**: The script reads all data from the "Torn Wars Data (Apps Script)" sheet
2. **Filtering**: Filters for wars that haven't started yet (Duration = "0m")
3. **Random Selection**: Uses the Fisher-Yates shuffle algorithm to randomly select from unstarted wars only
4. **Faction Data Retrieval**: Fetches historical faction data from Torn API for all selected factions
5. **Sheet Creation**: Creates or updates the "Random Wars Sample" sheet with enhanced headers
6. **Data Enhancement**: Combines original war data with faction statistics:
   - Faction 1 Wars Won, Wars Lost, Win Rate
   - Faction 2 Wars Won, Wars Lost, Win Rate
7. **Formatting**: Applies the same formatting as the source sheet, including:
   - Date formatting (yyyy-mm-dd)
   - Time formatting
   - Hyperlinks for faction names
   - Auto-resized columns
8. **Email Notification**: Sends detailed email notification to oowol003@gmail.com with results

## Features

- **Smart Filtering**: Only selects wars that haven't started yet (Duration = "0m")
- **Random Selection**: Truly random selection using proper shuffling algorithm
- **Historical Data**: Fetches faction war statistics from Torn API
- **Enhanced Data**: Includes Wars Won, Wars Lost, and Win Rate for each faction
- **Data Integrity**: Preserves all original data and formatting
- **Hyperlinks**: Maintains faction name hyperlinks to Torn.com
- **Flexible**: Works with any number of unstarted wars (selects all if less than 10)
- **Safe**: Creates new sheet without modifying the original data
- **Reusable**: Can be run multiple times to get different random selections
- **Email Notifications**: Automatically sends detailed email reports to oowol003@gmail.com
- **Error Handling**: Sends error notifications if the script encounters issues

## Email Notifications

### Success Notifications

When the script runs successfully, you'll receive an email with:
- **Selection Summary**: Number of wars selected and timestamp
- **Selected War IDs**: List of all selected war IDs
- **Process Details**: What the script accomplished including faction data retrieval
- **Enhanced Data Information**: Details about new faction statistics columns
- **Access Information**: Link to view results in Google Sheets

### Error Notifications

If the script encounters an error, you'll receive an email with:
- **Error Details**: Specific error message and timestamp
- **Troubleshooting Steps**: Common solutions to try
- **Common Issues**: List of frequent problems and fixes

### Email Configuration

- **Recipient**: oowol003@gmail.com (configurable in script)
- **Frequency**: Every time the script runs (manual or scheduled)
- **Format**: Plain text with emojis for easy reading
- **Subject**: Clear indication of success or failure

## Enhanced Data Structure

### New Columns Added

The script now includes additional faction statistics columns:

**Faction 1 Statistics:**
- **Faction 1 Wars Won**: Total number of wars won by Faction 1
- **Faction 1 Wars Lost**: Total number of wars lost by Faction 1  
- **Faction 1 Win Rate**: Percentage of wars won (calculated as Wins/(Wins+Losses)*100)

**Faction 2 Statistics:**
- **Faction 2 Wars Won**: Total number of wars won by Faction 2
- **Faction 2 Wars Lost**: Total number of wars lost by Faction 2
- **Faction 2 Win Rate**: Percentage of wars won (calculated as Wins/(Wins+Losses)*100)

### Data Source

- **API Endpoint**: `https://api.torn.com/faction/{faction_id}?selections=rankedwars&key={api_key}`
- **Data Type**: Historical ranked wars data from Torn API
- **Update Frequency**: Fetched fresh each time the script runs
- **Error Handling**: Shows "N/A" if faction data cannot be retrieved

### Column Layout

The enhanced sheet now has 25 columns total:
1. War ID, Status, Start Date, Start Time, End Date, End Time, Duration, Target Score
2. Faction 1 ID, Faction 1 Name, Faction 1 Score, Faction 1 Chain
3. **Faction 1 Wars Won, Faction 1 Wars Lost, Faction 1 Win Rate** (NEW)
4. Faction 2 ID, Faction 2 Name, Faction 2 Score, Faction 2 Chain  
5. **Faction 2 Wars Won, Faction 2 Wars Lost, Faction 2 Win Rate** (NEW)
6. Total Score, Winner Faction ID, Last Updated Date, Last Updated Time

## Troubleshooting

### Common Issues

1. **"Source sheet not found"**
   - Ensure the "Torn Wars Data (Apps Script)" sheet exists
   - Check that the sheet name matches exactly (case-sensitive)

2. **"No data found in source sheet"**
   - Make sure the source sheet has data rows (not just headers)
   - Run the main Torn Wars updater script first to populate data

3. **"No unstarted wars found"**
   - This means all wars in your sheet have already started (Duration > "0m")
   - Wait for new wars to be added or check if the Duration column format is correct
   - Use `getSourceSheetInfo()` to see how many unstarted wars are available

4. **Permission errors**
   - Grant all requested permissions when prompted
   - Ensure you have edit access to the Google Sheets document

5. **Script execution timeout**
   - If you have a very large dataset, the script might timeout
   - Consider reducing the number of wars to select

6. **Email notification issues**
   - Check if you have granted email permissions to the script
   - Verify the email address is correct in the script configuration
   - Check your spam folder for notifications

7. **Faction data shows "N/A"**
   - This indicates the faction data could not be retrieved from Torn API
   - Check if the faction ID is valid and the faction exists
   - Verify your Torn API key has proper permissions
   - The script will continue to work even if some faction data is unavailable

8. **Faction data shows all zeros (0 wins, 0 losses, 0% win rate)**
   - This may indicate an issue with the API response parsing
   - Use `testFactionData(factionId)` to debug a specific faction
   - Use `testMultipleFactions()` to test several factions at once
   - Check the Apps Script execution log for detailed API response information

### Getting Help

- Check the Apps Script execution log for detailed error messages
- Use `getSourceSheetInfo()` to verify your source sheet has data
- Use `runRandomWarsSelection()` for detailed logging output

## Example Usage

```javascript
// Get information about available wars
const info = getSourceSheetInfo();
console.log(info);

// Select random wars manually
const result = selectRandomWars();
console.log(result);

// Set up automatic scheduling (Tuesday 1:00 PM UTC)
const scheduleResult = setupRandomWarsSchedule();
console.log(scheduleResult);

// Check existing triggers
const triggerInfo = getTriggerInfo();
console.log(triggerInfo);

// Remove scheduling
const removeResult = removeRandomWarsSchedule();
console.log(removeResult);

// Delete the sample sheet
const deleteResult = deleteRandomWarsSheet();
console.log(deleteResult);

// Debug faction data issues
const testResult = testFactionData(937); // Test specific faction
console.log(testResult);

// Test multiple factions
const multiTestResult = testMultipleFactions();
console.log(multiTestResult);
```

## Notes

- The script will overwrite the "Random Wars Sample" sheet if it already exists
- Each run will select a different random set of **unstarted wars only**
- The selection is truly random and unbiased from the filtered pool
- All original data formatting and hyperlinks are preserved
- The script is designed to work alongside the main Torn Wars updater script
- **Important**: Only wars with Duration = "0m" will be selected (wars that haven't started yet)
- **Email Notifications**: You'll receive email updates at oowol003@gmail.com for both successful runs and errors
- **Enhanced Data**: Each run now includes historical faction statistics fetched from Torn API
- **API Integration**: Uses the same Torn API key as your main wars updater script
