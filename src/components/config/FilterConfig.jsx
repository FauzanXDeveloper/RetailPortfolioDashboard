/**
 * FilterConfig — Reusable filter configuration section for widgets.
 * Allows adding/removing per-widget filters.
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import useDashboardStore from "../../store/dashboardStore";
import { getUniqueValues } from "../../utils/dataProcessing";

export default function FilterConfig({ widget, fields, colTypes, dataSource }) {
  const { updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const filters = config.filters || [];

  const updateFilters = (newFilters) =>
    updateWidgetConfig(widget.i, { filters: newFilters });

  const addFilter = () => {
    updateFilters([
      ...filters,
      { field: fields[0] || "", condition: "equals", value: "" },
    ]);
  };

  const removeFilter = (idx) => {
    updateFilters(filters.filter((_, i) => i !== idx));
  };

  const updateFilter = (idx, key, value) => {
    const updated = [...filters];
    updated[idx] = { ...updated[idx], [key]: value };
    updateFilters(updated);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={addFilter}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        <Plus size={12} /> Add Filter
      </button>

      {filters.map((filter, idx) => (
        <div key={idx} className="p-2 bg-gray-50 rounded-lg space-y-2 relative">
          <button
            onClick={() => removeFilter(idx)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>

          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Field</label>
            <select
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
              value={filter.field}
              onChange={(e) => updateFilter(idx, "field", e.target.value)}
            >
              {fields.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Condition</label>
            <select
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
              value={filter.condition}
              onChange={(e) => updateFilter(idx, "condition", e.target.value)}
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="contains">Contains</option>
              <option value="in">In List</option>
              <option value="between">Between</option>
              <option value="gt">Greater Than</option>
              <option value="lt">Less Than</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Value</label>
            {filter.condition === "in" && dataSource ? (
              <select
                multiple
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none min-h-[60px]"
                value={Array.isArray(filter.value) ? filter.value : []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                  updateFilter(idx, "value", selected);
                }}
              >
                {getUniqueValues(dataSource.data, filter.field).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ) : filter.condition === "between" ? (
              <div className="flex gap-1">
                <input
                  type={colTypes[filter.field] === "date" ? "date" : "text"}
                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                  value={Array.isArray(filter.value) ? filter.value[0] || "" : ""}
                  onChange={(e) => {
                    const arr = Array.isArray(filter.value) ? [...filter.value] : ["", ""];
                    arr[0] = e.target.value;
                    updateFilter(idx, "value", arr);
                  }}
                  placeholder="From"
                />
                <input
                  type={colTypes[filter.field] === "date" ? "date" : "text"}
                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                  value={Array.isArray(filter.value) ? filter.value[1] || "" : ""}
                  onChange={(e) => {
                    const arr = Array.isArray(filter.value) ? [...filter.value] : ["", ""];
                    arr[1] = e.target.value;
                    updateFilter(idx, "value", arr);
                  }}
                  placeholder="To"
                />
              </div>
            ) : (
              <input
                type={colTypes[filter.field] === "number" ? "number" : "text"}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                value={filter.value || ""}
                onChange={(e) => updateFilter(idx, "value", e.target.value)}
                placeholder="Enter value..."
              />
            )}
          </div>
        </div>
      ))}

      {filters.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          No filters applied. Click "Add Filter" to add one.
        </p>
      )}
    </div>
  );
}
