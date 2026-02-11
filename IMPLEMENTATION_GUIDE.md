# 🚀 Dashboard Enhancement Implementation Guide

This document outlines the complete roadmap for implementing all requested improvements to the RCR Analytics Dashboard.

## ✅ Phase 1: COMPLETED

### Export Features ✓
- [x] Multi-format export dropdown (JSON, PNG, JPG, PDF)
- [x] Logo integration in exports (`public/alrajhi_logo.png`)
- [x] Export utilities (`src/utils/exportUtils.js`)
- [x] Updated Header component with export dropdown
- [x] Canvas ID for export targeting

### Packages Installed ✓
- [x] xlsx - Excel import/export
- [x] jspdf - PDF generation  
- [x] html2canvas - Image capture
- [x] apexcharts, react-apexcharts - Advanced charts
- [x] d3 - Complex visualizations
- [x] sql.js - SQL processing
- [x] ajv - JSON validation

### Infrastructure Ready ✓
- [x] Sidebar expand button (already present)
- [x] Clean build with 0 errors
- [x] Documentation updated

---

## 📋 Phase 2: Enhanced Import (NOT STARTED)

### 2.1 Excel Import Support
**File**: `src/components/modals/DataManager.jsx`

**Implementation**:
```javascript
import * as XLSX from 'xlsx';

// Add Excel file handler
const handleExcelUpload = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Show sheet selector if multiple sheets
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length > 1) {
      setSheetSelector({ workbook, sheets: sheetNames });
    } else {
      processSheet(workbook, sheetNames[0]);
    }
  };
  reader.readAsArrayBuffer(file);
};

const processSheet = (workbook, sheetName) => {
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  showImportPreview(jsonData);
};
```

### 2.2 Import Preview Table
**File**: Create `src/components/modals/ImportPreview.jsx`

**Features**:
- Column name mapping (editable)
- Data type auto-detection (Number, Date, Text, Boolean)
- Sample value preview (first 3 values)
- Include/exclude columns (checkboxes)
- Data preview table (first 10 rows)
- Manual data type override

**UI Structure**:
```jsx
<ImportPreviewModal>
  <DataSourceInfo />
  <ColumnMappingTable>
    {columns.map(col => (
      <ColumnRow 
        name={col.name}
        type={col.detectedType}
        samples={col.sampleValues}
        included={col.included}
        onEdit={handleEditColumn}
      />
    ))}
  </ColumnMappingTable>
  <DataPreviewTable data={previewData} />
  <Actions>
    <Button onClick={cancel}>Cancel</Button>
    <Button onClick={importData}>Import Data</Button>
  </Actions>
</ImportPreviewModal>
```

### 2.3 JSON Import
**Implementation**:
```javascript
const handleJSONUpload = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      // Flatten nested objects if needed
      const flatData = flattenJSON(json);
      showImportPreview(flatData);
    } catch (error) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
};
```

### 2.4 API Endpoint Connection
**File**: Create `src/components/modals/APIConnector.jsx`

**Features**:
- API URL input
- Method selector (GET, POST)
- Headers (key-value pairs)
- Authentication (None, API Key, Bearer Token)
- Test connection button
- Import JSON response

---

## 🔄 Phase 3: ETL Pipeline (NOT STARTED)

### 3.1 Extract Step
**File**: `src/components/modals/ETLWizard.jsx`

**Steps**:
1. **Choose Data Source**
   - File upload (CSV, Excel, JSON)
   - Database connection
   - API endpoint
   - Google Sheets

### 3.2 Transform Step
**File**: `src/utils/dataTransformations.js`

**Operations to Implement**:

