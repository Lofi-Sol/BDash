/**
 * Enhanced Random Wars Selector - TEST VERSION with Odds Engine
 * This script randomly selects 10 wars and calculates professional betting odds
 */

// Configuration
const TEST_SOURCE_SHEET_NAME = 'Torn Wars Data (Apps Script)';
const TEST_TARGET_SHEET_NAME = 'Random Wars Test Sample';
const TEST_NUM_WARS_TO_SELECT = 10;
const TEST_NOTIFICATION_EMAIL = 'oowol003@gmail.com';
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
    { start: 35, end: 43, color: '#ff6f00', name: 'Betting Odds' } // Orange for odds
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
function copyWarsDataToTargetWithOdds(targetSheet, selectedWars) {
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
    const faction1BasicStats = getFactionBasicStats(faction1Id);
    const faction2BasicStats = getFactionBasicStats(faction2Id);
    
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
  sheet.autoResizeColumns(1, 47);
  
  // Add hyperlinks
  addFactionHyperlinksToTarget(sheet, numRows);
}

/**
 * Main function with odds integration
 */
function selectRandomWarsTest() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found.');
    }
    
    const sourceSheet = spreadsheet.getSheetByName(TEST_SOURCE_SHEET_NAME);
    if (!sourceSheet) {
      throw new Error(`Source sheet "${TEST_SOURCE_SHEET_NAME}" not found.`);
    }
    
    const sourceData = getSourceSheetData(sourceSheet);
    if (sourceData.length === 0) {
      throw new Error('No data found in the source sheet.');
    }
    
    console.log(`Found ${sourceData.length} total wars in source sheet`);
    
    const selectedWars = selectRandomWarsFromData(sourceData);
    console.log(`Selected ${selectedWars.length} random unstarted wars:`, selectedWars.map(war => war[0]));
    
    const targetSheet = createOrUpdateTargetSheet(spreadsheet);
    
    // Use enhanced copy function with odds
    copyWarsDataToTargetWithOdds(targetSheet, selectedWars);
    
    console.log(`Successfully created "${TEST_TARGET_SHEET_NAME}" with ${selectedWars.length} unstarted wars and betting odds`);
    
    sendEnhancedNotificationEmail(selectedWars.length, selectedWars.map(war => war[0]));
    
    return {
      success: true,
      message: `Created "${TEST_TARGET_SHEET_NAME}" with ${selectedWars.length} unstarted wars and professional betting odds`,
      selectedWarIds: selectedWars.map(war => war[0]),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error selecting random wars:', error);
    sendErrorNotificationEmail(error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Enhanced notification email
 */
function sendEnhancedNotificationEmail(selectedWarsCount, selectedWarIds) {
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
• Source sheet: ${TEST_SOURCE_SHEET_NAME}
• Target sheet: ${TEST_TARGET_SHEET_NAME}
• ✅ TEST VERSION: Only selecting unstarted wars (duration = 0m)

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
      to: TEST_NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log(`Enhanced notification email sent to ${TEST_NOTIFICATION_EMAIL}`);
    
  } catch (error) {
    console.error('Failed to send enhanced notification email:', error);
  }
}

// Include all the existing helper functions from the original script
function getSourceSheetData(sourceSheet) {
  const lastRow = sourceSheet.getLastRow();
  const lastCol = sourceSheet.getLastColumn();
  
  if (lastRow <= 1) {
    return [];
  }
  
  const dataRange = sourceSheet.getRange(2, 1, lastRow - 1, lastCol);
  const data = dataRange.getValues();
  
  console.log(`Found ${data.length} wars in source sheet`);
  return data;
}

function selectRandomWarsFromData(sourceData) {
  // Filter for wars that have not started (duration is "0m")
  const unstartedWars = sourceData.filter(war => {
    const duration = war[6]; // Duration is column 7 (index 6)
    return duration === "0m" || duration === "0" || duration === 0;
  });
  
  console.log(`Found ${unstartedWars.length} unstarted wars out of ${sourceData.length} total wars`);
  
  if (unstartedWars.length === 0) {
    console.log('No unstarted wars found!');
    return [];
  }
  
  const numWarsToSelect = Math.min(TEST_NUM_WARS_TO_SELECT, unstartedWars.length);
  
  if (numWarsToSelect === 0) {
    return [];
  }
  
  const indices = Array.from({ length: unstartedWars.length }, (_, i) => i);
  
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  const selectedIndices = indices.slice(0, numWarsToSelect);
  const selectedWars = selectedIndices.map(index => unstartedWars[index]);
  
  return selectedWars;
}

function createOrUpdateTargetSheet(spreadsheet) {
  let targetSheet = spreadsheet.getSheetByName(TEST_TARGET_SHEET_NAME);
  
  if (targetSheet) {
    const lastRow = targetSheet.getLastRow();
    if (lastRow > 1) {
      targetSheet.getRange(2, 1, lastRow - 1, 47).clear(); // Clear more columns for odds data
    }
    console.log(`Cleared existing data from "${TEST_TARGET_SHEET_NAME}"`);
  } else {
    targetSheet = spreadsheet.insertSheet(TEST_TARGET_SHEET_NAME);
    console.log(`Created new sheet: "${TEST_TARGET_SHEET_NAME}"`);
  }
  
  setupTargetSheetHeaders(targetSheet);
  
  return targetSheet;
}

function addFactionHyperlinksToTarget(sheet, numRows) {
  const faction1Ids = sheet.getRange(2, 9, numRows, 1).getValues();
  const faction1Names = sheet.getRange(2, 10, numRows, 1).getValues();
  const faction2Ids = sheet.getRange(2, 20, numRows, 1).getValues();
  const faction2Names = sheet.getRange(2, 21, numRows, 1).getValues();
  
  for (let i = 0; i < numRows; i++) {
    const factionId = faction1Ids[i][0];
    const factionName = faction1Names[i][0];
    
    if (factionId && factionName && factionName !== 'Unknown') {
      const url = `https://www.torn.com/factions.php?step=profile&ID=${factionId}`;
      const cell = sheet.getRange(2 + i, 10);
      cell.setFormula(`=HYPERLINK("${url}","${factionName}")`);
    }
  }
  
  for (let i = 0; i < numRows; i++) {
    const factionId = faction2Ids[i][0];
    const factionName = faction2Names[i][0];
    
    if (factionId && factionName && factionName !== 'Unknown') {
      const url = `https://www.torn.com/factions.php?step=profile&ID=${factionId}`;
      const cell = sheet.getRange(2 + i, 21);
      cell.setFormula(`=HYPERLINK("${url}","${factionName}")`);
    }
  }
  
  console.log(`Added hyperlinks for ${numRows} rows in target sheet`);
}

// Include existing API functions
function fetchFactionBasicData(factionId) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `https://api.torn.com/v2/faction/${factionId}/basic?key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`Torn API v2 returned response code: ${responseCode}`);
    }
    
    const responseText = response.getContentText();
    const data = JSON.parse(responseText);
    
    if (data.error) {
      throw new Error(`Torn API v2 error: ${data.error.code} - ${data.error.error}`);
    }
    
    return data;
    
  } catch (error) {
    if (error.message.includes('Torn API v2 error')) {
      throw error;
    }
    throw new Error(`Failed to fetch faction basic data from Torn API v2: ${error.message}`);
  }
}

function getFactionBasicStats(factionId) {
  try {
    const factionBasicData = fetchFactionBasicData(factionId);
    
    if (!factionBasicData.basic) {
      return {
        rankValue: 'N/A',
        respectValue: 'N/A',
        hofChainValue: 'N/A',
        membersValue: 'N/A'
      };
    }
    
    const basic = factionBasicData.basic;
    const rank = basic.rank || {};
    
    return {
      rankValue: rank.level || 'N/A',
      respectValue: basic.respect || 'N/A',
      hofChainValue: basic.best_chain || 'N/A',
      membersValue: basic.members || 'N/A'
    };
    
  } catch (error) {
    console.error(`Error fetching basic data for faction ID ${factionId}:`, error);
    return {
      rankValue: 'N/A',
      respectValue: 'N/A',
      hofChainValue: 'N/A',
      membersValue: 'N/A'
    };
  }
}

function fetchFactionData(factionId) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('TORN_API_KEY');
  if (!apiKey) {
    throw new Error('Torn API key not found. Please set the TORN_API_KEY script property.');
  }
  
  const url = `https://api.torn.com/faction/${factionId}?selections=rankedwars&key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`Torn API returned response code: ${responseCode}`);
    }
    
    const responseText = response.getContentText();
    const data = JSON.parse(responseText);
    
    if (data.error) {
      throw new Error(`Torn API error: ${data.error.code} - ${data.error.error}`);
    }
    
    return data;
    
  } catch (error) {
    if (error.message.includes('Torn API error')) {
      throw error;
    }
    throw new Error(`Failed to fetch faction data from Torn API: ${error.message}`);
  }
}

