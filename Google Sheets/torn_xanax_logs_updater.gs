/**
 * Torn Xanax Logs Updater - Google Apps Script
 * This script pulls Torn logs 4 times a day and stores Xanax (ID 206) "Item receive" logs
 */

// Configuration - Updated to avoid conflicts
const XANAX_SHEET_NAME = 'Torn Xanax Logs';
const XANAX_API_BASE_URL = 'https://api.torn.com/user/';
const XANAX_ITEM_ID = 206;
const XANAX_LOG_TITLE = 'Item receive';

// Script properties for API key
const TORN_API_KEY_PROPERTY = 'TORN_API_KEY';

/**
 * Main function to update the sheet with Torn Xanax logs
 * This function will be called by the time-based trigger
 */
function updateTornXanaxLogs() {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Please run this from a Google Sheets document.');
    }
    
    // Get or create the Xanax logs sheet
    let sheet = spreadsheet.getSheetByName(XANAX_SHEET_NAME);
    if (!sheet) {
      sheet = createXanaxLogsSheet(spreadsheet);
    }
    
    // Fetch logs data from Torn API
    const logsData = fetchTornLogsData();
    if (!logsData || !logsData.log) {
      throw new Error('No logs data received from Torn API');
    }
    
    // Filter for Xanax "Item receive" logs
    const xanaxLogs = filterXanaxReceiveLogs(logsData.log);
    
    // Update sheet with new data
    updateSheetWithXanaxLogs(sheet, xanaxLogs);
    
    // Log success
    console.log(`Successfully updated sheet with ${xanaxLogs.length} new Xanax receive logs`);
    
    return {
      success: true,
      message: `Updated sheet with ${xanaxLogs.length} new Xanax receive logs`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error updating Torn Xanax logs sheet:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Create the Xanax logs sheet with proper headers and formatting
 */
function createXanaxLogsSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(XANAX_SHEET_NAME);
  
  // Set headers
  const headers = [
    'Log ID',
    'Date',
    'Timestamp',
    'Sender ID',
    'Quantity',
    'Message',
    'Log Entry ID',
    'Category',
    'Last Updated'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#34a853'); // Green color for Xanax theme
  headerRange.setFontColor('white');
  headerRange.setHorizontalAlignment('center');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Set date format for timestamp column
  sheet.getRange(1, 3, sheet.getMaxRows(), 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  return sheet;
}

/**
 * Fetch logs data from Torn API
 */
function fetchTornLogsData() {
  const apiKey = PropertiesService.getScriptProperties().getProperty(TORN_API_KEY_PROPERTY);
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `${XANAX_API_BASE_URL}?selections=log&key=${apiKey}`;
  
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
 * Filter logs for Xanax "Item receive" entries
 */
function filterXanaxReceiveLogs(logs) {
  const xanaxLogs = [];
  
  for (const [logEntryId, logEntry] of Object.entries(logs)) {
    // Check if it's an "Item receive" log
    if (logEntry.title === XANAX_LOG_TITLE) {
      // Check if it contains Xanax (ID 206)
      if (logEntry.data && logEntry.data.items) {
        for (const item of logEntry.data.items) {
          if (item.id === XANAX_ITEM_ID) {
            xanaxLogs.push({
              logEntryId: logEntryId,
              log: logEntry.log,
              title: logEntry.title,
              timestamp: logEntry.timestamp,
              category: logEntry.category,
              sender: logEntry.data.sender,
              quantity: item.qty,
              message: logEntry.data.message || '',
              params: logEntry.params
            });
            break; // Found Xanax in this log entry, move to next
          }
        }
      }
    }
  }
  
  return xanaxLogs;
}

/**
 * Update sheet with new Xanax logs data
 */
function updateSheetWithXanaxLogs(sheet, xanaxLogs) {
  if (xanaxLogs.length === 0) {
    console.log('No new Xanax receive logs to add');
    return;
  }
  
  // Get existing log entry IDs to avoid duplicates
  const existingLogIds = getExistingLogIds(sheet);
  
  // Filter out logs that already exist
  const newLogs = xanaxLogs.filter(log => !existingLogIds.has(log.logEntryId));
  
  if (newLogs.length === 0) {
    console.log('All Xanax logs already exist in sheet');
    return;
  }
  
  // Prepare data for sheet
  const sheetData = newLogs.map(log => [
    log.logEntryId,
    new Date(log.timestamp * 1000), // Convert Unix timestamp to Date
    log.timestamp,
    log.sender,
    log.quantity,
    log.message,
    log.log,
    log.category,
    new Date() // Last Updated
  ]);
  
  // Find the next empty row
  const lastRow = sheet.getLastRow();
  const startRow = lastRow + 1;
  
  // Add new data
  sheet.getRange(startRow, 1, sheetData.length, sheetData[0].length).setValues(sheetData);
  
  // Format the new rows
  formatNewRows(sheet, startRow, sheetData.length);
  
  console.log(`Added ${newLogs.length} new Xanax receive logs to sheet`);
}

/**
 * Get existing log entry IDs from the sheet to avoid duplicates
 */
function getExistingLogIds(sheet) {
  const logIds = new Set();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) { // Only header row
    return logIds;
  }
  
  const logIdColumn = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  logIdColumn.forEach(row => {
    if (row[0]) {
      logIds.add(row[0].toString());
    }
  });
  
  return logIds;
}

/**
 * Format newly added rows
 */
function formatNewRows(sheet, startRow, numRows) {
  // Set date format for timestamp column
  sheet.getRange(startRow, 3, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  // Set date format for date column
  sheet.getRange(startRow, 2, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  // Set date format for last updated column
  sheet.getRange(startRow, 9, numRows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  // Add alternating row colors for better readability
  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    if (i % 2 === 0) {
      sheet.getRange(row, 1, 1, 9).setBackground('#f8f9fa');
    }
  }
}

/**
 * Set up time-based triggers to run every 15 minutes
 * This function should be run once to set up the automation
 */
function setupXanaxTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'updateTornXanaxLogs') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger to run every 15 minutes
  ScriptApp.newTrigger('updateTornXanaxLogs')
    .timeBased()
    .everyMinutes(15)
    .create();
  
  console.log('Xanax triggers set up successfully to run every 15 minutes');
}

/**
 * Manual update function for testing
 */
function manualUpdateXanax() {
  console.log('Starting manual Xanax update...');
  const result = updateTornXanaxLogs();
  console.log('Manual Xanax update result:', result);
  return result;
}

/**
 * Test function to check API connection
 */
function testXanaxApiConnection() {
  try {
    const data = fetchTornLogsData();
    console.log('Xanax API connection successful');
    console.log('Sample log entry:', Object.keys(data.log)[0]);
    return {
      success: true,
      message: 'Xanax API connection successful',
      data: data
    };
  } catch (error) {
    console.error('Xanax API connection failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clear all data from the sheet (keeping headers)
 */
function clearAllXanaxData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(XANAX_SHEET_NAME);
  
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 9).clear();
      console.log('All Xanax data cleared from sheet');
    }
  }
}
