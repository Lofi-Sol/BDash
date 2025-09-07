# Google Sheets Functions Documentation

This document provides a comprehensive overview of all functions in the Random Wars Selector Google Apps Script.

## Configuration Constants

```javascript
const SOURCE_SHEET_NAME = 'Torn Wars Data (Apps Script)';
const TARGET_SHEET_NAME = 'Random Wars Sample';
const NUM_WARS_TO_SELECT = 10;
const DURATION_COLUMN_INDEX = 6; // Duration column (0-based index)
const NOTIFICATION_EMAIL = 'oowol003@gmail.com';
```

## Core Functions

### 1. `isBeforeTuesday()`
**Purpose**: Checks if the current day is before Tuesday
**Returns**: `boolean` - true if before Tuesday, false if Tuesday or later
**Usage**: Used to determine whether to show the selection prompt

### 2. `showSelectionPrompt()`
**Purpose**: Shows a dialog asking user whether to select new wars or update existing ones
**Returns**: `string` - 'new', 'update', or 'cancel'
**Usage**: Called when running before Tuesday to let user choose action

### 3. `selectRandomWars()`
**Purpose**: Main function that randomly selects wars and creates/updates the target sheet
**Returns**: `object` with success status, message, and selected war IDs
**Usage**: Primary function for war selection - can be run manually or scheduled

## Data Processing Functions

### 4. `getSourceSheetData(sourceSheet)`
**Purpose**: Retrieves all data from the source sheet (excluding header)
**Parameters**: `sourceSheet` - The source sheet object
**Returns**: `array` - 2D array of war data
**Usage**: Internal function to get raw data from source

### 5. `filterUnstartedWars(sourceData)`
**Purpose**: Filters wars to only include those that haven't started (Duration = "0m")
**Parameters**: `sourceData` - Array of war data
**Returns**: `array` - Filtered array of unstarted wars
**Usage**: Internal function to filter for eligible wars

### 6. `selectRandomWarsFromData(sourceData)`
**Purpose**: Randomly selects wars from the provided data using Fisher-Yates algorithm
**Parameters**: `sourceData` - Array of war data to select from
**Returns**: `array` - Array of randomly selected wars
**Usage**: Internal function for random selection logic

## Sheet Management Functions

### 7. `createOrUpdateTargetSheet(spreadsheet)`
**Purpose**: Creates a new target sheet or clears existing data from current sheet
**Parameters**: `spreadsheet` - The spreadsheet object
**Returns**: `object` - The target sheet object
**Usage**: Internal function to prepare the target sheet

### 8. `setupTargetSheetHeaders(sheet)`
**Purpose**: Sets up headers and formatting for the target sheet with color-coded column groups
**Parameters**: `sheet` - The target sheet object
**Returns**: `void`
**Usage**: Internal function to format the sheet headers

### 9. `copyWarsDataToTarget(targetSheet, selectedWars)`
**Purpose**: Copies selected wars data to target sheet with enhanced faction statistics
**Parameters**: 
- `targetSheet` - The target sheet object
- `selectedWars` - Array of selected war data
**Returns**: `void`
**Usage**: Internal function to populate the target sheet with data

### 10. `addFactionHyperlinksToTarget(sheet, numRows)`
**Purpose**: Adds hyperlinks to faction names in the target sheet
**Parameters**: 
- `sheet` - The target sheet object
- `numRows` - Number of data rows
**Returns**: `void`
**Usage**: Internal function to add clickable faction links

## API Integration Functions

### 11. `fetchFactionData(factionId)`
**Purpose**: Fetches faction historical data from Torn API
**Parameters**: `factionId` - The faction ID to fetch data for
**Returns**: `object` - Parsed API response data
**Usage**: Internal function to get faction war history

### 12. `fetchFactionHOFData(factionId)`
**Purpose**: Fetches faction Hall of Fame data from Torn API v2
**Parameters**: `factionId` - The faction ID to fetch data for
**Returns**: `object` - Parsed API response data
**Usage**: Internal function to get faction HOF statistics

### 13. `getFactionWarStats(factionId)`
**Purpose**: Calculates faction war statistics from historical data
**Parameters**: `factionId` - The faction ID to analyze
**Returns**: `object` - Object with warsWon, warsLost, and winRate
**Usage**: Internal function to compute war statistics

### 14. `getFactionHOFStats(factionId)`
**Purpose**: Extracts Hall of Fame statistics for a faction
**Parameters**: `factionId` - The faction ID to analyze
**Returns**: `object` - Object with rank, respect, and chain values/positions
**Usage**: Internal function to get HOF data

## Update Functions

### 15. `updateExistingWarsData()`
**Purpose**: Updates existing wars data without changing the selected war IDs
**Returns**: `object` with success status and update details
**Usage**: **This is the function you asked about!** Use this to update data without changing selected wars

## Email Notification Functions

### 16. `sendNotificationEmail(selectedWarsCount, selectedWarIds)`
**Purpose**: Sends success notification email when wars are selected
**Parameters**: 
- `selectedWarsCount` - Number of wars selected
- `selectedWarIds` - Array of selected war IDs
**Returns**: `void`
**Usage**: Internal function for success notifications

