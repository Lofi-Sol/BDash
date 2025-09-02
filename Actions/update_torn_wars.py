#!/usr/bin/env python3
"""
Torn Wars Updater - Python Script
This script fetches Torn war data and updates Google Sheets directly
Creates a new sheet every week with date labeling
"""

import os
import json
import requests
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime, timezone, timedelta
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
TORN_API_BASE_URL = "https://api.torn.com/torn/"
SHEET_NAME_PREFIX = "Torn Wars Data"
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

class TornWarsUpdater:
    def __init__(self, torn_api_key, google_creds_path=None):
        self.torn_api_key = torn_api_key
        self.google_creds_path = google_creds_path
        self.gc = None
        
    def authenticate_google(self):
        """Authenticate with Google Sheets API"""
        try:
            if self.google_creds_path and os.path.exists(self.google_creds_path):
                # Use service account credentials
                creds = Credentials.from_service_account_file(
                    self.google_creds_path, scopes=SCOPES
                )
                self.gc = gspread.authorize(creds)
                logger.info("Authenticated with Google using service account")
            else:
                # Try to use environment variable for credentials
                creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
                if creds_json:
                    creds = Credentials.from_service_account_info(
                        json.loads(creds_json), scopes=SCOPES
                    )
                    self.gc = gspread.authorize(creds)
                    logger.info("Authenticated with Google using environment credentials")
                else:
                    raise ValueError("No Google credentials found")
                    
        except Exception as e:
            logger.error(f"Failed to authenticate with Google: {e}")
            raise
    
    def fetch_torn_wars(self):
        """Fetch wars data from Torn API"""
        try:
            url = f"{TORN_API_BASE_URL}?selections=rankedwars&key={self.torn_api_key}"
            logger.info(f"Fetching data from: {url}")
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'error' in data:
                raise ValueError(f"Torn API Error: {data['error']}")
            
            wars_count = len(data.get('rankedwars', {}))
            logger.info(f"Successfully fetched {wars_count} wars from Torn API")
            
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise
    
    def get_weekly_sheet_name(self):
        """Generate sheet name for the current week"""
        # Get the current date
        now = datetime.now(timezone.utc)
        
        # Find the most recent Tuesday (or current day if it's Tuesday)
        days_since_tuesday = (now.weekday() - 1) % 7  # Tuesday is 1 (Monday=0)
        if days_since_tuesday == 0:  # If today is Tuesday
            tuesday_date = now
        else:
            tuesday_date = now - timedelta(days=days_since_tuesday)
        
        # Format the date for the sheet name
        date_str = tuesday_date.strftime("%Y-%m-%d")
        sheet_name = f"{SHEET_NAME_PREFIX} - {date_str}"
        
        logger.info(f"Generated sheet name: {sheet_name}")
        return sheet_name
    
    def get_or_create_weekly_sheet(self, spreadsheet_id):
        """Get or create the weekly wars sheet"""
        try:
            spreadsheet = self.gc.open_by_key(spreadsheet_id)
            sheet_name = self.get_weekly_sheet_name()
            
            # Try to get existing sheet for this week
            try:
                sheet = spreadsheet.worksheet(sheet_name)
                logger.info(f"Found existing sheet for this week: {sheet_name}")
            except gspread.WorksheetNotFound:
                # Create new sheet for this week
                sheet = spreadsheet.add_worksheet(
                    title=sheet_name,
                    rows=1000,
                    cols=20
                )
                logger.info(f"Created new sheet for this week: {sheet_name}")
                
                # Set up headers
                self.setup_headers(sheet)
                
                # Add a note about when this sheet was created
                sheet.update('A1', f'Sheet created on {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")} UTC')
                sheet.update('A2', f'Data represents wars as of {sheet_name.split(" - ")[1]}')
                
                # Move headers to row 4 (after the notes)
                self.setup_headers_at_row(sheet, 4)
            
            return sheet
            
        except Exception as e:
            logger.error(f"Failed to access spreadsheet: {e}")
            raise
    
    def setup_headers(self, sheet):
        """Set up the sheet headers and formatting (legacy method)"""
        self.setup_headers_at_row(sheet, 1)
    
    def setup_headers_at_row(self, sheet, row_number):
        """Set up the sheet headers at a specific row"""
        headers = [
            'War ID', 'Status', 'Start Date', 'End Date', 'Duration',
            'Target Score', 'Faction 1 ID', 'Faction 1 Name', 'Faction 1 Score',
            'Faction 1 Chain', 'Faction 2 ID', 'Faction 2 Name', 'Faction 2 Score',
            'Faction 2 Chain', 'Total Score', 'Winner Faction ID', 'Last Updated'
        ]
        
        # Set headers at the specified row
        sheet.update(f'A{row_number}:Q{row_number}', [headers])
        
        # Basic formatting (Google Sheets API has limited formatting options)
        logger.info(f"Set up sheet headers at row {row_number}")
    
    def format_duration(self, start_timestamp, end_timestamp):
        """Format duration between start and end times"""
        start_time = start_timestamp * 1000
        end_time = end_timestamp if end_timestamp else datetime.now().timestamp() * 1000
        duration = end_time - start_time
        
        days = int(duration // (1000 * 60 * 60 * 24))
        hours = int((duration % (1000 * 60 * 60 * 24)) // (1000 * 60 * 60))
        minutes = int((duration % (1000 * 60 * 60)) // (1000 * 60))
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"
    
    def prepare_wars_data(self, wars_data):
        """Prepare wars data for the sheet"""
        wars = []
        
        for war_id, war in wars_data.get('rankedwars', {}).items():
            start_date = datetime.fromtimestamp(war['war']['start'], tz=timezone.utc)
            end_date = None
            if war['war'].get('end'):
                end_date = datetime.fromtimestamp(war['war']['end'], tz=timezone.utc)
            
            duration = self.format_duration(war['war']['start'], war['war'].get('end'))
            
            # Get faction data
            faction_ids = list(war['factions'].keys())
            faction1 = war['factions'][faction_ids[0]]
            faction2 = war['factions'][faction_ids[1]]
            
            faction1_score = faction1.get('score', 0)
            faction2_score = faction2.get('score', 0)
            total_score = faction1_score + faction2_score
            
            # Determine status
            status = 'Preparing'
            if not war['war'].get('end'):
                status = 'Active'
            elif war['war']['end'] < datetime.now().timestamp():
                status = 'Finished'
            
            war_row = [
                war_id,
                status,
                start_date.isoformat(),
                end_date.isoformat() if end_date else '',
                duration,
                war['war'].get('target', 0),
                faction_ids[0],
                faction1.get('name', 'Unknown'),
                faction1_score,
                faction1.get('chain', 0),
                faction_ids[1],
                faction2.get('name', 'Unknown'),
                faction2_score,
                faction2.get('chain', 0),
                total_score,
                war['war'].get('winner', ''),
                datetime.now(timezone.utc).isoformat()
            ]
            
            wars.append(war_row)
        
        # Sort by start date (newest first)
        wars.sort(key=lambda x: x[2], reverse=True)
        
        return wars
    
    def update_sheet(self, sheet, wars_data):
        """Update the sheet with wars data"""
        try:
            # Clear existing data but keep the notes and headers
            # Find where the data starts (after notes and headers)
            data_start_row = 5  # Notes in rows 1-2, empty row 3, headers in row 4
            
            # Clear data rows (starting from row 6, after headers)
            last_row = sheet.row_count
            if last_row > data_start_row:
                sheet.delete_rows(data_start_row + 1, last_row)
            
            # Prepare and add new data
            wars = self.prepare_wars_data(wars_data)
            
            if wars:
                # Add data starting after the headers
                data_range = f'A{data_start_row + 1}:Q{data_start_row + len(wars)}'
                sheet.update(values=wars, range_name=data_range)
                logger.info(f"Updated sheet with {len(wars)} wars starting at row {data_start_row + 1}")
            else:
                logger.info("No wars data to update")
                
        except Exception as e:
            logger.error(f"Failed to update sheet: {e}")
            raise
    
    def cleanup_old_sheets(self, spreadsheet_id, keep_weeks=8):
        """Clean up old weekly sheets, keeping only the most recent ones"""
        try:
            spreadsheet = self.gc.open_by_key(spreadsheet_id)
            all_sheets = spreadsheet.worksheets()
            
            # Filter sheets that match our naming pattern
            weekly_sheets = []
            for sheet in all_sheets:
                if sheet.title.startswith(SHEET_NAME_PREFIX):
                    weekly_sheets.append(sheet)
            
            if len(weekly_sheets) <= keep_weeks:
                logger.info(f"Only {len(weekly_sheets)} weekly sheets found, no cleanup needed")
                return
            
            # Sort sheets by date (newest first)
            weekly_sheets.sort(key=lambda x: x.title, reverse=True)
            
            # Delete old sheets
            sheets_to_delete = weekly_sheets[keep_weeks:]
            for sheet in sheets_to_delete:
                logger.info(f"Deleting old sheet: {sheet.title}")
                spreadsheet.del_worksheet(sheet)
            
            logger.info(f"Cleaned up {len(sheets_to_delete)} old weekly sheets")
            
        except Exception as e:
            logger.error(f"Failed to cleanup old sheets: {e}")
            # Don't raise here, as this is not critical for the main functionality
    
    def run_update(self, spreadsheet_id):
        """Main function to run the complete update process"""
        try:
            logger.info("Starting Torn Wars update process...")
            
            # Authenticate with Google
            self.authenticate_google()
            
            # Fetch Torn data
            torn_data = self.fetch_torn_wars()
            
            # Get or create weekly sheet
            sheet = self.get_or_create_weekly_sheet(spreadsheet_id)
            
            # Update sheet
            self.update_sheet(sheet, torn_data)
            
            # Clean up old sheets (optional)
            self.cleanup_old_sheets(spreadsheet_id)
            
            logger.info("Torn Wars update completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Update failed: {e}")
            return False

def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Update Torn Wars in Google Sheets')
    parser.add_argument('--torn-api-key', required=True, help='Torn API key')
    parser.add_argument('--spreadsheet-id', required=True, help='Google Sheets spreadsheet ID')
    parser.add_argument('--google-creds', help='Path to Google service account credentials JSON file')
    
    args = parser.parse_args()
    
    # Create updater instance
    updater = TornWarsUpdater(args.torn_api_key, args.google_creds)
    
    # Run update
    success = updater.run_update(args.spreadsheet_id)
    
    if success:
        print("✅ Update completed successfully!")
        exit(0)
    else:
        print("❌ Update failed!")
        exit(1)

if __name__ == "__main__":
    main()
