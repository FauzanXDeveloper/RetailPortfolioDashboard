/**
 * WaterfallConfig — wraps DimensionMeasureConfig for Waterfall widgets.
 */
import React from "react";
import DimensionMeasureConfig from "./DimensionMeasureConfig";

export default function WaterfallConfig({ widget }) {
  return (
    <DimensionMeasureConfig
      widget={widget}
      extraDataFields={({ config, update }) => (
        <label className="flex items-center gap-2 text-xs mt-2">
          <input type="checkbox" checked={config.showTotal !== false} onChange={(e) => update("showTotal", e.target.checked)} /> Show Total Bar
        </label>
      )}
      extraStyleFields={({ style, updateStyle }) => (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Positive Color</label>
            <input type="color" value={style.positiveColor || "#10B981"} onChange={(e) => updateStyle("positiveColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Negative Color</label>
            <input type="color" value={style.negativeColor || "#EF4444"} onChange={(e) => updateStyle("negativeColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Color</label>
            <input type="color" value={style.totalColor || "#6366F1"} onChange={(e) => updateStyle("totalColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={style.showGridLines !== false} onChange={(e) => updateStyle("showGridLines", e.target.checked)} /> Show Grid Lines
          </label>
        </>
      )}
    />
  );
}
