#!/usr/bin/env python3
"""
Random Wars Sample Exporter
This script exports the Random Wars Sample sheet data to JSON format
and saves it to the Data/ directory in the repository
"""

import os
import json
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime, timezone
import logging
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
SHEET_NAME = 'Random Wars Sample'
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
]

class RandomWarsExporter:
    def __init__(self, google_creds_path=None):
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
    
    def export_random_wars_sample(self, spreadsheet_id):
        """Export Random Wars Sample sheet data to JSON"""
        try:
            # Open the spreadsheet
            spreadsheet = self.gc.open_by_key(spreadsheet_id)
            
            # Get the Random Wars Sample sheet
            try:
                sheet = spreadsheet.worksheet(SHEET_NAME)
                logger.info(f"Found sheet: {SHEET_NAME}")
            except gspread.WorksheetNotFound:
                logger.error(f"Sheet '{SHEET_NAME}' not found in spreadsheet")
                return None
            
            # Get all data from the sheet
            all_data = sheet.get_all_records()
            
            if not all_data:
                logger.warning("No data found in Random Wars Sample sheet")
                return {
                    'data': [],
                    'count': 0,
                    'exported_at': datetime.now(timezone.utc).isoformat(),
                    'source': SHEET_NAME,
                    'status': 'empty'
                }
            
            # Create the JSON structure
            json_data = {
                'data': all_data,
                'count': len(all_data),
                'exported_at': datetime.now(timezone.utc).isoformat(),
                'source': SHEET_NAME,
                'status': 'success',
                'metadata': {
                    'total_wars': len(all_data),
                    'export_timestamp': datetime.now(timezone.utc).isoformat(),
                    'sheet_name': SHEET_NAME,
                    'spreadsheet_id': spreadsheet_id
                }
            }
            
            logger.info(f"Successfully exported {len(all_data)} wars from {SHEET_NAME}")
            return json_data
            
        except Exception as e:
            logger.error(f"Failed to export Random Wars Sample: {e}")
            return {
                'data': [],
                'count': 0,
                'exported_at': datetime.now(timezone.utc).isoformat(),
                'source': SHEET_NAME,
                'status': 'error',
                'error': str(e)
            }
    
    def save_json_to_file(self, json_data, output_path):
        """Save JSON data to file"""
        try:
            # Ensure the Data directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Write JSON to file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"JSON data saved to: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save JSON file: {e}")
            return False
    
    def run_export(self, spreadsheet_id, output_path='Data/random_wars_sample.json'):
        """Main function to run the complete export process"""
        try:
            logger.info("Starting Random Wars Sample export process...")
            
            # Authenticate with Google
            self.authenticate_google()
            
            # Export data from sheet
            json_data = self.export_random_wars_sample(spreadsheet_id)
            
            if json_data is None:
                logger.error("Export failed - no data returned")
                return False
            
            # Save to file
            success = self.save_json_to_file(json_data, output_path)
            
            if success:
                logger.info(f"✅ Export completed successfully!")
                logger.info(f"📊 Exported {json_data['count']} wars to {output_path}")
                return True
            else:
                logger.error("❌ Failed to save JSON file")
                return False
                
        except Exception as e:
            logger.error(f"Export process failed: {e}")
            return False

def main():
    """Main function for command line usage"""
    parser = argparse.ArgumentParser(description='Export Random Wars Sample to JSON')
    parser.add_argument('--spreadsheet-id', required=True, help='Google Sheets spreadsheet ID')
    parser.add_argument('--google-creds', help='Path to Google service account credentials JSON file')
    parser.add_argument('--output', default='Data/random_wars_sample.json', help='Output JSON file path')
    
    args = parser.parse_args()
    
    # Create exporter instance
    exporter = RandomWarsExporter(args.google_creds)
    
    # Run export
    success = exporter.run_export(args.spreadsheet_id, args.output)
    
    if success:
        print("✅ Export completed successfully!")
        exit(0)
    else:
        print("❌ Export failed!")
        exit(1)

if __name__ == "__main__":
    main()
