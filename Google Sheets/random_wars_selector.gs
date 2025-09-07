/**
 * Random Wars Selector - Google Apps Script
 * This script randomly selects 10 wars from the Torn Wars Data sheet
 * that haven't started yet (Duration = "0m") and duplicates their data 
 * into a new sheet called "Random Wars Sample"
 */

// Configuration
const SOURCE_SHEET_NAME = 'Torn Wars Data (Apps Script)';
const TARGET_SHEET_NAME = 'Random Wars Sample';
const NUM_WARS_TO_SELECT = 10;
const DURATION_COLUMN_INDEX = 6; // Duration column (0-based index)
const NOTIFICATION_EMAIL = 'oowol003@gmail.com';

/**
 * Check if current day is before Tuesday
 * Returns true if it's before Tuesday, false if it's Tuesday or later
 */
function isBeforeTuesday() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  
  // Tuesday is day 2, so if dayOfWeek < 2, it's before Tuesday
  return dayOfWeek < 2;
}

/**
 * Show prompt dialog asking user whether to select new wars or update existing
 */
function showSelectionPrompt() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Random Wars Selection',
    'It\'s before Tuesday. Would you like to:\n\n' +
    '• Select a NEW random set of wars (creates new selection)\n' +
    '• UPDATE the current set (keeps same wars, updates their data)\n\n' +
    'Click "Yes" for NEW selection, "No" to UPDATE current set, or "Cancel" to abort.',
    ui.ButtonSet.YES_NO_CANCEL
  );
  
  if (response === ui.Button.YES) {
    return 'new';
  } else if (response === ui.Button.NO) {
    return 'update';
  } else {
    return 'cancel';
  }
}

/**
 * Main function to select random wars and create a new sheet
 */
