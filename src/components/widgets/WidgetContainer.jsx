/**
 * WidgetContainer — Base wrapper for all widgets on the canvas.
 * Provides drag handle, title, settings & delete buttons, and resize handle.
 */
import React, { useState } from "react";
import { Settings, X, GripVertical } from "lucide-react";
import useDashboardStore from "../../store/dashboardStore";

// Widget type imports
import BarChartWidget from "./BarChartWidget";
import LineChartWidget from "./LineChartWidget";
import AreaChartWidget from "./AreaChartWidget";
import PieChartWidget from "./PieChartWidget";
import KPICardWidget from "./KPICardWidget";
import DataTableWidget from "./DataTableWidget";
import DropdownFilterWidget from "./DropdownFilterWidget";
import DateRangeFilterWidget from "./DateRangeFilterWidget";
import TextBoxWidget from "./TextBoxWidget";

/** Map widget type string to its component */
const WIDGET_COMPONENTS = {
  bar: BarChartWidget,
  line: LineChartWidget,
  area: AreaChartWidget,
  pie: PieChartWidget,
  kpi: KPICardWidget,
  table: DataTableWidget,
  "dropdown-filter": DropdownFilterWidget,
  "date-range-filter": DateRangeFilterWidget,
  text: TextBoxWidget,
};

export default function WidgetContainer({ widget }) {
  const { selectWidget, removeWidget, updateWidgetTitle, selectedWidgetId } =
    useDashboardStore();
  const [editingTitle, setEditingTitle] = useState(false);

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const isSelected = selectedWidgetId === widget.i;

  return (
    <div
      className={`bg-white rounded-lg shadow border h-full flex flex-col overflow-hidden transition-shadow ${
        isSelected ? "border-indigo-400 shadow-md ring-2 ring-indigo-200" : "border-gray-200"
      }`}
    >
      {/* Header / Drag Handle */}
      <div className="drag-handle flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-100 cursor-move select-none min-h-[32px]">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
          {editingTitle ? (
            <input
              autoFocus
              className="text-xs font-medium bg-transparent border-b border-indigo-400 outline-none w-full"
              value={widget.title}
              onChange={(e) => updateWidgetTitle(widget.i, e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-xs font-medium text-gray-600 truncate cursor-text"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingTitle(true);
              }}
              title="Double-click to edit title"
            >
              {widget.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              selectWidget(widget.i);
            }}
            title="Configure"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Settings size={13} className="text-gray-500" />
          </button>
          <button
            className="p-1 rounded hover:bg-red-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(widget.i);
            }}
            title="Remove widget"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X size={13} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-2">
        {WidgetComponent ? (
          <WidgetComponent widget={widget} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Unknown widget type: {widget.type}
          </div>
        )}
      </div>
    </div>
  );
}
