/**
 * GaugeConfig — Config form for gauge widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, AggregationPills, ConfigNumber } from "./ConfigFieldComponents";

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
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setTab(t)}>
            {t === "data" ? "📊 Data" : t === "filters" ? "🔍 Filters" : "🎨 Style"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ConfigSection label="Data Source" icon="📊">
            <ConfigSelect label="Source" value={config.dataSource} onChange={(v) => update("dataSource", v)} options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))} placeholder="Select data source..." />
          </ConfigSection>
          {ds && (
            <ConfigSection label="Metric" icon="🎯">
              <ConfigSelect label="Metric" badge="measure" value={config.metric} onChange={(v) => update("metric", v)} options={numericFields.map((f) => ({ value: f, label: f }))} placeholder="Select field..." />
              <AggregationPills value={config.aggregation} onChange={(v) => update("aggregation", v)} />
              <ConfigNumber label="Max Value" value={config.maxValue || 100} onChange={(v) => update("maxValue", v)} min={1} />
            </ConfigSection>
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
