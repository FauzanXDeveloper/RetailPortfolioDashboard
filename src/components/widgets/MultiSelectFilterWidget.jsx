/**
 * MultiSelectFilterWidget — A tag-based multi-select filter with search.
 */
import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import useDashboardStore from "../../store/dashboardStore";
import { getUniqueValues } from "../../utils/dataProcessing";

export default function MultiSelectFilterWidget({ widget }) {
  const { dataSources, setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const options = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.filterField) return [];
    return getUniqueValues(ds.data, config.filterField);
  }, [dataSources, config.dataSource, config.filterField]);

  const selected = widgetFilterValues[widget.i] || [];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
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

  const clearAll = () => {
    setWidgetFilterValue(widget.i, []);
  };

  const selectAll = () => {
    setWidgetFilterValue(widget.i, [...options]);
  };

  const handleOpenDropdown = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen(!open);
  };

  const style = config.style || {};
  const filtered = options.filter((o) => String(o).toLowerCase().includes(search.toLowerCase()));

  const dropdownContent = open && createPortal(
    <div
      ref={ref}
      className="bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col"
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: Math.max(dropdownPos.width, 200),
        maxHeight: 260,
        zIndex: 9999,
      }}
    >
      <input
        autoFocus
        className="text-xs border-b px-2 py-1.5 outline-none rounded-t-lg"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Select All / Clear All */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100">
        <button onClick={selectAll} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium">Select All</button>
        <span className="text-[10px] text-gray-400">{selected.length}/{options.length}</span>
        <button onClick={clearAll} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Clear</button>
      </div>
      <div className="overflow-y-auto flex-1">
        {filtered.map((opt) => (
          <label key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer text-xs">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggleOption(opt)} className="rounded" />
            {String(opt)}
          </label>
        ))}
        {filtered.length === 0 && <p className="text-xs text-gray-400 p-2">No matches</p>}
      </div>
    </div>,
    document.body
  );

  return (
    <div className="flex flex-col h-full px-1 py-0.5">
      <div className="relative flex-1 flex flex-col">
        <div
          ref={triggerRef}
          className="flex flex-wrap gap-1 min-h-[28px] border border-gray-200 rounded-md px-2 py-1 cursor-pointer bg-white hover:border-indigo-300 transition-colors"
          style={{ color: style.textColor || undefined }}
          onClick={handleOpenDropdown}
        >
          {selected.length === 0 && <span className="text-xs text-gray-400">All</span>}
          {selected.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              {String(s)}
              <button onClick={(e) => { e.stopPropagation(); toggleOption(s); }} className="hover:text-red-500">×</button>
            </span>
          ))}
          {selected.length > 3 && <span className="text-[10px] text-gray-500">+{selected.length - 3} more</span>}
        </div>
        {dropdownContent}
      </div>
    </div>
  );
}
