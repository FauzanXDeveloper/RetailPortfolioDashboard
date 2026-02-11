/**
 * Chart helper utilities.
 * Provide default colors, formatting, and configuration presets for Recharts.
 */

// Default color palettes
export const CHART_COLORS = [
  "#4F46E5", // Indigo
  "#0EA5E9", // Sky
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Blue-indigo
];

export const COLOR_SCHEMES = {
  Default: CHART_COLORS,
  Blues: ["#1e3a5f", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  Greens: ["#064e3b", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"],
  Warm: ["#7c2d12", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"],
  Custom: CHART_COLORS,
};

/**
 * Get a color from the palette by index.
 */
export function getColor(index, scheme = "Default") {
  const colors = COLOR_SCHEMES[scheme] || CHART_COLORS;
  return colors[index % colors.length];
}

/**
 * Build default widget config for each widget type.
 */
export function getDefaultWidgetConfig(type) {
  const configs = {
    bar: {
      dataSource: "",
      xAxis: "",
      yAxis: "",
      aggregation: "sum",
      colorBy: "",
      sortBy: "value",
      sortOrder: "desc",
      limit: 0,
      limitDirection: "top",
      filters: [],
      applyGlobalFilters: true,
      style: {
        orientation: "vertical",
        barColor: "#4F46E5",
        useGradient: true,
        showGridLines: true,
        showLegend: true,
        showDataLabels: false,
        showAxisTitles: true,
        xAxisTitle: "",
        yAxisTitle: "",
        fontSize: "medium",
      },
    },
    line: {
      dataSource: "",
      xAxis: "",
      yAxis: "",
      aggregation: "sum",
      additionalLines: [],
      groupBy: "",
      filters: [],
      applyGlobalFilters: true,
      style: {
        lineStyle: "smooth",
        lineWidth: 2,
        showDataPoints: true,
        showGridLines: true,
        showLegend: true,
        showAreaFill: false,
        areaFillOpacity: 0.3,
        showTrendLine: false,
        colors: CHART_COLORS,
        xAxisTitle: "",
        yAxisTitle: "",
      },
    },
    area: {
      dataSource: "",
      xAxis: "",
      yAxis: "",
      aggregation: "sum",
      additionalLines: [],
      groupBy: "",
      filters: [],
      applyGlobalFilters: true,
      style: {
        lineStyle: "smooth",
        lineWidth: 2,
        areaOpacity: 0.4,
        stacking: "none",
        showDataPoints: false,
        showGridLines: true,
        showLegend: true,
        colors: CHART_COLORS,
        xAxisTitle: "",
        yAxisTitle: "",
      },
    },
    pie: {
      dataSource: "",
      dimension: "",
      measure: "",
      aggregation: "sum",
      limitSlices: 10,
      combineOthers: true,
      filters: [],
      applyGlobalFilters: true,
      style: {
        chartType: "pie",
        donutThickness: 60,
        showLabels: true,
        showPercentages: true,
        showValues: false,
        showLegend: true,
        labelPosition: "outside",
        colorScheme: "Default",
      },
    },
    kpi: {
      dataSource: "",
      metric: "",
      aggregation: "sum",
      comparison: {
        enabled: false,
        type: "target",
        targetValue: 0,
      },
      format: { type: "number", decimals: 0, prefix: "", suffix: "" },
      filters: [],
      applyGlobalFilters: true,
      style: {
        icon: "📊",
        backgroundColor: "#ffffff",
        textColor: "#111827",
        showTrendIndicator: true,
        showPercentageChange: true,
        showComparisonLabel: true,
        size: "normal",
      },
    },
    table: {
      dataSource: "",
      columns: [],
      rowsPerPage: 10,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      enableColumnResizing: false,
      enableExportCSV: true,
      filters: [],
      applyGlobalFilters: true,
      style: {
        stripedRows: true,
        hoverEffect: true,
        compactMode: false,
        columnFormats: {},
      },
    },
    "dropdown-filter": {
      filterName: "Filter",
      dataSource: "",
      filterField: "",
      type: "single",
      defaultValue: "all",
      applyTo: [],
      applyGlobalFilters: false,
    },
    "date-range-filter": {
      filterName: "Date Range",
      dataSource: "",
      dateField: "",
      presets: ["today", "last7", "last30", "thisMonth", "lastMonth", "thisYear", "custom"],
      applyTo: [],
      applyGlobalFilters: false,
    },
    text: {
      content: "# Dashboard Title\n\nAdd your description here.",
      style: {
        fontSize: "medium",
        alignment: "left",
        background: "transparent",
        showBorder: false,
      },
      applyGlobalFilters: false,
    },
    // ─── Advanced Charts ───
    scatter: {
      dataSource: "",
      xAxis: "",
      yAxis: "",
      sizeField: "",
      colorBy: "",
      filters: [],
      applyGlobalFilters: true,
      style: { showGridLines: true, showLegend: true },
    },
    heatmap: {
      dataSource: "",
      xAxis: "",
      yAxis: "",
      valueField: "",
      filters: [],
      applyGlobalFilters: true,
      style: { color: "#4F46E5", showDataLabels: true },
    },
    gauge: {
      dataSource: "",
      metric: "",
      aggregation: "sum",
      maxValue: 100,
      filters: [],
      applyGlobalFilters: true,
      style: { highColor: "#10B981", midColor: "#F59E0B", lowColor: "#EF4444" },
    },
    funnel: {
      dataSource: "",
      dimension: "",
      measure: "",
      aggregation: "sum",
      filters: [],
      applyGlobalFilters: true,
      style: { showLabels: true },
    },
    waterfall: {
      dataSource: "",
      dimension: "",
      measure: "",
      aggregation: "sum",
      showTotal: true,
      filters: [],
      applyGlobalFilters: true,
      style: { positiveColor: "#10B981", negativeColor: "#EF4444", totalColor: "#6366F1", showGridLines: true },
    },
    radar: {
      dataSource: "",
      dimension: "",
      measures: [],
      aggregation: "sum",
      filters: [],
      applyGlobalFilters: true,
      style: { fillOpacity: 0.3, showLegend: true },
    },
    treemap: {
      dataSource: "",
      dimension: "",
      measure: "",
      aggregation: "sum",
      filters: [],
      applyGlobalFilters: true,
      style: {},
    },
    combo: {
      dataSource: "",
      xAxis: "",
      barMeasure: "",
      lineMeasure: "",
      aggregation: "sum",
      lineAggregation: "average",
      filters: [],
      applyGlobalFilters: true,
      style: { barColor: "#4F46E5", lineColor: "#EF4444", showGridLines: true, showLegend: true },
    },
    boxplot: {
      dataSource: "",
      dimension: "",
      measure: "",
      filters: [],
      applyGlobalFilters: true,
      style: { upperColor: "#4F46E5", lowerColor: "#10B981" },
    },
    sankey: {
      dataSource: "",
      sourceField: "",
      targetField: "",
      valueField: "",
      filters: [],
      applyGlobalFilters: true,
      style: {},
    },
    // ─── Enhanced Filters ───
    "multiselect-filter": {
      filterName: "Multi-Select",
      dataSource: "",
      filterField: "",
      applyTo: [],
      applyGlobalFilters: false,
    },
    "range-slider-filter": {
      filterName: "Range",
      dataSource: "",
      filterField: "",
      applyTo: [],
      applyGlobalFilters: false,
    },
    "search-filter": {
      filterName: "Search",
      placeholder: "Type to search...",
      applyTo: [],
      applyGlobalFilters: false,
    },
    "checkbox-group-filter": {
      filterName: "Checkbox Filter",
      dataSource: "",
      filterField: "",
      applyTo: [],
      applyGlobalFilters: false,
    },
    "toggle-filter": {
      filterName: "Toggle",
      onLabel: "On",
      offLabel: "Off",
      applyTo: [],
      applyGlobalFilters: false,
    },
  };
  return configs[type] || {};
}

/**
 * Default sizes (in grid units) for each widget type.
 */
export function getDefaultWidgetSize(type) {
  const sizes = {
    bar: { w: 6, h: 4 },
    line: { w: 6, h: 4 },
    area: { w: 6, h: 4 },
    pie: { w: 4, h: 4 },
    kpi: { w: 3, h: 2 },
    table: { w: 8, h: 5 },
    "dropdown-filter": { w: 3, h: 1 },
    "date-range-filter": { w: 4, h: 1 },
    text: { w: 6, h: 2 },
    // Advanced Charts
    scatter: { w: 6, h: 4 },
    heatmap: { w: 6, h: 4 },
    gauge: { w: 3, h: 3 },
    funnel: { w: 4, h: 5 },
    waterfall: { w: 6, h: 4 },
    radar: { w: 5, h: 4 },
    treemap: { w: 6, h: 4 },
    combo: { w: 6, h: 4 },
    boxplot: { w: 6, h: 4 },
    sankey: { w: 8, h: 5 },
    // Enhanced Filters
    "multiselect-filter": { w: 3, h: 2 },
    "range-slider-filter": { w: 4, h: 1 },
    "search-filter": { w: 4, h: 1 },
    "checkbox-group-filter": { w: 3, h: 3 },
    "toggle-filter": { w: 3, h: 1 },
  };
  return sizes[type] || { w: 4, h: 3 };
}
