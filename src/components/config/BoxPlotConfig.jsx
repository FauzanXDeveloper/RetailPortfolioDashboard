/**
 * BoxPlotConfig — wraps DimensionMeasureConfig for BoxPlot widgets.
 */
import React from "react";
import DimensionMeasureConfig from "./DimensionMeasureConfig";

export default function BoxPlotConfig({ widget }) {
  return (
    <DimensionMeasureConfig
      widget={widget}
      extraStyleFields={({ style, updateStyle }) => (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Upper Color</label>
            <input type="color" value={style.upperColor || "#4F46E5"} onChange={(e) => updateStyle("upperColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Lower Color</label>
            <input type="color" value={style.lowerColor || "#10B981"} onChange={(e) => updateStyle("lowerColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
          </div>
        </>
      )}
    />
  );
}
