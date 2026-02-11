/**
 * AreaChartConfig — Config form for area chart (similar to line chart + stacking).
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";

export default function AreaChartConfig({ widget }) {
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
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "style"].map((t) => (
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.dataSource || ""} onChange={(e) => update("dataSource", e.target.value)}>
              <option value="">Select...</option>
              {dataSources.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {ds && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.xAxis || ""} onChange={(e) => update("xAxis", e.target.value)}>
                  <option value="">Select...</option>
                  {allFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.yAxis || ""} onChange={(e) => update("yAxis", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.aggregation || "sum"} onChange={(e) => update("aggregation", e.target.value)}>
                  {["sum", "average", "count", "min", "max"].map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Group By</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.groupBy || ""} onChange={(e) => update("groupBy", e.target.value)}>
                  <option value="">None</option>
                  {textFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} fields={allFields} colTypes={colTypes} dataSource={ds} />}

      {tab === "style" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Area Opacity: {(style.areaOpacity ?? 0.4).toFixed(1)}</label>
            <input type="range" min={0} max={100} value={(style.areaOpacity ?? 0.4) * 100} onChange={(e) => updateStyle("areaOpacity", Number(e.target.value) / 100)} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stacking</label>
            <div className="flex gap-2">
              {["none", "normal", "percentage"].map((s) => (
                <label key={s} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="stacking" checked={(style.stacking || "none") === s} onChange={() => updateStyle("stacking", s)} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {[["showDataPoints", "Data Points"], ["showGridLines", "Grid Lines"], ["showLegend", "Legend"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={style[key] !== false} onChange={(e) => updateStyle(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
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