```javascript
// Text transformations
export const trimWhitespace = (data, column) => {
  return data.map(row => ({
    ...row,
    [column]: row[column]?.toString().trim()
  }));
};

export const changeCase = (data, column, caseType) => {
  // caseType: 'upper', 'lower', 'capitalize'
  return data.map(row => {
    let value = row[column]?.toString();
    if (caseType === 'upper') value = value.toUpperCase();
    if (caseType === 'lower') value = value.toLowerCase();
    if (caseType === 'capitalize') value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return { ...row, [column]: value };
  });
};

export const findReplace = (data, column, find, replace) => {
  return data.map(row => ({
    ...row,
    [column]: row[column]?.toString().replace(new RegExp(find, 'g'), replace)
  }));
};

// Number transformations
export const removeCurrencySymbols = (data, column) => {
  return data.map(row => ({
    ...row,
    [column]: parseFloat(row[column]?.toString().replace(/[$€£,]/g, ''))
  }));
};

export const roundNumbers = (data, column, decimals) => {
  return data.map(row => ({
    ...row,
    [column]: parseFloat(row[column]).toFixed(decimals)
  }));
};

// Date transformations
export const parseDate = (data, column, format) => {
  // Use date-fns to parse different formats
  return data.map(row => ({
    ...row,
    [column]: parse(row[column], format, new Date())
  }));
};

// Row operations
export const removeDuplicates = (data) => {
  const seen = new Set();
  return data.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const removeNullRows = (data, columns) => {
  return data.filter(row => {
    return columns.every(col => row[col] != null && row[col] !== '');
  });
};

// Calculated columns
export const addCalculatedColumn = (data, config) => {
  // config: { name, formula, type }
  return data.map(row => ({
    ...row,
    [config.name]: evaluateFormula(config.formula, row)
  }));
};

const evaluateFormula = (formula, row) => {
  // Simple formula evaluator
  // Replace column names with values
  let expr = formula;
  Object.keys(row).forEach(key => {
    expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), row[key]);
  });
  try {
    return eval(expr); // In production, use a safe expression evaluator
  } catch (e) {
    return null;
  }
};
```

### 3.3 Transform UI
**Component**: `TransformDataStep.jsx`

**Tabs**:
1. **Column Operations**
   - Rename, delete, reorder columns
   - Transform text (trim, case, replace)
   - Transform numbers (currency removal, rounding)
   - Transform dates (parse formats)

2. **Row Operations**
   - Remove duplicates
   - Remove null rows
   - Filter rows by condition

3. **Calculated Columns**
   - Formula builder
   - Support functions: SUM, AVG, MIN, MAX, COUNT, IF
   - Preview calculated values

4. **Data Type Mapping**
   - Override detected types
   - Set date formats

### 3.4 Load Step
**Features**:
- Data source name input
- Update frequency (one-time, on-demand, auto-refresh)
- "Create suggested charts" option
- Preview final data

---

## 📊 Phase 4: Advanced Charts (NOT STARTED)

### 4.1 Chart Widgets to Add

#### Scatter Plot
**File**: `src/components/widgets/ScatterPlotWidget.jsx`
```javascript
import { ScatterChart, Scatter, XAxis, YAxis } from 'recharts';
// X-axis: numeric
// Y-axis: numeric
// Optional: bubble size (third metric)
// Color by category
// Trend line option
```

#### Heatmap
**File**: `src/components/widgets/HeatmapWidget.jsx`
```javascript
import ReactApexChart from 'react-apexcharts';
// Use ApexCharts heatmap
// Rows: dimension 1
// Columns: dimension 2
// Cell intensity: measure
// Color scale options
```

#### Gauge Chart
**File**: `src/components/widgets/GaugeWidget.jsx`
```javascript
import ReactApexChart from 'react-apexcharts';
// Single metric display
// Min/max range
// Colored zones (red/yellow/green)
// Target line
```

#### Funnel Chart
**File**: `src/components/widgets/FunnelWidget.jsx`
```javascript
import { FunnelChart, Funnel } from 'recharts';
// Stages: dimension
// Values: measure
// Show conversion rates
```

#### Waterfall Chart
**File**: `src/components/widgets/WaterfallWidget.jsx`
```javascript
// Use custom D3 or ApexCharts
// Show cumulative effect
// Starting value → changes → ending value
```

#### Radar/Spider Chart
**File**: `src/components/widgets/RadarWidget.jsx`
```javascript
import { RadarChart, Radar } from 'recharts';
// Multiple metrics on different axes
// Compare categories across metrics
```

#### Treemap
**File**: `src/components/widgets/TreemapWidget.jsx`
```javascript
import { Treemap } from 'recharts';
// Hierarchical data
// Rectangle size = value
// Nested rectangles
```

#### Combo Chart
**File**: `src/components/widgets/ComboWidget.jsx`
```javascript
import { ComposedChart, Bar, Line } from 'recharts';
// Two Y-axes
// Bar + Line combination
```

#### Box Plot
**File**: `src/components/widgets/BoxPlotWidget.jsx`
```javascript
// Use D3 or ApexCharts
// Show quartiles, median, outliers
// Statistical distribution
```

