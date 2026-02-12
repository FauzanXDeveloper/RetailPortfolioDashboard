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

  const shadowMap = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-shadow ${
        isSelected ? "ring-2 ring-brand-200" : ""
      }`}
      style={{
        backgroundColor: style.widgetBgColor || '#ffffff',
        borderRadius: `${style.widgetBorderRadius ?? 8}px`,
        boxShadow: shadowMap[style.widgetShadow || 'default'],
        border: isSelected ? '1px solid #a9b5eb' : '1px solid #e5e7eb',
        borderLeft: style.accentBorder ? `4px solid ${style.accentColor || "#1a3ab5"}` : undefined,
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Right-click context menu — native OS style */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9999]" onClick={closeContextMenu} onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }} />
          <div
            className="fixed z-[10000] min-w-[180px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '6px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.16), 0 0 1px rgba(0,0,0,0.12)',
              border: '0.5px solid rgba(0,0,0,0.08)',
              padding: '4px 0',
            }}
          >
            <button
              className="w-full text-left px-3 py-[6px] text-[13px] text-gray-700 hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-between gap-4"
              onClick={() => { setHeaderHidden(!headerHidden); closeContextMenu(); }}
            >
              <span>{headerHidden ? "Show Header" : "Hide Header"}</span>
              <span className="text-[11px] text-gray-400" style={{ fontFamily: 'system-ui' }}>{headerHidden ? "⌘H" : "⌘H"}</span>
            </button>
            <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />
            <button
              className="w-full text-left px-3 py-[6px] text-[13px] text-gray-700 hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-between gap-4"
              onClick={() => { toggleWidgetPin(widget.i); closeContextMenu(); }}
            >
              <span>{isPinned ? "Unpin Widget" : "Pin Widget"}</span>
              <span className="text-[11px] text-gray-400" style={{ fontFamily: 'system-ui' }}>{isPinned ? "⌘U" : "⌘P"}</span>
            </button>
            <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />
            <button
              className="w-full text-left px-3 py-[6px] text-[13px] text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => { selectWidget(widget.i); closeContextMenu(); }}
            >
              Configure
            </button>
            <button
              className="w-full text-left px-3 py-[6px] text-[13px] text-red-600 hover:bg-red-500 hover:text-white transition-colors"
              onClick={() => { removeWidget(widget.i); closeContextMenu(); }}
            >
              Remove Widget
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
              className="text-xs font-medium bg-transparent border-b border-brand-400 outline-none w-full"
              value={widget.title}
              onChange={(e) => updateWidgetTitle(widget.i, e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-xs text-gray-600 truncate cursor-text"
              style={{
                fontSize: style.titleFontSize ? `${style.titleFontSize}px` : undefined,
                color: style.titleColor || undefined,
                fontWeight: style.titleBold !== false ? 600 : 400,
              }}
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
            className={`p-1 rounded transition-colors ${isPinned ? 'hover:bg-gray-200 text-brand-500' : 'hover:bg-gray-200 text-gray-400'}`}
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
      <div className="flex-1 overflow-auto" style={{ padding: `${style.widgetPadding ?? 8}px` }}>
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
