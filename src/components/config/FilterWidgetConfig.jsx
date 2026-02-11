/**
 * FilterWidgetConfig — Config for dropdown-filter and date-range-filter widgets.
 */
import React from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";

export default function FilterWidgetConfig({ widget }) {
  const { dataSources, updateWidgetConfig, currentDashboard } = useDashboardStore();
  const config = widget.config || {};
  const isDateRange = widget.type === "date-range-filter";

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes);

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });

  // Get all other widgets to allow "Apply To" selection
  const otherWidgets = (currentDashboard.widgets || []).filter(
    (w) => w.i !== widget.i && !w.type.includes("filter") && w.type !== "text"
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Filter Name</label>
        <input
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
          value={config.filterName || ""}
          onChange={(e) => update("filterName", e.target.value)}
          placeholder="Enter filter name..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
        <select
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
          value={config.dataSource || ""}
          onChange={(e) => update("dataSource", e.target.value)}
        >
          <option value="">Select...</option>
          {dataSources.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {ds && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isDateRange ? "Date Field" : "Filter Field"}
            </label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={isDateRange ? config.dateField || "" : config.filterField || ""}
              onChange={(e) =>
                update(isDateRange ? "dateField" : "filterField", e.target.value)
              }
            >
              <option value="">Select...</option>
              {allFields.map((f) => (
                <option key={f} value={f}>{f} ({colTypes[f]})</option>
              ))}
            </select>
          </div>

          {!isDateRange && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Selection Type</label>
              <div className="flex gap-3">
                {["single", "multi"].map((t) => (
                  <label key={t} className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="filterType"
                      checked={(config.type || "single") === t}
                      onChange={() => update("type", t)}
                    />
                    {t === "single" ? "Single Select" : "Multi Select"}
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {otherWidgets.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Apply To Widgets</label>
          <div className="space-y-1">
            {otherWidgets.map((w) => (
              <label key={w.i} className="flex items-center gap-2 text-xs">
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
                />
                {w.title} ({w.type})
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
