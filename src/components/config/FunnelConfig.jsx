/**
 * FunnelConfig — wraps DimensionMeasureConfig for Funnel widgets.
 */
import React from "react";
import DimensionMeasureConfig from "./DimensionMeasureConfig";

export default function FunnelConfig({ widget }) {
  return (
    <DimensionMeasureConfig
      widget={widget}
      extraStyleFields={({ style, updateStyle }) => (
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={style.showLabels !== false} onChange={(e) => updateStyle("showLabels", e.target.checked)} /> Show Labels
        </label>
      )}
    />
  );
}
