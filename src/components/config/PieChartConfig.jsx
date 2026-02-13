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
  const allFields = Object.keys(colTypes);
  const numericFields = allFields.filter((f) => colTypes[f] === "number");

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
                <ConfigSelect label="Measure (Size)" badge="measure" value={config.measure} onChange={(v) => update("measure", v)} options={numericFields.map((f) => ({ value: f, label: f }))} placeholder="Select field..." />
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Label Font Size</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={style.labelFontSize || "medium"} onChange={(e) => updateStyle("labelFontSize", e.target.value)}>
              <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="xlarge">X-Large</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Display</label>
            {[["showLabels", "Labels"], ["showPercentages", "Percentages"], ["showValues", "Values (amounts)"], ["showLegend", "Legend"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={style[key] !== false} onChange={(e) => updateStyle(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label Position</label>
            <div className="flex gap-3">
              {["outside", "inside"].map((p) => (
                <label key={p} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="labelPos" checked={(style.labelPosition || "outside") === p} onChange={() => updateStyle("labelPosition", p)} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Legend Position</label>
            <div className="flex gap-2">
              {["bottom", "top"].map((p) => (
                <label key={p} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="legendPos" checked={(style.legendPosition || "bottom") === p} onChange={() => updateStyle("legendPosition", p)} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Legend Layout</label>
            <div className="flex gap-2">
              {["horizontal", "vertical"].map((l) => (
                <label key={l} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="legendLayout" checked={(style.legendLayout || "horizontal") === l} onChange={() => updateStyle("legendLayout", l)} />
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </label>
              ))}
            </div>
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
