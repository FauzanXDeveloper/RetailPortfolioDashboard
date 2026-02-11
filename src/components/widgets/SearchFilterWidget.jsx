/**
 * SearchFilterWidget — A text search filter.
 */
import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import useDashboardStore from "../../store/dashboardStore";

export default function SearchFilterWidget({ widget }) {
  const { setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};
  const current = widgetFilterValues[widget.i] || "";
  const [value, setValue] = useState(current);

  useEffect(() => { setValue(current); }, [current]);

  const handleChange = (e) => {
    setValue(e.target.value);
    // Debounce: apply on next tick
    clearTimeout(window.__searchFilterTimeout);
    window.__searchFilterTimeout = setTimeout(() => {
      setWidgetFilterValue(widget.i, e.target.value);
    }, 300);
  };

  const handleClear = () => {
    setValue("");
    setWidgetFilterValue(widget.i, "");
  };

  return (
    <div className="flex items-center h-full px-2 gap-2">
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
        {config.filterName || "Search"}:
      </span>
      <div className="relative flex-1">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full text-xs border border-gray-200 rounded-md pl-7 pr-7 py-1.5 outline-none focus:border-indigo-400 bg-white"
          placeholder={config.placeholder || "Type to search..."}
          value={value}
          onChange={handleChange}
        />
        {value && (
          <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