### 17. `sendErrorNotificationEmail(errorMessage)`
**Purpose**: Sends error notification email when script fails
**Parameters**: `errorMessage` - The error message to include
**Returns**: `void`
**Usage**: Internal function for error notifications

### 18. `sendUpdateNotificationEmail(updatedWarsCount, updatedWarIds, notFoundWarIds)`
**Purpose**: Sends notification email when existing wars are updated
**Parameters**: 
- `updatedWarsCount` - Number of wars updated
- `updatedWarIds` - Array of updated war IDs
- `notFoundWarIds` - Array of war IDs not found in source
**Returns**: `void`
**Usage**: Internal function for update notifications

## Scheduling Functions

### 19. `setupRandomWarsSchedule()`
**Purpose**: Sets up automated trigger to run every Tuesday at 1:00 PM UTC
**Returns**: `object` with success status and schedule details
**Usage**: Run once to enable automatic scheduling

### 20. `removeRandomWarsSchedule()`
**Purpose**: Removes the scheduled trigger for random wars selection
**Returns**: `object` with success status and removal details
**Usage**: Run to disable automatic scheduling

### 21. `getTriggerInfo()`
**Purpose**: Gets information about existing triggers
**Returns**: `object` with trigger details and counts
**Usage**: Check current trigger status

## Utility Functions

### 22. `deleteRandomWarsSheet()`
**Purpose**: Deletes the target sheet if it exists
**Returns**: `object` with success status and message
**Usage**: Clean up function to remove the target sheet

### 23. `getSourceSheetInfo()`
**Purpose**: Gets information about the source sheet including data counts
**Returns**: `object` with sheet statistics
**Usage**: Diagnostic function to check source data availability

## Test Functions

### 24. `testFactionData(factionId)`
**Purpose**: Test function to debug faction data for a specific faction
**Parameters**: `factionId` - The faction ID to test
**Returns**: `object` with faction statistics or error
**Usage**: Debug function for testing faction data retrieval

### 25. `testMultipleFactions()`
**Purpose**: Test function to debug faction data for multiple factions
**Returns**: `object` with results for multiple test factions
**Usage**: Debug function for batch testing

### 26. `quickTest()`
**Purpose**: Quick test function for a single faction (The Black Hand)
**Returns**: `object` with test results
**Usage**: Quick debug function

### 27. `testFactionHOFData(factionId)`
**Purpose**: Test function to debug HOF data for a specific faction
**Parameters**: `factionId` - The faction ID to test
**Returns**: `object` with HOF statistics or error
**Usage**: Debug function for testing HOF data retrieval

### 28. `testMultipleFactionsHOF()`
**Purpose**: Test function to debug HOF data for multiple factions
**Returns**: `object` with HOF results for multiple test factions
**Usage**: Debug function for batch HOF testing

### 29. `quickTestHOF()`
**Purpose**: Quick test function for HOF data
**Returns**: `object` with HOF test results
**Usage**: Quick debug function for HOF data

### 30. `testRandomWarsSelection()`
**Purpose**: Test the main random wars selection function
**Returns**: `void`
**Usage**: Debug function to test the main selection process

### 31. `runRandomWarsSelection()`
**Purpose**: Manual function to run the random selection with logging
**Returns**: `object` with selection results
**Usage**: Manual testing function with detailed logging

### 32. `testBeforeTuesdayPrompt()`
**Purpose**: Test function to simulate running before Tuesday (shows prompt)
**Returns**: `object` with user choice and message
**Usage**: Debug function to test the prompt dialog

### 33. `testDayCheck()`
**Purpose**: Test function to check current day and show what would happen
**Returns**: `object` with day information and behavior
**Usage**: Debug function to check day-based logic

## How to Use Key Functions

### To Update Data Without Changing Selected Wars:
```javascript
updateExistingWarsData()
```

### To Run New Random Selection:
```javascript
selectRandomWars()
```

### To Set Up Automatic Scheduling:
```javascript
setupRandomWarsSchedule()
```

### To Check Source Data:
```javascript
getSourceSheetInfo()
```

### To Test Faction Data:
```javascript
testFactionData(9100) // Replace with actual faction ID
```

## Data Structure

The script works with wars data that includes:
- **Basic War Info**: War ID, Status, Start/End dates and times, Duration, Target Score
- **Faction 1 Data**: ID, Name, Score, Chain, Wars Won, Wars Lost, Win Rate, Rank Value, Respect Value, HOF Chain Value
- **Faction 2 Data**: ID, Name, Score, Chain, Wars Won, Wars Lost, Win Rate, Rank Value, Respect Value, HOF Chain Value
- **War Results**: Total Score, Winner Faction ID
- **Metadata**: Last Updated Date and Time

## Error Handling

All functions include comprehensive error handling with:
- Try-catch blocks for API calls
- Validation of input parameters
- Detailed error logging
- Email notifications for failures
- Graceful fallbacks for missing data

## API Requirements

The script requires:
- Torn API key set in script properties as `TORN_API_KEY`
- Access to Torn API v1 for faction war data
- Access to Torn API v2 for Hall of Fame data
- Proper permissions for Google Sheets and Gmail services