function getFactionWarStats(factionId) {
  try {
    const factionData = fetchFactionData(factionId);
    
    if (!factionData.rankedwars) {
      return {
        warsWon: 0,
        warsLost: 0,
        winRate: '0%'
      };
    }
    
    const rankedWars = factionData.rankedwars;
    let warsWon = 0;
    let warsLost = 0;
    
    Object.entries(rankedWars).forEach(([warId, war]) => {
      const factionInWar = war.factions && (war.factions[factionId] || war.factions[factionId.toString()] || war.factions[parseInt(factionId)]);
      
      if (factionInWar) {
        const winner = war.war && war.war.winner;
        
        if (winner && (winner.toString() === factionId.toString() || winner === parseInt(factionId))) {
          warsWon++;
        } else if (winner && (winner.toString() !== factionId.toString() && winner !== parseInt(factionId))) {
          warsLost++;
        }
      }
    });
    
    const totalWars = warsWon + warsLost;
    const winRate = totalWars > 0 ? Math.round((warsWon / totalWars) * 100) : 0;
    
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
    
    const subject = `❌ Enhanced Random Wars Test Script Failed`;
    
    const body = `
Enhanced Random Wars Test Selection Script with Odds Engine encountered an error!

⚠️ Error Details:
• Error message: ${errorMessage}
• Error time: ${timestamp} UTC
• Source sheet: ${TEST_SOURCE_SHEET_NAME}
• Target sheet: ${TEST_TARGET_SHEET_NAME}

🔧 Troubleshooting Steps:
1. Check if the source sheet exists and has data
2. Verify your Torn API key is set correctly
3. Check the Apps Script execution log for more details
4. Ensure sufficient API quota remaining

📋 Common Issues:
• "Source sheet not found" - Ensure the sheet name is correct
• "No data found" - Run the main Torn Wars updater first
• "Torn API key not found" - Set the TORN_API_KEY script property
• Odds calculation errors - Check faction data availability

---
This is an automated error notification from the Enhanced Random Wars Test Script.
    `.trim();
    
    MailApp.sendEmail({
      to: TEST_NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log(`Error notification email sent to ${TEST_NOTIFICATION_EMAIL}`);
    
  } catch (emailError) {
    console.error('Failed to send error notification email:', emailError);
  }
}

// Test functions
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

function runEnhancedRandomWarsTest() {
  console.log('Starting enhanced random wars test selection with odds...');
  const result = selectRandomWarsTest();
  console.log('Enhanced random wars test selection result:', result);
  return result;
}

function deleteRandomWarsTestSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheet = spreadsheet.getSheetByName(TEST_TARGET_SHEET_NAME);
  
  if (targetSheet) {
    spreadsheet.deleteSheet(targetSheet);
    console.log(`Deleted sheet: "${TEST_TARGET_SHEET_NAME}"`);
    return {
      success: true,
      message: `Deleted sheet: "${TEST_TARGET_SHEET_NAME}"`
    };
  } else {
    console.log(`Sheet "${TEST_TARGET_SHEET_NAME}" does not exist`);
    return {
      success: false,
      message: `Sheet "${TEST_TARGET_SHEET_NAME}" does not exist`
    };
  }
}