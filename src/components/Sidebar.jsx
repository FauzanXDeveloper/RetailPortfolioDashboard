/**
 * Left Sidebar — Widget Library.
 * Contains draggable widget items organized by category.
 */
import React from "react";
import { useDrag } from "react-dnd";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Table2,
  LayoutDashboard,
  ListFilter,
  Calendar,
  Type,
  ChevronLeft,
  ChevronRight,
  ScatterChart,
  Flame,
  Gauge,
  TrendingDown,
  ArrowDownUp,
  Radar,
  TreePine,
  Layers,
  BoxSelect,
  GitBranch,
  CheckSquare,
  SlidersHorizontal,
  Search,
  ToggleLeft,
  Tag,
} from "lucide-react";
import useDashboardStore from "../store/dashboardStore";

// Widget definitions grouped by category
const WIDGET_GROUPS = [
  {
    label: "Visualization",
    items: [
      { type: "bar", name: "Bar Chart", icon: BarChart3 },
      { type: "line", name: "Line Chart", icon: LineChart },
      { type: "area", name: "Area Chart", icon: Activity },
      { type: "pie", name: "Pie Chart", icon: PieChart },
      { type: "table", name: "Data Table", icon: Table2 },
      { type: "kpi", name: "KPI Card", icon: LayoutDashboard },
    ],
  },
  {
    label: "Advanced Charts",
    items: [
      { type: "scatter", name: "Scatter Plot", icon: ScatterChart },
      { type: "heatmap", name: "Heatmap", icon: Flame },
      { type: "gauge", name: "Gauge", icon: Gauge },
      { type: "funnel", name: "Funnel Chart", icon: TrendingDown },
      { type: "waterfall", name: "Waterfall", icon: ArrowDownUp },
      { type: "radar", name: "Radar Chart", icon: Radar },
      { type: "treemap", name: "Treemap", icon: TreePine },
      { type: "combo", name: "Combo Chart", icon: Layers },
      { type: "boxplot", name: "Box Plot", icon: BoxSelect },
      { type: "sankey", name: "Sankey Diagram", icon: GitBranch },
    ],
  },
  {
    label: "Filters",
    items: [
      { type: "dropdown-filter", name: "Dropdown Filter", icon: ListFilter },
      { type: "date-range-filter", name: "Date Range Filter", icon: Calendar },
      { type: "multiselect-filter", name: "Multi-Select", icon: Tag },
      { type: "range-slider-filter", name: "Range Slider", icon: SlidersHorizontal },
      { type: "search-filter", name: "Search Filter", icon: Search },
      { type: "checkbox-group-filter", name: "Checkbox Group", icon: CheckSquare },
      { type: "toggle-filter", name: "Toggle Filter", icon: ToggleLeft },
    ],
  },
  {
    label: "Content",
    items: [
      { type: "text", name: "Text Box", icon: Type },
    ],
  },
];

/** Individual draggable widget item */
function DraggableWidgetItem({ type, name, icon: Icon }) {
  const [{ isDragging }, drag] = useDrag({
    type: "WIDGET",
    item: { widgetType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging
          ? "opacity-40 bg-indigo-100 scale-95"
          : "hover:bg-gray-100 bg-white"
      }`}
    >
      <Icon size={16} className="text-indigo-500 flex-shrink-0" />
      <span className="text-sm text-gray-700">{name}</span>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  return (
    <div className="relative flex-shrink-0">
      {/* Toggle button — placed OUTSIDE the aside so it's always visible */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-6 top-3 z-20 w-6 h-10 bg-white border border-gray-200 border-l-0 rounded-r-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <aside
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full ${
          sidebarOpen ? "w-60" : "w-0 overflow-hidden"
        }`}
      >
        {sidebarOpen && (
          <>
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Widget Library
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Drag widgets to the canvas
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
              {WIDGET_GROUPS.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1 px-1">
                    {group.label}
                  </h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <DraggableWidgetItem key={item.type} {...item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
