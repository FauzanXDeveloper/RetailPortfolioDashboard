/**
 * Data processing utility functions.
 * Filter, aggregate, sort, and transform data for charts and widgets.
 */

/**
 * Filter data based on an array of filter conditions.
 * Each filter: { field, condition, value }
 *   condition: 'equals','not_equals','contains','in','between','gt','lt','gte','lte'
 */
export function filterData(data, filters) {
  if (!filters || filters.length === 0) return data;
  return data.filter((row) => {
    return filters.every((f) => {
      const val = row[f.field];
      switch (f.condition) {
        case "equals":
          return String(val) === String(f.value);
        case "not_equals":
          return String(val) !== String(f.value);
        case "contains":
          return String(val).toLowerCase().includes(String(f.value).toLowerCase());
        case "in":
          if (Array.isArray(f.value)) {
            return f.value.map(String).includes(String(val));
          }
          return true;
        case "between":
          if (Array.isArray(f.value) && f.value.length === 2) {
            return val >= f.value[0] && val <= f.value[1];
          }
          return true;
        case "gt":
          return Number(val) > Number(f.value);
        case "lt":
          return Number(val) < Number(f.value);
        case "gte":
          return Number(val) >= Number(f.value);
        case "lte":
          return Number(val) <= Number(f.value);
        default:
          return true;
      }
    });
  });
}

/**
 * Aggregate data by a dimension field and a measure using an aggregation type.
 * @param {Array} data - The dataset
 * @param {string} dimension - The field to group by
 * @param {string} measure - The field to aggregate
 * @param {string} aggType - sum | average | count | min | max
 * @param {string} [colorBy] - Optional secondary grouping for stacked/grouped charts
 * @returns {Array} Aggregated rows: [{ [dimension]: value, [measure]: aggregatedValue, ... }]
 */
export function aggregateData(data, dimension, measure, aggType = "sum", colorBy = null) {
  if (!data || !dimension || !measure) return [];

  if (colorBy && colorBy !== dimension) {
    // Produce grouped aggregation: each row has dimension + one key per colorBy value
    const groups = {};
    data.forEach((row) => {
      const key = String(row[dimension]);
      const color = String(row[colorBy]);
      if (!groups[key]) groups[key] = {};
      if (!groups[key][color]) groups[key][color] = [];
      groups[key][color].push(Number(row[measure]) || 0);
    });

    return Object.entries(groups).map(([dimVal, colorGroups]) => {
      const entry = { [dimension]: dimVal };
      Object.entries(colorGroups).forEach(([colorVal, vals]) => {
        entry[colorVal] = applyAgg(vals, aggType);
      });
      return entry;
    });
  }

  // Simple aggregation
  const groups = {};
  data.forEach((row) => {
    const key = String(row[dimension]);
    if (!groups[key]) groups[key] = [];
    groups[key].push(Number(row[measure]) || 0);
  });

  return Object.entries(groups).map(([dimVal, vals]) => ({
    [dimension]: dimVal,
    [measure]: applyAgg(vals, aggType),
  }));
}

function applyAgg(values, aggType) {
  if (!values.length) return 0;
  switch (aggType) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "average":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "count":
      return values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

/**
 * Sort data by a given field and order.
 * @param {Array} data
 * @param {string} sortBy - 'value' or 'label' or a field name
 * @param {string} order - 'asc' or 'desc'
 * @param {string} [field] - The field to use when sortBy is 'value' or 'label'
 */
export function sortData(data, sortBy, order = "desc", field = null) {
  if (!data || !data.length) return data;
  const arr = [...data];
  const key = field || Object.keys(arr[0])[sortBy === "label" ? 0 : 1];
  arr.sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === "number" && typeof vb === "number") {
      return order === "asc" ? va - vb : vb - va;
    }
    return order === "asc"
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });
  return arr;
}

/**
 * Apply global filters to widget data.
 * Global filters: { dateRange: { start, end }, categories: [...], regions: [...], search: '', dynamic: [...] }
 */
export function applyGlobalFilters(data, globalFilters, widgetConfig) {
  if (!widgetConfig?.applyGlobalFilters) return data;
  if (!globalFilters) return data;

  let filtered = [...data];

  // Date range filter
  if (globalFilters.dateRange?.start && globalFilters.dateRange?.end) {
    const dateFields = Object.keys(data[0] || {}).filter(
      (k) => k.toLowerCase().includes("date") || k.toLowerCase().includes("time")
    );
    if (dateFields.length > 0) {
      const dateField = dateFields[0];
      filtered = filtered.filter((row) => {
        const d = row[dateField];
        return d >= globalFilters.dateRange.start && d <= globalFilters.dateRange.end;
      });
    }
  }

  // Dynamic filters (user-defined global filters on any column)
  if (globalFilters.dynamic?.length > 0) {
    globalFilters.dynamic.forEach((df) => {
      if (!df.field || !df.values?.length) return;
      filtered = filtered.filter((row) =>
        df.values.map(String).includes(String(row[df.field]))
      );
    });
  }

  // Search filter - search across all text fields
  if (globalFilters.search) {
    const searchLower = globalFilters.search.toLowerCase();
    filtered = filtered.filter((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(searchLower)
      )
    );
  }

  return filtered;
}

