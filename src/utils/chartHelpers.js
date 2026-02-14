/**
 * Chart helper utilities.
 * Provide default colors, formatting, and configuration presets for Recharts.
 */
import React from "react";

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
 * Format a number according to style config.
 * Used by chart tooltips, data labels, and axis ticks.
 */
export function formatNumber(value, style = {}) {
  if (value == null || isNaN(value)) return value;
  const num = Number(value);
  const fmt = style.numberFormat || "auto";
  const prefix = style.numberPrefix || "";
  const suffix = style.numberSuffix || "";
  const dp = style.decimalPlaces ?? 2;

  let formatted;
  switch (fmt) {
    case "comma":
      formatted = num.toLocaleString("en-US");
      break;
    case "compact": {
      const abs = Math.abs(num);
      if (abs >= 1e9) formatted = (num / 1e9).toFixed(1) + "B";
      else if (abs >= 1e6) formatted = (num / 1e6).toFixed(1) + "M";
      else if (abs >= 1e3) formatted = (num / 1e3).toFixed(1) + "K";
      else formatted = num.toFixed(dp);
      break;
    }
    case "currency_usd":
      formatted = "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      break;
    case "currency_sar":
      formatted = "SAR " + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      break;
    case "percent":
      formatted = num.toFixed(dp) + "%";
      break;
    case "decimal_1":
      formatted = num.toFixed(1);
      break;
    case "decimal_2":
      formatted = num.toFixed(2);
      break;
    case "integer":
      formatted = Math.round(num).toLocaleString("en-US");
      break;
    default: // auto
      formatted = num.toLocaleString();
  }
  return prefix + formatted + suffix;
}

/**
 * Build tooltip style from widget style config.
 */
export function buildTooltipStyle(style = {}) {
  const tipFontMap = { small: 9, medium: 11, large: 13 };
  return {
    fontSize: tipFontMap[style.tooltipFontSize || "medium"] || 11,
    borderRadius: style.tooltipRadius ?? 8,
    backgroundColor: style.tooltipBgColor || "#fff",
    color: style.tooltipTextColor || "#374151",
    border: style.tooltipBorder !== false ? "1px solid #e5e7eb" : "none",
    boxShadow: style.tooltipShadow !== false ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
  };
}

/**
 * Build chart margin object from style config.
 * All chart widgets should use this for consistent margin support.
 */
export function buildChartMargin(style = {}, defaults = {}) {
  return {
    top: style.marginTop ?? defaults.top ?? 5,
    right: style.marginRight ?? defaults.right ?? 20,
    bottom: style.marginBottom ?? defaults.bottom ?? 5,
    left: style.marginLeft ?? defaults.left ?? 10,
  };
}

/**
 * Build Recharts Legend props from style config.
 * Supports top/bottom/left/right positioning.
 * Left/Right use vertical layout + align prop.
 */
export function buildLegendProps(style = {}, fontSize = 11) {
  const pos = style.legendPosition || "bottom";
  const layout = style.legendLayout || (pos === "left" || pos === "right" ? "vertical" : "horizontal");

  const props = {
    wrapperStyle: { fontSize: fontSize - 1 },
    layout,
  };

  if (pos === "top") {
    props.verticalAlign = "top";
    props.align = "center";
  } else if (pos === "bottom") {
    props.verticalAlign = "bottom";
    props.align = "center";
  } else if (pos === "right") {
    props.verticalAlign = "middle";
    props.align = "right";
    props.layout = "vertical";
  } else if (pos === "left") {
    props.verticalAlign = "middle";
    props.align = "left";
    props.layout = "vertical";
  }

  return props;
}

/**
 * Font family map for data labels.
 */
const LABEL_FONT_MAP = {
  default: "system-ui, -apple-system, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'SF Mono', 'Fira Code', monospace",
  condensed: "'Arial Narrow', 'Roboto Condensed', sans-serif",
};

/**
 * Separator map for data label parts.
 */
const SEPARATOR_MAP = {
  newline: "\n",
  comma: ", ",
  space: " ",
  dash: " — ",
  pipe: " | ",
  semicolon: "; ",
};

/**
 * Build data label style object from widget style config.
 * Used by all chart widgets for consistent label styling.
 */
export function buildDataLabelStyle(style = {}) {
  return {
    fontSize: style.dataLabelSize || 10,
    fill: style.dataLabelColor || "#374151",
    fontWeight: style.dataLabelBold ? "bold" : "normal",
    fontStyle: style.dataLabelItalic ? "italic" : "normal",
    fontFamily: LABEL_FONT_MAP[style.dataLabelFont || "default"],
  };
}

