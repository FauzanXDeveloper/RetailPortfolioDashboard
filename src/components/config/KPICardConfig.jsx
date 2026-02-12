/**
 * KPICardConfig — Configuration form for KPI card widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import { ColorPicker } from "../common/CommonComponents";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";

const EMOJI_OPTIONS = ["📊", "💰", "📈", "📉", "👥", "💵", "🛒", "📦", "🎯", "⚡", "🔥", "❤️", "⭐", "🏆", "📱", "💎", "🏠", "🚀", "📋", "🔔", "✅", "❌", "🔑", "💼", "🌍", "🔄", "📌", "🏷️", "💡", "🎉"];

export default function KPICardConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const format = config.format || {};
  const comparison = config.comparison || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes);
  const numericFields = allFields.filter((f) => colTypes[f] === "number");

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) => updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });
  const updateFormat = (key, value) => updateWidgetConfig(widget.i, { format: { ...format, [key]: value } });
  const updateComparison = (key, value) => updateWidgetConfig(widget.i, { comparison: { ...comparison, [key]: value } });

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
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.dataSource || ""} onChange={(e) => update("dataSource", e.target.value)}>
              <option value="">Select...</option>
              {dataSources.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {ds && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Metric Field</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.metric || ""} onChange={(e) => update("metric", e.target.value)}>
                  <option value="">Select...</option>
                  {numericFields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={config.aggregation || "sum"} onChange={(e) => update("aggregation", e.target.value)}>
                  {["sum", "average", "count", "min", "max"].map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>

              {/* Comparison */}
              <div className="p-2 bg-gray-50 rounded-lg space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input type="checkbox" checked={comparison.enabled || false} onChange={(e) => updateComparison("enabled", e.target.checked)} />
                  Enable Comparison
                </label>
                {comparison.enabled && (
                  <>
                    <div className="flex gap-2">
                      {["target"].map((t) => (
                        <label key={t} className="flex items-center gap-1 text-xs">
                          <input type="radio" name="compType" checked={(comparison.type || "target") === t} onChange={() => updateComparison("type", t)} />
                          Target Value
                        </label>
                      ))}
                    </div>
                    <input type="number" className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={comparison.targetValue || 0} onChange={(e) => updateComparison("targetValue", Number(e.target.value))} placeholder="Target value" />
                  </>
                )}
              </div>

              {/* Format */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Format</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={format.type || "number"} onChange={(e) => updateFormat("type", e.target.value)}>
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="percentage">Percentage</option>
                </select>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">Decimals</label>
                    <input type="number" min={0} max={4} className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={format.decimals || 0} onChange={(e) => updateFormat("decimals", Number(e.target.value))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">Prefix</label>
                    <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={format.prefix || ""} onChange={(e) => updateFormat("prefix", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-0.5">Suffix</label>
                    <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={format.suffix || ""} onChange={(e) => updateFormat("suffix", e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} fields={allFields} colTypes={colTypes} dataSource={ds} />}

      {tab === "style" && (
        <div className="space-y-3">
          {/* Icon Section */}
          <div className="p-2 bg-gray-50 rounded-lg space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" checked={style.showIcon !== false} onChange={(e) => updateStyle("showIcon", e.target.checked)} />
              Show Icon
            </label>
            {style.showIcon !== false && (
              <>
                <div className="flex flex-wrap gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} className={`text-lg p-1 rounded ${style.icon === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-gray-100"}`} onClick={() => updateStyle("icon", e)}>{e}</button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Icon Size</label>
                  <div className="flex gap-2">
                    {["small", "medium", "large"].map((s) => (
                      <label key={s} className="flex items-center gap-1 text-xs">
                        <input type="radio" name="iconSize" checked={(style.iconSize || "medium") === s} onChange={() => updateStyle("iconSize", s)} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Or type custom icon/text</label>
                  <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={style.icon || ""} onChange={(e) => updateStyle("icon", e.target.value)} placeholder="Emoji or text..." />
                </div>
              </>
            )}
          </div>

          {/* Label Section */}
          <div className="p-2 bg-gray-50 rounded-lg space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" checked={style.showLabel !== false} onChange={(e) => updateStyle("showLabel", e.target.checked)} />
              Show Label
            </label>
            {style.showLabel !== false && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Custom Label</label>
                  <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none" value={style.customLabel || ""} onChange={(e) => updateStyle("customLabel", e.target.value)} placeholder="Default: field name" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Label Size</label>
                  <div className="flex gap-2">
                    {["small", "medium", "large"].map((s) => (
                      <label key={s} className="flex items-center gap-1 text-xs">
                        <input type="radio" name="labelSize" checked={(style.labelSize || "small") === s} onChange={() => updateStyle("labelSize", s)} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <ColorPicker label="Label Color" value={style.labelColor || "#6b7280"} onChange={(c) => updateStyle("labelColor", c)} />
              </>
            )}
          </div>

          {/* Colors */}
          <ColorPicker label="Background Color" value={style.backgroundColor || "#ffffff"} onChange={(c) => updateStyle("backgroundColor", c)} />
          <ColorPicker label="Value Color" value={style.valueColor || "#111827"} onChange={(c) => updateStyle("valueColor", c)} />
          <ColorPicker label="Text Color" value={style.textColor || "#111827"} onChange={(c) => updateStyle("textColor", c)} />
          <ColorPicker label="Positive Color" value={style.positiveColor || "#16a34a"} onChange={(c) => updateStyle("positiveColor", c)} />
          <ColorPicker label="Negative Color" value={style.negativeColor || "#dc2626"} onChange={(c) => updateStyle("negativeColor", c)} />

          {/* Accent Border */}
          <div className="p-2 bg-gray-50 rounded-lg space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium">
              <input type="checkbox" checked={!!style.accentBorder} onChange={(e) => updateStyle("accentBorder", e.target.checked)} />
              Accent Border (left)
            </label>
            {style.accentBorder && (
              <ColorPicker label="Accent Color" value={style.accentColor || "#4F46E5"} onChange={(c) => updateStyle("accentColor", c)} />
            )}
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
            <div className="flex gap-2">
              {["left", "center", "right"].map((a) => (
                <label key={a} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="alignment" checked={(style.alignment || "center") === a} onChange={() => updateStyle("alignment", a)} />
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Display</label>
            {[["showTrendIndicator", "Trend Indicator (↑/↓)"], ["showPercentageChange", "Percentage Change"], ["showComparisonLabel", "Comparison Label"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={style[key] !== false} onChange={(e) => updateStyle(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          {/* Value Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Value Size</label>
            <div className="flex gap-2">
              {["compact", "normal", "large", "xlarge"].map((s) => (
                <label key={s} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="size" checked={(style.size || "normal") === s} onChange={() => updateStyle("size", s)} />
                  {s === "xlarge" ? "XL" : s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Widget Appearance */}
          <WidgetStyleConfig style={style} updateStyle={updateStyle} />
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
