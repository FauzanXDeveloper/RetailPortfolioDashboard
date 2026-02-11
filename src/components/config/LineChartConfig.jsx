/**
 * LineChartConfig — Configuration form for line chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";

export default function LineChartConfig({ widget }) {
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
          <button
            key={t}
            className={`px-3 py-1.5 text-xs font-medium capitalize ${
              tab === t ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400"
              value={config.dataSource || ""}
              onChange={(e) => update("dataSource", e.target.value)}
            >
              <option value="">Select...</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis (Metric)</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.yAxis || ""} onChange={(e) => update("yAxis", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.aggregation || "sum"} onChange={(e) => update("aggregation", e.target.value)}>
                  {["sum", "average", "count", "min", "max"].map((a) => (
                    <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Additional Lines</label>
                {(config.additionalLines || []).map((line, idx) => (
                  <div key={idx} className="flex gap-1 mb-1">
                    <select className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={line} onChange={(e) => {
                      const lines = [...(config.additionalLines || [])];
                      lines[idx] = e.target.value;
                      update("additionalLines", lines);
                    }}>
                      {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <button className="text-red-400 hover:text-red-600 text-xs px-1" onClick={() => {
                      const lines = (config.additionalLines || []).filter((_, i) => i !== idx);
                      update("additionalLines", lines);
                    }}>×</button>
                  </div>
                ))}
                <button className="text-xs text-indigo-600 hover:text-indigo-800" onClick={() => {
                  update("additionalLines", [...(config.additionalLines || []), numericFields[0] || ""]);
                }}>+ Add Line</button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Group By (Optional)</label>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Line Style</label>
            <div className="flex gap-2">
              {["smooth", "straight", "step"].map((s) => (
                <label key={s} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="lineStyle" checked={style.lineStyle === s} onChange={() => updateStyle("lineStyle", s)} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Line Width: {style.lineWidth || 2}</label>
            <input type="range" min={1} max={5} value={style.lineWidth || 2} onChange={(e) => updateStyle("lineWidth", Number(e.target.value))} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Show</label>
            {[["showDataPoints", "Data Points"], ["showGridLines", "Grid Lines"], ["showLegend", "Legend"], ["showAreaFill", "Area Fill"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={style[key] !== false} onChange={(e) => updateStyle(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          {style.showAreaFill && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Area Opacity: {style.areaFillOpacity ?? 0.3}</label>
              <input type="range" min={0} max={100} value={(style.areaFillOpacity ?? 0.3) * 100} onChange={(e) => updateStyle("areaFillOpacity", Number(e.target.value) / 100)} className="w-full" />
            </div>
          )}
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
