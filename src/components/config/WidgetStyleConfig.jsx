/**
 * WidgetStyleConfig — Advanced shared widget-level style options.
 * Background, border, custom shadows, padding, title, tooltip, number format, margins.
 * Reused across all chart/widget config panels.
 */
import React, { useState, useCallback } from "react";
import { ColorPicker } from "../common/CommonComponents";

const PRESETS = [
  {
    label: "Clean",
    preview: { bg: "#ffffff", shadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" },
    values: { widgetBgColor: "#ffffff", widgetBgOpacity: 1, widgetBorderRadius: 12, widgetShadow: "sm", widgetPadding: 12, widgetBorderWidth: 1, widgetBorderColor: "#e5e7eb", widgetBorderStyle: "solid", shadowCustom: false, backdropBlur: 0, titleColor: "#4b5563" },
  },
  {
    label: "Elevated",
    preview: { bg: "#ffffff", shadow: "0 10px 15px rgba(0,0,0,0.1)", border: "none" },
    values: { widgetBgColor: "#ffffff", widgetBgOpacity: 1, widgetBorderRadius: 16, widgetShadow: "lg", widgetPadding: 16, widgetBorderWidth: 0, shadowCustom: false, backdropBlur: 0, titleColor: "#4b5563" },
  },
  {
    label: "Flat",
    preview: { bg: "#f9fafb", shadow: "none", border: "2px solid #e5e7eb" },
    values: { widgetBgColor: "#f9fafb", widgetBgOpacity: 1, widgetBorderRadius: 8, widgetShadow: "none", widgetPadding: 10, widgetBorderWidth: 2, widgetBorderColor: "#e5e7eb", widgetBorderStyle: "solid", shadowCustom: false, backdropBlur: 0, titleColor: "#4b5563" },
  },
  {
    label: "Dark",
    preview: { bg: "#1f2937", shadow: "0 4px 12px rgba(0,0,0,0.3)", border: "none" },
    values: { widgetBgColor: "#1f2937", widgetBgOpacity: 1, widgetBorderRadius: 12, widgetShadow: "lg", widgetPadding: 14, widgetBorderWidth: 0, shadowCustom: false, backdropBlur: 0, titleColor: "#f3f4f6", subtitleColor: "#9ca3af", axisColor: "#9ca3af", gridColor: "#374151" },
  },
  {
    label: "Glass",
    preview: { bg: "rgba(255,255,255,0.3)", shadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.5)" },
    values: { widgetBgColor: "#ffffff", widgetBgOpacity: 0.55, widgetBorderRadius: 20, widgetShadow: "md", widgetPadding: 14, widgetBorderWidth: 1, widgetBorderColor: "#e5e7eb", widgetBorderStyle: "solid", shadowCustom: false, backdropBlur: 12, titleColor: "#374151" },
  },
  {
    label: "Bordered",
    preview: { bg: "#ffffff", shadow: "none", border: "2px solid #6366f1" },
    values: { widgetBgColor: "#ffffff", widgetBgOpacity: 1, widgetBorderRadius: 10, widgetShadow: "none", widgetPadding: 12, widgetBorderWidth: 2, widgetBorderColor: "#6366f1", widgetBorderStyle: "solid", shadowCustom: false, backdropBlur: 0, titleColor: "#4b5563" },
  },
  {
    label: "Soft",
    preview: { bg: "#ffffff", shadow: "0 8px 32px rgba(0,0,0,0.12)", border: "none" },
    values: { widgetBgColor: "#ffffff", widgetBgOpacity: 1, widgetBorderRadius: 14, widgetPadding: 14, widgetBorderWidth: 0, shadowCustom: true, shadowX: 0, shadowY: 8, shadowBlur: 32, shadowSpread: -4, shadowColor: "#000000", shadowOpacity: 0.12, backdropBlur: 0, titleColor: "#4b5563" },
  },
  {
    label: "Neumorphism",
    preview: { bg: "#f0f0f3", shadow: "5px 5px 10px #bebebe, -5px -5px 10px #ffffff", border: "none" },
    values: { widgetBgColor: "#f0f0f3", widgetBgOpacity: 1, widgetBorderRadius: 16, widgetPadding: 14, widgetBorderWidth: 0, shadowCustom: true, shadowX: 6, shadowY: 6, shadowBlur: 14, shadowSpread: 0, shadowColor: "#000000", shadowOpacity: 0.1, backdropBlur: 0, titleColor: "#4b5563" },
  },
  {
    label: "Brand",
    preview: { bg: "#1a3ab5", shadow: "0 4px 12px rgba(26,58,181,0.3)", border: "none" },
    values: { widgetBgColor: "#1a3ab5", widgetBgOpacity: 1, widgetBorderRadius: 12, widgetShadow: "lg", widgetPadding: 14, widgetBorderWidth: 0, shadowCustom: false, backdropBlur: 0, titleColor: "#ffffff", subtitleColor: "#bfdbfe", axisColor: "#bfdbfe", gridColor: "#2d4ec7" },
  },
];

export default function WidgetStyleConfig({ style = {}, updateStyle, updateStyleBatch }) {
  const [section, setSection] = useState("appearance");

  // Apply all preset values at once using batch update to avoid stale state
  const applyPreset = useCallback((preset) => {
    if (updateStyleBatch) {
      updateStyleBatch(preset.values);
    } else {
      // Fallback: call updateStyle for each (may have stale state issues)
      Object.entries(preset.values).forEach(([key, value]) => {
        updateStyle(key, value);
      });
    }
  }, [updateStyle, updateStyleBatch]);

  const sections = [
    { key: "appearance", label: "🎨 Look" },
    { key: "shadow", label: "🌓 Shadow" },
    { key: "title", label: "✏️ Title" },
    { key: "display", label: "⚙️ Display" },
    { key: "labels", label: "🏷️ Labels" },
    { key: "margins", label: "📐 Margins" },
    { key: "tooltip", label: "💬 Tooltip" },
    { key: "number", label: "#️⃣ Number" },
  ];

  return (
    <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
      <label className="block text-xs font-bold text-gray-600">Widget Appearance</label>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1 mb-2">
        {sections.map((s) => (
          <button
            key={s.key}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              section === s.key ? "bg-brand-600 text-white shadow-sm" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── APPEARANCE ── */}
      {section === "appearance" && (
        <div className="space-y-3">
          {/* Quick Presets with Visual Preview */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Quick Presets</label>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="group flex flex-col items-center gap-1 p-1.5 rounded-lg border border-gray-200 hover:border-brand-400 hover:shadow-md transition-all"
                >
                  <div
                    className="w-full h-6 rounded"
                    style={{
                      background: p.preview.bg,
                      boxShadow: p.preview.shadow,
                      border: p.preview.border || 'none',
                    }}
                  />
                  <span className="text-[9px] font-medium text-gray-500 group-hover:text-brand-600">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <ColorPicker label="Background Color" value={style.widgetBgColor || "#ffffff"} onChange={(c) => updateStyle("widgetBgColor", c)} />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Background Opacity: {Math.round((style.widgetBgOpacity ?? 1) * 100)}%
            </label>
            <input type="range" min={0} max={100} value={Math.round((style.widgetBgOpacity ?? 1) * 100)}
              onChange={(e) => updateStyle("widgetBgOpacity", Number(e.target.value) / 100)} className="w-full accent-brand-600" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Backdrop Blur: {style.backdropBlur ?? 0}px
              {(style.widgetBgOpacity ?? 1) >= 1 && <span className="text-[10px] text-amber-500 ml-1">(lower opacity to see)</span>}
            </label>
            <input type="range" min={0} max={30} step={1} value={style.backdropBlur ?? 0}
              onChange={(e) => updateStyle("backdropBlur", Number(e.target.value))} className="w-full accent-brand-600" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius: {style.widgetBorderRadius ?? 8}px</label>
            <input type="range" min={0} max={32} value={style.widgetBorderRadius ?? 8}
              onChange={(e) => updateStyle("widgetBorderRadius", Number(e.target.value))} className="w-full accent-brand-600" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Content Padding: {style.widgetPadding ?? 8}px</label>
            <input type="range" min={0} max={40} step={2} value={style.widgetPadding ?? 8}
              onChange={(e) => updateStyle("widgetPadding", Number(e.target.value))} className="w-full accent-brand-600" />
          </div>

          <div className="space-y-2 p-2 rounded border border-gray-200 bg-white">
            <label className="block text-xs font-medium text-gray-600">Border</label>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width: {style.widgetBorderWidth ?? 0}px</label>
              <input type="range" min={0} max={4} value={style.widgetBorderWidth ?? 0}
                onChange={(e) => updateStyle("widgetBorderWidth", Number(e.target.value))} className="w-full accent-brand-600" />
            </div>
            {(style.widgetBorderWidth || 0) > 0 && (
              <>
                <ColorPicker label="Border Color" value={style.widgetBorderColor || "#e5e7eb"} onChange={(c) => updateStyle("widgetBorderColor", c)} />
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Style</label>
                  <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none" value={style.widgetBorderStyle || "solid"}
                    onChange={(e) => updateStyle("widgetBorderStyle", e.target.value)}>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SHADOW ── */}
      {section === "shadow" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${!style.shadowCustom ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-500"}`}
              onClick={() => updateStyle("shadowCustom", false)}>Presets</button>
            <button className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${style.shadowCustom ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-500"}`}
              onClick={() => updateStyle("shadowCustom", true)}>Custom</button>
          </div>

          {!style.shadowCustom ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Shadow Size</label>
              <div className="grid grid-cols-4 gap-1">
                {[{ value: "none", label: "None" }, { value: "sm", label: "S" }, { value: "default", label: "M" }, { value: "md", label: "L" }, { value: "lg", label: "XL" }, { value: "xl", label: "2XL" }, { value: "2xl", label: "3XL" }].map((s) => (
                  <button key={s.value} onClick={() => updateStyle("widgetShadow", s.value)}
                    className={`text-[10px] px-2 py-1.5 rounded border transition-all ${(style.widgetShadow || "default") === s.value ? "border-brand-400 bg-brand-50 text-brand-700 font-semibold" : "border-gray-200 text-gray-500 hover:border-brand-300"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center py-3">
                <div className="w-20 h-14 rounded-lg bg-white border border-gray-100"
                  style={{ boxShadow: `${style.shadowX ?? 0}px ${style.shadowY ?? 4}px ${style.shadowBlur ?? 8}px ${style.shadowSpread ?? 0}px rgba(0,0,0,${style.shadowOpacity ?? 0.15})` }} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">X: {style.shadowX ?? 0}px</label>
                <input type="range" min={-30} max={30} value={style.shadowX ?? 0} onChange={(e) => updateStyle("shadowX", Number(e.target.value))} className="w-full accent-brand-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y: {style.shadowY ?? 4}px</label>
                <input type="range" min={-30} max={30} value={style.shadowY ?? 4} onChange={(e) => updateStyle("shadowY", Number(e.target.value))} className="w-full accent-brand-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Blur: {style.shadowBlur ?? 8}px</label>
                <input type="range" min={0} max={60} value={style.shadowBlur ?? 8} onChange={(e) => updateStyle("shadowBlur", Number(e.target.value))} className="w-full accent-brand-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Spread: {style.shadowSpread ?? 0}px</label>
                <input type="range" min={-20} max={20} value={style.shadowSpread ?? 0} onChange={(e) => updateStyle("shadowSpread", Number(e.target.value))} className="w-full accent-brand-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Opacity: {Math.round((style.shadowOpacity ?? 0.15) * 100)}%</label>
                <input type="range" min={0} max={100} value={Math.round((style.shadowOpacity ?? 0.15) * 100)} onChange={(e) => updateStyle("shadowOpacity", Number(e.target.value) / 100)} className="w-full accent-brand-600" />
              </div>
              <ColorPicker label="Shadow Color" value={style.shadowColor || "#000000"} onChange={(c) => updateStyle("shadowColor", c)} />
            </div>
          )}
        </div>
      )}

      {/* ── TITLE ── */}
      {section === "title" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.showTitle !== false}
              onChange={(e) => updateStyle("showTitle", e.target.checked)} />
            Show Title Bar
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title Font Size: {style.titleFontSize || 12}px
            </label>
            <input type="range" min={9} max={28} value={style.titleFontSize || 12}
              onChange={(e) => updateStyle("titleFontSize", Number(e.target.value))} className="w-full accent-brand-600" />
          </div>
          <ColorPicker label="Title Color" value={style.titleColor || "#4b5563"}
            onChange={(c) => updateStyle("titleColor", c)} />
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={style.titleBold !== false}
                onChange={(e) => updateStyle("titleBold", e.target.checked)} />
              <span className="font-bold">B</span>
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={style.titleItalic || false}
                onChange={(e) => updateStyle("titleItalic", e.target.checked)} />
              <span className="italic">I</span>
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={style.titleUnderline || false}
                onChange={(e) => updateStyle("titleUnderline", e.target.checked)} />
              <span className="underline">U</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
            <div className="flex gap-1">
              {["left", "center", "right"].map((a) => (
                <button key={a}
                  className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${(style.titleAlign || "left") === a ? "bg-brand-100 text-brand-700 border border-brand-300" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  onClick={() => updateStyle("titleAlign", a)}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title Font</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.titleFont || "default"}
              onChange={(e) => updateStyle("titleFont", e.target.value)}>
              <option value="default">Default (Inter)</option>
              <option value="serif">Serif (Georgia)</option>
              <option value="mono">Monospace</option>
              <option value="condensed">Condensed</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
            <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.subtitle || ""}
              onChange={(e) => updateStyle("subtitle", e.target.value)}
              placeholder="Add a subtitle or description…" />
          </div>
          <ColorPicker label="Subtitle Color" value={style.subtitleColor || "#9ca3af"}
            onChange={(c) => updateStyle("subtitleColor", c)} />
        </div>
      )}

      {/* ── DISPLAY OPTIONS ── */}
      {section === "display" && (
        <div className="space-y-3">
          <p className="text-[10px] text-gray-400">Toggle chart display elements. These apply to most chart types.</p>
          <div className="space-y-2">
            {[
              ["showGridLines", "Grid Lines", "Show/hide grid lines behind chart"],
              ["showLegend", "Legend", "Show/hide the chart legend"],
              ["showAxisTitles", "Axis Titles", "Show/hide axis title labels"],
              ["showValueFormatted", "Format Values (commas)", "Add comma separators to numbers"],
              ["showDataPoints", "Data Points", "Show dots on line/area charts"],
            ].map(([key, label, desc]) => (
              <label key={key} className="flex items-start gap-2 text-xs cursor-pointer group">
                <input type="checkbox" checked={style[key] !== false}
                  onChange={(e) => updateStyle(key, e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
                <div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          {style.showAxisTitles && (
            <div className="pl-3 border-l-2 border-brand-200 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X-Axis Title</label>
                <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-400"
                  value={style.xAxisTitle || ""} onChange={(e) => updateStyle("xAxisTitle", e.target.value)}
                  placeholder="Enter X-axis title..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y-Axis Title</label>
                <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-400"
                  value={style.yAxisTitle || ""} onChange={(e) => updateStyle("yAxisTitle", e.target.value)}
                  placeholder="Enter Y-axis title..." />
              </div>
            </div>
          )}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Grid Options</label>
            {[
              ["gridHorizontal", "Horizontal Grid Lines"],
              ["gridVertical", "Vertical Grid Lines"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={style[key] !== false}
                  onChange={(e) => updateStyle(key, e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
                {label}
              </label>
            ))}
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Legend</label>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Legend Position</label>
              <div className="flex gap-1">
                {["bottom", "top", "right", "left"].map((p) => (
                  <button key={p}
                    className={`flex-1 px-2 py-1 rounded text-[10px] transition-colors ${
                      (style.legendPosition || "bottom") === p
                        ? "bg-brand-100 text-brand-700 border border-brand-300 font-semibold"
                        : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300"
                    }`}
                    onClick={() => updateStyle("legendPosition", p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Legend Layout</label>
              <div className="flex gap-1">
                {["horizontal", "vertical"].map((l) => (
                  <button key={l}
                    className={`flex-1 px-2 py-1 rounded text-[10px] transition-colors ${
                      (style.legendLayout || "horizontal") === l
                        ? "bg-brand-100 text-brand-700 border border-brand-300 font-semibold"
                        : "bg-white border border-gray-200 text-gray-500 hover:border-brand-300"
                    }`}
                    onClick={() => updateStyle("legendLayout", l)}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Accent Border</label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={style.accentBorder || false}
                onChange={(e) => updateStyle("accentBorder", e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
              Show Left Accent Border
            </label>
            {style.accentBorder && (
              <ColorPicker label="Accent Color" value={style.accentColor || "#4F46E5"} onChange={(c) => updateStyle("accentColor", c)} />
            )}
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Text Colors</label>
            <ColorPicker label="Axis / Label Color" value={style.axisColor || "#6b7280"} onChange={(c) => updateStyle("axisColor", c)} />
            <ColorPicker label="Widget Text Color" value={style.textColor || "#374151"} onChange={(c) => updateStyle("textColor", c)} />
          </div>
        </div>
      )}

      {/* ── DATA LABELS ── */}
      {section === "labels" && (
        <div className="space-y-3">
          <p className="text-[10px] text-gray-400">Configure data labels shown on chart elements.</p>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input type="checkbox" checked={style.showDataLabels || false}
              onChange={(e) => updateStyle("showDataLabels", e.target.checked)} />
            Show Data Labels
          </label>
          {style.showDataLabels && (
            <div className="space-y-2 pl-1 border-l-2 border-brand-200">
              {/* Label Content */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Label Contains</label>
                <div className="space-y-1">
                  {[
                    ["labelShowValue", "Value", true],
                    ["labelShowCategory", "Category / Labels", false],
                    ["labelShowPercentage", "Percentage", false],
                    ["labelShowSeriesName", "Series Name", false],
                  ].map(([key, label, def]) => (
                    <label key={key} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={style[key] !== undefined ? style[key] : def}
                        onChange={(e) => updateStyle(key, e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                  value={style.labelSeparator || "newline"}
                  onChange={(e) => updateStyle("labelSeparator", e.target.value)}>
                  <option value="newline">New Line ↵</option>
                  <option value="comma">Comma (,)</option>
                  <option value="space">Space</option>
                  <option value="dash">Dash (—)</option>
                  <option value="pipe">Pipe (|)</option>
                  <option value="semicolon">Semicolon (;)</option>
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                  value={style.dataLabelPosition || "top"}
                  onChange={(e) => updateStyle("dataLabelPosition", e.target.value)}>
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                  <option value="insideTop">Inside Top</option>
                  <option value="insideBottom">Inside Bottom</option>
                  <option value="inside">Inside</option>
                  <option value="outside">Outside</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Font Size: {style.dataLabelSize || 10}px
                </label>
                <input type="range" min={7} max={18} value={style.dataLabelSize || 10}
                  onChange={(e) => updateStyle("dataLabelSize", Number(e.target.value))} className="w-full accent-brand-600" />
              </div>

              {/* Text Color */}
              <ColorPicker label="Text Color" value={style.dataLabelColor || "#374151"}
                onChange={(c) => updateStyle("dataLabelColor", c)} />

              {/* Font Style */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Font Style</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={style.dataLabelBold || false}
                      onChange={(e) => updateStyle("dataLabelBold", e.target.checked)} />
                    <span className="font-bold">B</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={style.dataLabelItalic || false}
                      onChange={(e) => updateStyle("dataLabelItalic", e.target.checked)} />
                    <span className="italic">I</span>
                  </label>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                  value={style.dataLabelFont || "default"}
                  onChange={(e) => updateStyle("dataLabelFont", e.target.value)}>
                  <option value="default">Default (Inter/System)</option>
                  <option value="serif">Serif (Georgia)</option>
                  <option value="mono">Monospace</option>
                  <option value="condensed">Condensed</option>
                </select>
              </div>

              {/* Label Background */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={style.dataLabelBackground || false}
                    onChange={(e) => updateStyle("dataLabelBackground", e.target.checked)} />
                  Label Background
                </label>
                {style.dataLabelBackground && (
                  <div className="pl-4 space-y-1">
                    <ColorPicker label="Background Color" value={style.dataLabelBgColor || "#ffffff"}
                      onChange={(c) => updateStyle("dataLabelBgColor", c)} />
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">
                        Opacity: {Math.round((style.dataLabelBgOpacity ?? 0.85) * 100)}%
                      </label>
                      <input type="range" min={0} max={100} value={Math.round((style.dataLabelBgOpacity ?? 0.85) * 100)}
                        onChange={(e) => updateStyle("dataLabelBgOpacity", Number(e.target.value) / 100)} className="w-full accent-brand-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Rotation */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Rotation: {style.dataLabelRotation || 0}°
                </label>
                <input type="range" min={-90} max={90} step={15} value={style.dataLabelRotation || 0}
                  onChange={(e) => updateStyle("dataLabelRotation", Number(e.target.value))} className="w-full accent-brand-600" />
              </div>

              {/* Leader Lines (for pie) */}
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={style.showLeaderLines !== false}
                  onChange={(e) => updateStyle("showLeaderLines", e.target.checked)} />
                Leader Lines (Pie/Donut)
              </label>
            </div>
          )}
        </div>
      )}

      {/* ── MARGINS ── */}
      {section === "margins" && (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400">Chart area margins (pixels). Adjust to prevent label clipping.</p>
          {[
            ["marginTop", "Top", 5],
            ["marginRight", "Right", 20],
            ["marginBottom", "Bottom", 5],
            ["marginLeft", "Left", 10],
          ].map(([key, label, def]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}: {style[key] ?? def}px
              </label>
              <input type="range" min={0} max={80} value={style[key] ?? def}
                onChange={(e) => updateStyle(key, Number(e.target.value))} className="w-full accent-brand-600" />
            </div>
          ))}
        </div>
      )}

      {/* ── TOOLTIP ── */}
      {section === "tooltip" && (
        <div className="space-y-2">
          <ColorPicker label="Tooltip Background" value={style.tooltipBgColor || "#ffffff"}
            onChange={(c) => updateStyle("tooltipBgColor", c)} />
          <ColorPicker label="Tooltip Text Color" value={style.tooltipTextColor || "#374151"}
            onChange={(c) => updateStyle("tooltipTextColor", c)} />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.tooltipBorder !== false}
              onChange={(e) => updateStyle("tooltipBorder", e.target.checked)} />
            Show Tooltip Border
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tooltip Border Radius: {style.tooltipRadius ?? 8}px</label>
            <input type="range" min={0} max={20} value={style.tooltipRadius ?? 8}
              onChange={(e) => updateStyle("tooltipRadius", Number(e.target.value))} className="w-full accent-brand-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tooltip Font Size</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.tooltipFontSize || "medium"}
              onChange={(e) => updateStyle("tooltipFontSize", e.target.value)}>
              <option value="small">Small (9px)</option>
              <option value="medium">Medium (11px)</option>
              <option value="large">Large (13px)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.tooltipShadow !== false}
              onChange={(e) => updateStyle("tooltipShadow", e.target.checked)} />
            Tooltip Shadow
          </label>
        </div>
      )}

      {/* ── NUMBER FORMAT ── */}
      {section === "number" && (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400">Number formatting for values, tooltips, and data labels.</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Format Preset</label>
            <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.numberFormat || "auto"}
              onChange={(e) => updateStyle("numberFormat", e.target.value)}>
              <option value="auto">Auto</option>
              <option value="comma">Commas (1,234,567)</option>
              <option value="compact">Compact (1.2M, 3.4K)</option>
              <option value="currency_usd">Currency $ (1,234.00)</option>
              <option value="currency_sar">Currency SAR (1,234.00)</option>
              <option value="percent">Percentage (45.2%)</option>
              <option value="decimal_1">1 Decimal (1234.5)</option>
              <option value="decimal_2">2 Decimals (1234.56)</option>
              <option value="integer">Integer (1235)</option>
            </select>
          </div>
          {textInput("Prefix", "numberPrefix", style, "e.g. $ or SAR ", updateStyle)}
          {textInput("Suffix", "numberSuffix", style, "e.g. % or units", updateStyle)}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Decimal Places: {style.decimalPlaces ?? 2}
            </label>
            <input type="range" min={0} max={6} value={style.decimalPlaces ?? 2}
              onChange={(e) => updateStyle("decimalPlaces", Number(e.target.value))} className="w-full accent-brand-600" />
          </div>
        </div>
      )}
    </div>
  );
}

function textInput(label, key, style, placeholder, updateStyle) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
        value={style[key] || ""}
        placeholder={placeholder}
        onChange={(e) => updateStyle(key, e.target.value)} />
    </div>
  );
}
