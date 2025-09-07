/**
 * Torn Wars Updater - Google Apps Script Version
 * This script handles updating Google Sheets with Torn war information
 * Runs independently via time-based triggers
 */

// Configuration - Updated to avoid conflicts
const WARS_SHEET_NAME = 'Torn Wars Data (Apps Script)';
const WARS_API_BASE_URL = 'https://api.torn.com/torn/';

/**
 * Main function to update the sheet with Torn wars data
 * This function will be called by the time-based trigger
 */
function updateTornWarsSheet() {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Please run this from a Google Sheets document.');
    }
    
    // Get or create the wars sheet
    let sheet = spreadsheet.getSheetByName(WARS_SHEET_NAME);
    if (!sheet) {
      sheet = createWarsSheet(spreadsheet);
    } else {
      // If sheet exists, delete it and recreate with new structure
      spreadsheet.deleteSheet(sheet);
      sheet = createWarsSheet(spreadsheet);
    }
    
    // Fetch wars data from Torn API
    const warsData = fetchTornWarsData();
    if (!warsData || !warsData.rankedwars) {
      throw new Error('No wars data received from Torn API');
    }
    
    // Update with new data (no need to clear since we recreated the sheet)
    updateSheetWithWarsData(sheet, warsData);
    
    // Log success
    console.log(`Successfully updated sheet with ${Object.keys(warsData.rankedwars).length} wars`);
    
    return {
      success: true,
      message: `Updated sheet with ${Object.keys(warsData.rankedwars).length} wars`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error updating Torn wars sheet:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Create the wars sheet with proper headers and formatting
 */
function createWarsSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(WARS_SHEET_NAME);
  
  // Set headers with split date/time columns
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
    'Faction 2 ID',
    'Faction 2 Name',
    'Faction 2 Score',
    'Faction 2 Chain',
    'Total Score',
    'Winner Faction ID',
    'Last Updated Date',
    'Last Updated Time'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setHorizontalAlignment('center');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  return sheet;
}

/**
 * Fetch wars data from Torn API
 */
function fetchTornWarsData() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `${WARS_API_BASE_URL}?selections=rankedwars&key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`Torn API returned response code: ${responseCode}`);
    }
    
    const data = JSON.parse(response.getContentText());
    
    if (data.error) {
      throw new Error(`Torn API error: ${data.error.code} - ${data.error.error}`);
    }
    
    return data;
    
  } catch (error) {
    if (error.message.includes('Torn API error')) {
      throw error;
    }
    throw new Error(`Failed to fetch data from Torn API: ${error.message}`);
  }
}

/**
 * Clear existing data from the sheet (keep headers)
 */
function clearWarsSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

/**
 * Update the sheet with wars data
 */
function updateSheetWithWarsData(sheet, warsData) {
  const wars = Object.entries(warsData.rankedwars);
  if (wars.length === 0) {
    return;
  }
  
  // Prepare data rows
  const dataRows = wars.map(([warId, war]) => {
    const startDate = new Date(war.war.start * 1000);
    const endDate = war.war.end ? new Date(war.war.end * 1000) : null;
    const duration = formatWarsDuration(war.war.start, war.war.end);
    const now = new Date();
    
    // Get faction data
    const factionIds = Object.keys(war.factions);
    const faction1 = war.factions[factionIds[0]];
    const faction2 = war.factions[factionIds[1]];
    
    const faction1Score = faction1.score || 0;
    const faction2Score = faction2.score || 0;
    const totalScore = faction1Score + faction2Score;
    
    // Determine status
    let status = 'Preparing';
    if (!war.war.end) {
      status = 'Active';
    } else if (war.war.end < Date.now() / 1000) {
      status = 'Finished';
    }
    
    // Split date and time
    const startDateStr = startDate.toISOString().split('T')[0];
    const startTimeStr = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const endDateStr = endDate ? endDate.toISOString().split('T')[0] : '';
    const endTimeStr = endDate ? endDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }) : '';
    
    const lastUpdatedDateStr = now.toISOString().split('T')[0];
    const lastUpdatedTimeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return [
      warId,
      status,
      startDateStr,
      startTimeStr,
      endDateStr,
      endTimeStr,
      duration,
      war.war.target || 0,
      factionIds[0] || '',
      faction1.name || 'Unknown',
      faction1Score,
      faction1.chain || 0,
      factionIds[1] || '',
      faction2.name || 'Unknown',
      faction2Score,
      faction2.chain || 0,
      totalScore,
      war.war.winner || '',
      lastUpdatedDateStr,
      lastUpdatedTimeStr
    ];
  });
  
  // Sort by start date (newest first)
  dataRows.sort((a, b) => new Date(b[2]) - new Date(a[2]));
  
  // Add data to sheet
  if (dataRows.length > 0) {
    const range = sheet.getRange(2, 1, dataRows.length, dataRows[0].length);
    range.setValues(dataRows);
    
    // Format date columns
    const startDateRange = sheet.getRange(2, 3, dataRows.length, 1);
    const endDateRange = sheet.getRange(2, 5, dataRows.length, 1);
    const lastUpdatedDateRange = sheet.getRange(2, 19, dataRows.length, 1);
    
    startDateRange.setNumberFormat('yyyy-mm-dd');
    endDateRange.setNumberFormat('yyyy-mm-dd');
    lastUpdatedDateRange.setNumberFormat('yyyy-mm-dd');
    
    // Format time columns
    const startTimeRange = sheet.getRange(2, 4, dataRows.length, 1);
    const endTimeRange = sheet.getRange(2, 6, dataRows.length, 1);
    const lastUpdatedTimeRange = sheet.getRange(2, 20, dataRows.length, 1);
    
    startTimeRange.setNumberFormat('@');
    endTimeRange.setNumberFormat('@');
    lastUpdatedTimeRange.setNumberFormat('@');
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, dataRows[0].length);
    
    // Add hyperlinks to faction names
    addFactionHyperlinks(sheet, dataRows.length);
  }
}

/**
 * Format duration between start and end times
 */
function formatWarsDuration(start, end) {
  const startTime = start * 1000;
  const endTime = end ? end * 1000 : Date.now();
  const duration = endTime - startTime;
  
  // Don't show negative durations
  if (duration < 0) {
    return '0m';
  }
  
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Add hyperlinks to faction names
 */
function addFactionHyperlinks(sheet, numRows) {
  // Get all faction IDs and names at once for efficiency
  const faction1Ids = sheet.getRange(2, 9, numRows, 1).getValues(); // Faction 1 ID column
  const faction1Names = sheet.getRange(2, 10, numRows, 1).getValues(); // Faction 1 Name column
  const faction2Ids = sheet.getRange(2, 13, numRows, 1).getValues(); // Faction 2 ID column
  const faction2Names = sheet.getRange(2, 14, numRows, 1).getValues(); // Faction 2 Name column
  
  // Process Faction 1 names
  for (let i = 0; i < numRows; i++) {
    const factionId = faction1Ids[i][0];
    const factionName = faction1Names[i][0];
    
    if (factionId && factionName && factionName !== 'Unknown') {
      const url = `https://www.torn.com/factions.php?step=profile&ID=${factionId}`;
      const cell = sheet.getRange(2 + i, 10);
      cell.setFormula(`=HYPERLINK("${url}","${factionName}")`);
      console.log(`Added hyperlink for Faction 1: ${factionName} (ID: ${factionId})`);
    }
  }
  
  // Process Faction 2 names
  for (let i = 0; i < numRows; i++) {
    const factionId = faction2Ids[i][0];
    const factionName = faction2Names[i][0];
    
    if (factionId && factionName && factionName !== 'Unknown') {
      const url = `https://www.torn.com/factions.php?step=profile&ID=${factionId}`;
      const cell = sheet.getRange(2 + i, 14);
      cell.setFormula(`=HYPERLINK("${url}","${factionName}")`);
      console.log(`Added hyperlink for Faction 2: ${factionName} (ID: ${factionId})`);
    }
  }
  
  console.log(`Processed hyperlinks for ${numRows} rows`);
}

