/**
 * GaugeConfig — Config form for gauge widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";

export default function GaugeConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const numericFields = Object.keys(colTypes).filter((f) => colTypes[f] === "number");

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
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.metric || ""} onChange={(e) => update("metric", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
                <select className="w-full text-xs border rounded-md px-2 py-1.5" value={config.aggregation || "sum"} onChange={(e) => update("aggregation", e.target.value)}>
                  {["sum", "average", "count", "min", "max"].map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Value</label>
                <input type="number" className="w-full text-xs border rounded-md px-2 py-1.5" value={config.maxValue || 100} onChange={(e) => update("maxValue", Number(e.target.value))} />
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} />}

      {tab === "style" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">High Color (≥75%)</label>
            <input type="color" value={style.highColor || "#10B981"} onChange={(e) => updateStyle("highColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mid Color (≥50%)</label>
            <input type="color" value={style.midColor || "#F59E0B"} onChange={(e) => updateStyle("midColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Low Color (&lt;50%)</label>
            <input type="color" value={style.lowColor || "#EF4444"} onChange={(e) => updateStyle("lowColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}
    </div>
  );
}
