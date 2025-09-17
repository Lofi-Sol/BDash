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
const XANAX_VALUE = 744983; // Current Xanax market value

/**
 * Enhanced Odds Engine for Google Apps Script
 */
class GoogleSheetsOddsEngine {
  constructor() {
    this.config = {
      houseEdge: 0.06,
      dollarPerXanax: XANAX_VALUE,
      
      // Pre-war weights (no current score data available)
      weights: {
        staticPower: 0.40,
        winRate: 0.30,
        recentPerformance: 0.20,
        scoreEfficiency: 0.05,
        consistency: 0.05
      },
      
      // Rank multipliers based on rank values from API
      rankMultipliers: {
        25: 1.60, 24: 1.50, 23: 1.40, 22: 1.30, // Diamond tiers
        21: 1.20, 20: 1.10, 19: 1.00,           // Platinum tiers
        18: 0.85, 17: 0.75, 16: 0.65, 15: 0.55, // Gold tiers
        14: 0.45, 13: 0.35, 12: 0.28, 11: 0.22, // Silver tiers
        10: 0.18, 9: 0.14, 8: 0.10, 7: 0.07,   // Bronze tiers
        'default': 0.05
      }
    };
  }

  calculateStaticPower(faction) {
    const respectScore = (faction.respectValue || 1000000) / 1000000;
    const rankMultiplier = this.config.rankMultipliers[faction.rankValue] || this.config.rankMultipliers['default'];
    
    // Member efficiency calculation
    let memberEfficiency;
    const members = faction.membersValue || 50;
    if (members >= 100) memberEfficiency = 1.0;
    else if (members >= 90) memberEfficiency = 0.95;
    else if (members >= 80) memberEfficiency = 0.90;
    else if (members >= 70) memberEfficiency = 0.85;
    else if (members >= 50) memberEfficiency = 0.80;
    else if (members >= 20) memberEfficiency = 0.60;
    else memberEfficiency = 0.40;
    
    return respectScore * rankMultiplier * memberEfficiency;
  }

  calculatePerformanceMetrics(faction) {
    // Parse win rate
    let winRate = 0.5;
    if (faction.winRate && faction.winRate !== 'N/A') {
      const winRateStr = faction.winRate.toString().replace('%', '');
      winRate = parseFloat(winRateStr) / 100;
    }
    
    const winRateScore = Math.max(0.5, Math.min(2.0, winRate * 2));
    
    // Calculate confidence based on total wars
    const totalWars = (faction.warsWon || 0) + (faction.warsLost || 0);
    let confidence;
    if (totalWars >= 30) confidence = 95;
    else if (totalWars >= 20) confidence = 85;
    else if (totalWars >= 15) confidence = 75;
    else if (totalWars >= 10) confidence = 65;
    else if (totalWars >= 5) confidence = 45;
    else confidence = 25;
    
    return {
      winRateScore,
      recentPerformanceScore: winRateScore,
      scoreEfficiencyScore: 1.0,
      consistencyScore: 1.0,
      confidence,
      totalWars,
      actualWinRate: winRate
    };
  }

  calculateComprehensiveRating(faction) {
    const staticPower = this.calculateStaticPower(faction);
    const performance = this.calculatePerformanceMetrics(faction);
    
    const rating = 
      (staticPower * this.config.weights.staticPower) +
      (performance.winRateScore * this.config.weights.winRate) +
      (performance.recentPerformanceScore * this.config.weights.recentPerformance) +
      (performance.scoreEfficiencyScore * this.config.weights.scoreEfficiency) +
      (performance.consistencyScore * this.config.weights.consistency);
    
    return {
      overallRating: rating,
      confidence: performance.confidence,
      breakdown: {
        staticPower,
        ...performance
      }
    };
  }

