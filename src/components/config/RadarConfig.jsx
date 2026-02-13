/**
 * RadarConfig — Config form for radar chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, AggregationPills, DataSourceInfo } from "./ConfigFieldComponents";

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
  const updateStyleBatch = (updates) => updateWidgetConfig(widget.i, { style: { ...style, ...updates } });

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
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setTab(t)}>
            {t === "data" ? "📊 Data" : t === "filters" ? "🔍 Filters" : "🎨 Style"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ConfigSection label="Data Source" icon="📊">
            <ConfigSelect label="Source" value={config.dataSource} onChange={(v) => update("dataSource", v)} options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))} placeholder="Select data source..." />
            {ds && <DataSourceInfo ds={ds} />}
          </ConfigSection>
          {ds && (
            <>
              <ConfigSection label="Fields" icon="📐">
                <ConfigSelect label="Dimension (Axis Labels)" badge="dimension" value={config.dimension} onChange={(v) => update("dimension", v)} options={allFields.map((f) => ({ value: f, label: f }))} placeholder="Select field..." />
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Measures <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-100 text-emerald-700">multi-select</span></label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {numericFields.map((f) => (
                      <label key={f} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg cursor-pointer transition-all ${(config.measures || []).includes(f) ? "bg-brand-100 text-brand-700 border border-brand-300" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}>
                        <input type="checkbox" checked={(config.measures || []).includes(f)} onChange={() => toggleMeasure(f)} className="sr-only" />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
              </ConfigSection>
              <ConfigSection label="Aggregation" icon="⚡" collapsible defaultOpen={false}>
                <AggregationPills value={config.aggregation} onChange={(v) => update("aggregation", v)} />
              </ConfigSection>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} />}

      {tab === "style" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fill Opacity: {style.fillOpacity ?? 0.3}</label>
            <input type="range" min="0" max="1" step="0.1" value={style.fillOpacity ?? 0.3} onChange={(e) => updateStyle("fillOpacity", parseFloat(e.target.value))} className="w-full" />
          </div>
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}
    </div>
  );
}