function selectRandomWars() {
  try {
    // Check if it's before Tuesday and show prompt if needed
    if (isBeforeTuesday()) {
      const userChoice = showSelectionPrompt();
      
      if (userChoice === 'cancel') {
        console.log('User cancelled the operation');
        return {
          success: false,
          message: 'Operation cancelled by user',
          timestamp: new Date().toISOString()
        };
      } else if (userChoice === 'update') {
        console.log('User chose to update existing wars');
        return updateExistingWarsData();
      }
      // If userChoice === 'new', continue with normal flow
    }
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Please run this from a Google Sheets document.');
    }
    
    // Get the source sheet
    const sourceSheet = spreadsheet.getSheetByName(SOURCE_SHEET_NAME);
    if (!sourceSheet) {
      throw new Error(`Source sheet "${SOURCE_SHEET_NAME}" not found. Please ensure the Torn Wars Data sheet exists.`);
    }
    
    // Get all data from the source sheet
    const sourceData = getSourceSheetData(sourceSheet);
    if (sourceData.length === 0) {
      throw new Error('No data found in the source sheet.');
    }
    
    // Filter for wars that haven't started (Duration = "0m")
    const unstartedWars = filterUnstartedWars(sourceData);
    if (unstartedWars.length === 0) {
      throw new Error('No unstarted wars found in the source sheet (Duration = "0m").');
    }
    
    console.log(`Found ${unstartedWars.length} unstarted wars out of ${sourceData.length} total wars`);
    
    // Select random wars from unstarted wars only
    const selectedWars = selectRandomWarsFromData(unstartedWars);
    console.log(`Selected ${selectedWars.length} random wars:`, selectedWars.map(war => war[0])); // Log war IDs
    
    // Create or update the target sheet
    const targetSheet = createOrUpdateTargetSheet(spreadsheet);
    
    // Copy selected wars data to target sheet
    copyWarsDataToTarget(targetSheet, selectedWars);
    
    // Log success
    console.log(`Successfully created "${TARGET_SHEET_NAME}" with ${selectedWars.length} random wars`);
    
    // Send email notification
    sendNotificationEmail(selectedWars.length, selectedWars.map(war => war[0]));
    
    return {
      success: true,
      message: `Created "${TARGET_SHEET_NAME}" with ${selectedWars.length} random wars`,
      selectedWarIds: selectedWars.map(war => war[0]),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error selecting random wars:', error);
    
    // Send error notification email
    sendErrorNotificationEmail(error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get all data from the source sheet (excluding header)
 */
function getSourceSheetData(sourceSheet) {
  const lastRow = sourceSheet.getLastRow();
  const lastCol = sourceSheet.getLastColumn();
  
  if (lastRow <= 1) {
    return []; // No data rows
  }
  
  // Get all data rows (skip header row)
  const dataRange = sourceSheet.getRange(2, 1, lastRow - 1, lastCol);
  const data = dataRange.getValues();
  
  console.log(`Found ${data.length} wars in source sheet`);
  return data;
}

/**
 * Filter wars to only include those that haven't started (Duration = "0m")
 */
function filterUnstartedWars(sourceData) {
  const unstartedWars = sourceData.filter(war => {
    const duration = war[DURATION_COLUMN_INDEX];
    return duration === '0m';
  });
  
  console.log(`Filtered to ${unstartedWars.length} unstarted wars (Duration = "0m")`);
  return unstartedWars;
}

/**
 * Select random wars from the data
 */
function selectRandomWarsFromData(sourceData) {
  const numWarsToSelect = Math.min(NUM_WARS_TO_SELECT, sourceData.length);
  
  if (numWarsToSelect === 0) {
    return [];
  }
  
  // Create array of indices
  const indices = Array.from({ length: sourceData.length }, (_, i) => i);
  
  // Shuffle the indices using Fisher-Yates algorithm
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // Select the first numWarsToSelect indices
  const selectedIndices = indices.slice(0, numWarsToSelect);
  
  // Get the corresponding war data
  const selectedWars = selectedIndices.map(index => sourceData[index]);
  
  return selectedWars;
}

/**
 * Create or update the target sheet
 */
function createOrUpdateTargetSheet(spreadsheet) {
  let targetSheet = spreadsheet.getSheetByName(TARGET_SHEET_NAME);
  
  if (targetSheet) {
    // Clear existing data but keep the sheet
    const lastRow = targetSheet.getLastRow();
    if (lastRow > 1) {
      targetSheet.getRange(2, 1, lastRow - 1, 20).clear();
    }
    console.log(`Cleared existing data from "${TARGET_SHEET_NAME}"`);
  } else {
    // Create new sheet
    targetSheet = spreadsheet.insertSheet(TARGET_SHEET_NAME);
    console.log(`Created new sheet: "${TARGET_SHEET_NAME}"`);
  }
  
  // Set up headers and formatting
  setupTargetSheetHeaders(targetSheet);
  
  return targetSheet;
}

/**
 * Set up headers and formatting for the target sheet
 */
function setupTargetSheetHeaders(sheet) {
  // Set headers (same as source sheet plus faction statistics and HOF data)
  const headers = [
    'War ID',
    'Status',
    'Start Date',
    'Start Time',
    'End Date',
    'End Time',
    'Duration',
    'Target Score',
    'Faction 1 ID',
    'Faction 1 Name',
    'Faction 1 Score',
    'Faction 1 Chain',
    'Faction 1 Wars Won',
    'Faction 1 Wars Lost',
    'Faction 1 Win Rate',
    'Faction 1 Rank Value',
    'Faction 1 Respect Value',
    'Faction 1 HOF Chain Value',
    'Faction 2 ID',
    'Faction 2 Name',
    'Faction 2 Score',
    'Faction 2 Chain',
    'Faction 2 Wars Won',
    'Faction 2 Wars Lost',
    'Faction 2 Win Rate',
    'Faction 2 Rank Value',
    'Faction 2 Respect Value',
    'Faction 2 HOF Chain Value',
    'Total Score',
    'Winner Faction ID',
    'Last Updated Date',
    'Last Updated Time'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers with different colors for each group
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setFontColor('white');
  headerRange.setHorizontalAlignment('center');
  
  // Define column groups and their colors
  const columnGroups = [
    { start: 1, end: 8, color: '#1f4e79', name: 'Basic War Data' },      // Dark blue
    { start: 9, end: 18, color: '#2e7d32', name: 'Faction 1' },         // Dark green
    { start: 19, end: 27, color: '#d32f2f', name: 'Faction 2' },        // Dark red
    { start: 28, end: 31, color: '#7b1fa2', name: 'Final Data' }        // Dark purple
  ];
  
  // Apply colors to each group
  columnGroups.forEach(group => {
    if (group.end <= headers.length) {
      const groupRange = sheet.getRange(1, group.start, 1, group.end - group.start + 1);
      groupRange.setBackground(group.color);
      console.log(`Applied ${group.color} color to ${group.name} columns (${group.start}-${group.end})`);
    }
  });
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Copy selected wars data to the target sheet with faction statistics
 */
function copyWarsDataToTarget(targetSheet, selectedWars) {
  if (selectedWars.length === 0) {
    return;
  }
  
  // Enhance selected wars data with faction statistics and HOF data
  const enhancedWarsData = selectedWars.map(war => {
    const faction1Id = war[8]; // Faction 1 ID column
    const faction2Id = war[12]; // Faction 2 ID column (original structure)
    
    // Get faction statistics and HOF data
    console.log(`Processing war ${war[0]}: Faction 1 ID = ${faction1Id}, Faction 2 ID = ${faction2Id}`);
    const faction1Stats = getFactionWarStats(faction1Id);
    const faction2Stats = getFactionWarStats(faction2Id);
    const faction1HOFStats = getFactionHOFStats(faction1Id);
    const faction2HOFStats = getFactionHOFStats(faction2Id);
    console.log(`Faction 1 stats:`, faction1Stats);
    console.log(`Faction 2 stats:`, faction2Stats);
    console.log(`Faction 1 HOF stats:`, faction1HOFStats);
    console.log(`Faction 2 HOF stats:`, faction2HOFStats);
    
    // Create enhanced row with faction statistics and HOF data
    const enhancedRow = [
      war[0], // War ID
      war[1], // Status
      war[2], // Start Date
      war[3], // Start Time
      war[4], // End Date
      war[5], // End Time
      war[6], // Duration
      war[7], // Target Score
      war[8], // Faction 1 ID
      war[9], // Faction 1 Name
      war[10], // Faction 1 Score
      war[11], // Faction 1 Chain
      faction1Stats.warsWon, // Faction 1 Wars Won
      faction1Stats.warsLost, // Faction 1 Wars Lost
      faction1Stats.winRate, // Faction 1 Win Rate
      faction1HOFStats.rankValue, // Faction 1 Rank Value
      faction1HOFStats.respectValue, // Faction 1 Respect Value
      faction1HOFStats.hofChainValue, // Faction 1 HOF Chain Value
      war[12], // Faction 2 ID
      war[13], // Faction 2 Name
      war[14], // Faction 2 Score
      war[15], // Faction 2 Chain
      faction2Stats.warsWon, // Faction 2 Wars Won
      faction2Stats.warsLost, // Faction 2 Wars Lost
      faction2Stats.winRate, // Faction 2 Win Rate
      faction2HOFStats.rankValue, // Faction 2 Rank Value
      faction2HOFStats.respectValue, // Faction 2 Respect Value
      faction2HOFStats.hofChainValue, // Faction 2 HOF Chain Value
      war[16], // Total Score
      war[17], // Winner Faction ID
      war[18], // Last Updated Date
      war[19]  // Last Updated Time
    ];
    
    return enhancedRow;
  });
  
  // Add enhanced data to sheet
  const range = targetSheet.getRange(2, 1, enhancedWarsData.length, enhancedWarsData[0].length);
  range.setValues(enhancedWarsData);
  
  // Format date columns (positions updated after removing all position columns)
  const startDateRange = targetSheet.getRange(2, 3, enhancedWarsData.length, 1);
  const endDateRange = targetSheet.getRange(2, 5, enhancedWarsData.length, 1);
  const lastUpdatedDateRange = targetSheet.getRange(2, 30, enhancedWarsData.length, 1);
  
  startDateRange.setNumberFormat('yyyy-mm-dd');
  endDateRange.setNumberFormat('yyyy-mm-dd');
  lastUpdatedDateRange.setNumberFormat('yyyy-mm-dd');
  
  // Format time columns (positions updated after removing all position columns)
  const startTimeRange = targetSheet.getRange(2, 4, enhancedWarsData.length, 1);
  const endTimeRange = targetSheet.getRange(2, 6, enhancedWarsData.length, 1);
  const lastUpdatedTimeRange = targetSheet.getRange(2, 31, enhancedWarsData.length, 1);
  
  startTimeRange.setNumberFormat('@');
  endTimeRange.setNumberFormat('@');
  lastUpdatedTimeRange.setNumberFormat('@');
  
  // Auto-resize columns
  targetSheet.autoResizeColumns(1, enhancedWarsData[0].length);
  
  // Add hyperlinks to faction names
  addFactionHyperlinksToTarget(targetSheet, enhancedWarsData.length);
  
  console.log(`Copied ${selectedWars.length} wars to target sheet`);
}

/**
 * Add hyperlinks to faction names in the target sheet
 */
function addFactionHyperlinksToTarget(sheet, numRows) {
  // Get all faction IDs and names at once for efficiency
  // Note: Column positions updated after removing all position columns
  const faction1Ids = sheet.getRange(2, 9, numRows, 1).getValues(); // Faction 1 ID column
  const faction1Names = sheet.getRange(2, 10, numRows, 1).getValues(); // Faction 1 Name column
  const faction2Ids = sheet.getRange(2, 19, numRows, 1).getValues(); // Faction 2 ID column (adjusted after removing 6 columns total)
  const faction2Names = sheet.getRange(2, 20, numRows, 1).getValues(); // Faction 2 Name column (adjusted after removing 6 columns total)
  
  // Process Faction 1 names
  for (let i = 0; i < numRows; i++) {
    const factionId = faction1Ids[i][0];
    const factionName = faction1Names[i][0];
    
    if (factionId && factionName && factionName !== 'Unknown') {
      const url = `https://www.torn.com/factions.php?step=profile&ID=${factionId}`;
      const cell = sheet.getRange(2 + i, 10);
      cell.setFormula(`=HYPERLINK("${url}","${factionName}")`);
    }
  }
  
  // Process Faction 2 names
  for (let i = 0; i < numRows; i++) {
    const factionId = faction2Ids[i][0];
    const factionName = faction2Names[i][0];
    
    if (factionId && factionName && factionName !== 'Unknown') {
      const url = `https://www.torn.com/factions.php?step=profile&ID=${factionId}`;
      const cell = sheet.getRange(2 + i, 20);
      cell.setFormula(`=HYPERLINK("${url}","${factionName}")`);
    }
  }
  
  console.log(`Added hyperlinks for ${numRows} rows in target sheet`);
}

/**
 * Test function to debug faction data for a specific faction
 */
function testFactionData(factionId) {
  if (!factionId) {
    console.error('No faction ID provided to testFactionData');
    return { error: 'No faction ID provided' };
  }
  
  console.log(`Testing faction data for ID: ${factionId}`);
  try {
    const stats = getFactionWarStats(factionId);
    console.log(`Faction ${factionId} stats:`, stats);
    return stats;
  } catch (error) {
    console.error(`Error testing faction ${factionId}:`, error);
    return { error: error.message };
  }
}

/**
 * Test function to debug faction data for multiple factions
 */
function testMultipleFactions() {
  const testFactions = [937, 9100, 10850, 12249]; // Sample faction IDs from your data
  const results = {};
  
  testFactions.forEach(factionId => {
    console.log(`\n=== Testing Faction ${factionId} ===`);
    results[factionId] = testFactionData(factionId);
  });
  
  console.log('\n=== All Results ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * Quick test function for a single faction
 */
function quickTest() {
  return testFactionData(9100); // Test The Black Hand faction
}

/**
 * Test function to debug HOF data for a specific faction
 */
function testFactionHOFData(factionId) {
  if (!factionId) {
    console.error('No faction ID provided to testFactionHOFData');
    return { error: 'No faction ID provided' };
  }
  
  console.log(`Testing HOF data for faction ID: ${factionId}`);
  try {
    const hofStats = getFactionHOFStats(factionId);
    console.log(`Faction ${factionId} HOF stats:`, hofStats);
    return hofStats;
  } catch (error) {
    console.error(`Error testing HOF data for faction ${factionId}:`, error);
    return { error: error.message };
  }
}

/**
 * Test function to debug HOF data for multiple factions
 */
function testMultipleFactionsHOF() {
  const testFactions = [53263, 937, 9100, 10850, 12249]; // Sample faction IDs including the one from your example
  const results = {};
  
  testFactions.forEach(factionId => {
    console.log(`\n=== Testing HOF Data for Faction ${factionId} ===`);
    results[factionId] = testFactionHOFData(factionId);
  });
  
  console.log('\n=== All HOF Results ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * Quick test function for HOF data
 */
function quickTestHOF() {
  return testFactionHOFData(53263); // Test the faction from your example
}

/**
 * Test the main random wars selection function
 */
function testRandomWarsSelection() {
  console.log('Testing random wars selection...');
  try {
    selectRandomWars();
    console.log('Random wars selection completed successfully');
  } catch (error) {
    console.error('Error in random wars selection:', error);
  }
}

/**
 * Manual function to run the random selection
 * Use this to test the functionality
 */
function runRandomWarsSelection() {
  console.log('Starting random wars selection...');
  const result = selectRandomWars();
  console.log('Random wars selection result:', result);
  return result;
}

/**
 * Test function to simulate running before Tuesday
 * This will show the prompt dialog for testing purposes
 */
function testBeforeTuesdayPrompt() {
  console.log('Testing before Tuesday prompt...');
  
  // Temporarily override the day check for testing
  const originalIsBeforeTuesday = isBeforeTuesday;
  
  // Force the prompt to show
  const userChoice = showSelectionPrompt();
  
  console.log('User choice from prompt:', userChoice);
  
  if (userChoice === 'new') {
    console.log('User chose NEW selection - would run normal selectRandomWars()');
    return { choice: 'new', message: 'Would proceed with new random selection' };
  } else if (userChoice === 'update') {
    console.log('User chose UPDATE - would run updateExistingWarsData()');
    return { choice: 'update', message: 'Would proceed with updating existing wars' };
  } else {
    console.log('User chose CANCEL - operation would be aborted');
    return { choice: 'cancel', message: 'Operation would be cancelled' };
  }
}

/**
 * Test function to check current day and show what would happen
 */
function testDayCheck() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[dayOfWeek];
  const isBefore = isBeforeTuesday();
  
  console.log(`Current day: ${currentDay} (${dayOfWeek})`);
  console.log(`Is before Tuesday: ${isBefore}`);
  
  if (isBefore) {
    console.log('Prompt would be shown to user');
  } else {
    console.log('Normal selection would proceed (no prompt)');
  }
  
  return {
    currentDay: currentDay,
    dayOfWeek: dayOfWeek,
    isBeforeTuesday: isBefore,
    wouldShowPrompt: isBefore
  };
}

/**
 * Delete the target sheet if it exists
 */
function deleteRandomWarsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheet = spreadsheet.getSheetByName(TARGET_SHEET_NAME);
  
  if (targetSheet) {
    spreadsheet.deleteSheet(targetSheet);
    console.log(`Deleted sheet: "${TARGET_SHEET_NAME}"`);
    return {
      success: true,
      message: `Deleted sheet: "${TARGET_SHEET_NAME}"`
    };
  } else {
    console.log(`Sheet "${TARGET_SHEET_NAME}" does not exist`);
    return {
      success: false,
      message: `Sheet "${TARGET_SHEET_NAME}" does not exist`
    };
  }
}

/**
 * Fetch faction historical data from Torn API
 */
function fetchFactionData(factionId) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `https://api.torn.com/faction/${factionId}?selections=rankedwars&key=${apiKey}`;
  
  console.log(`Fetching faction data from: ${url}`);
  
  try {
    const response = UrlFetchApp.fetch(url);
    const responseCode = response.getResponseCode();
    
    console.log(`API response code: ${responseCode}`);
    
    if (responseCode !== 200) {
      throw new Error(`Torn API returned response code: ${responseCode}`);
    }
    
    const responseText = response.getContentText();
    console.log(`Raw API response: ${responseText.substring(0, 500)}...`);
    
    const data = JSON.parse(responseText);
    
    if (data.error) {
      throw new Error(`Torn API error: ${data.error.code} - ${data.error.error}`);
    }
    
    console.log(`Parsed data keys: ${Object.keys(data)}`);
    if (data.rankedwars) {
      console.log(`Rankedwars keys: ${Object.keys(data.rankedwars)}`);
    }
    
    return data;
    
  } catch (error) {
    if (error.message.includes('Torn API error')) {
      throw error;
    }
    throw new Error(`Failed to fetch faction data from Torn API: ${error.message}`);
  }
}

/**
 * Fetch faction Hall of Fame (HOF) data from Torn API v2
 */
function fetchFactionHOFData(factionId) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `https://api.torn.com/v2/faction/${factionId}/hof?key=${apiKey}`;
  
  console.log(`Fetching faction HOF data from: ${url}`);
  
  try {
    const response = UrlFetchApp.fetch(url);
    const responseCode = response.getResponseCode();
    
    console.log(`HOF API response code: ${responseCode}`);
    
    if (responseCode !== 200) {
      throw new Error(`Torn API v2 returned response code: ${responseCode}`);
    }
    
    const responseText = response.getContentText();
    console.log(`Raw HOF API response: ${responseText.substring(0, 500)}...`);
    
    const data = JSON.parse(responseText);
    
    if (data.error) {
      throw new Error(`Torn API v2 error: ${data.error.code} - ${data.error.error}`);
    }
    
    console.log(`Parsed HOF data keys: ${Object.keys(data)}`);
    if (data.hof) {
      console.log(`HOF data:`, JSON.stringify(data.hof, null, 2));
    }
    
    return data;
    
  } catch (error) {
    if (error.message.includes('Torn API v2 error')) {
      throw error;
    }
    throw new Error(`Failed to fetch faction HOF data from Torn API v2: ${error.message}`);
  }
}

/**
 * Get faction Hall of Fame (HOF) statistics
 */
function getFactionHOFStats(factionId) {
  try {
    const factionHOFData = fetchFactionHOFData(factionId);
    
    console.log(`Faction ${factionId} HOF data:`, JSON.stringify(factionHOFData, null, 2));
    
    if (!factionHOFData.hof) {
      console.log(`No HOF data for faction ${factionId}`);
      return {
        rankValue: 'N/A',
        rankPosition: 'N/A',
        respectValue: 'N/A',
        respectPosition: 'N/A',
        hofChainValue: 'N/A',
        hofChainPosition: 'N/A'
      };
    }
    
    const hof = factionHOFData.hof;
    
    // Extract rank data
    const rankValue = hof.rank ? hof.rank.value : 'N/A';
    const rankPosition = hof.rank ? hof.rank.rank : 'N/A';
    
    // Extract respect data
    const respectValue = hof.respect ? hof.respect.value : 'N/A';
    const respectPosition = hof.respect ? hof.respect.rank : 'N/A';
    
    // Extract chain data
    const hofChainValue = hof.chain ? hof.chain.value : 'N/A';
    const hofChainPosition = hof.chain ? hof.chain.rank : 'N/A';
    
    console.log(`Faction ${factionId} HOF stats: Rank=${rankValue}(${rankPosition}), Respect=${respectValue}(${respectPosition}), Chain=${hofChainValue}(${hofChainPosition})`);
    
    return {
      rankValue: rankValue,
      rankPosition: rankPosition,
      respectValue: respectValue,
      respectPosition: respectPosition,
      hofChainValue: hofChainValue,
      hofChainPosition: hofChainPosition
    };
    
  } catch (error) {
    console.error(`Error fetching HOF data for faction ID ${factionId}:`, error);
    return {
      rankValue: 'N/A',
      rankPosition: 'N/A',
      respectValue: 'N/A',
      respectPosition: 'N/A',
      hofChainValue: 'N/A',
      hofChainPosition: 'N/A'
    };
  }
}

/**
 * Get faction war statistics from historical data
 */
function getFactionWarStats(factionId) {
  try {
    const factionData = fetchFactionData(factionId);
    
    console.log(`Faction ${factionId} data:`, JSON.stringify(factionData, null, 2));
    
    if (!factionData.rankedwars) {
      console.log(`No rankedwars data for faction ${factionId}`);
      return {
        warsWon: 0,
        warsLost: 0,
        winRate: '0%'
      };
    }
    
    const rankedWars = factionData.rankedwars;
    let warsWon = 0;
    let warsLost = 0;
    
    console.log(`Processing ${Object.keys(rankedWars).length} wars for faction ${factionId}`);
    
    // Count wins and losses from historical data
    Object.entries(rankedWars).forEach(([warId, war]) => {
      console.log(`War ${warId}:`, JSON.stringify(war, null, 2));
      
      // Check if this faction was in this war
      // Try both string and number versions of the faction ID
      const factionInWar = war.factions && (war.factions[factionId] || war.factions[factionId.toString()] || war.factions[parseInt(factionId)]);
      
      if (factionInWar) {
        console.log(`Faction ${factionId} was in war ${warId}`);
        
        // Check if this faction won
        // The winner field is nested under war.war.winner
        const winner = war.war && war.war.winner;
        
        if (winner && (winner.toString() === factionId.toString() || winner === parseInt(factionId))) {
          warsWon++;
          console.log(`Faction ${factionId} WON war ${warId}`);
        } else if (winner && (winner.toString() !== factionId.toString() && winner !== parseInt(factionId))) {
          warsLost++;
          console.log(`Faction ${factionId} LOST war ${warId} to ${winner}`);
        } else {
          console.log(`War ${warId} has no winner yet (winner: ${winner})`);
        }
      } else {
        console.log(`Faction ${factionId} was NOT in war ${warId}`);
        console.log(`Available factions in war ${warId}:`, Object.keys(war.factions || {}));
      }
    });
    
    const totalWars = warsWon + warsLost;
    const winRate = totalWars > 0 ? Math.round((warsWon / totalWars) * 100) : 0;
    
    console.log(`Faction ${factionId} stats: ${warsWon} wins, ${warsLost} losses, ${winRate}% win rate`);
    
    return {
      warsWon: warsWon,
      warsLost: warsLost,
      winRate: `${winRate}%`
    };
    
  } catch (error) {
    console.error(`Error fetching faction data for ID ${factionId}:`, error);
    return {
      warsWon: 'N/A',
      warsLost: 'N/A',
      winRate: 'N/A'
    };
  }
}

/**
 * Send error notification email when the script fails
 */
function sendErrorNotificationEmail(errorMessage) {
  try {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const subject = `❌ Random Wars Selection Script Failed`;
    
    const body = `
Random Wars Selection Script encountered an error!

⚠️ Error Details:
• Error message: ${errorMessage}
• Error time: ${timestamp} UTC
• Source sheet: ${SOURCE_SHEET_NAME}
• Target sheet: ${TARGET_SHEET_NAME}

🔧 Troubleshooting Steps:
1. Check if the source sheet exists and has data
2. Verify there are unstarted wars (Duration = "0m") available
3. Check the Apps Script execution log for more details
4. Run getSourceSheetInfo() to verify data availability

📋 Common Issues:
• "Source sheet not found" - Ensure the sheet name is correct
• "No unstarted wars found" - All wars may have already started
• "No data found" - Run the main Torn Wars updater first

---
This is an automated error notification from the Random Wars Selector script.
    `.trim();
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log(`Error notification email sent to ${NOTIFICATION_EMAIL}`);
    
  } catch (emailError) {
    console.error('Failed to send error notification email:', emailError);
    // Don't throw error - email failure shouldn't break the main script
  }
}

/**
 * Send email notification when the script runs
 */
function sendNotificationEmail(selectedWarsCount, selectedWarIds) {
  try {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const subject = `Random Wars Selection Completed - ${selectedWarsCount} Wars Selected`;
    
    const body = `
Random Wars Selection Script has completed successfully!

📊 Selection Summary:
• Total wars selected: ${selectedWarsCount}
• Selection time: ${timestamp} UTC
• Source sheet: ${SOURCE_SHEET_NAME}
• Target sheet: ${TARGET_SHEET_NAME}

🎯 Selected War IDs:
${selectedWarIds.map(id => `• War ID: ${id}`).join('\n')}

📋 What happened:
1. Script filtered for unstarted wars (Duration = "0m")
2. Randomly selected ${selectedWarsCount} wars from the filtered pool
3. Fetched historical faction data from Torn API for all selected factions
4. Fetched Hall of Fame (HOF) data from Torn API v2 for all selected factions
5. Created/updated "${TARGET_SHEET_NAME}" sheet with enhanced data including:
   - Original war data
   - Faction 1 & 2 historical statistics (Wars Won, Wars Lost, Win Rate)
   - Faction 1 & 2 Hall of Fame data (Rank, Respect, Chain values only)
   - Color-coded column group headers for easy navigation
   - Preserved formatting and hyperlinks

📈 New Data Columns Added:
• Faction 1 Wars Won, Wars Lost, Win Rate
• Faction 1 Rank Value, Respect Value, HOF Chain Value
• Faction 2 Wars Won, Wars Lost, Win Rate
• Faction 2 Rank Value, Respect Value, HOF Chain Value

🔗 Access your Google Sheets to view the enhanced results with faction statistics.

---
This is an automated notification from the Random Wars Selector script.
    `.trim();
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log(`Email notification sent to ${NOTIFICATION_EMAIL}`);
    
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw error - email failure shouldn't break the main script
  }
}

/**
 * Set up a scheduled trigger to run the random wars selection every Tuesday at 1:00 PM UTC
 * This function should be run once to set up the automation
 */
function setupRandomWarsSchedule() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'selectRandomWars') {
      ScriptApp.deleteTrigger(trigger);
      console.log('Deleted existing random wars trigger');
    }
  });
  
  // Create new trigger to run every Tuesday at 1:00 PM UTC
  ScriptApp.newTrigger('selectRandomWars')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.TUESDAY)
    .atHour(13) // 1:00 PM UTC (13:00 in 24-hour format)
    .create();
  
  console.log('Random wars selection scheduled successfully for every Tuesday at 1:00 PM UTC');
  
  return {
    success: true,
    message: 'Random wars selection scheduled for every Tuesday at 1:00 PM UTC',
    nextRun: 'Next Tuesday at 1:00 PM UTC'
  };
}

