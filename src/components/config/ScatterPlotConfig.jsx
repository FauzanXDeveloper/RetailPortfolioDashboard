/**
 * ScatterPlotConfig — Config form for scatter plot widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";

export default function ScatterPlotConfig({ widget }) {
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
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis (Numeric)</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.xAxis || ""} onChange={(e) => update("xAxis", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis (Numeric)</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.yAxis || ""} onChange={(e) => update("yAxis", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Size Field (Optional)</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.sizeField || ""} onChange={(e) => update("sizeField", e.target.value)}>
                  <option value="">None</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Color By (Group)</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.colorBy || ""} onChange={(e) => update("colorBy", e.target.value)}>
                  <option value="">None</option>
                  {allFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} />}

      {tab === "style" && (
        <div className="space-y-3">
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
