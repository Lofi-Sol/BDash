# Random Wars Sample Data

This directory contains the automatically exported JSON data from the "Random Wars Sample" Google Sheet.

## Files

- `random_wars_sample.json` - Contains the latest randomly selected wars data with faction statistics

## Data Structure

The JSON file contains:

```json
{
  "data": [
    {
      "War ID": "12345",
      "Status": "Active",
      "Start Date": "2024-01-15",
      "Start Time": "14:30:00",
      "End Date": "",
      "End Time": "",
      "Duration": "0m",
      "Target Score": 1000,
      "Faction 1 ID": "937",
      "Faction 1 Name": "Example Faction 1",
      "Faction 1 Score": 0,
      "Faction 1 Chain": 0,
      "Faction 1 Wars Won": 15,
      "Faction 1 Wars Lost": 5,
      "Faction 1 Win Rate": "75%",
      "Faction 2 ID": "9100",
      "Faction 2 Name": "Example Faction 2",
      "Faction 2 Score": 0,
      "Faction 2 Chain": 0,
      "Faction 2 Wars Won": 12,
      "Faction 2 Wars Lost": 8,
      "Faction 2 Win Rate": "60%",
      "Total Score": 0,
      "Winner Faction ID": "",
      "Last Updated Date": "2024-01-15",
      "Last Updated Time": "14:30:00"
    }
  ],
  "count": 1,
  "exported_at": "2024-01-15T14:00:00Z",
  "source": "Random Wars Sample",
  "status": "success",
  "metadata": {
    "total_wars": 1,
    "export_timestamp": "2024-01-15T14:00:00Z",
    "sheet_name": "Random Wars Sample",
    "spreadsheet_id": "your_spreadsheet_id_here"
  }
}
```

## Update Schedule

- **Automatic**: Every Tuesday at 2:00 PM UTC (1 hour after the Random Wars Selector runs)
- **Manual**: Can be triggered manually via GitHub Actions

## Usage in Dashboard

Your betting dashboard can load this data directly from the GitHub repository:

```javascript
fetch('https://raw.githubusercontent.com/yourusername/BDash/main/Data/random_wars_sample.json')
  .then(response => response.json())
  .then(data => {
    console.log(`Loaded ${data.count} wars from ${data.source}`);
    // Process data.data array for your betting dashboard
    data.data.forEach(war => {
      console.log(`War ${war['War ID']}: ${war['Faction 1 Name']} vs ${war['Faction 2 Name']}`);
    });
  });
```

## Data Fields

Each war record contains:

- **Basic War Info**: War ID, Status, Start/End dates and times, Duration, Target Score
- **Faction 1 Data**: ID, Name, Score, Chain, Wars Won, Wars Lost, Win Rate
- **Faction 2 Data**: ID, Name, Score, Chain, Wars Won, Wars Lost, Win Rate
- **War Results**: Total Score, Winner Faction ID
- **Metadata**: Last Updated Date and Time

## Notes

- Only wars with Duration = "0m" (unstarted wars) are selected
- Faction statistics are fetched from Torn API historical data
- Data is updated automatically every Tuesday
- The file is overwritten with each update (no historical versions kept)
