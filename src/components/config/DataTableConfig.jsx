/**
 * DataTableConfig — Configuration form for data table widgets.
 */
import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, DataSourceInfo } from "./ConfigFieldComponents";

export default function DataTableConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes);

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) => updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });
  const updateStyleBatch = (updates) => updateWidgetConfig(widget.i, { style: { ...style, ...updates } });

  const selectedColumns = config.columns?.length > 0 ? config.columns : allFields;
  const availableColumns = allFields.filter((f) => !selectedColumns.includes(f));

  const addColumn = (col) => update("columns", [...selectedColumns, col]);
  const removeColumn = (col) => update("columns", selectedColumns.filter((c) => c !== col));
  const moveColumn = (col, dir) => {
    const idx = selectedColumns.indexOf(col);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= selectedColumns.length) return;
    const arr = [...selectedColumns];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    update("columns", arr);
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "formatting"].map((t) => (
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setTab(t)}>
            {t === "data" ? "📊 Data" : t === "filters" ? "🔍 Filters" : "🎨 Format"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ConfigSection label="Data Source" icon="📊">
            <ConfigSelect label="Source" value={config.dataSource} onChange={(v) => update("dataSource", v)} options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))} placeholder="Select data source..." />
            {ds && <DataSourceInfo ds={ds} />}
          </ConfigSection>

          {ds && (
            <>
              {/* Column selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Columns</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">Available</p>
                    <div className="border border-gray-200 rounded p-1 min-h-[80px] max-h-[120px] overflow-y-auto">
                      {availableColumns.map((col) => (
                        <button key={col} className="block w-full text-left text-xs px-1 py-0.5 hover:bg-blue-50 rounded" onClick={() => addColumn(col)}>{col}</button>
                      ))}
                      {availableColumns.length === 0 && <span className="text-[10px] text-gray-300">All selected</span>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">Selected</p>
                    <div className="border border-gray-200 rounded p-1 min-h-[80px] max-h-[120px] overflow-y-auto">
                      {selectedColumns.map((col) => (
                        <div key={col} className="flex items-center gap-0.5 text-xs px-1 py-0.5 hover:bg-gray-50 rounded group">
                          <span className="flex-1">{col}</span>
                          <button className="text-gray-300 hover:text-gray-600" onClick={() => moveColumn(col, -1)}><ChevronUp size={10} /></button>
                          <button className="text-gray-300 hover:text-gray-600" onClick={() => moveColumn(col, 1)}><ChevronDown size={10} /></button>
                          <button className="text-gray-300 hover:text-red-500 ml-1" onClick={() => removeColumn(col)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rows per page</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.rowsPerPage || 10} onChange={(e) => update("rowsPerPage", Number(e.target.value))}>
                  {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                {[["enableSorting", "Sorting"], ["enableFiltering", "Column Filtering"], ["enablePagination", "Pagination"], ["enableExportCSV", "Export to CSV"]].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={config[key] !== false} onChange={(e) => update(key, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} fields={allFields} colTypes={colTypes} dataSource={ds} />}

      {tab === "formatting" && (
        <div className="space-y-3">
          <div className="space-y-2">
            {[["stripedRows", "Striped Rows"], ["hoverEffect", "Hover Effect"], ["compactMode", "Compact Mode"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={key === "compactMode" ? style[key] === true : style[key] !== false} onChange={(e) => updateStyle(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          {/* Per-column formatting */}
          {selectedColumns.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Column Formatting</label>
              {selectedColumns.map((col) => {
                const cf = (style.columnFormats || {})[col] || {};
                const updateColFormat = (key, value) => {
                  const formats = { ...(style.columnFormats || {}) };
                  formats[col] = { ...cf, [key]: value };
                  updateStyle("columnFormats", formats);
                };
                return (
                  <div key={col} className="p-1.5 bg-gray-50 rounded mb-1">
                    <p className="text-[10px] font-semibold text-gray-500 mb-1">{col}</p>
                    <div className="flex gap-1">
                      <input className="flex-1 text-[10px] border border-gray-200 rounded px-1 py-0.5 outline-none" placeholder="Display Name" value={cf.displayName || ""} onChange={(e) => updateColFormat("displayName", e.target.value)} />
                      <select className="text-[10px] border border-gray-200 rounded px-1 py-0.5 outline-none" value={cf.alignment || "left"} onChange={(e) => updateColFormat("alignment", e.target.value)}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                      <select className="text-[10px] border border-gray-200 rounded px-1 py-0.5 outline-none" value={cf.format || ""} onChange={(e) => updateColFormat("format", e.target.value)}>
                        <option value="">Auto</option>
                        <option value="number">Number</option>
                        <option value="currency">Currency</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={config.applyGlobalFilters !== false} onChange={(e) => update("applyGlobalFilters", e.target.checked)} />
          <span className="font-medium">Apply global filters</span>
        </label>
      </div>
    </div>
  );
}
