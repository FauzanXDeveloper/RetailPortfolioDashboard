/**
 * FilterConfig — Reusable filter configuration section for widgets.
 * Allows adding/removing per-widget filters with smart value pickers.
 */
import React, { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
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
        { value: "in", label: "Is One Of (Multi-Select)" },
        { value: "gt", label: "Greater Than" },
        { value: "lt", label: "Less Than" },
        { value: "gte", label: "≥ Greater or Equal" },
        { value: "lte", label: "≤ Less or Equal" },
        { value: "between", label: "Between" },
      ];
    }
    if (fieldType === "date") {
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not Equals" },
        { value: "in", label: "Is One Of (Multi-Select)" },
        { value: "between", label: "Between" },
        { value: "gt", label: "After" },
        { value: "lt", label: "Before" },
      ];
    }
    // text
    return [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
      { value: "in", label: "Is One Of (Multi-Select)" },
      { value: "contains", label: "Contains" },
    ];
  };

  const renderValueInput = (filter, idx) => {
    const fieldType = colTypes[filter.field] || "text";
    const uniqueValues = dataSource ? getUniqueValues(dataSource.data, filter.field) : [];

    // "In List" — multi-select checkbox picker with search
    if (filter.condition === "in") {
      const selected = Array.isArray(filter.value) ? filter.value : [];
      return <MultiSelectPicker
        values={uniqueValues}
        selected={selected}
        onChange={(next) => updateFilter(idx, "value", next)}
      />;
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

/**
 * MultiSelectPicker — Checkbox list with search, Select All, and count badge.
 * Matches the UI pattern from the screenshot.
 */
function MultiSelectPicker({ values, selected, onChange }) {
  const [search, setSearch] = useState("");
  const filtered = values.filter((v) =>
    String(v).toLowerCase().includes(search.toLowerCase())
  );
  const allFilteredSelected = filtered.length > 0 && filtered.every((v) => selected.includes(String(v)));

  const toggleOne = (v) => {
    const sv = String(v);
    onChange(selected.includes(sv) ? selected.filter((s) => s !== sv) : [...selected, sv]);
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered items
      const filteredSet = new Set(filtered.map(String));
      onChange(selected.filter((s) => !filteredSet.has(s)));
    } else {
      // Select all filtered items (merge with existing)
      const existing = new Set(selected);
      filtered.forEach((v) => existing.add(String(v)));
      onChange([...existing]);
    }
  };

  return (
    <div className="space-y-1">
      {/* Search box */}
      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 pl-6 outline-none focus:border-brand-400"
          placeholder="Search values..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Checkbox list */}
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-white">
        {filtered.length > 0 ? (
          <>
            {/* Select All */}
            <label className="flex items-center gap-2 text-xs px-2 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 sticky top-0 bg-white z-10">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAll}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-400"
              />
              <span className="font-semibold text-gray-600">Select All</span>
              {search && <span className="text-[10px] text-gray-400 ml-auto">({filtered.length})</span>}
            </label>
            {filtered.map((v) => (
              <label key={v} className="flex items-center gap-2 text-xs px-2 py-1 hover:bg-brand-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(String(v))}
                  onChange={() => toggleOne(v)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-400"
                />
                <span className="truncate">{String(v)}</span>
              </label>
            ))}
          </>
        ) : (
          <p className="text-xs text-gray-400 p-2 text-center">No values found</p>
        )}
      </div>

      {/* Count badge */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-brand-600 font-medium">
            {selected.length} of {values.length} selected
          </span>
          <button
            onClick={() => onChange([])}
            className="text-[10px] text-red-500 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