  calculateWarOdds(faction1Data, faction2Data) {
    console.log(`Calculating odds for: ${faction1Data.name} vs ${faction2Data.name}`);
    
    const rating1 = this.calculateComprehensiveRating(faction1Data);
    const rating2 = this.calculateComprehensiveRating(faction2Data);
    
    // Calculate win probabilities
    const totalRating = rating1.overallRating + rating2.overallRating;
    const trueProb1 = rating1.overallRating / totalRating;
    const trueProb2 = rating2.overallRating / totalRating;
    
    // Add small variance for uncertainty
    const variance1 = (Math.random() - 0.5) * 0.02; // ±1%
    const variance2 = -variance1;
    
    const adjustedProb1 = Math.max(0.05, Math.min(0.95, trueProb1 + variance1));
    const adjustedProb2 = 1 - adjustedProb1;
    
    // Apply house edge
    const overround = 1 + this.config.houseEdge;
    const impliedProb1 = adjustedProb1 * overround / (adjustedProb1 * overround + adjustedProb2 * overround);
    const impliedProb2 = 1 - impliedProb1;
    
    // Convert to decimal odds
    const odds1 = Math.round((1 / impliedProb1) * 100) / 100;
    const odds2 = Math.round((1 / impliedProb2) * 100) / 100;
    
    // Generate betting examples
    const examples1 = this.generateBettingExamples(odds1);
    const examples2 = this.generateBettingExamples(odds2);
    
    const overallConfidence = Math.round((rating1.confidence + rating2.confidence) / 2);
    
    console.log(`Final odds: ${faction1Data.name} ${odds1} vs ${faction2Data.name} ${odds2}`);
    
    return {
      faction1: {
        name: faction1Data.name,
        odds: odds1,
        impliedProbability: impliedProb1,
        trueProbability: adjustedProb1,
        confidence: rating1.confidence,
        bettingExamples: examples1
      },
      faction2: {
        name: faction2Data.name,
        odds: odds2,
        impliedProbability: impliedProb2,
        trueProbability: adjustedProb2,
        confidence: rating2.confidence,
        bettingExamples: examples2
      },
      metadata: {
        overallConfidence,
        houseEdge: this.config.houseEdge * 100,
        ratingRatio: rating1.overallRating / rating2.overallRating,
        timestamp: new Date()
      }
    };
  }

  generateBettingExamples(odds) {
    const examples = [];
    const xanaxAmounts = [1, 2, 5];
    
    for (const amount of xanaxAmounts) {
      const betDollars = amount * this.config.dollarPerXanax;
      const totalReturn = Math.round(betDollars * odds);
      const profit = totalReturn - betDollars;
      
      examples.push({
        xanaxAmount: amount,
        betDollars,
        totalReturn,
        profit,
        description: `${amount} Xanax ($${betDollars.toLocaleString()}) → $${totalReturn.toLocaleString()} (+$${profit.toLocaleString()})`
      });
    }
    
    return examples;
  }
}

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
      targetSheet.getRange(2, 1, lastRow - 1, 48).clear();
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
 * Enhanced setup headers with odds columns
 */