/**
 * Remove the scheduled trigger for random wars selection
 */
function removeRandomWarsSchedule() {
  const triggers = ScriptApp.getProjectTriggers();
  let deletedCount = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'selectRandomWars') {
      ScriptApp.deleteTrigger(trigger);
      deletedCount++;
      console.log('Deleted random wars trigger');
    }
  });
  
  if (deletedCount > 0) {
    console.log(`Removed ${deletedCount} random wars trigger(s)`);
    return {
      success: true,
      message: `Removed ${deletedCount} random wars trigger(s)`
    };
  } else {
    console.log('No random wars triggers found to remove');
    return {
      success: false,
      message: 'No random wars triggers found to remove'
    };
  }
}

/**
 * Get information about existing triggers
 */
function getTriggerInfo() {
  const triggers = ScriptApp.getProjectTriggers();
  const randomWarsTriggers = triggers.filter(trigger => 
    trigger.getHandlerFunction() === 'selectRandomWars'
  );
  
  const triggerInfo = randomWarsTriggers.map(trigger => ({
    functionName: trigger.getHandlerFunction(),
    triggerSource: trigger.getTriggerSource().toString(),
    eventType: trigger.getEventType().toString(),
    uniqueId: trigger.getUniqueId()
  }));
  
  return {
    totalTriggers: triggers.length,
    randomWarsTriggers: randomWarsTriggers.length,
    triggerDetails: triggerInfo,
    message: `Found ${randomWarsTriggers.length} random wars trigger(s) out of ${triggers.length} total triggers`
  };
}

