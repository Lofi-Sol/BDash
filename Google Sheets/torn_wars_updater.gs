/**
 * Torn Wars Updater - Google Apps Script
 * This script handles updating Google Sheets with Torn war information
 */

// Configuration
const SHEET_NAME = 'Torn Wars Data';
const API_BASE_URL = 'https://api.torn.com/torn/';

/**
 * Main function to update the sheet with Torn wars data
 * This function will be called by the webhook from GitHub Actions
 */
function updateTornWarsSheet() {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Please run this from a Google Sheets document.');
    }
    
    // Get or create the wars sheet
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = createWarsSheet(spreadsheet);
    }
    
    // Fetch wars data from Torn API
    const warsData = fetchTornWarsData();
    if (!warsData || !warsData.rankedwars) {
      throw new Error('No wars data received from Torn API');
    }
    
    // Clear existing data and update with new data
    clearSheetData(sheet);
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
  const sheet = spreadsheet.insertSheet(SHEET_NAME);
  
  // Set headers
  const headers = [
    'War ID',
    'Status',
    'Start Date',
    'End Date',
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
    'Last Updated'
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
 * Note: This requires a valid API key to be set in the script properties
 */
function fetchTornWarsData() {
  // Get API key from script properties
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set TORN_API_KEY in script properties.');
  }
  
  const url = `${API_BASE_URL}?selections=rankedwars&key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      throw new Error(`HTTP ${responseCode}: ${response.getContentText()}`);
    }
    
    const data = JSON.parse(response.getContentText());
    
    if (data.error) {
      throw new Error(`Torn API Error: ${data.error}`);
    }
    
    return data;
    
  } catch (error) {
    throw new Error(`Failed to fetch data from Torn API: ${error.message}`);
  }
}

/**
 * Clear existing data from the sheet (keep headers)
 */
function clearSheetData(sheet) {
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
    const duration = formatDuration(war.war.start, war.war.end);
    
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
    
    return [
      warId,
      status,
      startDate.toISOString(),
      endDate ? endDate.toISOString() : '',
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
      new Date().toISOString()
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
    const endDateRange = sheet.getRange(2, 4, dataRows.length, 1);
    const lastUpdatedRange = sheet.getRange(2, 17, dataRows.length, 1);
    
    startDateRange.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    endDateRange.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    lastUpdatedRange.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, dataRows[0].length);
  }
}

/**
 * Format duration between start and end times
 */
function formatDuration(start, end) {
  const startTime = start * 1000;
  const endTime = end ? end * 1000 : Date.now();
  const duration = endTime - startTime;
  
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
 * Set up the Torn API key in script properties
 * Run this function once to configure your API key
 */
function setupApiKey() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Setup Torn API Key',
    'Please enter your Torn API key:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const apiKey = result.getResponseText().trim();
    if (apiKey) {
      PropertiesService.getScriptProperties().setProperty('TORN_API_KEY', apiKey);
      ui.alert('Success', 'API key has been set successfully!', ui.ButtonSet.OK);
    } else {
      ui.alert('Error', 'API key cannot be empty.', ui.ButtonSet.OK);
    }
  }
}

/**
 * Test the API connection
 */
function testApiConnection() {
  try {
    const warsData = fetchTornWarsData();
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'API Test Success',
      `Successfully connected to Torn API!\nFound ${Object.keys(warsData.rankedwars).length} wars.`,
      ui.ButtonSet.OK
    );
  } catch (error) {
    const ui = SpreadsheetApp.getUi();
    ui.alert('API Test Failed', `Error: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Manual trigger function for testing
 */
function manualUpdate() {
  const result = updateTornWarsSheet();
  const ui = SpreadsheetApp.getUi();
  
  if (result.success) {
    ui.alert('Update Complete', result.message, ui.ButtonSet.OK);
  } else {
    ui.alert('Update Failed', `Error: ${result.error}`, ui.ButtonSet.OK);
  }
}
