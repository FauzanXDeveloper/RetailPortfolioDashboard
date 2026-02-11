/**
 * MultiSelectFilterWidget — A tag-based multi-select filter with search.
 */
import React, { useMemo, useState, useRef, useEffect } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { getUniqueValues } from "../../utils/dataProcessing";

export default function MultiSelectFilterWidget({ widget }) {
  const { dataSources, setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const options = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.filterField) return [];
    return getUniqueValues(ds.data, config.filterField);
  }, [dataSources, config.dataSource, config.filterField]);

  const selected = widgetFilterValues[widget.i] || [];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!config.dataSource || !config.filterField) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-xs">Configure filter</div>;
  }

  const toggleOption = (opt) => {
    const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
    setWidgetFilterValue(widget.i, next);
  };

  const filtered = options.filter((o) => String(o).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full px-1 py-0.5" ref={ref}>
      <span className="text-xs font-medium text-gray-600 mb-1">{config.filterName || config.filterField}</span>
      <div className="relative flex-1">
        <div
          className="flex flex-wrap gap-1 min-h-[28px] border border-gray-200 rounded-md px-2 py-1 cursor-pointer bg-white"
          onClick={() => setOpen(!open)}
        >
          {selected.length === 0 && <span className="text-xs text-gray-400">All</span>}
          {selected.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              {s}
              <button onClick={(e) => { e.stopPropagation(); toggleOption(s); }} className="hover:text-red-500">×</button>
            </span>
          ))}
          {selected.length > 3 && <span className="text-[10px] text-gray-500">+{selected.length - 3} more</span>}
        </div>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-hidden flex flex-col">
            <input
              autoFocus
              className="text-xs border-b px-2 py-1.5 outline-none"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="overflow-y-auto flex-1">
              {filtered.map((opt) => (
                <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs">
                  <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggleOption(opt)} className="rounded" />
                  {opt}
                </label>
              ))}
              {filtered.length === 0 && <p className="text-xs text-gray-400 p-2">No matches</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
