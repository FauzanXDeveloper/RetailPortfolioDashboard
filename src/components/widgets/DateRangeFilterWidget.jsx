/**
 * Date Range Filter Widget — Provides date range selection with presets.
 */
import React from "react";
import useDashboardStore from "../../store/dashboardStore";

const PRESETS = {
  today: { label: "Today", fn: () => { const t = new Date().toISOString().split("T")[0]; return { start: t, end: t }; } },
  last7: { label: "Last 7 Days", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 7); return { start: s.toISOString().split("T")[0], end: e.toISOString().split("T")[0] }; } },
  last30: { label: "Last 30 Days", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 30); return { start: s.toISOString().split("T")[0], end: e.toISOString().split("T")[0] }; } },
  thisMonth: { label: "This Month", fn: () => { const now = new Date(); const s = new Date(now.getFullYear(), now.getMonth(), 1); return { start: s.toISOString().split("T")[0], end: now.toISOString().split("T")[0] }; } },
  lastMonth: { label: "Last Month", fn: () => { const now = new Date(); const s = new Date(now.getFullYear(), now.getMonth() - 1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0); return { start: s.toISOString().split("T")[0], end: e.toISOString().split("T")[0] }; } },
  thisYear: { label: "This Year", fn: () => { const now = new Date(); const s = new Date(now.getFullYear(), 0, 1); return { start: s.toISOString().split("T")[0], end: now.toISOString().split("T")[0] }; } },
};

export default function DateRangeFilterWidget({ widget }) {
  const { setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};
  const current = widgetFilterValues[widget.i] || { preset: "", start: "", end: "" };

  if (!config.dataSource || !config.dateField) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center">
        Configure filter
      </div>
    );
  }

  const handlePreset = (key) => {
    const range = PRESETS[key].fn();
    setWidgetFilterValue(widget.i, { preset: key, ...range });
  };

  const style = config.style || {};

  return (
    <div className="flex items-center gap-2 h-full px-1 flex-wrap">
      <span className="text-xs font-medium whitespace-nowrap" style={{ color: style.textColor || style.axisColor || '#6b7280' }}>
        {config.filterName || "Date Range"}:
      </span>
      <select
        className="text-xs border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-indigo-400 bg-white"
        value={current.preset || ""}
        onChange={(e) => {
          if (e.target.value && PRESETS[e.target.value]) {
            handlePreset(e.target.value);
          }
        }}
      >
        <option value="">Custom</option>
        {(config.presets || Object.keys(PRESETS)).map((p) =>
          PRESETS[p] ? (
            <option key={p} value={p}>{PRESETS[p].label}</option>
          ) : null
        )}
      </select>
      <input
        type="date"
        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none w-28"
        value={current.start || ""}
        onChange={(e) =>
          setWidgetFilterValue(widget.i, { ...current, preset: "custom", start: e.target.value })
        }
      />
      <span className="text-gray-400 text-xs">—</span>
      <input
        type="date"
        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none w-28"
        value={current.end || ""}
        onChange={(e) =>
          setWidgetFilterValue(widget.i, { ...current, preset: "custom", end: e.target.value })
        }
      />
    </div>
  );
}