/**
 * Set up time-based triggers to run every 15 minutes
 * This function should be run once to set up the automation
 */
function setupWarsTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'updateTornWarsSheet') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger to run every 15 minutes
  ScriptApp.newTrigger('updateTornWarsSheet')
    .timeBased()
    .everyMinutes(15)
    .create();
  
  console.log('Wars triggers set up successfully to run every 15 minutes');
}

/**
 * Manual update function for testing
 */
function manualUpdateWars() {
  console.log('Starting manual wars update...');
  const result = updateTornWarsSheet();
  console.log('Manual wars update result:', result);
  return result;
}

/**
 * Test function to check API connection
 */
function testWarsApiConnection() {
  try {
    const data = fetchTornWarsData();
    console.log('Wars API connection successful');
    console.log('Found wars:', Object.keys(data.rankedwars).length);
    return {
      success: true,
      message: 'Wars API connection successful',
      warsCount: Object.keys(data.rankedwars).length
    };
  } catch (error) {
    console.error('Wars API connection failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clear all data from the sheet (keeping headers)
 */
function clearAllWarsData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(WARS_SHEET_NAME);
  
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 20).clear();
      console.log('All wars data cleared from sheet');
    }
  }
}

/**
 * Force recreate the sheet with new structure
 * Use this if you're having column alignment issues
 */
function recreateWarsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(WARS_SHEET_NAME);
  
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
    console.log('Wars sheet deleted. Run manualUpdateWars() to recreate with new structure.');
  } else {
    console.log('Wars sheet does not exist. Run manualUpdateWars() to create it.');
  }
}

/**
 * Fix hyperlinks for existing faction names
 * Use this to add hyperlinks to an existing sheet without recreating it
 */
function fixFactionHyperlinks() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(WARS_SHEET_NAME);
  
  if (!sheet) {
    console.log('Wars sheet not found. Run manualUpdateWars() first.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    console.log('No data rows found in sheet.');
    return;
  }
  
  const numRows = lastRow - 1; // Subtract header row
  addFactionHyperlinks(sheet, numRows);
  console.log('Faction hyperlinks fixed for existing sheet.');
}
