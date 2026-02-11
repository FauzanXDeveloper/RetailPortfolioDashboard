/**
 * TextBoxConfig — Configuration form for text/markdown widgets.
 */
import React from "react";
import useDashboardStore from "../../store/dashboardStore";

export default function TextBoxConfig({ widget }) {
  const { updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) =>
    updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Content (Markdown supported)
        </label>
        <textarea
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none min-h-[150px] font-mono resize-y"
          value={config.content || ""}
          onChange={(e) => update("content", e.target.value)}
          placeholder="# Title\n\nYour text here..."
        />
        <p className="text-[10px] text-gray-400 mt-0.5">
          Supports: # Headers, **bold**, *italic*
        </p>
      </div>

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
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
        <select
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none"
          value={style.alignment || "left"}
          onChange={(e) => updateStyle("alignment", e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={style.showBorder || false}
          onChange={(e) => updateStyle("showBorder", e.target.checked)}
        />
        Show Border
      </label>
    </div>
  );
}
