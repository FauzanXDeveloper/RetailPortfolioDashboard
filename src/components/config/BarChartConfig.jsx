/**
 * BarChartConfig — Configuration form for bar chart widgets.
 * Tabs: Data, Filters, Style
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import { ColorPicker } from "../common/CommonComponents";
import FilterConfig from "./FilterConfig";

export default function BarChartConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes);
  const numericFields = allFields.filter((f) => colTypes[f] === "number");
  const textFields = allFields.filter((f) => colTypes[f] !== "number");

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) =>
    updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "style"].map((t) => (
          <button
            key={t}
            className={`px-3 py-1.5 text-xs font-medium capitalize ${
              tab === t
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Data Tab */}
      {tab === "data" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400"
              value={config.dataSource || ""}
              onChange={(e) => update("dataSource", e.target.value)}
            >
              <option value="">Select data source...</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>

          {ds && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis (Dimension)</label>
                <select
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400"
                  value={config.xAxis || ""}
                  onChange={(e) => update("xAxis", e.target.value)}
                >
                  <option value="">Select field...</option>
                  {allFields.map((f) => (
                    <option key={f} value={f}>{f} ({colTypes[f]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis (Measure)</label>
                <select
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400"
                  value={config.yAxis || ""}
                  onChange={(e) => update("yAxis", e.target.value)}
                >
                  <option value="">Select field...</option>
                  {numericFields.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
                <select
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400"
                  value={config.aggregation || "sum"}
                  onChange={(e) => update("aggregation", e.target.value)}
                >
                  {["sum", "average", "count", "min", "max"].map((a) => (
                    <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Color By (Optional)</label>
                <select
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400"
                  value={config.colorBy || ""}
                  onChange={(e) => update("colorBy", e.target.value)}
                >
                  <option value="">None</option>
                  {textFields.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                  <select
                    className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                    value={config.sortBy || "value"}
                    onChange={(e) => update("sortBy", e.target.value)}
                  >
                    <option value="value">Value</option>
                    <option value="label">Label</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <select
                    className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                    value={config.sortOrder || "desc"}
                    onChange={(e) => update("sortOrder", e.target.value)}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Limit</label>
                  <select
                    className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                    value={config.limitDirection || "top"}
                    onChange={(e) => update("limitDirection", e.target.value)}
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Items</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                    value={config.limit || 0}
                    onChange={(e) => update("limit", Number(e.target.value))}
                    placeholder="0 = all"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Filters Tab */}
      {tab === "filters" && (
        <FilterConfig
          widget={widget}
          fields={allFields}
          colTypes={colTypes}
          dataSource={ds}
        />
      )}

      {/* Style Tab */}
      {tab === "style" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Orientation</label>
            <div className="flex gap-2">
              {["vertical", "horizontal"].map((o) => (
                <label key={o} className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="orientation"
                    checked={style.orientation === o}
                    onChange={() => updateStyle("orientation", o)}
                  />
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <ColorPicker
            label="Bar Color"
            value={style.barColor || "#4F46E5"}
            onChange={(c) => updateStyle("barColor", c)}
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Show</label>
            {[
              ["showGridLines", "Grid Lines"],
              ["showLegend", "Legend"],
              ["showDataLabels", "Data Labels"],
              ["showAxisTitles", "Axis Titles"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={style[key] !== false}
                  onChange={(e) => updateStyle(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          {style.showAxisTitles && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis Title</label>
                <input
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                  value={style.xAxisTitle || ""}
                  onChange={(e) => updateStyle("xAxisTitle", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis Title</label>
                <input
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                  value={style.yAxisTitle || ""}
                  onChange={(e) => updateStyle("yAxisTitle", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Apply Global Filters toggle */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.applyGlobalFilters !== false}
            onChange={(e) => update("applyGlobalFilters", e.target.checked)}
          />
          <span className="font-medium">Apply global filters to this widget</span>
        </label>
      </div>
    </div>
  );
}
