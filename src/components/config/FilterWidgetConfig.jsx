/**
 * FilterWidgetConfig — Config for dropdown-filter and date-range-filter widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, DataSourceInfo } from "./ConfigFieldComponents";

export default function FilterWidgetConfig({ widget }) {
  const { dataSources, updateWidgetConfig, currentDashboard } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const isDateRange = widget.type === "date-range-filter";
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes);

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) => updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });
  const updateStyleBatch = (updates) => updateWidgetConfig(widget.i, { style: { ...style, ...updates } });

  // Get all other widgets to allow "Apply To" selection
  const otherWidgets = (currentDashboard.widgets || []).filter(
    (w) => w.i !== widget.i && !w.type.includes("filter") && w.type !== "text"
  );

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "style"].map((t) => (
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setTab(t)}>
            {t === "data" ? "📊 Config" : "🎨 Style"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ConfigSection label="Filter Setup" icon="🔍">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Filter Name</label>
              <input
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                value={config.filterName || ""}
                onChange={(e) => update("filterName", e.target.value)}
                placeholder="Enter filter name..."
              />
            </div>
            <ConfigSelect
              label="Data Source"
              value={config.dataSource}
              onChange={(v) => update("dataSource", v)}
              options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))}
              placeholder="Select data source..."
            />
            {ds && <DataSourceInfo ds={ds} />}
          </ConfigSection>

          {ds && (
            <ConfigSection label="Field & Type" icon="📐">
              <ConfigSelect
                label={isDateRange ? "Date Field" : "Filter Field"}
                badge={isDateRange ? "date" : "dimension"}
                value={isDateRange ? config.dateField : config.filterField}
                onChange={(v) => update(isDateRange ? "dateField" : "filterField", v)}
                options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))}
                placeholder="Select field..."
              />
              {!isDateRange && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Selection Type</label>
                  <div className="flex gap-1">
                    {["single", "multi"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`flex-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          (config.type || "single") === t
                            ? "bg-brand-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        onClick={() => update("type", t)}
                      >
                        {t === "single" ? "Single Select" : "Multi Select"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ConfigSection>
          )}

          {otherWidgets.length > 0 && (
            <ConfigSection label="Apply To" icon="🎯" collapsible defaultOpen={false}>
              <div className="space-y-1">
                {otherWidgets.map((w) => (
                  <label key={w.i} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={(config.applyTo || []).includes(w.i)}
                      onChange={(e) => {
                        const current = config.applyTo || [];
                        const updated = e.target.checked
                          ? [...current, w.i]
                          : current.filter((id) => id !== w.i);
                        update("applyTo", updated);
                      }}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-400"
                    />
                    <span className="font-medium text-gray-700">{w.title}</span>
                    <span className="text-[10px] text-gray-400">({w.type})</span>
                  </label>
                ))}
              </div>
            </ConfigSection>
          )}
        </div>
      )}

      {tab === "style" && (
        <div className="space-y-3">
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}
    </div>
  );
}
