/**
 * ComboConfig — Config form for combo (bar+line) chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";

export default function ComboConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes);
  const numericFields = allFields.filter((f) => colTypes[f] === "number");

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) => updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });
  const updateStyleBatch = (updates) => updateWidgetConfig(widget.i, { style: { ...style, ...updates } });

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "style"].map((t) => (
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
            <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.dataSource || ""} onChange={(e) => update("dataSource", e.target.value)}>
              <option value="">Select...</option>
              {dataSources.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {ds && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis (Dimension)</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.xAxis || ""} onChange={(e) => update("xAxis", e.target.value)}>
                  <option value="">Select...</option>
                  {allFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bar Measure</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.barMeasure || ""} onChange={(e) => update("barMeasure", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Line Measure</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.lineMeasure || ""} onChange={(e) => update("lineMeasure", e.target.value)}>
                  <option value="">None</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bar Aggregation</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.aggregation || "sum"} onChange={(e) => update("aggregation", e.target.value)}>
                  {["sum", "average", "count", "min", "max"].map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              {config.lineMeasure && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Line Aggregation</label>
                  <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.lineAggregation || "average"} onChange={(e) => update("lineAggregation", e.target.value)}>
                    {["sum", "average", "count", "min", "max"].map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} />}

      {tab === "style" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bar Color</label>
            <input type="color" value={style.barColor || "#4F46E5"} onChange={(e) => updateStyle("barColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Line Color</label>
            <input type="color" value={style.lineColor || "#EF4444"} onChange={(e) => updateStyle("lineColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.showGridLines !== false} onChange={(e) => updateStyle("showGridLines", e.target.checked)} /> Show Grid Lines
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.showLegend !== false} onChange={(e) => updateStyle("showLegend", e.target.checked)} /> Show Legend
          </label>
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}
    </div>
  );
}
