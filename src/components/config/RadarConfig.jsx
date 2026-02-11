/**
 * RadarConfig — Config form for radar chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";

export default function RadarConfig({ widget }) {
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

  const toggleMeasure = (field) => {
    const measures = config.measures || [];
    if (measures.includes(field)) {
      update("measures", measures.filter((m) => m !== field));
    } else {
      update("measures", [...measures, field]);
    }
  };

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
            <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.dataSource || ""} onChange={(e) => update("dataSource", e.target.value)}>
              <option value="">Select...</option>
              {dataSources.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {ds && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dimension (Axis Labels)</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.dimension || ""} onChange={(e) => update("dimension", e.target.value)}>
                  <option value="">Select...</option>
                  {allFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Measures (select multiple)</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {numericFields.map((f) => (
                    <label key={f} className={`flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer ${(config.measures || []).includes(f) ? "bg-indigo-100 text-indigo-700" : "bg-gray-100"}`}>
                      <input type="checkbox" checked={(config.measures || []).includes(f)} onChange={() => toggleMeasure(f)} className="sr-only" />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.aggregation || "sum"} onChange={(e) => update("aggregation", e.target.value)}>
                  {["sum", "average"].map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} />}

      {tab === "style" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fill Opacity</label>
            <input type="range" min="0" max="1" step="0.1" value={style.fillOpacity ?? 0.3} onChange={(e) => updateStyle("fillOpacity", parseFloat(e.target.value))} className="w-full" />
            <span className="text-xs text-gray-400">{style.fillOpacity ?? 0.3}</span>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.showLegend !== false} onChange={(e) => updateStyle("showLegend", e.target.checked)} /> Show Legend
          </label>
        </div>
      )}
    </div>
  );
}
