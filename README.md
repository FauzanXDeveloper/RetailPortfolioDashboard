# 📊 Interactive Analytics Dashboard (RCR_Dashboard)

A fully interactive analytics dashboard built with **React.js**, **Tailwind CSS**, **Recharts**, and modern JavaScript libraries. Create, customize, and save data visualizations with a drag-and-drop interface.

![React](https://img.shields.io/badge/React-18-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🎨 Widget System
- **Bar Chart** — Vertical/horizontal, grouped by color, sortable
- **Line Chart** — Multi-line, smooth/straight/step, area fill
- **Area Chart** — Stacked, percentage, adjustable opacity
- **Pie/Donut Chart** — Slice limit, "Others" grouping, label positions
- **KPI Card** — Metric display with trend indicators & comparison
- **Data Table** — Sortable, filterable, paginated, CSV export
- **Dropdown Filter** — Single/multi-select, connects to other widgets
- **Date Range Filter** — Presets (Today, Last 7 Days, etc.) + custom
- **Text Box** — Markdown-supported content blocks

### 🖱️ Drag & Drop
- Drag widgets from the sidebar library onto the canvas
- Move widgets around the canvas with grid snapping
- Resize widgets by dragging the bottom-right corner
- Widgets auto-compact vertically to avoid gaps

### ⚙️ Widget Configuration
- Click the ⚙️ icon on any widget to open the config panel
- **Data tab**: Select data source, axes, aggregation, sorting, limits
- **Filters tab**: Add per-widget filter conditions
- **Style tab**: Colors, gridlines, legends, labels, chart-specific options

### 🔍 Global Filters
- Date range, category, region, and search filters in the header
- Filters apply to all widgets with "Apply global filters" enabled

### 💾 Persistence
- Save/load dashboards to browser LocalStorage
- Export dashboards as JSON files
- Import JSON dashboard files
- Multiple dashboards support

### 📁 Data Management
- 3 built-in sample datasets (Sales, User Analytics, Marketing Campaigns)
- Upload CSV files with auto-detection of column types
- Inline data editor (add/edit/remove rows)
- Create manual data sources with custom columns

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone or navigate to the project
cd analytics-dashboard

# Install dependencies
npm install

# Start development server
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx              # Main container (DndProvider)
│   ├── Header.jsx                 # Top bar: title, actions, global filters
│   ├── Sidebar.jsx                # Widget library (draggable items)
│   ├── Canvas.jsx                 # Grid layout + drop target
│   ├── ConfigPanel.jsx            # Right sidebar config overlay
│   ├── widgets/
│   │   ├── WidgetContainer.jsx    # Base wrapper (header, drag, settings, delete)
│   │   ├── BarChartWidget.jsx     # Recharts BarChart
│   │   ├── LineChartWidget.jsx    # Recharts LineChart
│   │   ├── AreaChartWidget.jsx    # Recharts AreaChart
│   │   ├── PieChartWidget.jsx     # Recharts PieChart (+ donut)
│   │   ├── KPICardWidget.jsx      # Metric card with trend
│   │   ├── DataTableWidget.jsx    # Sortable/filterable table
│   │   ├── DropdownFilterWidget.jsx
│   │   ├── DateRangeFilterWidget.jsx
│   │   └── TextBoxWidget.jsx      # Markdown text block
│   ├── config/
│   │   ├── BarChartConfig.jsx     # Config form for bar charts
│   │   ├── LineChartConfig.jsx
│   │   ├── AreaChartConfig.jsx
│   │   ├── PieChartConfig.jsx
│   │   ├── KPICardConfig.jsx
│   │   ├── DataTableConfig.jsx
│   │   ├── FilterWidgetConfig.jsx
│   │   ├── TextBoxConfig.jsx
│   │   └── FilterConfig.jsx       # Shared filter condition builder
│   ├── modals/
│   │   └── DataManager.jsx        # Data source management modal
│   └── common/
│       └── CommonComponents.jsx   # ColorPicker, FieldPill, DragDropZone
├── store/
│   └── dashboardStore.js          # Zustand state management
├── utils/
│   ├── dataProcessing.js          # Filter, aggregate, sort, format
│   ├── chartHelpers.js            # Colors, default configs, sizes
│   └── storage.js                 # LocalStorage, export/import, UUID
├── data/
│   └── sampleData.js              # 3 built-in datasets
├── App.js
└── index.css                      # Tailwind + grid layout styles
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework (functional components + hooks) |
| **Tailwind CSS 3** | Utility-first styling |
| **Recharts** | Chart rendering (Bar, Line, Area, Pie) |
| **React Grid Layout** | Drag-and-drop grid system |
| **React DnD** | Drag from sidebar to canvas |
| **Zustand** | Lightweight state management |
| **PapaParse** | CSV file parsing |
| **Lucide React** | Icon library |
| **date-fns** | Date utilities |

---

## 📖 How to Use

1. **Add widgets**: Drag any widget type from the left sidebar onto the canvas
2. **Configure**: Click the ⚙️ gear icon → select data source → set axes/metrics
3. **Customize**: Use the Style tab to change colors, labels, and chart options
4. **Filter**: Add per-widget filters or use global filters in the header bar
5. **Arrange**: Move and resize widgets to build your layout
6. **Save**: Click "Save" to persist to LocalStorage
7. **Export**: Click "Export" to download as a JSON file

---

## 🔌 Adding New Widget Types

Follow these steps to add a new widget type to the dashboard:

### 1. Create the Widget Component

Create a new file in `src/components/widgets/`:

```jsx
// src/components/widgets/MyWidget.jsx
import React, { useMemo } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { filterData, applyGlobalFilters } from '../../utils/dataProcessing';

export default function MyWidget({ widget }) {
  const dataSources = useDashboardStore(s => s.dataSources);
  const globalFilters = useDashboardStore(s => s.currentDashboard.globalFilters);
  const config = widget.config;

  const data = useMemo(() => {
    const ds = dataSources.find(d => d.id === config.dataSource);
    if (!ds) return [];
    let result = [...ds.data];
    if (config.applyGlobalFilters) {
      result = applyGlobalFilters(result, globalFilters);
    }
    return filterData(result, config.filters || []);
  }, [dataSources, config, globalFilters]);

  return (
    <div className="w-full h-full p-4">
      {/* Your widget rendering */}
    </div>
  );
}
```

### 2. Create the Config Form

Create a config form in `src/components/config/`:

```jsx
// src/components/config/MyWidgetConfig.jsx
import React from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function MyWidgetConfig({ widget }) {
  const updateWidgetConfig = useDashboardStore(s => s.updateWidgetConfig);

  const updateConfig = (key, value) => {
    updateWidgetConfig(widget.id, { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Config form fields */}
    </div>
  );
}
```

### 3. Add Default Config

In `src/utils/chartHelpers.js`, add your widget type to `getDefaultWidgetConfig()`:

```js
case 'my-widget':
  return {
    dataSource: '',
    applyGlobalFilters: true,
    filters: [],
    // ... your custom defaults
  };
```

Also add the default size in `getDefaultWidgetSize()`:

```js
case 'my-widget': return { w: 4, h: 4 };
```

### 4. Register Components

In `WidgetContainer.jsx`, add to `WIDGET_COMPONENTS`:

```js
import MyWidget from './MyWidget';
const WIDGET_COMPONENTS = {
  // ...existing entries
  'my-widget': MyWidget,
};
```

In `ConfigPanel.jsx`, add to `CONFIG_COMPONENTS`:

```js
import MyWidgetConfig from './config/MyWidgetConfig';
const CONFIG_COMPONENTS = {
  // ...existing entries
  'my-widget': MyWidgetConfig,
};
```

### 5. Add to Sidebar

In `Sidebar.jsx`, add your widget to the appropriate group in `WIDGET_GROUPS`:

```js
{
  label: 'My Widget',
  type: 'my-widget',
  icon: SomeIcon, // from lucide-react
}
```

---

## 📝 Sample Data

The app includes 3 built-in datasets:

| Dataset | Rows | Fields |
|---|---|---|
| **Sales Data** | 49 | Product, Category, Region, Revenue, Quantity, Cost, Date |
| **User Analytics** | 90 | Date, Users, Sessions, Pageviews, Bounce Rate, Source |
| **Marketing Campaigns** | 18 | Campaign, Channel, Impressions, Clicks, Conversions, Spend |

You can also upload your own CSV files or create data manually via the **Data Manager** (click "Manage Data" in the header).

---

## License

MIT
