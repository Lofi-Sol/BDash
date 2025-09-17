# CORS Error Troubleshooting Guide

## 🚨 **Current Issue: CORS Error (405 Status)**

You're seeing this error:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
Status code: 405
```

This means the Google Apps Script deployment isn't configured correctly.

## 🔧 **Solution Steps:**

### **Step 1: Update Your Google Apps Script Code**

1. **Go to your Google Apps Script project**
2. **Replace the existing code** with the updated code from `betting_data_updater.gs`
3. **Save the script** (Ctrl+S)

### **Step 2: Redeploy the Web App**

1. **Click "Deploy" > "Manage deployments"**
2. **Click the gear icon (⚙️)** next to your current deployment
3. **Update these settings:**
   - **Execute as**: "Me" (your email address)
   - **Who has access**: "Anyone" (NOT "Anyone with Google account")
4. **Click "Done"**
5. **Click "Save"** - this will create a NEW deployment with a NEW URL

### **Step 3: Update Dashboard with New URL**

1. **Copy the NEW web app URL** from the deployment
2. **Open `bettingdashboard.html`**
3. **Find line 4358** and replace the URL:
   ```javascript
   const GOOGLE_SHEETS_URL = 'YOUR_NEW_URL_HERE';
   ```

### **Step 4: Test the Deployment**

1. **In Google Apps Script**, run the `testDeployment()` function
2. **Check the execution log** for any errors
3. **Test the web app URL** directly in your browser

## 🧪 **Testing Steps:**

### **Test 1: Direct URL Test**
Open your web app URL in a new browser tab. You should see:
```json
{"success":true,"message":"Betting Data API is running","timestamp":"..."}
```

### **Test 2: Google Apps Script Test**
1. In Apps Script, select `testDeployment` from function dropdown
2. Click **Run**
3. Check execution log for success messages

### **Test 3: Dashboard Test**
1. Open your dashboard
2. Place a bet
3. Check browser console for success/error messages

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Still Getting 405 Error**
**Solution**: The deployment settings are wrong
- Make sure "Who has access" is set to "Anyone" (not "Anyone with Google account")
- Redeploy and get a new URL

### **Issue 2: CORS Still Blocked**
**Solution**: Try these alternatives:
1. **Use JSONP** (already implemented in updated code)
2. **Use a different deployment type**
3. **Check if the script is actually deployed**

### **Issue 3: Script Not Found**
**Solution**: Make sure the script is properly deployed
- Go to "Deploy" > "Manage deployments"
- Verify there's an active deployment
- Copy the correct URL

### **Issue 4: Permission Denied**
**Solution**: Check script permissions
- Make sure you're the owner of the script
- Check that the Google Sheet is accessible
- Verify API permissions

## 🔍 **Debug Information:**

### **Check Execution Logs:**
1. In Google Apps Script, go to **Executions**
2. Look for recent runs of `doPost` or `doGet`
3. Check for error messages

### **Check Browser Console:**
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for detailed error messages

### **Test with curl:**
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"betId":"TEST123","playerId":"12345","warId":"99999"}'
```

## 🆘 **If Nothing Works:**

### **Alternative 1: Use JSONP**
The updated script supports JSONP. You can modify the dashboard to use JSONP instead of fetch.

### **Alternative 2: Use Google Forms**
Create a Google Form that submits to the same sheet as a backup method.

### **Alternative 3: Manual Entry**
You can always manually enter bets in the Google Sheet while we troubleshoot.

## 📞 **Need Help?**

If you're still having issues:
1. **Check the Google Apps Script execution logs**
2. **Try the test functions** in the script
3. **Verify the deployment settings**
4. **Test the web app URL directly**

The most common fix is updating the deployment settings to "Anyone" access and redeploying.
