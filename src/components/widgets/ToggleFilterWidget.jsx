/**
 * ToggleFilterWidget — A toggle/switch for boolean filtering.
 */
import React from "react";
import useDashboardStore from "../../store/dashboardStore";

export default function ToggleFilterWidget({ widget }) {
  const { setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};
  const value = widgetFilterValues[widget.i] ?? false;

  return (
    <div className="flex items-center h-full px-2 gap-3">
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
        {config.filterName || "Toggle"}
      </span>
      <button
        onClick={() => setWidgetFilterValue(widget.i, !value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-xs text-gray-500">
        {value ? (config.onLabel || "On") : (config.offLabel || "Off")}
      </span>
    </div>
  );
}
