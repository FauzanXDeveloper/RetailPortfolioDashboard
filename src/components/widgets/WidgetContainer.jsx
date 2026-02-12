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

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const isSelected = selectedWidgetId === widget.i;
  const isPinned = widget.pinned;
  const style = widget.config?.style || {};

  // ── Shadow builder ──
  const shadowMap = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  };

  const buildBoxShadow = () => {
    if (style.shadowCustom) {
      const x = style.shadowX ?? 0;
      const y = style.shadowY ?? 4;
      const blur = style.shadowBlur ?? 8;
      const spread = style.shadowSpread ?? 0;
      const color = style.shadowColor || '#000000';
      const opacity = style.shadowOpacity ?? 0.15;
      // Parse hex to rgba
      const r = parseInt(color.slice(1,3), 16) || 0;
      const g = parseInt(color.slice(3,5), 16) || 0;
      const b = parseInt(color.slice(5,7), 16) || 0;
      return `${x}px ${y}px ${blur}px ${spread}px rgba(${r},${g},${b},${opacity})`;
    }
    return shadowMap[style.widgetShadow || 'default'];
  };

  // ── Background color with opacity ──
  const buildBackgroundColor = () => {
    const bgColor = style.widgetBgColor || '#ffffff';
    const bgOpacity = style.widgetBgOpacity ?? 1;
    if (bgOpacity >= 1 && !bgColor.startsWith('rgba')) return bgColor;
    // If it's already rgba, just use it
    if (bgColor.startsWith('rgba')) return bgColor;
    // Parse hex to rgba
    const r = parseInt(bgColor.slice(1,3), 16) || 255;
    const g = parseInt(bgColor.slice(3,5), 16) || 255;
    const b = parseInt(bgColor.slice(5,7), 16) || 255;
    return `rgba(${r},${g},${b},${bgOpacity})`;
  };

  const titleFontMap = {
    default: "inherit",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    condensed: "'Arial Narrow', 'Barlow Condensed', sans-serif",
    rounded: "'Nunito', 'Varela Round', system-ui, sans-serif",
  };

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-shadow ${
        isSelected ? "ring-2 ring-brand-200" : ""
      }`}
      onDoubleClick={(e) => {
        // Don't trigger if user double-clicked on a button, input, or is editing title
        const tag = e.target.tagName?.toLowerCase();
        if (tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea') return;
        e.stopPropagation();
        selectWidget(widget.i);
      }}
      title="Double-click to configure"
      style={{
        backgroundColor: buildBackgroundColor(),
        borderRadius: `${style.widgetBorderRadius ?? 8}px`,
        boxShadow: buildBoxShadow(),
        border: isSelected
          ? '1px solid #a9b5eb'
          : (style.widgetBorderWidth || 0) > 0
            ? `${style.widgetBorderWidth}px ${style.widgetBorderStyle || 'solid'} ${style.widgetBorderColor || '#e5e7eb'}`
            : '1px solid #e5e7eb',
        borderLeft: style.accentBorder ? `4px solid ${style.accentColor || "#1a3ab5"}` : undefined,
        backdropFilter: style.backdropBlur ? `blur(${style.backdropBlur}px)` : undefined,
        WebkitBackdropFilter: style.backdropBlur ? `blur(${style.backdropBlur}px)` : undefined,
      }}
    >

      {/* Header / Drag Handle */}
      {style.showTitle !== false && (
      <div className={`${isPinned ? '' : 'drag-handle'} flex items-center justify-between px-2 py-1.5 border-b ${isPinned ? 'cursor-default' : 'cursor-move'} select-none min-h-[32px]`}
        style={{
          backgroundColor: style.widgetBgColor === '#1f2937' ? '#111827' : undefined,
          borderColor: style.widgetBgColor === '#1f2937' ? '#374151' : '#f3f4f6',
        }}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0" style={{ justifyContent: style.titleAlign === 'center' ? 'center' : style.titleAlign === 'right' ? 'flex-end' : 'flex-start' }}>
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
            <div className="min-w-0">
              <span
                className="text-xs text-gray-600 truncate cursor-text block"
                style={{
                  fontSize: style.titleFontSize ? `${style.titleFontSize}px` : undefined,
                  color: style.titleColor || undefined,
                  fontWeight: style.titleBold !== false ? 600 : 400,
                  fontStyle: style.titleItalic ? 'italic' : undefined,
                  textDecoration: style.titleUnderline ? 'underline' : undefined,
                  fontFamily: titleFontMap[style.titleFont || 'default'],
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle(true);
                }}
                title="Double-click to edit title"
              >
                {widget.title}
              </span>
              {style.subtitle && (
                <span className="text-[10px] block truncate" style={{ color: style.subtitleColor || '#9ca3af' }}>
                  {style.subtitle}
                </span>
              )}
            </div>
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
