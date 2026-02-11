/**
 * Dropdown Filter Widget — A select filter that pushes values to connected widgets.
 */
import React, { useMemo } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { getUniqueValues } from "../../utils/dataProcessing";

export default function DropdownFilterWidget({ widget }) {
  const { dataSources, setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};

  const options = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.filterField) return [];
    return getUniqueValues(ds.data, config.filterField);
  }, [dataSources, config.dataSource, config.filterField]);

  const currentValue = widgetFilterValues[widget.i] ?? (config.type === "multi" ? [] : "all");

  if (!config.dataSource || !config.filterField) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center">
        Configure filter
      </div>
    );
  }

  const handleChange = (e) => {
    if (config.type === "multi") {
      const selected = Array.from(e.target.selectedOptions, (o) => o.value);
      setWidgetFilterValue(widget.i, selected);
    } else {
      setWidgetFilterValue(widget.i, e.target.value);
    }
  };

  return (
    <div className="flex items-center gap-2 h-full px-1">
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
        {config.filterName || config.filterField}:
      </span>
      <select
        className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-indigo-400 bg-white"
        value={currentValue}
        onChange={handleChange}
        multiple={config.type === "multi"}
      >
        {config.type !== "multi" && <option value="all">All</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