#### Sankey Diagram
**File**: `src/components/widgets/SankeyWidget.jsx`
```javascript
import { Sankey } from 'recharts';
// Flow visualization
// From → To relationships
// Flow width = value
```

### 4.2 Update Sidebar
**File**: `src/components/Sidebar.jsx`

Add new widgets to `WIDGET_GROUPS`:
```javascript
{
  label: "Advanced Charts",
  items: [
    { type: "scatter", name: "Scatter Plot", icon: TrendingUp },
    { type: "heatmap", name: "Heatmap", icon: Grid },
    { type: "gauge", name: "Gauge", icon: Gauge },
    { type: "funnel", name: "Funnel", icon: Filter },
    { type: "waterfall", name: "Waterfall", icon: BarChart2 },
    { type: "radar", name: "Radar", icon: Target },
    { type: "treemap", name: "Treemap", icon: Grid3x3 },
    { type: "combo", name: "Combo Chart", icon: Layers },
    { type: "boxplot", name: "Box Plot", icon: Box },
    { type: "sankey", name: "Sankey", icon: GitBranch },
  ],
}
```

### 4.3 Enhanced Filters

#### Multi-Select Dropdown
**File**: `src/components/widgets/MultiSelectFilter.jsx`
- Checkbox list inside dropdown
- "Select All" / "Clear All"
- Search within options

#### Range Slider
**File**: `src/components/widgets/RangeSliderFilter.jsx`
- Dual handles (min/max)
- Show current range values
- Real-time filtering

#### Search Input
**File**: `src/components/widgets/SearchFilter.jsx`
- Debounced text input
- Contains/starts with/equals modes

#### Checkbox Group
**File**: `src/components/widgets/CheckboxGroupFilter.jsx`
- Multiple checkboxes visible
- Group by categories

#### Toggle Switch
**File**: `src/components/widgets/ToggleFilter.jsx`
- Binary choice (Yes/No)
- Boolean fields

#### Hierarchical Filter
**File**: `src/components/widgets/HierarchicalFilter.jsx`
- Tree structure
- Parent-child relationships
- Expand/collapse nodes

---

## ✨ Phase 5: Polish & UX (NOT STARTED)

### 5.1 Global Filter Management
**File**: Create `src/components/modals/GlobalFilterManager.jsx`

**Features**:
- List of active global filters
- Add/remove/reorder filters
- Configure each filter:
  - Filter name
  - Data source
  - Field
  - Filter type
  - Default value
  - Show in header toggle
- Preview header layout
- Drag-and-drop reordering

### 5.2 Enhanced Config Tabs

#### Enhanced Data Tab
**Improvements**:
- Drag-and-drop field assignment
- Available fields panel (draggable pills)
- Drop zones for X-axis, Y-axis, Color, etc.
- Multiple metrics support
- Data preview table
- Live chart preview

#### Enhanced Filter Tab
**Improvements**:
- Visual filter builder
- Filter logic selector (AND/OR/Custom)
- Cross-filtering options
- Filter preview (rows affected)
- Test filters button

#### Enhanced Style Tab
**Improvements**:
- Color scheme presets
- Style presets (Corporate, Minimal, Colorful, Dark)
- Reference lines
- Responsive behavior settings
- Animation settings
- Click behavior configuration

### 5.3 Live Preview
**Implementation**:
- Add preview mode toggle in config panel
- Show mini chart preview as settings change
- Debounced updates (300ms delay)
- Preview button to show full-size preview modal

### 5.4 Content Widgets

#### Image Widget
**File**: `src/components/widgets/ImageWidget.jsx`
- Upload or URL
- Resize and position

#### Rich Text Widget
**File**: `src/components/widgets/RichTextWidget.jsx`
- Markdown editor
- Preview mode

#### Divider Widget
**File**: `src/components/widgets/DividerWidget.jsx`
- Horizontal/vertical lines
- Customizable style

#### Iframe Widget
**File**: `src/components/widgets/IframeWidget.jsx`
- Embed external content
- YouTube, websites, etc.

---

## 🛠️ Implementation Priority

### Immediate Next Steps (High Priority)

1. **Excel Import** (2-3 hours)
   - Add Excel file handler to DataManager
   - Sheet selector for multi-sheet files
   - Use existing preview infrastructure

