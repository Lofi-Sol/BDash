#!/usr/bin/env python3
"""
Torn Wars Updater - Fixed Python Script
This script fetches Torn war data and updates Google Sheets directly
Creates a new sheet every week with date labeling and faction statistics
Fixed column mismatch and added rate limiting
"""

import os
import json
import requests
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime, timezone, timedelta
import logging
import time  # For rate limiting

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
    
    def fetch_faction_history(self, faction_id):
        """Fetch faction historical data including recent wars"""
        try:
            # Add rate limiting to prevent "Too many requests" errors
            time.sleep(0.2)  # 200ms delay between requests
            
            url = f"https://api.torn.com/faction/{faction_id}?selections=basic&key={self.torn_api_key}"
            logger.info(f"Fetching faction history for faction {faction_id}")
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'error' in data:
                if data['error'].get('code') == 5:  # Too many requests
                    logger.warning(f"Rate limited for faction {faction_id}, using default stats")
                    return None
                else:
                    logger.warning(f"Error fetching faction {faction_id}: {data['error']}")
                    return None
            
            return data
            
        except Exception as e:
            logger.warning(f"Failed to fetch faction {faction_id} history: {e}")
            return None
    
    def calculate_faction_stats(self, faction_id):
        """Calculate faction win/loss statistics from recent wars"""
        try:
            faction_data = self.fetch_faction_history(faction_id)
            if not faction_data:
                return {
                    'wars_won': 0,
                    'wars_lost': 0,
                    'total_wars': 0,
                    'win_rate': '0%'
                }
            
            # Get basic faction info
            faction_name = faction_data.get('name', 'Unknown')
            
            # For now, we'll use basic stats since detailed war history requires different API calls
            # In a future enhancement, we could fetch detailed war history
            return {
                'wars_won': 0,  # Placeholder - would need war history API
                'wars_lost': 0,  # Placeholder - would need war history API
                'total_wars': 0,  # Placeholder - would need war history API
                'win_rate': '0%'  # Placeholder - would need war history API
            }
            
        except Exception as e:
            logger.warning(f"Failed to calculate stats for faction {faction_id}: {e}")
            return {
                'wars_won': 0,
                'wars_lost': 0,
                'total_wars': 0,
                'win_rate': '0%'
            }
    
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
                
                # Check if headers need updating (in case structure changed)
                try:
                    current_headers = sheet.row_values(4)  # Headers are at row 4
                    expected_headers = [
                        'War ID', 'Status', 'Start Date', 'End Date', 'Duration',
                        'Target Score', 'Faction 1 ID', 'Faction 1 Name', 'Faction 1 Score',
                        'Faction 1 Chain', 'Faction 1 Wars Won', 'Faction 1 Wars Lost', 'Faction 1 Win Rate',
                        'Faction 2 ID', 'Faction 2 Name', 'Faction 2 Score', 'Faction 2 Chain',
                        'Faction 2 Wars Won', 'Faction 2 Wars Lost', 'Faction 2 Win Rate',
                        'Total Score', 'Winner Faction ID'
                    ]
                    
                    if len(current_headers) != len(expected_headers) or current_headers != expected_headers:
                        logger.info("Headers structure changed, resetting sheet for clean data")
                        # Reset the entire sheet structure
                        self.reset_sheet_structure(sheet)
                    else:
                        logger.info("Sheet structure is up to date")
                        
                except Exception as e:
                    logger.warning(f"Could not check headers, resetting sheet: {e}")
                    self.reset_sheet_structure(sheet)
                
            except gspread.WorksheetNotFound:
                # Create new sheet for this week
                sheet = spreadsheet.add_worksheet(
                    title=sheet_name,
                    rows=1000,
                    cols=22  # Exactly 22 columns (A-V)
                )
                logger.info(f"Created new sheet for this week: {sheet_name}")
                
                # Add a note about when this sheet was created
                sheet.update(values=[f'Sheet created on {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")} UTC'], range_name='A1')
                sheet.update(values=[f'Data represents wars as of {sheet_name.split(" - ")[1]}'], range_name='A2')
                
                # Set up headers at row 4 (after the notes)
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
            'Faction 1 Chain', 'Faction 1 Wars Won', 'Faction 1 Wars Lost', 'Faction 1 Win Rate',
            'Faction 2 ID', 'Faction 2 Name', 'Faction 2 Score', 'Faction 2 Chain',
            'Faction 2 Wars Won', 'Faction 2 Wars Lost', 'Faction 2 Win Rate',
            'Total Score', 'Winner Faction ID'
        ]
        
        # Set headers at the specified row using the correct syntax
        sheet.update(values=[headers], range_name=f'A{row_number}:V{row_number}')
        
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
        
        # Get unique faction IDs to reduce API calls
        unique_faction_ids = set()
        for war in wars_data.get('rankedwars', {}).values():
            faction_ids = list(war['factions'].keys())
            unique_faction_ids.update(faction_ids)
        
        logger.info(f"Processing {len(wars_data.get('rankedwars', {}))} wars with {len(unique_faction_ids)} unique factions")
        
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
            
            # Get faction statistics
            faction1_stats = self.calculate_faction_stats(faction_ids[0])
            faction2_stats = self.calculate_faction_stats(faction_ids[1])
            
            # Determine status
            status = 'Preparing'
            if not war['war'].get('end'):
                status = 'Active'
            elif war['war']['end'] < datetime.now().timestamp():
                status = 'Finished'
            
            # Create war row with exactly 22 columns (A-V)
            war_row = [
                war_id,                    # A: War ID
                status,                    # B: Status
                start_date.isoformat(),    # C: Start Date
                end_date.isoformat() if end_date else '',  # D: End Date
                duration,                  # E: Duration
                war['war'].get('target', 0),  # F: Target Score
                faction_ids[0],            # G: Faction 1 ID
                faction1.get('name', 'Unknown'),  # H: Faction 1 Name
                faction1_score,            # I: Faction 1 Score
                faction1.get('chain', 0),  # J: Faction 1 Chain
                faction1_stats['wars_won'],  # K: Faction 1 Wars Won
                faction1_stats['wars_lost'], # L: Faction 1 Wars Lost
                faction1_stats['win_rate'],  # M: Faction 1 Win Rate
                faction_ids[1],            # N: Faction 2 ID
                faction2.get('name', 'Unknown'),  # O: Faction 2 Name
                faction2_score,            # P: Faction 2 Score
                faction2.get('chain', 0),  # Q: Faction 2 Chain
                faction2_stats['wars_won'],  # R: Faction 2 Wars Won
                faction2_stats['wars_lost'], # S: Faction 2 Wars Lost
                faction2_stats['win_rate'],  # T: Faction 2 Win Rate
                total_score,               # U: Total Score
                war['war'].get('winner', '')  # V: Winner Faction ID
                # Removed: Last Updated (was causing 23rd column)
            ]
            
            wars.append(war_row)
        
        # Sort by start date (newest first)
        wars.sort(key=lambda x: x[2], reverse=True)
        
        return wars
    
    def update_sheet(self, sheet, wars_data):
        """Update the sheet with wars data"""
        try:
            # Prepare and add new data
            wars = self.prepare_wars_data(wars_data)
            
            if wars:
                # Calculate how many rows we need
                # Notes in rows 1-2, empty row 3, headers in row 4, data starts at row 5
                total_rows_needed = 4 + len(wars)  # 4 rows for notes/headers + data rows
                
                # Resize the sheet if needed
                current_rows = sheet.row_count
                current_cols = sheet.col_count
                
                if current_rows < total_rows_needed:
                    logger.info(f"Resizing sheet from {current_rows} to {total_rows_needed} rows")
                    sheet.resize(rows=total_rows_needed, cols=22)  # Exactly 22 columns
                
                if current_cols < 22:  # We need exactly 22 columns (A-V)
                    logger.info(f"Resizing sheet from {current_cols} to 22 columns")
                    sheet.resize(rows=total_rows_needed, cols=22)
                
                # Clear existing data but keep the notes and headers
                # Find where the data starts (after notes and headers)
                data_start_row = 5  # Notes in rows 1-2, empty row 3, headers in row 4
                
                # Clear data rows (starting from row 6, after headers)
                last_row = sheet.row_count
                if last_row > data_start_row:
                    sheet.delete_rows(data_start_row + 1, last_row)
                    # Resize back to minimum size after clearing
                    sheet.resize(rows=total_rows_needed, cols=22)
                
                # Add data starting after the headers
                data_range = f'A{data_start_row + 1}:V{data_start_row + len(wars)}'
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