/**
 * Apply cross-filters from filter widgets to a target widget's data.
 * Finds all filter widgets that target this widget, then filters data by their values.
 * @param {Array} data - The raw data
 * @param {string} widgetId - The target widget's ID
 * @param {Array} allWidgets - All widgets in the dashboard
 * @param {Object} widgetFilterValues - Map of filterWidgetId -> selected value(s)
 * @returns {Array} Filtered data
 */
export function applyCrossFilters(data, widgetId, allWidgets, widgetFilterValues) {
  if (!data || !allWidgets || !widgetFilterValues) return data;

  let filtered = [...data];

  // Find all filter widgets that target this widget
  const filterWidgets = allWidgets.filter(
    (w) =>
      w.type.includes("filter") &&
      w.config?.applyTo?.includes(widgetId) &&
      widgetFilterValues[w.i] !== undefined
  );

  filterWidgets.forEach((fw) => {
    const filterValue = widgetFilterValues[fw.i];
    const filterField = fw.config?.filterField || fw.config?.dateField;
    if (!filterField) return;

    // Skip "all" value (no filter)
    if (filterValue === "all" || filterValue === "") return;

    if (Array.isArray(filterValue)) {
      // Multi-select: keep rows where field is in selected values
      if (filterValue.length === 0) return;
      filtered = filtered.filter((row) =>
        filterValue.map(String).includes(String(row[filterField]))
      );
    } else if (typeof filterValue === "object" && filterValue !== null) {
      // Date range or range object: { start, end } or { min, max }
      if (filterValue.start && filterValue.end) {
        filtered = filtered.filter((row) => {
          const v = row[filterField];
          return v >= filterValue.start && v <= filterValue.end;
        });
      } else if (filterValue.min !== undefined && filterValue.max !== undefined) {
        filtered = filtered.filter((row) => {
          const v = Number(row[filterField]);
          return v >= filterValue.min && v <= filterValue.max;
        });
      }
    } else if (typeof filterValue === "boolean") {
      // Toggle filter
      if (filterValue) {
        filtered = filtered.filter((row) => {
          const v = row[filterField];
          return v && v !== "false" && v !== "0" && v !== "";
        });
      }
    } else if (typeof filterValue === "string" && filterValue.trim()) {
      // Search filter or single dropdown
      filtered = filtered.filter((row) =>
        String(row[filterField]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }
  });

  return filtered;
}

/**
 * Compute a single aggregate value from data (for KPI cards).
 */
export function computeMetric(data, field, aggType = "sum") {
  if (!data || !data.length || !field) return 0;
  const values = data.map((row) => Number(row[field]) || 0);
  return applyAgg(values, aggType);
}

/**
 * Get the unique values of a field in a dataset.
 */
export function getUniqueValues(data, field) {
  if (!data || !field) return [];
  return [...new Set(data.map((row) => row[field]))].filter(Boolean);
}

/**
 * Detect column types from a dataset.
 * Returns an object mapping field names to 'number', 'date', or 'text'.
 */
export function detectColumnTypes(data) {
  if (!data || !data.length) return {};
  const types = {};
  const sample = data.slice(0, 20);
  Object.keys(data[0]).forEach((key) => {
    const values = sample.map((r) => r[key]).filter((v) => v != null && v !== "");
    if (values.length === 0) {
      types[key] = "text";
      return;
    }
    // Check if all values are numbers
    if (values.every((v) => !isNaN(Number(v)) && typeof v !== "boolean")) {
      types[key] = "number";
      return;
    }
    // Check if it looks like dates
    if (values.every((v) => !isNaN(Date.parse(String(v))))) {
      types[key] = "date";
      return;
    }
    types[key] = "text";
  });
  return types;
}

/**
 * Format a number according to a format spec.
 */
export function formatValue(value, format = {}) {
  if (value == null) return "—";
  const num = Number(value);
  if (isNaN(num)) return String(value);

  const { type = "number", decimals = 0, prefix = "", suffix = "" } = format;

  let formatted;
  switch (type) {
    case "currency":
      formatted = num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${prefix || "$"}${formatted}${suffix}`;
    case "percentage":
      formatted = num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${prefix}${formatted}%${suffix}`;
    default:
      formatted = num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${prefix}${formatted}${suffix}`;
  }
}

/**
 * Limit results to top/bottom N items.
 */
export function limitData(data, limit, direction = "top", valueField = null) {
  if (!limit || !data) return data;
  if (valueField) {
    const sorted = [...data].sort(
      (a, b) =>
        direction === "top"
          ? (Number(b[valueField]) || 0) - (Number(a[valueField]) || 0)
          : (Number(a[valueField]) || 0) - (Number(b[valueField]) || 0)
    );
    return sorted.slice(0, limit);
  }
  return data.slice(0, limit);
}
