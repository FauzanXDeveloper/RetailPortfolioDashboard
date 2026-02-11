/**
 * ConfigPanel — Right sidebar that appears when a widget's settings icon is clicked.
 * Renders the appropriate config form based on widget type.
 */
import React from "react";
import { X } from "lucide-react";
import useDashboardStore from "../store/dashboardStore";
import BarChartConfig from "./config/BarChartConfig";
import LineChartConfig from "./config/LineChartConfig";
import AreaChartConfig from "./config/AreaChartConfig";
import PieChartConfig from "./config/PieChartConfig";
import KPICardConfig from "./config/KPICardConfig";
import DataTableConfig from "./config/DataTableConfig";
import FilterWidgetConfig from "./config/FilterWidgetConfig";
import TextBoxConfig from "./config/TextBoxConfig";

const CONFIG_COMPONENTS = {
  bar: BarChartConfig,
  line: LineChartConfig,
  area: AreaChartConfig,
  pie: PieChartConfig,
  kpi: KPICardConfig,
  table: DataTableConfig,
  "dropdown-filter": FilterWidgetConfig,
  "date-range-filter": FilterWidgetConfig,
  text: TextBoxConfig,
};

export default function ConfigPanel() {
  const { configPanelOpen, selectedWidgetId, currentDashboard, closeConfigPanel } =
    useDashboardStore();

  if (!configPanelOpen || !selectedWidgetId) return null;

  const widget = currentDashboard.widgets.find((w) => w.i === selectedWidgetId);
  if (!widget) return null;

  const ConfigComponent = CONFIG_COMPONENTS[widget.type];

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={closeConfigPanel}
      />

      {/* Config Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Widget Configuration
            </h3>
            <p className="text-xs text-gray-400">{widget.title} · {widget.type}</p>
          </div>
          <button
            onClick={closeConfigPanel}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {ConfigComponent ? (
            <ConfigComponent widget={widget} />
          ) : (
            <div className="text-sm text-gray-400 text-center py-8">
              No configuration available for this widget type.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
