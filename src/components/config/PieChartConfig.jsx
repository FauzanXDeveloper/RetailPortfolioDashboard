/**
 * PieChartConfig — Configuration form for pie/donut chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, AggregationPills, DataSourceInfo, ConfigNumber } from "./ConfigFieldComponents";

export default function PieChartConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes).sort((a, b) => a.localeCompare(b));

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
            {ds && <DataSourceInfo ds={ds} />}
          </ConfigSection>
          {ds && (
            <>
              <ConfigSection label="Fields" icon="📐">
                <ConfigSelect label="Dimension (Slices)" badge="dimension" value={config.dimension} onChange={(v) => update("dimension", v)} options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))} placeholder="Select field..." />
                <ConfigSelect label="Measure (Size)" badge="measure" value={config.measure} onChange={(v) => update("measure", v)} options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))} placeholder="Select field..." />
                {/* Additional Measures — show in tooltip alongside main measure */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Additional Measures
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-gray-100 text-gray-500">tooltip</span>
                  </label>
                  <p className="text-[10px] text-gray-400 mb-1">Extra measures shown in tooltip for each slice.</p>
                  {(config.additionalMeasures || []).map((measure, idx) => (
                    <div key={idx} className="flex gap-1 mb-1">
                      <select className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-400" value={measure}
                        onChange={(e) => {
                          const measures = [...(config.additionalMeasures || [])];
                          measures[idx] = e.target.value;
                          update("additionalMeasures", measures);
                        }}>
                        {allFields.map((f) => <option key={f} value={f}>{f} ({colTypes[f]})</option>)}
                      </select>
                      <button className="text-red-400 hover:text-red-600 text-xs px-1 rounded hover:bg-red-50" onClick={() => {
                        update("additionalMeasures", (config.additionalMeasures || []).filter((_, i) => i !== idx));
                      }}>×</button>
                    </div>
                  ))}
                  <button className="text-[10px] text-brand-600 hover:text-brand-800 font-medium" onClick={() => {
                    update("additionalMeasures", [...(config.additionalMeasures || []), allFields[0] || ""]);
                  }}>+ Add Measure</button>
                </div>
              </ConfigSection>
              <ConfigSection label="Aggregation & Limits" icon="⚡" collapsible defaultOpen={false}>
                <AggregationPills value={config.aggregation} onChange={(v) => update("aggregation", v)} />
                <ConfigNumber label="Limit Slices" value={config.limitSlices || 10} onChange={(v) => update("limitSlices", v)} min={1} max={50} />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={config.combineOthers !== false} onChange={(e) => update("combineOthers", e.target.checked)} />
                  Combine remaining into "Others"
                </label>
              </ConfigSection>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} fields={allFields} colTypes={colTypes} dataSource={ds} />}

      {tab === "style" && (
        <div className="space-y-3">
          {/* Chart Subtype */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chart Subtype</label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-400"
              value={style.subtype || "pie"}
              onChange={(e) => {
                const v = e.target.value;
                const updates = { subtype: v };
                if (v === "donut") { updates.chartType = "donut"; updates.roseMode = false; }
                else if (v === "rose") { updates.chartType = "pie"; updates.roseMode = true; }
                else { updates.chartType = "pie"; updates.roseMode = false; }
                updateStyleBatch(updates);
              }}
            >
              <option value="pie">Pie</option>
              <option value="donut">Donut</option>
              <option value="rose">Rose / Nightingale</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chart Type</label>
            <div className="flex gap-3">
              {["pie", "donut"].map((t) => (
                <label key={t} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="chartType" checked={(style.chartType || "pie") === t} onChange={() => updateStyle("chartType", t)} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>
          {style.chartType === "donut" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Donut Thickness: {style.donutThickness || 60}%</label>
              <input type="range" min={20} max={80} value={style.donutThickness || 60} onChange={(e) => updateStyle("donutThickness", Number(e.target.value))} className="w-full" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Padding Angle: {style.paddingAngle ?? 2}°</label>
            <input type="range" min={0} max={10} value={style.paddingAngle ?? 2} onChange={(e) => updateStyle("paddingAngle", Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Color Scheme</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={style.colorScheme || "Default"} onChange={(e) => updateStyle("colorScheme", e.target.value)}>
              {["Default", "Blues", "Greens", "Warm"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Widget Appearance */}
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
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
