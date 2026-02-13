/**
 * LineChartConfig — Configuration form for line chart widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import { ColorPicker } from "../common/CommonComponents";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";

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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Label Position</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.dataLabelPosition || "top"} onChange={(e) => updateStyle("dataLabelPosition", e.target.value)}>
              <option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option><option value="center">Center</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Label Size: {style.dataLabelSize || 10}</label>
            <input type="range" min={8} max={18} value={style.dataLabelSize || 10} onChange={(e) => updateStyle("dataLabelSize", Number(e.target.value))} className="w-full" />
          </div>
          <ColorPicker label="Axis Color" value={style.axisColor || "#6b7280"} onChange={(c) => updateStyle("axisColor", c)} />
          <ColorPicker label="Grid Color" value={style.gridColor || "#e5e7eb"} onChange={(c) => updateStyle("gridColor", c)} />
          <ColorPicker label="Data Label Color" value={style.dataLabelColor || "#374151"} onChange={(c) => updateStyle("dataLabelColor", c)} />
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
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Display Options</label>
            {[["showDataPoints", "Data Points"], ["showGridLines", "Grid Lines"], ["showLegend", "Legend"], ["showAreaFill", "Area Fill"], ["showDataLabels", "Data Labels"], ["showValueFormatted", "Format Values (commas)"], ["showAxisTitles", "Axis Titles"]].map(([key, label]) => (
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
          {style.showAxisTitles && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis Title</label>
                <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={style.xAxisTitle || ""} onChange={(e) => updateStyle("xAxisTitle", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis Title</label>
                <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={style.yAxisTitle || ""} onChange={(e) => updateStyle("yAxisTitle", e.target.value)} />
              </div>
            </>
          )}
          <div className="p-2 bg-gray-50 rounded-lg space-y-2">
            <label className="block text-xs font-medium text-gray-600">Accent Border</label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={style.accentBorder || false} onChange={(e) => updateStyle("accentBorder", e.target.checked)} />
              Show Left Border
            </label>
            {style.accentBorder && (
              <ColorPicker label="Border Color" value={style.accentColor || "#4F46E5"} onChange={(c) => updateStyle("accentColor", c)} />
            )}
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
