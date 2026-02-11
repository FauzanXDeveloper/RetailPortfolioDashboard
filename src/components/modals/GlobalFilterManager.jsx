/**
 * GlobalFilterManager — Modal for managing dynamic global filters.
 * Lets users add/remove global filter entries on any column from any data source.
 */
import React, { useState, useMemo } from "react";
import { X, Plus, Trash2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import useDashboardStore from "../../store/dashboardStore";
import { getUniqueValues, detectColumnTypes } from "../../utils/dataProcessing";

export default function GlobalFilterManager({ open, onClose }) {
  const {
    currentDashboard,
    dataSources,
    setGlobalFilter,
  } = useDashboardStore();

  const gf = currentDashboard.globalFilters || {};
  const dynamicFilters = gf.dynamic || [];

  const [expandedIdx, setExpandedIdx] = useState(null);

  // Gather all fields from all data sources
  const allFieldsInfo = useMemo(() => {
    const fieldsMap = {};
    dataSources.forEach((ds) => {
      const types = detectColumnTypes(ds.data);
      Object.entries(types).forEach(([field, type]) => {
        if (!fieldsMap[field]) {
          fieldsMap[field] = { field, type, sources: [] };
        }
        fieldsMap[field].sources.push(ds.id);
      });
    });
    return Object.values(fieldsMap);
  }, [dataSources]);

  const updateDynamic = (newDynamic) => {
    setGlobalFilter("dynamic", newDynamic);
  };

  const addDynamicFilter = () => {
    const firstField = allFieldsInfo[0];
    const newFilter = {
      id: `gf-${Date.now()}`,
      field: firstField?.field || "",
      type: firstField?.type || "text",
      values: [],
      label: firstField?.field || "New Filter",
    };
    updateDynamic([...dynamicFilters, newFilter]);
    setExpandedIdx(dynamicFilters.length);
  };

  const removeDynamicFilter = (idx) => {
    updateDynamic(dynamicFilters.filter((_, i) => i !== idx));
    setExpandedIdx(null);
  };

  const updateDynamicFilter = (idx, updates) => {
    const updated = [...dynamicFilters];
    updated[idx] = { ...updated[idx], ...updates };
    updateDynamic(updated);
  };

  const getUniqueValuesForField = (field) => {
    const values = new Set();
    dataSources.forEach((ds) => {
      getUniqueValues(ds.data, field).forEach((v) => values.add(v));
    });
    return [...values].sort();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-800">Global Filter Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Built-in filters info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Built-in filters</strong> (Date Range, Category, Region, Search) are always available in the header bar.
              Add custom filters below to filter on any column across all data sources.
            </p>
          </div>

          {/* Dynamic filters list */}
          {dynamicFilters.length === 0 ? (
            <div className="text-center py-6">
              <Filter size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No custom global filters yet.</p>
              <p className="text-xs text-gray-400">Click "Add Filter" to create one.</p>
            </div>
          ) : (
            dynamicFilters.map((df, idx) => {
              const isExpanded = expandedIdx === idx;
              const uniqueValues = getUniqueValuesForField(df.field);

              return (
                <div key={df.id || idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Filter header */}
                  <div
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span className="text-sm font-medium text-gray-700">
                        {df.label || df.field}
                      </span>
                      {df.values?.length > 0 && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                          {df.values.length} selected
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDynamicFilter(idx);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 py-3 space-y-3">
                      {/* Label */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Filter Label</label>
                        <input
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400"
                          value={df.label || ""}
                          onChange={(e) => updateDynamicFilter(idx, { label: e.target.value })}
                          placeholder="Filter label..."
                        />
                      </div>

                      {/* Field */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Column / Field</label>
                        <select
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400"
                          value={df.field}
                          onChange={(e) => {
                            const fi = allFieldsInfo.find((f) => f.field === e.target.value);
                            updateDynamicFilter(idx, {
                              field: e.target.value,
                              type: fi?.type || "text",
                              values: [],
                              label: df.label === df.field ? e.target.value : df.label,
                            });
                          }}
                        >
                          {allFieldsInfo.map((f) => (
                            <option key={f.field} value={f.field}>
                              {f.field} ({f.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Values */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">
                          Filter Values ({df.values?.length || 0} of {uniqueValues.length})
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-1.5 space-y-0.5">
                          {/* Select All */}
                          <label className="flex items-center gap-1.5 text-xs px-1 py-0.5 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={df.values?.length === uniqueValues.length && uniqueValues.length > 0}
                              onChange={(e) => {
                                updateDynamicFilter(idx, {
                                  values: e.target.checked ? uniqueValues.map(String) : [],
                                });
                              }}
                              className="rounded"
                            />
                            <span className="font-medium text-gray-500">Select All</span>
                          </label>
                          <hr className="border-gray-100" />
                          {uniqueValues.map((v) => (
                            <label
                              key={v}
                              className="flex items-center gap-1.5 text-xs px-1 py-0.5 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(df.values || []).includes(String(v))}
                                onChange={(e) => {
                                  const current = df.values || [];
                                  const next = e.target.checked
                                    ? [...current, String(v)]
                                    : current.filter((s) => s !== String(v));
                                  updateDynamicFilter(idx, { values: next });
                                }}
                                className="rounded"
                              />
                              {String(v)}
                            </label>
                          ))}
                          {uniqueValues.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">No values found</p>
                          )}
                        </div>
                      </div>

                      {/* Quick clear */}
                      {df.values?.length > 0 && (
                        <button
                          onClick={() => updateDynamicFilter(idx, { values: [] })}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={addDynamicFilter}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add Filter
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
