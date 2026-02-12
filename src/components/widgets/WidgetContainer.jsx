/**
 * WidgetContainer — Base wrapper for all widgets on the canvas.
 * Provides drag handle, title, settings & delete buttons, pin/unpin, and resize handle.
 */
import React, { useState } from "react";
import { Settings, X, GripVertical, Pin, PinOff } from "lucide-react";
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
// Advanced Charts
import ScatterPlotWidget from "./ScatterPlotWidget";
import HeatmapWidget from "./HeatmapWidget";
import GaugeWidget from "./GaugeWidget";
import FunnelWidget from "./FunnelWidget";
import WaterfallWidget from "./WaterfallWidget";
import RadarWidget from "./RadarWidget";
import TreemapWidget from "./TreemapWidget";
import ComboWidget from "./ComboWidget";
import BoxPlotWidget from "./BoxPlotWidget";
import SankeyWidget from "./SankeyWidget";
// Enhanced Filters
import MultiSelectFilterWidget from "./MultiSelectFilterWidget";
import RangeSliderFilterWidget from "./RangeSliderFilterWidget";
import SearchFilterWidget from "./SearchFilterWidget";
import CheckboxGroupFilterWidget from "./CheckboxGroupFilterWidget";
import ToggleFilterWidget from "./ToggleFilterWidget";

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
  // Advanced Charts
  scatter: ScatterPlotWidget,
  heatmap: HeatmapWidget,
  gauge: GaugeWidget,
  funnel: FunnelWidget,
  waterfall: WaterfallWidget,
  radar: RadarWidget,
  treemap: TreemapWidget,
  combo: ComboWidget,
  boxplot: BoxPlotWidget,
  sankey: SankeyWidget,
  // Enhanced Filters
  "multiselect-filter": MultiSelectFilterWidget,
  "range-slider-filter": RangeSliderFilterWidget,
  "search-filter": SearchFilterWidget,
  "checkbox-group-filter": CheckboxGroupFilterWidget,
  "toggle-filter": ToggleFilterWidget,
};

export default function WidgetContainer({ widget }) {
  const { selectWidget, removeWidget, updateWidgetTitle, selectedWidgetId, toggleWidgetPin } =
    useDashboardStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const isSelected = selectedWidgetId === widget.i;
  const isPinned = widget.pinned;
  const style = widget.config?.style || {};

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <div
      className={`bg-white rounded-lg shadow border h-full flex flex-col overflow-hidden transition-shadow ${
        isSelected ? "border-indigo-400 shadow-md ring-2 ring-indigo-200" : "border-gray-200"
      }`}
      style={{
        borderLeft: style.accentBorder ? `4px solid ${style.accentColor || "#4F46E5"}` : undefined,
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Right-click context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9999]" onClick={closeContextMenu} onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }} />
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[10000] py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors"
              onClick={() => { setHeaderHidden(!headerHidden); closeContextMenu(); }}
            >
              {headerHidden ? "📌 Show Header" : "👁️ Hide Header"}
            </button>
            <button
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors"
              onClick={() => { toggleWidgetPin(widget.i); closeContextMenu(); }}
            >
              {isPinned ? "🔓 Unpin Widget" : "📍 Pin Widget"}
            </button>
          </div>
        </>
      )}

      {/* Header / Drag Handle */}
      {!headerHidden && (
      <div className={`${isPinned ? '' : 'drag-handle'} flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-100 ${isPinned ? 'cursor-default' : 'cursor-move'} select-none min-h-[32px]`}>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {isPinned ? (
            <Pin size={14} className="text-amber-500 flex-shrink-0" />
          ) : (
            <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
          )}
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
            className={`p-1 rounded transition-colors ${isPinned ? 'hover:bg-gray-200 text-indigo-500' : 'hover:bg-gray-200 text-gray-400'}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWidgetPin(widget.i);
            }}
            title={isPinned ? "Unpin widget" : "Pin widget (lock position)"}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
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
      )}

      {/* Minimal drag handle when header is hidden */}
      {headerHidden && (
        <div className={`${isPinned ? '' : 'drag-handle'} h-1.5 bg-gray-100 ${isPinned ? 'cursor-default' : 'cursor-move'}`} />
      )}

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