/**
 * Build data label content string for a chart data point.
 * Supports value, category, percentage, series name with configurable separator.
 *
 * @param {object} params
 * @param {number} params.value - The data value
 * @param {string} params.category - Category/dimension name
 * @param {number} params.percent - Percentage (0-100)
 * @param {string} params.seriesName - Series/measure name
 * @param {object} params.style - Widget style config
 * @returns {string} Formatted label text
 */
export function buildDataLabelContent({ value, category, percent, seriesName, style = {} }) {
  const parts = [];
  const sep = SEPARATOR_MAP[style.labelSeparator || "newline"] || "\n";

  // If user has explicitly configured any label option, respect their choices.
  // Only fall back to showing value if no label options have been set at all.
  const hasExplicitConfig = style.labelShowValue !== undefined ||
    style.labelShowCategory || style.labelShowPercentage || style.labelShowSeriesName;

  const showValue = hasExplicitConfig ? (style.labelShowValue || false) : true;
  const showCategory = style.labelShowCategory || false;
  const showPercentage = style.labelShowPercentage || false;
  const showSeriesName = style.labelShowSeriesName || false;

  if (showSeriesName && seriesName) parts.push(seriesName);
  if (showCategory && category) parts.push(category);
  if (showValue && value != null) parts.push(formatNumber(value, style));
  if (showPercentage && percent != null) parts.push(percent.toFixed(1) + "%");

  // If user explicitly turned off everything, return empty string
  if (hasExplicitConfig && parts.length === 0) return "";

  return parts.length > 0 ? parts.join(sep) : formatNumber(value, style);
}

/**
 * Custom SVG label renderer for Recharts LabelList.
 * Handles newline separator by rendering <tspan> elements.
 * Supports category, seriesName, percent via extra props.
 */
export function renderSvgDataLabel({ x, y, value, width, height, style: _ignored, ...rest }) {
  const labelStyle = rest.labelStyle || {};
  const widgetStyle = rest.widgetStyle || {};
  const seriesName = rest.seriesName;
  const xAxisKey = rest.xAxisKey;
  const percentMap = rest.percentMap;
  const payload = rest.payload || rest;
  const category = xAxisKey && payload ? payload[xAxisKey] : undefined;
  // Compute percent from percentMap if provided
  let percent = null;
  if (percentMap && payload && xAxisKey) {
    const mapKey = `${seriesName || rest.dataKey}::${payload[xAxisKey]}`;
    percent = percentMap[mapKey] ?? null;
  }

  const text = buildDataLabelContent({ value, category, seriesName, percent, style: widgetStyle });
  const lines = text.split("\n");
  const fontSize = labelStyle.fontSize || 10;

  return (
    <text
      x={x + (width ? width / 2 : 0)}
      y={y}
      textAnchor="middle"
      fill={labelStyle.fill || "#374151"}
      fontSize={fontSize}
      fontWeight={labelStyle.fontWeight || "normal"}
      fontStyle={labelStyle.fontStyle || "normal"}
      fontFamily={labelStyle.fontFamily}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x + (width ? width / 2 : 0)} dy={i === 0 ? -fontSize * (lines.length - 1) * 0.5 : fontSize * 1.2}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/**
 * Build LabelList props for Recharts Bar/Line/Area charts.
 * Returns null if labels are disabled.
 * Uses custom SVG renderer for newline separator support.
 * @param {object} style - widget style config
 * @param {string} dataKey - the data key for LabelList
 * @param {object} [extra] - { seriesName, xAxisKey, percentMap, chartData }
 */
export function buildLabelListProps(style = {}, dataKey, extra = {}) {
  if (!style.showDataLabels) return null;
  const lStyle = buildDataLabelStyle(style);
  const sep = style.labelSeparator || "newline";
  const { seriesName, xAxisKey, percentMap } = extra;

  // Always use custom SVG content renderer for proper newline + percent + category support
  if (sep === "newline") {
    return {
      dataKey,
      position: style.dataLabelPosition || "top",
      content: (props) => renderSvgDataLabel({
        ...props,
        labelStyle: lStyle,
        widgetStyle: style,
        seriesName,
        xAxisKey,
        percentMap,
      }),
    };
  }

  // Non-newline separators: use formatter (no SVG tspan needed)
  return {
    dataKey,
    position: style.dataLabelPosition || "top",
    style: lStyle,
    angle: style.dataLabelRotation || 0,
    formatter: (v, entry) => {
      const payload = entry?.payload || entry || {};
      const category = xAxisKey ? payload[xAxisKey] : undefined;
      let percent = null;
      if (percentMap) {
        const mapKey = `${seriesName || dataKey}::${category}`;
        percent = percentMap[mapKey] ?? null;
      }
      return buildDataLabelContent({ value: v, category, seriesName, percent, style });
    },
  };
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
