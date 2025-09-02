# Weekly Sheets Example

This document shows what your Google Sheets workbook will look like when using the Python Script + Direct API method.

## 📊 Workbook Structure

Your Google Sheets workbook will contain multiple sheets, one for each week:

```
📁 Torn Wars Tracker (Workbook)
├── 📋 Sheet 1: "Torn Wars Data - 2024-01-16" (Current Week)
├── 📋 Sheet 2: "Torn Wars Data - 2024-01-09" (Last Week)
├── 📋 Sheet 3: "Torn Wars Data - 2024-01-02" (2 Weeks Ago)
├── 📋 Sheet 4: "Torn Wars Data - 2023-12-26" (3 Weeks Ago)
├── 📋 Sheet 5: "Torn Wars Data - 2023-12-19" (4 Weeks Ago)
├── 📋 Sheet 6: "Torn Wars Data - 2023-12-12" (5 Weeks Ago)
├── 📋 Sheet 7: "Torn Wars Data - 2023-12-05" (6 Weeks Ago)
└── 📋 Sheet 8: "Torn Wars Data - 2023-11-28" (7 Weeks Ago)
```

## 📋 Individual Sheet Structure

Each weekly sheet will look like this:

| Row | Column A | Column B | Column C | ... | Column Q |
|-----|----------|----------|----------|-----|----------|
| **1** | `Sheet created on 2024-01-16 12:15:00 UTC` | | | | |
| **2** | `Data represents wars as of 2024-01-16` | | | | |
| **3** | *(empty row)* | | | | |
| **4** | **War ID** | **Status** | **Start Date** | ... | **Last Updated** |
| **5** | `12345` | `Active` | `2024-01-15T10:00:00Z` | ... | `2024-01-16T12:15:00Z` |
| **6** | `12344` | `Finished` | `2024-01-14T08:00:00Z` | ... | `2024-01-16T12:15:00Z` |
| **7** | `12343` | `Preparing` | `2024-01-13T06:00:00Z` | ... | `2024-01-16T12:15:00Z` |
| ... | ... | ... | ... | ... | ... |

## 🔄 Automatic Updates

### Every Tuesday at 12:15 PM UTC:

1. **New Sheet Creation**: A new sheet is created with the current week's date
2. **Data Population**: Current war data is fetched and populated
3. **Cleanup**: If more than 8 weekly sheets exist, the oldest ones are deleted

### Example Timeline:

```
Week 1 (Jan 16): Sheet "Torn Wars Data - 2024-01-16" created
Week 2 (Jan 23): Sheet "Torn Wars Data - 2024-01-23" created
Week 3 (Jan 30): Sheet "Torn Wars Data - 2024-01-30" created
...
Week 9 (Mar 12): Sheet "Torn Wars Data - 2024-03-12" created
                 Sheet "Torn Wars Data - 2024-01-16" automatically deleted
```

## 📈 Benefits of Weekly Sheets

### 1. **Historical Tracking**
- See how wars progressed over time
- Track faction performance trends
- Monitor war frequency and patterns

### 2. **Data Organization**
- Each week's data is clearly separated
- Easy to compare different time periods
- No data mixing between weeks

### 3. **Automatic Management**
- No manual sheet creation needed
- Automatic cleanup prevents workbook bloat
- Consistent naming convention

### 4. **Analysis Capabilities**
- Export specific weeks for analysis
- Compare war data across different periods
- Track long-term trends

## 🛠️ Manual Operations

### Viewing Specific Weeks:
- Simply click on the sheet tab for the desired week
- Each sheet is self-contained with complete war data

### Exporting Data:
- Copy specific sheets to new workbooks
- Download as CSV for external analysis
- Share individual weekly sheets with team members

### Custom Analysis:
- Use Google Sheets formulas across multiple weekly sheets
- Create pivot tables from historical data
- Build charts showing trends over time

## 🔍 Data Consistency

Each weekly sheet contains:
- **Same column structure** for easy comparison
- **Consistent formatting** across all sheets
- **Standardized date formats** (ISO 8601)
- **Uniform status labels** (Preparing/Active/Finished)

## 📅 Date Logic

The system uses Tuesday as the reference point:
- **Tuesday 12:15 PM UTC**: New sheet created
- **Sheet Name**: Based on the Tuesday date
- **Data Scope**: All wars available at that time
- **Historical Context**: Each sheet represents a snapshot of that week

This ensures consistent weekly boundaries and makes it easy to track data across standard 7-day periods.