/**
 * Update existing wars data in the target sheet
 * This function keeps the same war IDs but updates their data with fresh information
 */
function updateExistingWarsData() {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Please run this from a Google Sheets document.');
    }
    
    // Check if target sheet exists
    const targetSheet = spreadsheet.getSheetByName(TARGET_SHEET_NAME);
    if (!targetSheet) {
      throw new Error(`Target sheet "${TARGET_SHEET_NAME}" not found. Please run the normal selection first to create the sheet.`);
    }
    
    // Get existing war IDs from the target sheet
    const lastRow = targetSheet.getLastRow();
    if (lastRow <= 1) {
      throw new Error('No wars found in the target sheet to update.');
    }
    
    // Get all existing war IDs (column 1)
    const existingWarIds = targetSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    console.log(`Found ${existingWarIds.length} existing wars to update:`, existingWarIds);
    
    // Get the source sheet
    const sourceSheet = spreadsheet.getSheetByName(SOURCE_SHEET_NAME);
    if (!sourceSheet) {
      throw new Error(`Source sheet "${SOURCE_SHEET_NAME}" not found. Please ensure the Torn Wars Data sheet exists.`);
    }
    
    // Get all data from the source sheet
    const sourceData = getSourceSheetData(sourceSheet);
    if (sourceData.length === 0) {
      throw new Error('No data found in the source sheet.');
    }
    
    // Find matching wars in source data
    const updatedWars = [];
    const notFoundWars = [];
    
    existingWarIds.forEach(warId => {
      const matchingWar = sourceData.find(war => war[0] == warId);
      if (matchingWar) {
        updatedWars.push(matchingWar);
        console.log(`Found updated data for war ${warId}`);
      } else {
        notFoundWars.push(warId);
        console.log(`War ${warId} not found in source data`);
      }
    });
    
    if (updatedWars.length === 0) {
      throw new Error('No matching wars found in source data to update.');
    }
    
    if (notFoundWars.length > 0) {
      console.log(`Warning: ${notFoundWars.length} wars not found in source data:`, notFoundWars);
    }
    
    // Clear existing data (keep headers)
    if (lastRow > 1) {
      targetSheet.getRange(2, 1, lastRow - 1, 31).clear();
    }
    
    // Copy updated wars data to target sheet with enhanced faction statistics
    copyWarsDataToTarget(targetSheet, updatedWars);
    
    // Log success
    console.log(`Successfully updated "${TARGET_SHEET_NAME}" with ${updatedWars.length} wars`);
    
    // Send email notification
    sendUpdateNotificationEmail(updatedWars.length, updatedWars.map(war => war[0]), notFoundWars);
    
    return {
      success: true,
      message: `Updated "${TARGET_SHEET_NAME}" with ${updatedWars.length} wars`,
      updatedWarIds: updatedWars.map(war => war[0]),
      notFoundWarIds: notFoundWars,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error updating existing wars data:', error);
    
    // Send error notification email
    sendErrorNotificationEmail(error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Send email notification when updating existing wars
 */
function sendUpdateNotificationEmail(updatedWarsCount, updatedWarIds, notFoundWarIds) {
  try {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const subject = `Random Wars Data Updated - ${updatedWarsCount} Wars Refreshed`;
    
    let body = `
Random Wars Data Update has completed successfully!

📊 Update Summary:
• Total wars updated: ${updatedWarsCount}
• Update time: ${timestamp} UTC
• Source sheet: ${SOURCE_SHEET_NAME}
• Target sheet: ${TARGET_SHEET_NAME}

🔄 Updated War IDs:
${updatedWarIds.map(id => `• War ID: ${id}`).join('\n')}`;

    if (notFoundWarIds.length > 0) {
      body += `

⚠️ Wars Not Found in Source Data:
${notFoundWarIds.map(id => `• War ID: ${id}`).join('\n')}`;
    }

    body += `

📋 What happened:
1. Script kept the same war IDs from the existing selection
2. Fetched fresh data for these wars from the source sheet
3. Updated faction historical statistics from Torn API
4. Updated Hall of Fame (HOF) data from Torn API v2
5. Refreshed all data in "${TARGET_SHEET_NAME}" sheet

🔗 Access your Google Sheets to view the updated results with fresh faction statistics.

---
This is an automated notification from the Random Wars Selector script.
    `.trim();
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log(`Update notification email sent to ${NOTIFICATION_EMAIL}`);
    
  } catch (error) {
    console.error('Failed to send update notification email:', error);
    // Don't throw error - email failure shouldn't break the main script
  }
}

/**
 * Get information about the source sheet
 */
function getSourceSheetInfo() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = spreadsheet.getSheetByName(SOURCE_SHEET_NAME);
  
  if (!sourceSheet) {
    return {
      success: false,
      message: `Source sheet "${SOURCE_SHEET_NAME}" not found`
    };
  }
  
  const lastRow = sourceSheet.getLastRow();
  const lastCol = sourceSheet.getLastColumn();
  const dataRows = lastRow > 1 ? lastRow - 1 : 0;
  
  // Get unstarted wars count
  let unstartedWarsCount = 0;
  if (dataRows > 0) {
    const sourceData = getSourceSheetData(sourceSheet);
    const unstartedWars = filterUnstartedWars(sourceData);
    unstartedWarsCount = unstartedWars.length;
  }
  
  return {
    success: true,
    sheetName: SOURCE_SHEET_NAME,
    totalRows: lastRow,
    dataRows: dataRows,
    unstartedWars: unstartedWarsCount,
    totalColumns: lastCol,
    message: `Source sheet has ${dataRows} total wars, ${unstartedWarsCount} unstarted wars (Duration = "0m") available for selection`
  };
}