function setupTargetSheetHeaders(sheet) {
  // Enhanced headers including odds columns
  const headers = [
    // Original 34 columns
    'War ID', 'Status', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Duration', 'Target Score',
    'Faction 1 ID', 'Faction 1 Name', 'Faction 1 Score', 'Faction 1 Chain', 'Faction 1 Wars Won', 'Faction 1 Wars Lost', 'Faction 1 Win Rate', 'Faction 1 Rank Value', 'Faction 1 Respect Value', 'Faction 1 HOF Chain Value', 'Faction 1 Members',
    'Faction 2 ID', 'Faction 2 Name', 'Faction 2 Score', 'Faction 2 Chain', 'Faction 2 Wars Won', 'Faction 2 Wars Lost', 'Faction 2 Win Rate', 'Faction 2 Rank Value', 'Faction 2 Respect Value', 'Faction 2 HOF Chain Value', 'Faction 2 Members',
    'Total Score', 'Winner Faction ID', 'Last Updated Date', 'Last Updated Time',
    // New odds columns (starting at column 35)
    'Faction 1 Odds', 'Faction 1 Implied %', 'Faction 1 True %', 'Faction 1 Confidence', 'Faction 1 Bet Example',
    'Faction 2 Odds', 'Faction 2 Implied %', 'Faction 2 True %', 'Faction 2 Confidence', 'Faction 2 Bet Example',
    'Overall Confidence', 'House Edge %', 'Rating Ratio', 'Odds Calculated At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers with colors
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setFontColor('white');
  headerRange.setHorizontalAlignment('center');
  
  // Define column groups and their colors
  const columnGroups = [
    { start: 1, end: 8, color: '#1f4e79', name: 'Basic War Data' },
    { start: 9, end: 19, color: '#2e7d32', name: 'Faction 1' },
    { start: 20, end: 30, color: '#d32f2f', name: 'Faction 2' },
    { start: 31, end: 34, color: '#7b1fa2', name: 'Final Data' },
    { start: 35, end: 47, color: '#ff6f00', name: 'Betting Odds' } // Orange for odds
  ];
  
  // Apply colors to each group
  columnGroups.forEach(group => {
    if (group.end <= headers.length) {
      const groupRange = sheet.getRange(1, group.start, 1, group.end - group.start + 1);
      groupRange.setBackground(group.color);
      console.log(`Applied ${group.color} color to ${group.name} columns (${group.start}-${group.end})`);
    }
  });
  
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Enhanced copy function with odds calculations
 */
function copyWarsDataToTarget(targetSheet, selectedWars) {
  if (selectedWars.length === 0) {
    return;
  }
  
  console.log('Initializing odds engine...');
  const oddsEngine = new GoogleSheetsOddsEngine();
  
  // Process each war and calculate odds
  const enhancedWarsData = selectedWars.map(war => {
    const faction1Id = war[8];
    const faction2Id = war[12];
    
    console.log(`Processing war ${war[0]}: ${faction1Id} vs ${faction2Id}`);
    
    // Get faction data
    const faction1Stats = getFactionWarStats(faction1Id);
    const faction2Stats = getFactionWarStats(faction2Id);
    const faction1BasicStats = getFactionHOFStats(faction1Id);
    const faction2BasicStats = getFactionHOFStats(faction2Id);
    
    // Prepare faction data for odds calculation
    const faction1Data = {
      name: war[9],
      respectValue: faction1BasicStats.respectValue,
      rankValue: faction1BasicStats.rankValue,
      membersValue: faction1BasicStats.membersValue,
      warsWon: faction1Stats.warsWon,
      warsLost: faction1Stats.warsLost,
      winRate: faction1Stats.winRate
    };
    
    const faction2Data = {
      name: war[13],
      respectValue: faction2BasicStats.respectValue,
      rankValue: faction2BasicStats.rankValue,
      membersValue: faction2BasicStats.membersValue,
      warsWon: faction2Stats.warsWon,
      warsLost: faction2Stats.warsLost,
      winRate: faction2Stats.winRate
    };
    
    // Calculate odds
    let oddsResult;
    try {
      oddsResult = oddsEngine.calculateWarOdds(faction1Data, faction2Data);
    } catch (error) {
      console.error(`Error calculating odds for war ${war[0]}:`, error);
      // Fallback odds
      oddsResult = {
        faction1: { odds: 2.00, impliedProbability: 0.50, trueProbability: 0.485, confidence: 25, bettingExamples: [] },
        faction2: { odds: 2.00, impliedProbability: 0.50, trueProbability: 0.515, confidence: 25, bettingExamples: [] },
        metadata: { overallConfidence: 25, houseEdge: 6.0, ratingRatio: 1.0, timestamp: new Date() }
      };
    }
    
    // Create enhanced row with odds data
    const enhancedRow = [
      // Original 34 columns
      war[0], war[1], war[2], war[3], war[4], war[5], war[6], war[7],
      war[8], war[9], war[10], war[11], 
      faction1Stats.warsWon, faction1Stats.warsLost, faction1Stats.winRate,
      faction1BasicStats.rankValue, faction1BasicStats.respectValue, faction1BasicStats.hofChainValue, faction1BasicStats.membersValue,
      war[12], war[13], war[14], war[15],
      faction2Stats.warsWon, faction2Stats.warsLost, faction2Stats.winRate,
      faction2BasicStats.rankValue, faction2BasicStats.respectValue, faction2BasicStats.hofChainValue, faction2BasicStats.membersValue,
      war[16], war[17], war[18], war[19],
      // New odds columns (starting at column 35)
      oddsResult.faction1.odds,
      Math.round(oddsResult.faction1.impliedProbability * 10000) / 100, // Percentage with 2 decimals
      Math.round(oddsResult.faction1.trueProbability * 10000) / 100,
      oddsResult.faction1.confidence,
      oddsResult.faction1.bettingExamples[0]?.description || 'N/A',
      oddsResult.faction2.odds,
      Math.round(oddsResult.faction2.impliedProbability * 10000) / 100,
      Math.round(oddsResult.faction2.trueProbability * 10000) / 100,
      oddsResult.faction2.confidence,
      oddsResult.faction2.bettingExamples[0]?.description || 'N/A',
      oddsResult.metadata.overallConfidence,
      oddsResult.metadata.houseEdge,
      Math.round(oddsResult.metadata.ratingRatio * 100) / 100,
      oddsResult.metadata.timestamp.toLocaleString()
    ];
    
    return enhancedRow;
  });
  
  // Add enhanced data to sheet
  const range = targetSheet.getRange(2, 1, enhancedWarsData.length, enhancedWarsData[0].length);
  range.setValues(enhancedWarsData);
  
  // Format columns
  formatEnhancedSheet(targetSheet, enhancedWarsData.length);
  
  console.log(`Copied ${selectedWars.length} wars with odds calculations to target sheet`);
}

/**
 * Format the enhanced sheet with odds data
 */
function formatEnhancedSheet(sheet, numRows) {
  // Format date columns
  const startDateRange = sheet.getRange(2, 3, numRows, 1);
  const endDateRange = sheet.getRange(2, 5, numRows, 1);
  const lastUpdatedDateRange = sheet.getRange(2, 33, numRows, 1);
  
  startDateRange.setNumberFormat('yyyy-mm-dd');
  endDateRange.setNumberFormat('yyyy-mm-dd');
  lastUpdatedDateRange.setNumberFormat('yyyy-mm-dd');
  
  // Format time columns
  const startTimeRange = sheet.getRange(2, 4, numRows, 1);
  const endTimeRange = sheet.getRange(2, 6, numRows, 1);
  const lastUpdatedTimeRange = sheet.getRange(2, 34, numRows, 1);
  
  startTimeRange.setNumberFormat('@');
  endTimeRange.setNumberFormat('@');
  lastUpdatedTimeRange.setNumberFormat('@');
  
  // Format odds columns
  const odds1Range = sheet.getRange(2, 35, numRows, 1);
  const odds2Range = sheet.getRange(2, 40, numRows, 1);
  odds1Range.setNumberFormat('0.00');
  odds2Range.setNumberFormat('0.00');
  
  // Format percentage columns
  const impl1Range = sheet.getRange(2, 36, numRows, 1);
  const true1Range = sheet.getRange(2, 37, numRows, 1);
  const impl2Range = sheet.getRange(2, 41, numRows, 1);
  const true2Range = sheet.getRange(2, 42, numRows, 1);
  
  impl1Range.setNumberFormat('0.00"%"');
  true1Range.setNumberFormat('0.00"%"');
  impl2Range.setNumberFormat('0.00"%"');
  true2Range.setNumberFormat('0.00"%"');
  
  // Format confidence columns
  const conf1Range = sheet.getRange(2, 38, numRows, 1);
  const conf2Range = sheet.getRange(2, 43, numRows, 1);
  const overallConfRange = sheet.getRange(2, 45, numRows, 1);
  
  conf1Range.setNumberFormat('0"%"');
  conf2Range.setNumberFormat('0"%"');
  overallConfRange.setNumberFormat('0"%"');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 48);
  
  // Add hyperlinks
  addFactionHyperlinksToTarget(sheet, numRows);
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
 * Test function to debug basic data for a specific faction
 */
function testFactionHOFData(factionId) {
  if (!factionId) {
    console.error('No faction ID provided to testFactionHOFData');
    return { error: 'No faction ID provided' };
  }
  
  console.log(`Testing basic data for faction ID: ${factionId}`);
  try {
    const basicStats = getFactionHOFStats(factionId);
    console.log(`Faction ${factionId} basic stats:`, basicStats);
    return basicStats;
  } catch (error) {
    console.error(`Error testing basic data for faction ${factionId}:`, error);
    return { error: error.message };
  }
}

/**
 * Test function to debug basic data for multiple factions
 */
function testMultipleFactionsHOF() {
  const testFactions = [53054, 937, 9100, 10850, 12249]; // Sample faction IDs including the one from your example
  const results = {};
  
  testFactions.forEach(factionId => {
    console.log(`\n=== Testing Basic Data for Faction ${factionId} ===`);
    results[factionId] = testFactionHOFData(factionId);
  });
  
  console.log('\n=== All Basic Results ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * Quick test function for basic data
 */
function quickTestHOF() {
  return testFactionHOFData(53054); // Test the faction from your example
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
 * Fetch faction basic data from Torn API v2 (includes rank and respect)
 */
function fetchFactionHOFData(factionId) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `https://api.torn.com/v2/faction/${factionId}/basic?key=${apiKey}`;
  
  console.log(`Fetching faction basic data from: ${url}`);
  
  try {
    const response = UrlFetchApp.fetch(url);
    const responseCode = response.getResponseCode();
    
    console.log(`Basic API response code: ${responseCode}`);
    
    if (responseCode !== 200) {
      throw new Error(`Torn API v2 returned response code: ${responseCode}`);
    }
    
    const responseText = response.getContentText();
    console.log(`Raw Basic API response: ${responseText.substring(0, 500)}...`);
    
    const data = JSON.parse(responseText);
    
    if (data.error) {
      throw new Error(`Torn API v2 error: ${data.error.code} - ${data.error.error}`);
    }
    
    console.log(`Parsed Basic data keys: ${Object.keys(data)}`);
    if (data.basic) {
      console.log(`Basic data:`, JSON.stringify(data.basic, null, 2));
    }
    
    return data;
    
  } catch (error) {
    if (error.message.includes('Torn API v2 error')) {
      throw error;
    }
    throw new Error(`Failed to fetch faction basic data from Torn API v2: ${error.message}`);
  }
}

/**
 * Get faction basic statistics (rank and respect from basic endpoint)
 */
function getFactionHOFStats(factionId) {
  try {
    const factionBasicData = fetchFactionHOFData(factionId);
    
    console.log(`Faction ${factionId} basic data:`, JSON.stringify(factionBasicData, null, 2));
    
    if (!factionBasicData.basic) {
      console.log(`No basic data for faction ${factionId}`);
      return {
        rankValue: 'N/A',
        rankPosition: 'N/A',
        respectValue: 'N/A',
        respectPosition: 'N/A',
        hofChainValue: 'N/A',
        hofChainPosition: 'N/A',
        membersValue: 'N/A'
      };
    }
    
    const basic = factionBasicData.basic;
    const rank = basic.rank || {};
    
    // Extract rank data from the new API response format
    const rankValue = rank.level || 'N/A';
    const rankPosition = rank.position || 'N/A';
    
    // Extract respect data
    const respectValue = basic.respect || 'N/A';
    const respectPosition = 'N/A'; // Position not available in basic endpoint
    
    // Extract chain data (best_chain)
    const hofChainValue = basic.best_chain || 'N/A';
    const hofChainPosition = 'N/A'; // Position not available in basic endpoint
    
    // Extract members count
    const membersValue = basic.members || 'N/A';
    
    console.log(`Faction ${factionId} basic stats: Rank=${rankValue}(${rankPosition}), Respect=${respectValue}, Chain=${hofChainValue}, Members=${membersValue}`);
    
    return {
      rankValue: rankValue,
      rankPosition: rankPosition,
      respectValue: respectValue,
      respectPosition: respectPosition,
      hofChainValue: hofChainValue,
      hofChainPosition: hofChainPosition,
      membersValue: membersValue
    };
    
  } catch (error) {
    console.error(`Error fetching basic data for faction ID ${factionId}:`, error);
    return {
      rankValue: 'N/A',
      rankPosition: 'N/A',
      respectValue: 'N/A',
      respectPosition: 'N/A',
      hofChainValue: 'N/A',
      hofChainPosition: 'N/A',
      membersValue: 'N/A'
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
 * Enhanced notification email
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
    
    const subject = `🎰 Random Wars with Professional Odds - ${selectedWarsCount} Wars Selected`;
    
    const body = `
Random Wars Selection with Professional Betting Odds completed successfully!

📊 Selection Summary:
• Total wars selected: ${selectedWarsCount}
• Selection time: ${timestamp} UTC
• Source sheet: ${SOURCE_SHEET_NAME}
• Target sheet: ${TARGET_SHEET_NAME}

🎯 Selected War IDs:
${selectedWarIds.map(id => `• War ID: ${id}`).join('\n')}

🎰 NEW: Professional Betting Odds Engine Added!
Each war now includes comprehensive odds calculations:

📈 Faction Analysis:
• Multi-factor power ratings (respect, rank, members, win rate)
• Historical performance metrics
• Confidence scoring based on war experience
• Advanced statistical modeling

💰 Betting Information:
• Decimal odds with 6% house edge
• Implied vs true win probabilities
• Confidence levels for each prediction
• Xanax betting examples ($${XANAX_VALUE.toLocaleString()} per Xanax)

📊 New Columns Added:
• Faction 1 & 2 Odds (decimal format)
• Implied & True Win Percentages
• Confidence Scores (reliability indicators)
• Betting Examples (Xanax conversion)
• Overall Prediction Confidence
• House Edge & Rating Ratios

🎯 How to Use:
1. Higher confidence scores = more reliable predictions
2. Lower odds = higher probability of winning
3. Use confidence levels to decide bet sizes
4. Orange column headers = betting data

🔗 Access your Google Sheets to view the enhanced results with professional betting odds!

---
This is an automated notification with enhanced odds calculations.
    `.trim();
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log(`Enhanced notification email sent to ${NOTIFICATION_EMAIL}`);
    
  } catch (error) {
    console.error('Failed to send enhanced notification email:', error);
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
      targetSheet.getRange(2, 1, lastRow - 1, 48).clear(); // Clear more columns for odds data
    }
    
    // Copy updated wars data to target sheet with enhanced faction statistics and odds
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
4. Updated faction basic data (rank and respect) from Torn API v2
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

// Test functions for odds calculation and enhanced features
function testOddsCalculation() {
  console.log('Testing odds calculation...');
  const oddsEngine = new GoogleSheetsOddsEngine();
  
  // Test with sample faction data
  const faction1 = {
    name: "Test Faction 1",
    respectValue: 5000000,
    rankValue: 18,
    membersValue: 85,
    warsWon: 45,
    warsLost: 30,
    winRate: "60%"
  };
  
  const faction2 = {
    name: "Test Faction 2", 
    respectValue: 3000000,
    rankValue: 15,
    membersValue: 70,
    warsWon: 20,
    warsLost: 25,
    winRate: "44%"
  };
  
  const result = oddsEngine.calculateWarOdds(faction1, faction2);
  console.log('Test odds result:', JSON.stringify(result, null, 2));
  
  return result;
}

function runEnhancedRandomWarsSelection() {
  console.log('Starting enhanced random wars selection with odds...');
  const result = selectRandomWars();
  console.log('Enhanced random wars selection result:', result);
  return result;
}

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
