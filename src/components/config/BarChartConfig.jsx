/**
 * BarChartConfig — Configuration form for bar chart widgets.
 * Tabs: Data, Filters, Style
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import { ColorPicker } from "../common/CommonComponents";
import { getColor } from "../../utils/chartHelpers";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, AggregationPills, DataSourceInfo } from "./ConfigFieldComponents";

export default function BarChartConfig({ widget }) {
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
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "style"].map((t) => (
          <button
            key={t}
            className={`px-3 py-1.5 text-xs font-medium capitalize ${
              tab === t
                ? "border-b-2 border-brand-500 text-brand-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "data" ? "📊 Data" : t === "filters" ? "🔍 Filters" : "🎨 Style"}
          </button>
        ))}
      </div>

      {/* Data Tab */}
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
                {/* Additional Measures */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Additional Measures
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-gray-100 text-gray-500">optional</span>
                  </label>
                  {(config.additionalMeasures || []).map((measure, idx) => (
                    <div key={idx} className="flex gap-1 mb-1">
                      <select className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-brand-400" value={measure}
                        onChange={(e) => {
                          const measures = [...(config.additionalMeasures || [])];
                          measures[idx] = e.target.value;
                          update("additionalMeasures", measures);
                        }}>
                        {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <button className="text-red-400 hover:text-red-600 text-xs px-1 rounded hover:bg-red-50" onClick={() => {
                        update("additionalMeasures", (config.additionalMeasures || []).filter((_, i) => i !== idx));
                      }}>×</button>
                    </div>
                  ))}
                  <button className="text-[10px] text-brand-600 hover:text-brand-800 font-medium" onClick={() => {
                    update("additionalMeasures", [...(config.additionalMeasures || []), numericFields[0] || ""]);
                  }}>+ Add Measure</button>
                </div>
                <ConfigSelect
                  label="Color By"
                  badge="optional"
                  value={config.colorBy}
                  onChange={(v) => update("colorBy", v)}
                  options={textFields.map((f) => ({ value: f, label: f }))}
                  placeholder="None"
                />
              </ConfigSection>

              <ConfigSection label="Aggregation & Sort" icon="⚡" collapsible defaultOpen={false}>
                <AggregationPills value={config.aggregation} onChange={(v) => update("aggregation", v)} />
                <div className="flex gap-2">
                  <ConfigSelect
                    label="Sort By"
                    value={config.sortBy || "value"}
                    onChange={(v) => update("sortBy", v)}
                    options={[{ value: "value", label: "Value" }, { value: "label", label: "Label" }]}
                    className="flex-1"
                  />
                  <ConfigSelect
                    label="Order"
                    value={config.sortOrder || "desc"}
                    onChange={(v) => update("sortOrder", v)}
                    options={[{ value: "desc", label: "Descending" }, { value: "asc", label: "Ascending" }]}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <ConfigSelect
                    label="Limit"
                    value={config.limitDirection || "top"}
                    onChange={(v) => update("limitDirection", v)}
                    options={[{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }]}
                    className="flex-1"
                  />
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Items</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                      value={config.limit || 0}
                      onChange={(e) => update("limit", Number(e.target.value))}
                      placeholder="0 = all"
                    />
                  </div>
                </div>
              </ConfigSection>
            </>
          )}
        </div>
      )}

      {/* Filters Tab */}
      {tab === "filters" && (
        <FilterConfig
          widget={widget}
          fields={allFields}
          colTypes={colTypes}
          dataSource={ds}
        />
      )}

      {/* Style Tab */}
      {tab === "style" && (
        <div className="space-y-3">
          {/* Chart Subtype */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chart Subtype</label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-400"
              value={style.subtype || "vertical"}
              onChange={(e) => {
                const v = e.target.value;
                const updates = { subtype: v };
                updates.orientation = (v === "horizontal") ? "horizontal" : "vertical";
                updates.stacking = (v === "stacked" || v === "100-stacked");
                updates.stackPercent = (v === "100-stacked");
                updateStyleBatch(updates);
              }}
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="grouped">Grouped</option>
              <option value="stacked">Stacked</option>
              <option value="100-stacked">100% Stacked</option>
            </select>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Orientation</label>
            <div className="flex gap-2">
              {["vertical", "horizontal"].map((o) => (
                <label key={o} className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="orientation"
                    checked={style.orientation === o}
                    onChange={() => updateStyle("orientation", o)}
                  />
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Series Colors */}
          {(() => {
            const allSeries = [config.yAxis, ...(config.additionalMeasures || [])].filter(Boolean);
            const seriesColors = style.seriesColors || {};
            if (allSeries.length <= 1 && !config.colorBy) {
              return (
                <ColorPicker
                  label="Bar Color"
                  value={style.barColor || "#4F46E5"}
                  onChange={(c) => updateStyle("barColor", c)}
                />
              );
            }
            return (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-600">Series Colors</label>
                <p className="text-[10px] text-gray-400">Each measure/group gets its own color. Click to customize.</p>
                {allSeries.map((key, idx) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={seriesColors[key] || getColor(idx)}
                      onChange={(e) => {
                        const next = { ...seriesColors, [key]: e.target.value };
                        updateStyle("seriesColors", next);
                      }}
                      className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
                    />
                    <span className="text-xs text-gray-600 truncate flex-1">{key}</span>
                    {seriesColors[key] && (
                      <button
                        className="text-[10px] text-gray-400 hover:text-red-500"
                        onClick={() => {
                          const next = { ...seriesColors };
                          delete next[key];
                          updateStyle("seriesColors", next);
                        }}
                      >reset</button>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.fontSize || "medium"}
              onChange={(e) => updateStyle("fontSize", e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">X-Large</option>
            </select>
          </div>

          {/* X-Axis Label Angle */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis Label Angle: {style.xAxisLabelAngle || 0}°</label>
            <input type="range" min={-90} max={90} step={15} value={style.xAxisLabelAngle || 0}
              onChange={(e) => updateStyle("xAxisLabelAngle", Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>-90° (vertical)</span><span>0°</span><span>90°</span>
            </div>
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

          {/* Bar Width */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bar Width: {style.barWidth || "Auto"}</label>
            <input type="range" min={0} max={60} value={style.barWidth || 0}
              onChange={(e) => updateStyle("barWidth", Number(e.target.value) || undefined)} className="w-full" />
          </div>

          {/* Bar Corner Radius */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Corner Radius: {style.barRadius ?? 4}</label>
            <input type="range" min={0} max={20} value={style.barRadius ?? 4}
              onChange={(e) => updateStyle("barRadius", Number(e.target.value))} className="w-full" />
          </div>

          {/* Y-Axis Width */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis Width: {style.yAxisWidth || 60}</label>
            <input type="range" min={30} max={150} value={style.yAxisWidth || 60}
              onChange={(e) => updateStyle("yAxisWidth", Number(e.target.value))} className="w-full" />
          </div>

          <ColorPicker label="Axis Text Color" value={style.axisColor || "#6b7280"} onChange={(c) => updateStyle("axisColor", c)} />
          <ColorPicker label="Grid Color" value={style.gridColor || "#e5e7eb"} onChange={(c) => updateStyle("gridColor", c)} />

          {/* Widget Appearance */}
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}

      {/* Apply Global Filters toggle */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.applyGlobalFilters !== false}
            onChange={(e) => update("applyGlobalFilters", e.target.checked)}
          />
          <span className="font-medium">Apply global filters to this widget</span>
        </label>
      </div>
    </div>
  );
}
