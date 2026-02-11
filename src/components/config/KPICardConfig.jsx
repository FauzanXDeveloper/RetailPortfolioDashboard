/**
 * KPICardConfig — Configuration form for KPI card widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import { ColorPicker } from "../common/CommonComponents";
import FilterConfig from "./FilterConfig";

const EMOJI_OPTIONS = ["📊", "💰", "📈", "📉", "👥", "💵", "🛒", "📦", "🎯", "⚡", "🔥", "❤️", "⭐", "🏆", "📱"];

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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
            <div className="flex flex-wrap gap-1">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} className={`text-lg p-1 rounded ${style.icon === e ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-gray-100"}`} onClick={() => updateStyle("icon", e)}>{e}</button>
              ))}
            </div>
          </div>
          <ColorPicker label="Background Color" value={style.backgroundColor || "#ffffff"} onChange={(c) => updateStyle("backgroundColor", c)} />
          <ColorPicker label="Text Color" value={style.textColor || "#111827"} onChange={(c) => updateStyle("textColor", c)} />
          <div className="space-y-2">
            {[["showTrendIndicator", "Trend Indicator (↑/↓)"], ["showPercentageChange", "Percentage Change"], ["showComparisonLabel", "Comparison Label"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={style[key] !== false} onChange={(e) => updateStyle(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
            <div className="flex gap-2">
              {["compact", "normal", "large"].map((s) => (
                <label key={s} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="size" checked={(style.size || "normal") === s} onChange={() => updateStyle("size", s)} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
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
