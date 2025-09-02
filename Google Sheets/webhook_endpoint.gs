/**
 * Webhook Endpoint for GitHub Actions
 * This creates a web app that can receive POST requests to trigger sheet updates
 */

/**
 * Handle POST requests from GitHub Actions
 */
function doPost(e) {
  try {
    // Parse the request
    const requestData = JSON.parse(e.postData.contents);
    
    // Log the request for debugging
    console.log('Webhook received:', requestData);
    
    // Verify this is a valid request (you can add more validation here)
    if (!requestData.action || requestData.action !== 'update_wars') {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action specified'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Trigger the wars update
    const result = updateTornWarsSheet();
    
    // Return the result
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Webhook error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'Torn Wars Webhook is running',
      timestamp: new Date().toISOString(),
      instructions: 'Send a POST request with {"action": "update_wars"} to trigger an update'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Deploy this as a web app to get the webhook URL
 * Instructions:
 * 1. Run this function once to deploy
 * 2. Set execution as: "Me"
 * 3. Set access as: "Anyone, even anonymous"
 * 4. Copy the web app URL for use in GitHub Actions
 */
function deployWebhook() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Deploy Webhook',
    'To deploy this webhook:\n\n' +
    '1. Go to Deploy > New deployment\n' +
    '2. Choose "Web app"\n' +
    '3. Set "Execute as" to "Me"\n' +
    '4. Set "Who has access" to "Anyone"\n' +
    '5. Click "Deploy"\n' +
    '6. Copy the web app URL\n\n' +
    'Use this URL in your GitHub Actions workflow.',
    ui.ButtonSet.OK
  );
}
