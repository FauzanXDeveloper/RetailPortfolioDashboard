/**
 * WidgetStyleConfig — Shared widget-level style options.
 * Background, border, shadow, padding, title, tooltip, number formatting, margins.
 * Reused across all chart/widget config panels.
 */
import React, { useState } from "react";
import { ColorPicker } from "../common/CommonComponents";

const PRESETS = [
  { label: "Clean", bg: "#ffffff", radius: 12, shadow: "sm", padding: 12, border: false },
  { label: "Elevated", bg: "#ffffff", radius: 16, shadow: "lg", padding: 16, border: false },
  { label: "Flat", bg: "#f9fafb", radius: 8, shadow: "none", padding: 10, border: true },
  { label: "Dark Card", bg: "#1f2937", radius: 12, shadow: "lg", padding: 14, border: false },
  { label: "Glass", bg: "rgba(255,255,255,0.7)", radius: 20, shadow: "md", padding: 14, border: false },
  { label: "Bordered", bg: "#ffffff", radius: 10, shadow: "none", padding: 12, border: true },
];

export default function WidgetStyleConfig({ style = {}, updateStyle }) {
  const [section, setSection] = useState("appearance");

  const sections = [
    { key: "appearance", label: "Appearance" },
    { key: "title", label: "Title" },
    { key: "margins", label: "Margins" },
    { key: "tooltip", label: "Tooltip" },
    { key: "number", label: "Number Format" },
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
              section === s.key ? "bg-brand-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
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
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Quick Presets</label>
            <div className="grid grid-cols-3 gap-1">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    updateStyle("widgetBgColor", p.bg);
                    updateStyle("widgetBorderRadius", p.radius);
                    updateStyle("widgetShadow", p.shadow);
                    updateStyle("widgetPadding", p.padding);
                    if (p.border) {
                      updateStyle("widgetBorderWidth", 1);
                      updateStyle("widgetBorderColor", "#e5e7eb");
                    } else {
                      updateStyle("widgetBorderWidth", 0);
                    }
                    if (p.bg === "#1f2937") {
                      updateStyle("titleColor", "#f3f4f6");
                    }
                  }}
                  className="text-[10px] px-2 py-1.5 rounded border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-gray-600"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <ColorPicker
            label="Background Color"
            value={style.widgetBgColor || "#ffffff"}
            onChange={(c) => updateStyle("widgetBgColor", c)}
          />

          {/* Background Opacity */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Background Opacity: {Math.round((style.widgetBgOpacity ?? 1) * 100)}%
            </label>
            <input
              type="range" min={0} max={100}
              value={Math.round((style.widgetBgOpacity ?? 1) * 100)}
              onChange={(e) => updateStyle("widgetBgOpacity", Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Border Radius: {style.widgetBorderRadius ?? 8}px
            </label>
            <input type="range" min={0} max={32} value={style.widgetBorderRadius ?? 8}
              onChange={(e) => updateStyle("widgetBorderRadius", Number(e.target.value))} className="w-full" />
          </div>

          {/* Shadow */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shadow</label>
            <select
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.widgetShadow || "default"}
              onChange={(e) => updateStyle("widgetShadow", e.target.value)}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="default">Default</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
              <option value="2xl">2XL</option>
            </select>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Content Padding: {style.widgetPadding ?? 8}px
            </label>
            <input type="range" min={0} max={40} step={2} value={style.widgetPadding ?? 8}
              onChange={(e) => updateStyle("widgetPadding", Number(e.target.value))} className="w-full" />
          </div>

          {/* Widget Border */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Widget Border</label>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Border Width: {style.widgetBorderWidth ?? 0}px
              </label>
              <input type="range" min={0} max={4} value={style.widgetBorderWidth ?? 0}
                onChange={(e) => updateStyle("widgetBorderWidth", Number(e.target.value))} className="w-full" />
            </div>
            {(style.widgetBorderWidth || 0) > 0 && (
              <>
                <ColorPicker label="Border Color" value={style.widgetBorderColor || "#e5e7eb"}
                  onChange={(c) => updateStyle("widgetBorderColor", c)} />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Border Style</label>
                  <select className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
                    value={style.widgetBorderStyle || "solid"}
                    onChange={(e) => updateStyle("widgetBorderStyle", e.target.value)}>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TITLE ── */}
      {section === "title" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.showTitle !== false}
              onChange={(e) => updateStyle("showTitle", e.target.checked)} />
            Show Title
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title Font Size: {style.titleFontSize || 12}px
            </label>
            <input type="range" min={9} max={28} value={style.titleFontSize || 12}
              onChange={(e) => updateStyle("titleFontSize", Number(e.target.value))} className="w-full" />
          </div>
          <ColorPicker label="Title Color" value={style.titleColor || "#4b5563"}
            onChange={(c) => updateStyle("titleColor", c)} />
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={style.titleBold !== false}
                onChange={(e) => updateStyle("titleBold", e.target.checked)} />
              Bold
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={style.titleItalic || false}
                onChange={(e) => updateStyle("titleItalic", e.target.checked)} />
              Italic
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={style.titleUnderline || false}
                onChange={(e) => updateStyle("titleUnderline", e.target.checked)} />
              Underline
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title Alignment</label>
            <div className="flex gap-2">
              {["left", "center", "right"].map((a) => (
                <label key={a} className="flex items-center gap-1 text-xs">
                  <input type="radio" name="titleAlign" checked={(style.titleAlign || "left") === a}
                    onChange={() => updateStyle("titleAlign", a)} />
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </label>
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
            </select>
          </div>
          {/* Subtitle / Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle (optional)</label>
            <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
              value={style.subtitle || ""}
              onChange={(e) => updateStyle("subtitle", e.target.value)}
              placeholder="Add a subtitle or description…" />
          </div>
          <ColorPicker label="Subtitle Color" value={style.subtitleColor || "#9ca3af"}
            onChange={(c) => updateStyle("subtitleColor", c)} />
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
                onChange={(e) => updateStyle(key, Number(e.target.value))} className="w-full" />
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
              onChange={(e) => updateStyle("tooltipRadius", Number(e.target.value))} className="w-full" />
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
          {textInput("Prefix", "numberPrefix", "", "e.g. $ or SAR ", updateStyle)}
          {textInput("Suffix", "numberSuffix", "", "e.g. % or units", updateStyle)}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Decimal Places: {style.decimalPlaces ?? 2}
            </label>
            <input type="range" min={0} max={6} value={style.decimalPlaces ?? 2}
              onChange={(e) => updateStyle("decimalPlaces", Number(e.target.value))} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

function textInput(label, key, defVal, placeholder, updateStyle) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
        placeholder={placeholder}
        onChange={(e) => updateStyle(key, e.target.value)} />
    </div>
  );
}
