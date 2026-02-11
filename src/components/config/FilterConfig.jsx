/**
 * FilterConfig — Reusable filter configuration section for widgets.
 * Allows adding/removing per-widget filters with smart value pickers.
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
    // Reset value when field or condition changes
    if (key === "field" || key === "condition") {
      if (key === "condition") {
        if (value === "in") updated[idx] = { ...updated[idx], [key]: value, value: [] };
        else if (value === "between") updated[idx] = { ...updated[idx], [key]: value, value: ["", ""] };
        else updated[idx] = { ...updated[idx], [key]: value, value: "" };
      } else {
        updated[idx] = { ...updated[idx], [key]: value };
      }
    } else {
      updated[idx] = { ...updated[idx], [key]: value };
    }
    updateFilters(updated);
  };

  const getConditionsForType = (fieldType) => {
    if (fieldType === "number") {
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not Equals" },
        { value: "gt", label: "Greater Than" },
        { value: "lt", label: "Less Than" },
        { value: "gte", label: "≥ Greater or Equal" },
        { value: "lte", label: "≤ Less or Equal" },
        { value: "between", label: "Between" },
        { value: "in", label: "Is One Of" },
      ];
    }
    if (fieldType === "date") {
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not Equals" },
        { value: "between", label: "Between" },
        { value: "gt", label: "After" },
        { value: "lt", label: "Before" },
      ];
    }
    // text
    return [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
      { value: "contains", label: "Contains" },
      { value: "in", label: "Is One Of" },
    ];
  };

  const renderValueInput = (filter, idx) => {
    const fieldType = colTypes[filter.field] || "text";
    const uniqueValues = dataSource ? getUniqueValues(dataSource.data, filter.field) : [];

    // "In List" — multi-select checkbox picker
    if (filter.condition === "in") {
      const selected = Array.isArray(filter.value) ? filter.value : [];
      return (
        <div className="space-y-1">
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-1 space-y-0.5">
            {uniqueValues.length > 0 ? (
              <>
                <label className="flex items-center gap-1.5 text-xs px-1 py-0.5 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.length === uniqueValues.length}
                    onChange={(e) => {
                      updateFilter(idx, "value", e.target.checked ? uniqueValues.map(String) : []);
                    }}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-500">Select All</span>
                </label>
                <hr className="border-gray-100" />
                {uniqueValues.map((v) => (
                  <label key={v} className="flex items-center gap-1.5 text-xs px-1 py-0.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(String(v))}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selected, String(v)]
                          : selected.filter((s) => s !== String(v));
                        updateFilter(idx, "value", next);
                      }}
                      className="rounded"
                    />
                    {String(v)}
                  </label>
                ))}
              </>
            ) : (
              <p className="text-xs text-gray-400 p-1">No values found</p>
            )}
          </div>
          {selected.length > 0 && (
            <p className="text-xs text-indigo-500">{selected.length} selected</p>
          )}
        </div>
      );
    }

    // "Between" — two inputs
    if (filter.condition === "between") {
      return (
        <div className="flex gap-1">
          <input
            type={fieldType === "date" ? "date" : fieldType === "number" ? "number" : "text"}
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
            type={fieldType === "date" ? "date" : fieldType === "number" ? "number" : "text"}
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
      );
    }

    // "Equals" / "Not Equals" for text — show dropdown with unique values
    if (fieldType === "text" && (filter.condition === "equals" || filter.condition === "not_equals")) {
      return (
        <select
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
          value={filter.value || ""}
          onChange={(e) => updateFilter(idx, "value", e.target.value)}
        >
          <option value="">Select value...</option>
          {uniqueValues.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      );
    }

    // Default — plain input
    return (
      <input
        type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
        className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
        value={filter.value || ""}
        onChange={(e) => updateFilter(idx, "value", e.target.value)}
        placeholder="Enter value..."
      />
    );
  };

  return (
    <div className="space-y-3">
      <button
        onClick={addFilter}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        <Plus size={12} /> Add Filter
      </button>

      {filters.map((filter, idx) => {
        const fieldType = colTypes[filter.field] || "text";
        const conditions = getConditionsForType(fieldType);

        return (
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
                  <option key={f} value={f}>{f} ({colTypes[f] || "text"})</option>
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
                {conditions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Value</label>
              {renderValueInput(filter, idx)}
            </div>
          </div>
        );
      })}

      {filters.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          No filters applied. Click "Add Filter" to add one.
        </p>
      )}
    </div>
  );
}
