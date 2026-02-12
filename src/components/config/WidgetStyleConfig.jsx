/**
 * WidgetStyleConfig — Shared widget-level style options.
 * Background color, border radius, shadow, padding, title styling.
 * Reused across all chart/widget config panels.
 */
import React from "react";
import { ColorPicker } from "../common/CommonComponents";

export default function WidgetStyleConfig({ style = {}, updateStyle }) {
  return (
    <div className="space-y-3 p-2 bg-gray-50 rounded-lg">
      <label className="block text-xs font-bold text-gray-600">Widget Appearance</label>

      {/* Background Color */}
      <ColorPicker
        label="Background Color"
        value={style.widgetBgColor || "#ffffff"}
        onChange={(c) => updateStyle("widgetBgColor", c)}
      />

      {/* Border Radius */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Border Radius: {style.widgetBorderRadius ?? 8}px
        </label>
        <input
          type="range"
          min={0}
          max={24}
          value={style.widgetBorderRadius ?? 8}
          onChange={(e) => updateStyle("widgetBorderRadius", Number(e.target.value))}
          className="w-full"
        />
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
        </select>
      </div>

      {/* Padding */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Content Padding: {style.widgetPadding ?? 8}px
        </label>
        <input
          type="range"
          min={0}
          max={32}
          step={2}
          value={style.widgetPadding ?? 8}
          onChange={(e) => updateStyle("widgetPadding", Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Title Style */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600">Title Styling</label>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Title Font Size: {style.titleFontSize || 12}px
          </label>
          <input
            type="range"
            min={10}
            max={24}
            value={style.titleFontSize || 12}
            onChange={(e) => updateStyle("titleFontSize", Number(e.target.value))}
            className="w-full"
          />
        </div>
        <ColorPicker
          label="Title Color"
          value={style.titleColor || "#4b5563"}
          onChange={(c) => updateStyle("titleColor", c)}
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={style.titleBold !== false}
            onChange={(e) => updateStyle("titleBold", e.target.checked)}
          />
          Bold Title
        </label>
      </div>

      {/* Tooltip Customization */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600">Tooltip</label>
        <ColorPicker
          label="Tooltip Background"
          value={style.tooltipBgColor || "#ffffff"}
          onChange={(c) => updateStyle("tooltipBgColor", c)}
        />
        <ColorPicker
          label="Tooltip Text Color"
          value={style.tooltipTextColor || "#374151"}
          onChange={(c) => updateStyle("tooltipTextColor", c)}
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={style.tooltipBorder !== false}
            onChange={(e) => updateStyle("tooltipBorder", e.target.checked)}
          />
          Show Tooltip Border
        </label>
      </div>
    </div>
  );
}
