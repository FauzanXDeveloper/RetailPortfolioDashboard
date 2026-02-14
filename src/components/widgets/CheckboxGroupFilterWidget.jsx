/**
 * CheckboxGroupFilterWidget — A set of checkboxes for multi-value filtering.
 */
import React, { useMemo } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { getUniqueValues } from "../../utils/dataProcessing";

export default function CheckboxGroupFilterWidget({ widget }) {
  const { dataSources, setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};

  const options = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.filterField) return [];
    return getUniqueValues(ds.data, config.filterField);
  }, [dataSources, config.dataSource, config.filterField]);

  const selected = widgetFilterValues[widget.i] || [];

  if (!config.dataSource || !config.filterField) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-xs">Configure filter</div>;
  }

  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
    setWidgetFilterValue(widget.i, next);
  };

  const clearAll = () => setWidgetFilterValue(widget.i, []);

  const style = config.style || {};

  return (
    <div className="flex flex-col h-full px-2 py-1 overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: style.textColor || style.axisColor || '#6b7280' }}>{config.filterName || config.filterField}</span>
        <button onClick={clearAll} className="text-[10px] text-indigo-600 hover:text-indigo-700">Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
            <input
              type="checkbox"
              checked={selected.length === 0 || selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded text-indigo-600"
            />
            <span className="truncate" style={{ color: style.textColor || undefined }}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