2. **Import Preview Table** (3-4 hours)
   - Create ImportPreview modal
   - Column mapping UI
   - Data type detection
   - Sample value display

3. **Export Widget Data** (1-2 hours)
   - Add context menu to widgets
   - Export as CSV/Excel options
   - Use existing export utilities

### Medium Priority (Next Sprint)

4. **3-5 Advanced Charts** (8-10 hours)
   - Start with: Scatter, Gauge, Heatmap, Funnel, Combo
   - Create widgets + configs
   - Update sidebar

5. **Enhanced Filters** (6-8 hours)
   - Multi-select dropdown
   - Range slider
   - Search input
   - Ensure all filters actually work

6. **ETL Transform Step** (10-12 hours)
   - Create transformation utilities
   - Build transform UI
   - Preview transformations

### Lower Priority (Future Enhancements)

7. **Global Filter Management UI** (4-6 hours)
8. **Enhanced Config Tabs** (8-10 hours)
9. **Remaining Advanced Charts** (10-12 hours)
10. **Content Widgets** (4-6 hours)

---

## 📝 Testing Checklist

### Export Features ✓
- [x] Export as JSON works
- [ ] Export as PNG with logo
- [ ] Export as JPG with logo
- [ ] Export as PDF with logo
- [ ] Widget data export as CSV
- [ ] Widget data export as Excel

### Import Features
- [ ] CSV import works
- [ ] Excel import works
- [ ] JSON import works
- [ ] Import preview shows correctly
- [ ] Column mapping works
- [ ] Data type detection accurate

### Filters
- [ ] Date range filter works
- [ ] Dropdown filter works
- [ ] Multi-select filter works
- [ ] Global filters affect all widgets
- [ ] Per-widget filters work
- [ ] Filter combinations work (AND logic)
- [ ] Clear filters resets correctly

### Charts
- [ ] All existing charts render correctly
- [ ] New charts render correctly
- [ ] Charts respond to filters
- [ ] Charts export properly
- [ ] Responsive on mobile/tablet

---

## 📚 Resources & Documentation

### Libraries Documentation
- [xlsx.js](https://sheetjs.com/) - Excel import/export
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [html2canvas](https://html2canvas.hertzen.com/) - Screenshot capture
- [ApexCharts](https://apexcharts.com/) - Advanced charts
- [D3.js](https://d3js.org/) - Data visualization
- [Recharts](https://recharts.org/) - React charts

### Current Architecture
- State Management: Zustand (`src/store/dashboardStore.js`)
- Data Processing: `src/utils/dataProcessing.js`
- Storage: `src/utils/storage.js`
- Export: `src/utils/exportUtils.js` ✓

---

## 🎯 Success Criteria

### Phase 2 Complete When:
- [ ] Excel files can be imported
- [ ] Import shows preview table with column mapping
- [ ] Users can edit column names and types
- [ ] JSON files can be imported
- [ ] Widget data can be exported to CSV/Excel

### Phase 3 Complete When:
- [ ] ETL wizard has all 3 steps
- [ ] Transform operations work correctly
- [ ] Calculated columns can be added
- [ ] Transformation preview works
- [ ] ETL templates can be saved

### Phase 4 Complete When:
- [ ] At least 5 new chart types added
- [ ] All filters actually filter data
- [ ] Multi-select filters work
- [ ] Range sliders work
- [ ] Cross-filtering works

### Phase 5 Complete When:
- [ ] Global filter management UI exists
- [ ] Config tabs are enhanced
- [ ] Live preview works
- [ ] Style presets available
- [ ] Content widgets added

---

## 🚀 Deployment Notes

### Before Deployment:
1. Test all export formats
2. Verify logo displays correctly
3. Test on different browsers
4. Mobile responsive check
5. Performance testing with large datasets
6. Security audit (eval() usage in formulas)

### Environment Variables:
```env
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_GOOGLE_API_KEY=your_key_here
```

### Build Command:
```bash
npm run build
```

### Serve Production:
```bash
npx serve -s build -l 3000
```

---

## 📞 Support & Contact

For questions or issues during implementation:
- GitHub: https://github.com/FauzanXDeveloper/RCR_Dashboard
- Documentation: See README.md and LOGO_SETUP.md

---

**Last Updated**: February 11, 2026
**Version**: 1.0.0
**Status**: Phase 1 Complete, Phases 2-5 Ready for Implementation
