/**
 * LineChartConfig — Configuration form for line chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import { ColorPicker } from "../common/CommonComponents";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, AggregationPills, DataSourceInfo } from "./ConfigFieldComponents";

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
  const updateStyleBatch = (updates) =>
    updateWidgetConfig(widget.i, { style: { ...style, ...updates } });

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "style"].map((t) => (
          <button
            key={t}
            className={`px-3 py-1.5 text-xs font-medium capitalize ${
              tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "data" ? "📊 Data" : t === "filters" ? "🔍 Filters" : "🎨 Style"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ConfigSection label="Data Source" icon="📊">
            <ConfigSelect
              label="Source"
              value={config.dataSource}
              onChange={(v) => update("dataSource", v)}
              options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))}
              placeholder="Select data source..."
            />
            {ds && <DataSourceInfo ds={ds} />}
          </ConfigSection>

          {ds && (
            <>
              <ConfigSection label="Fields" icon="📐">
                <ConfigSelect
                  label="X-Axis"
                  badge="dimension"
                  value={config.xAxis}
                  onChange={(v) => update("xAxis", v)}
                  options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))}
                  placeholder="Select field..."
                />
                <ConfigSelect
                  label="Y-Axis"
                  badge="measure"
                  value={config.yAxis}
                  onChange={(v) => update("yAxis", v)}
                  options={numericFields.map((f) => ({ value: f, label: f }))}
                  placeholder="Select field..."
                />
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Additional Lines
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-gray-100 text-gray-500">optional</span>
                  </label>
                  {(config.additionalLines || []).map((line, idx) => (
                    <div key={idx} className="flex gap-1 mb-1">
                      <select className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-400" value={line} onChange={(e) => {
                        const lines = [...(config.additionalLines || [])];
                        lines[idx] = e.target.value;
                        update("additionalLines", lines);
                      }}>
                        {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <button className="text-red-400 hover:text-red-600 text-xs px-1 rounded hover:bg-red-50" onClick={() => {
                        const lines = (config.additionalLines || []).filter((_, i) => i !== idx);
                        update("additionalLines", lines);
                      }}>×</button>
                    </div>
                  ))}
                  <button className="text-[10px] text-brand-600 hover:text-brand-800 font-medium" onClick={() => {
                    update("additionalLines", [...(config.additionalLines || []), numericFields[0] || ""]);
                  }}>+ Add Line</button>
                </div>
                <ConfigSelect
                  label="Group By"
                  badge="optional"
                  value={config.groupBy}
                  onChange={(v) => update("groupBy", v)}
                  options={textFields.map((f) => ({ value: f, label: f }))}
                  placeholder="None"
                />
              </ConfigSection>

              <ConfigSection label="Aggregation" icon="⚡" collapsible defaultOpen={false}>
                <AggregationPills value={config.aggregation} onChange={(v) => update("aggregation", v)} />
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
              value={style.subtype || "smooth"}
              onChange={(e) => {
                const v = e.target.value;
                const updates = { subtype: v, lineStyle: v === "sparkline" ? "smooth" : v };
                if (v === "sparkline") {
                  updates.showDataPoints = false;
                  updates.showGridLines = false;
                  updates.showLegend = false;
                  updates.showAxisTitles = false;
                  updates.sparkline = true;
                } else {
                  updates.sparkline = false;
                }
                updateStyleBatch(updates);
              }}
            >
              <option value="smooth">Smooth</option>
              <option value="straight">Straight</option>
              <option value="step">Stepped</option>
              <option value="sparkline">Sparkline (minimal)</option>
            </select>
          </div>

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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dot Size: {style.dotSize || 3}</label>
            <input type="range" min={1} max={8} value={style.dotSize || 3} onChange={(e) => updateStyle("dotSize", Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={style.fontSize || "medium"} onChange={(e) => updateStyle("fontSize", e.target.value)}>
              <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="xlarge">X-Large</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis Label Angle: {style.xAxisLabelAngle || 0}°</label>
            <input type="range" min={-90} max={90} step={15} value={style.xAxisLabelAngle || 0}
              onChange={(e) => updateStyle("xAxisLabelAngle", Number(e.target.value))} className="w-full" />
          </div>
          {/* Axis Font */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Axis Font Family</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.axisFontFamily || "default"} onChange={(e) => updateStyle("axisFontFamily", e.target.value)}>
              <option value="default">Default (System)</option>
              <option value="serif">Serif (Georgia)</option>
              <option value="mono">Monospace</option>
              <option value="condensed">Condensed</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.axisBold || false} onChange={(e) => updateStyle("axisBold", e.target.checked)} />
            Bold Axis Labels
          </label>
          <ColorPicker label="Axis Color" value={style.axisColor || "#6b7280"} onChange={(c) => updateStyle("axisColor", c)} />
          <ColorPicker label="Grid Color" value={style.gridColor || "#e5e7eb"} onChange={(c) => updateStyle("gridColor", c)} />
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
