/**
 * Betting Data Updater - Google Apps Script
 * This script handles saving betting data to Google Sheets
 */

// Configuration
const BETTING_SHEET_NAME = 'Betting Data';
const API_BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

/**
 * Main function to handle bet data from the dashboard
 * This function will be called via HTTP POST from the dashboard
 */
function doPost(e) {
  try {
    console.log('📥 Received POST request');
    console.log('📥 Event object:', e);
    
    // Check if e and postData exist
    if (!e || !e.postData || !e.postData.contents) {
      console.error('❌ Invalid POST request - missing data');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid POST request - missing data'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('📥 Post data:', e.postData);
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    console.log('📥 Parsed data:', data);
    
    // Validate required fields
    if (!data.betId || !data.playerId || !data.warId) {
      const errorResponse = {
        success: false,
        error: 'Missing required fields: betId, playerId, warId'
      };
      console.log('❌ Validation failed:', errorResponse);
      
      return ContentService
        .createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Save bet to sheet
    const result = saveBetToSheet(data);
    console.log('✅ Save result:', result);
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ Error processing bet data:', error);
    const errorResponse = {
      success: false,
      error: error.message
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing and CORS/JSONP)
 */
function doGet(e) {
  console.log('📥 Received GET request');
  console.log('📥 Event object:', e);
  
  // Check if e and parameters exist
  if (!e) {
    console.error('❌ Invalid GET request - missing event object');
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid GET request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  console.log('📥 Parameters:', e.parameter);
  console.log('📥 Parameter keys:', Object.keys(e.parameter || {}));
  console.log('📥 Callback parameter:', e.parameter.callback);
  console.log('📥 Data parameter:', e.parameter.data);
  
  // Log all parameters for debugging
  if (e.parameter) {
    for (const [key, value] of Object.entries(e.parameter)) {
      console.log(`📥 Parameter ${key}:`, value);
    }
  }
  
  // Handle JSONP requests with bet data
  if (e.parameter.callback && e.parameter.data) {
    try {
      // Parse the bet data
      const betData = JSON.parse(e.parameter.data);
      console.log('📥 JSONP bet data:', betData);
      
      // Validate required fields
      if (!betData.betId || !betData.playerId || !betData.warId) {
        const errorResponse = {
          success: false,
          error: 'Missing required fields: betId, playerId, warId'
        };
        
        return ContentService
          .createTextOutput(`${e.parameter.callback}(${JSON.stringify(errorResponse)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      
      // Save bet to sheet
      const result = saveBetToSheet(betData);
      console.log('✅ JSONP save result:', result);
      
      return ContentService
        .createTextOutput(`${e.parameter.callback}(${JSON.stringify(result)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
        
    } catch (error) {
      console.error('❌ JSONP error:', error);
      const errorResponse = {
        success: false,
        error: error.message
      };
      
      return ContentService
        .createTextOutput(`${e.parameter.callback}(${JSON.stringify(errorResponse)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }
  
  // Handle simple JSONP test requests
  if (e.parameter.callback) {
    const data = {
      success: true,
      message: 'Betting Data API is running (JSONP)',
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(`${e.parameter.callback}(${JSON.stringify(data)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // Regular JSON response
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Betting Data API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Save bet data to the Google Sheet
 */
function saveBetToSheet(betData) {
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found');
    }
    
    // Get or create the betting sheet
    let sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    if (!sheet) {
      sheet = createBettingSheet(spreadsheet);
    } else {
      // Update existing sheet to add Expected Payout column if it doesn't exist
      updateSheetHeaders(sheet);
    }
    
    // Calculate expected payout (bet amount * odds)
    const expectedPayout = Math.round(betData.betAmount * (betData.odds || 2.0));
    
    // Prepare row data - must match the exact column order defined in headers
    const rowData = [
      new Date(), // 1. Date
      betData.betId, // 2. Bet ID
      betData.betMessage || '', // 3. Bet Message
      betData.playerId, // 4. Player ID
      betData.playerName || 'Unknown', // 5. Player Name
      betData.warId, // 6. War ID
      betData.factionId, // 7. Faction ID
      betData.factionName || 'Unknown', // 8. Faction Name
      betData.xanaxAmount, // 9. Xanax Amount
      betData.betAmount, // 10. Bet Amount ($)
      betData.odds || 2.0, // 11. Odds
      expectedPayout, // 12. Expected Payout ($)
      betData.status || 'pending', // 13. Status
      betData.timestamp, // 14. Client Timestamp
      new Date().toISOString() // 15. Server Timestamp
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    console.log('Bet saved to sheet:', betData.betId);
    
    return {
      success: true,
      message: 'Bet saved successfully',
      betId: betData.betId,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error saving bet to sheet:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create the betting sheet with proper headers and formatting
 */
function createBettingSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(BETTING_SHEET_NAME);
  
  // Set up headers
  const headers = [
    'Date',
    'Bet ID',
    'Bet Message',
    'Player ID',
    'Player Name',
    'War ID',
    'Faction ID',
    'Faction Name',
    'Xanax Amount',
    'Bet Amount ($)',
    'Odds',
    'Expected Payout ($)',
    'Status',
    'Client Timestamp',
    'Server Timestamp'
  ];
  
  // Add headers to first row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  
  // Set column widths
  sheet.setColumnWidth(1, 150); // Date
  sheet.setColumnWidth(2, 100); // Bet ID
  sheet.setColumnWidth(3, 200); // Bet Message
  sheet.setColumnWidth(4, 100); // Player ID
  sheet.setColumnWidth(5, 150); // Player Name
  sheet.setColumnWidth(6, 100); // War ID
  sheet.setColumnWidth(7, 100); // Faction ID
  sheet.setColumnWidth(8, 200); // Faction Name
  sheet.setColumnWidth(9, 120); // Xanax Amount
  sheet.setColumnWidth(10, 120); // Bet Amount
  sheet.setColumnWidth(11, 80);  // Odds
  sheet.setColumnWidth(12, 100); // Expected Payout
  sheet.setColumnWidth(13, 100); // Status
  sheet.setColumnWidth(14, 150); // Client Timestamp
  sheet.setColumnWidth(15, 150); // Server Timestamp
  
  // Format number columns
  sheet.getRange(2, 9, sheet.getMaxRows(), 1).setNumberFormat('0'); // Xanax Amount
  sheet.getRange(2, 10, sheet.getMaxRows(), 1).setNumberFormat('$#,##0'); // Bet Amount
  sheet.getRange(2, 11, sheet.getMaxRows(), 1).setNumberFormat('0.00'); // Odds
  
  // Add data validation for status column
  const statusRange = sheet.getRange(2, 13, sheet.getMaxRows(), 1);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'confirmed', 'won', 'lost', 'cancelled'], true)
    .setAllowInvalid(false)
    .setHelpText('Select bet status')
    .build();
  statusRange.setDataValidation(statusRule);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  console.log('Created betting sheet with headers and formatting');
  return sheet;
}

/**
 * Update existing sheet headers to add Bet Message and Expected Payout columns
 */
function updateSheetHeaders(sheet) {
  try {
    // Get current headers
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const currentHeaders = headerRange.getValues()[0];
    
    // Check if Bet Message column exists
    const hasBetMessage = currentHeaders.includes('Bet Message');
    const hasExpectedPayout = currentHeaders.includes('Expected Payout ($)');
    
    // Add Bet Message column if it doesn't exist
    if (!hasBetMessage) {
      console.log('Adding Bet Message column to existing sheet...');
      
      // Insert Bet Message column after Bet ID column
      const betIdColumnIndex = currentHeaders.indexOf('Bet ID') + 1;
      if (betIdColumnIndex > 0) {
        // Insert new column
        sheet.insertColumnAfter(betIdColumnIndex);
        
        // Set the header
        sheet.getRange(1, betIdColumnIndex + 1).setValue('Bet Message');
        
        // Format the header
        const newHeaderCell = sheet.getRange(1, betIdColumnIndex + 1);
        newHeaderCell.setBackground('#4285f4');
        newHeaderCell.setFontColor('white');
        newHeaderCell.setFontWeight('bold');
        newHeaderCell.setFontSize(11);
        
        // Set column width
        sheet.setColumnWidth(betIdColumnIndex + 1, 200);
        
        console.log('Bet Message column added');
      }
    }
    
    // Add Expected Payout column if it doesn't exist
    if (!hasExpectedPayout) {
      console.log('Adding Expected Payout column to existing sheet...');
      
      // Insert Expected Payout column after Odds column
      const oddsColumnIndex = currentHeaders.indexOf('Odds') + 1;
      if (oddsColumnIndex > 0) {
        // Insert new column
        sheet.insertColumnAfter(oddsColumnIndex);
        
        // Set the header
        sheet.getRange(1, oddsColumnIndex + 1).setValue('Expected Payout ($)');
        
        // Format the header
        const newHeaderCell = sheet.getRange(1, oddsColumnIndex + 1);
        newHeaderCell.setBackground('#4285f4');
        newHeaderCell.setFontColor('white');
        newHeaderCell.setFontWeight('bold');
        newHeaderCell.setFontSize(11);
        
        // Calculate expected payout for existing rows
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          for (let row = 2; row <= lastRow; row++) {
            const betAmount = sheet.getRange(row, 10).getValue(); // Bet Amount column (index 9)
            const odds = sheet.getRange(row, 11).getValue(); // Odds column (index 10)
            
            if (betAmount && odds) {
              // Remove $ and commas from bet amount if present
              const cleanBetAmount = String(betAmount).replace(/[$,]/g, '');
              const numericBetAmount = parseFloat(cleanBetAmount);
              
              if (!isNaN(numericBetAmount) && !isNaN(odds)) {
                const expectedPayout = Math.round(numericBetAmount * odds);
                // Expected Payout column is at oddsColumnIndex + 1 (after Odds column)
                sheet.getRange(row, oddsColumnIndex + 1).setValue(expectedPayout);
              }
            }
          }
        }
        
        console.log('Expected Payout column added and calculated for existing bets');
      }
    }
  } catch (error) {
    console.error('Error updating sheet headers:', error);
  }
}

/**
 * Test function to debug parameter issues
 */
function testParameters() {
  console.log('🧪 Testing parameter handling...');
  
  // Test with mock data
  const mockEvent = {
    parameter: {
      callback: 'testCallback',
      data: JSON.stringify({
        betId: 'TEST123',
        playerId: '12345',
        warId: '99999',
        factionId: '11111',
        factionName: 'Test Faction',
        xanaxAmount: 1,
        betAmount: 744983,
        playerName: 'Test Player',
        odds: 2.0,
        timestamp: Date.now()
      })
    }
  };
  
  console.log('🧪 Testing doGet with mock data...');
  const result = doGet(mockEvent);
  console.log('🧪 doGet result:', result);
  
  return {
    success: true,
    message: 'Parameter test completed',
    result: result.getContent()
  };
}

/**
 * Simple test function to verify deployment
 */
function testDeployment() {
  console.log('🧪 Testing deployment...');
  
  try {
    // Test creating the sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('✅ Spreadsheet found:', spreadsheet.getName());
    
    // Test sheet creation
    let sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    if (!sheet) {
      sheet = createBettingSheet(spreadsheet);
      console.log('✅ Created betting sheet');
    } else {
      console.log('✅ Betting sheet already exists');
    }
    
    return {
      success: true,
      message: 'Deployment test successful',
      spreadsheet: spreadsheet.getName(),
      sheetExists: !!sheet
    };
    
  } catch (error) {
    console.error('❌ Deployment test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test function to verify the setup
 */
function testBettingSetup() {
  try {
    // Test creating the sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    
    if (!sheet) {
      sheet = createBettingSheet(spreadsheet);
    }
    
    // Test saving a sample bet
    const testBet = {
      betId: 'TEST123',
      playerId: '12345',
      playerName: 'Test Player',
      warId: '99999',
      factionId: '11111',
      factionName: 'Test Faction',
      xanaxAmount: 1,
      betAmount: 744983,
      odds: 2.5,
      status: 'pending',
      timestamp: Date.now()
    };
    
    const result = saveBetToSheet(testBet);
    console.log('Test result:', result);
    
    return {
      success: true,
      message: 'Betting setup test completed',
      result: result
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Function to get betting statistics
 */
function getBettingStats() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    
    if (!sheet) {
      return { error: 'Betting sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const bets = data.slice(1);
    
    // Calculate statistics
    const totalBets = bets.length;
    const totalVolume = bets.reduce((sum, bet) => sum + (bet[9] || 0), 0); // Bet Amount column (index 9)
    const pendingBets = bets.filter(bet => bet[12] === 'pending').length; // Status column (index 12)
    const wonBets = bets.filter(bet => bet[12] === 'won').length; // Status column (index 12)
    const lostBets = bets.filter(bet => bet[12] === 'lost').length; // Status column (index 12)
    
    return {
      totalBets,
      totalVolume,
      pendingBets,
      wonBets,
      lostBets,
      winRate: totalBets > 0 ? (wonBets / (wonBets + lostBets) * 100).toFixed(2) : 0
    };
    
  } catch (error) {
    console.error('Error getting betting stats:', error);
    return { error: error.message };
  }
}

/**
 * Function to update bet status (for manual updates)
 */
function updateBetStatus(betId, newStatus) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Betting sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const betIdColumn = 1; // Bet ID is in column B (index 1)
    const statusColumn = 12; // Status is in column M (index 12)
    
    for (let i = 1; i < data.length; i++) { // Start from row 2 (skip header)
      if (data[i][betIdColumn] === betId) {
        sheet.getRange(i + 1, statusColumn + 1).setValue(newStatus);
        console.log(`Updated bet ${betId} status to ${newStatus}`);
        return { success: true, message: `Bet ${betId} status updated to ${newStatus}` };
      }
    }
    
    return { success: false, message: `Bet ${betId} not found` };
    
  } catch (error) {
    console.error('Error updating bet status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test function to simulate the actual URL being sent
 */
function testRealURL() {
  console.log('🧪 Testing with real URL format...');
  
  // Simulate the actual URL parameters that are being sent
  const realURL = 'https://script.google.com/macros/s/AKfycbwQrtVLUMnZveNcUxjKbhBzYYK9q0iyymOLQBGXPxaDGqFCRfdfHG6Od52RaRT5wwJU0w/exec?callback=bettingCallback_1758141142020&data={"playerId":3520571,"warId":"30870","factionId":"42185","factionName":"Bruh.","xanaxAmount":1,"betAmount":744983,"betId":"I4TQ6CHU","playerName":"VanillaScoop","odds":2,"timestamp":1758141142019}';
  
  // Parse the URL manually using string methods (Google Apps Script doesn't have URL constructor)
  const urlParts = realURL.split('?');
  const queryString = urlParts[1];
  const params = {};
  
  if (queryString) {
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  
  console.log('🧪 Parsed parameters from real URL:', params);
  
  const mockEvent = {
    parameter: params
  };
  
  console.log('🧪 Testing doGet with real URL parameters...');
  const result = doGet(mockEvent);
  console.log('🧪 doGet result:', result);
  
  return {
    success: true,
    message: 'Real URL test completed',
    parameters: params,
    result: result.getContent()
  };
}

/**
 * Simple test function to check parameter parsing
 */
function testSimpleParameters() {
  console.log('🧪 Testing simple parameter parsing...');
  
  // Test with the exact parameters that should be received
  const mockEvent = {
    parameter: {
      callback: 'bettingCallback_1758141142020',
      data: '{"playerId":3520571,"warId":"30870","factionId":"42185","factionName":"Bruh.","xanaxAmount":1,"betAmount":744983,"betId":"I4TQ6CHU","playerName":"VanillaScoop","odds":2,"timestamp":1758141142019}'
    }
  };
  
  console.log('🧪 Mock event:', mockEvent);
  console.log('🧪 Parameter keys:', Object.keys(mockEvent.parameter));
  console.log('🧪 Callback parameter:', mockEvent.parameter.callback);
  console.log('🧪 Data parameter:', mockEvent.parameter.data);
  
  console.log('🧪 Testing doGet with simple parameters...');
  const result = doGet(mockEvent);
  console.log('🧪 doGet result:', result);
  
  return {
    success: true,
    message: 'Simple parameter test completed',
    result: result.getContent()
  };
}

/**
 * Test function to check what parameters are received from web requests
 * Call this by visiting: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?test=1
 */
function testWebRequest() {
  console.log('🧪 Testing web request parameters...');
  
  // This function will be called when the web app is accessed
  // We'll use doGet to test it
  const mockEvent = {
    parameter: {
      test: '1'
    }
  };
  
  console.log('🧪 Testing doGet with test parameter...');
  const result = doGet(mockEvent);
  console.log('🧪 doGet result:', result);
  
  return {
    success: true,
    message: 'Web request test completed',
    result: result.getContent()
  };
}

/**
 * Manual function to add Bet Message column to existing sheet
 * Run this function manually in Google Apps Script to add the missing Bet Message column
 */
function addBetMessageColumn() {
  try {
    console.log('🔧 Adding Bet Message column to existing sheet...');
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found');
    }
    
    // Get the betting sheet
    const sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    if (!sheet) {
      throw new Error('Betting Data sheet not found');
    }
    
    // Get current headers
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const currentHeaders = headerRange.getValues()[0];
    
    console.log('Current headers:', currentHeaders);
    
    // Check if Bet Message column already exists
    const hasBetMessage = currentHeaders.includes('Bet Message');
    
    if (hasBetMessage) {
      console.log('✅ Bet Message column already exists');
      return { success: true, message: 'Bet Message column already exists' };
    }
    
    // Find the Bet ID column index
    const betIdColumnIndex = currentHeaders.indexOf('Bet ID');
    if (betIdColumnIndex === -1) {
      throw new Error('Bet ID column not found');
    }
    
    console.log('Bet ID column found at index:', betIdColumnIndex + 1);
    
    // Insert new column after Bet ID column
    sheet.insertColumnAfter(betIdColumnIndex + 1);
    
    // Set the header
    sheet.getRange(1, betIdColumnIndex + 2).setValue('Bet Message');
    
    // Format the header
    const newHeaderCell = sheet.getRange(1, betIdColumnIndex + 2);
    newHeaderCell.setBackground('#4285f4');
    newHeaderCell.setFontColor('white');
    newHeaderCell.setFontWeight('bold');
    newHeaderCell.setFontSize(11);
    
    // Set column width
    sheet.setColumnWidth(betIdColumnIndex + 2, 200);
    
    console.log('Header added at column:', betIdColumnIndex + 2);
    
    // Generate bet messages for existing rows
    const lastRow = sheet.getLastRow();
    console.log('Last row with data:', lastRow);
    
    if (lastRow > 1) {
      for (let row = 2; row <= lastRow; row++) {
        try {
          // Get bet data from existing columns (after Bet Message column insertion)
          const betId = sheet.getRange(row, 2).getValue(); // Bet ID column
          const warId = sheet.getRange(row, 6).getValue(); // War ID column (shifted by +1)
          const factionId = sheet.getRange(row, 7).getValue(); // Faction ID column (shifted by +1)
          const xanaxAmount = sheet.getRange(row, 9).getValue(); // Xanax Amount column (shifted by +1)
          
          console.log(`Row ${row}: Bet ID = ${betId}, War ID = ${warId}, Faction ID = ${factionId}, Xanax = ${xanaxAmount}`);
          
          if (betId && warId && factionId && xanaxAmount) {
            const betMessage = `BET:${warId}:${factionId}:${xanaxAmount}:${betId}`;
            sheet.getRange(row, betIdColumnIndex + 2).setValue(betMessage);
            console.log(`Row ${row}: Bet Message = ${betMessage}`);
          }
        } catch (error) {
          console.error(`Error processing row ${row}:`, error);
        }
      }
    }
    
    console.log('✅ Bet Message column added and populated for all existing bets');
    
    return {
      success: true,
      message: 'Bet Message column added successfully',
      rowsProcessed: lastRow - 1
    };
    
  } catch (error) {
    console.error('❌ Error adding Bet Message column:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Manual function to fix incorrect bet messages in existing sheet
 * Run this function manually in Google Apps Script to correct bet message format
 */
function fixBetMessages() {
  try {
    console.log('🔧 Fixing bet messages in existing sheet...');
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found');
    }
    
    // Get the betting sheet
    const sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    if (!sheet) {
      throw new Error('Betting Data sheet not found');
    }
    
    // Get current headers to find Bet Message column
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const currentHeaders = headerRange.getValues()[0];
    const betMessageColumnIndex = currentHeaders.indexOf('Bet Message');
    
    if (betMessageColumnIndex === -1) {
      throw new Error('Bet Message column not found');
    }
    
    console.log('Bet Message column found at index:', betMessageColumnIndex + 1);
    
    // Fix bet messages for existing rows
    const lastRow = sheet.getLastRow();
    console.log('Last row with data:', lastRow);
    
    if (lastRow > 1) {
      for (let row = 2; row <= lastRow; row++) {
        try {
          // Get bet data from the correct columns
          const betId = sheet.getRange(row, 2).getValue(); // Bet ID column
          const warId = sheet.getRange(row, 6).getValue(); // War ID column
          const factionId = sheet.getRange(row, 7).getValue(); // Faction ID column
          const xanaxAmount = sheet.getRange(row, 9).getValue(); // Xanax Amount column
          
          console.log(`Row ${row}: Bet ID = ${betId}, War ID = ${warId}, Faction ID = ${factionId}, Xanax = ${xanaxAmount}`);
          
          if (betId && warId && factionId && xanaxAmount) {
            const correctBetMessage = `BET:${warId}:${factionId}:${xanaxAmount}:${betId}`;
            sheet.getRange(row, betMessageColumnIndex + 1).setValue(correctBetMessage);
            console.log(`Row ${row}: Fixed Bet Message = ${correctBetMessage}`);
          }
        } catch (error) {
          console.error(`Error processing row ${row}:`, error);
        }
      }
    }
    
    console.log('✅ Bet messages fixed for all existing bets');
    
    return {
      success: true,
      message: 'Bet messages fixed successfully',
      rowsProcessed: lastRow - 1
    };
    
  } catch (error) {
    console.error('❌ Error fixing bet messages:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Manual function to add Expected Payout column to existing sheet
 * Run this function manually in Google Apps Script to fix existing sheets
 */
function addExpectedPayoutColumn() {
  try {
    console.log('🔧 Adding Expected Payout column to existing sheet...');
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found');
    }
    
    // Get the betting sheet
    const sheet = spreadsheet.getSheetByName(BETTING_SHEET_NAME);
    if (!sheet) {
      throw new Error('Betting Data sheet not found');
    }
    
    // Get current headers
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const currentHeaders = headerRange.getValues()[0];
    
    console.log('Current headers:', currentHeaders);
    
    // Check if Expected Payout column already exists
    const hasExpectedPayout = currentHeaders.includes('Expected Payout ($)');
    
    if (hasExpectedPayout) {
      console.log('✅ Expected Payout column already exists');
      return { success: true, message: 'Expected Payout column already exists' };
    }
    
    // Find the Odds column index
    const oddsColumnIndex = currentHeaders.indexOf('Odds');
    if (oddsColumnIndex === -1) {
      throw new Error('Odds column not found');
    }
    
    console.log('Odds column found at index:', oddsColumnIndex + 1);
    
    // Insert new column after Odds column
    sheet.insertColumnAfter(oddsColumnIndex + 1);
    
    // Set the header
    sheet.getRange(1, oddsColumnIndex + 2).setValue('Expected Payout ($)');
    
    // Format the header
    const newHeaderCell = sheet.getRange(1, oddsColumnIndex + 2);
    newHeaderCell.setBackground('#4285f4');
    newHeaderCell.setFontColor('white');
    newHeaderCell.setFontWeight('bold');
    newHeaderCell.setFontSize(11);
    
    console.log('Header added at column:', oddsColumnIndex + 2);
    
    // Calculate expected payout for existing rows
    const lastRow = sheet.getLastRow();
    console.log('Last row with data:', lastRow);
    
    if (lastRow > 1) {
      for (let row = 2; row <= lastRow; row++) {
        try {
          // Get bet amount and odds (adjust column numbers based on your sheet)
          const betAmountCell = sheet.getRange(row, 10); // Bet Amount column (index 9)
          const oddsCell = sheet.getRange(row, 11); // Odds column (index 10)
          
          const betAmount = betAmountCell.getValue();
          const odds = oddsCell.getValue();
          
          console.log(`Row ${row}: Bet Amount = ${betAmount}, Odds = ${odds}`);
          
          if (betAmount && odds) {
            // Remove $ and commas from bet amount if present
            const cleanBetAmount = String(betAmount).replace(/[$,]/g, '');
            const numericBetAmount = parseFloat(cleanBetAmount);
            
            if (!isNaN(numericBetAmount) && !isNaN(odds)) {
              const expectedPayout = Math.round(numericBetAmount * odds);
              // Expected Payout column is at oddsColumnIndex + 1 (after Odds column)
              sheet.getRange(row, oddsColumnIndex + 1).setValue(expectedPayout);
              console.log(`Row ${row}: Expected Payout = ${expectedPayout}`);
            }
          }
        } catch (error) {
          console.error(`Error processing row ${row}:`, error);
        }
      }
    }
    
    console.log('✅ Expected Payout column added and calculated for all existing bets');
    
    return {
      success: true,
      message: 'Expected Payout column added successfully',
      rowsProcessed: lastRow - 1
    };
    
  } catch (error) {
    console.error('❌ Error adding Expected Payout column:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
