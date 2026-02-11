/**
 * Bar Chart Widget — Renders a Recharts BarChart based on widget config.
 */
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, sortData, applyGlobalFilters, limitData, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

export default function BarChartWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.yAxis) return null;

    let data = [...ds.data];

    // Apply global filters
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);

    // Apply cross-filters from filter widgets
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);

    // Apply widget-level filters
    if (config.filters?.length > 0) {
      data = filterData(data, config.filters);
    }

    // Aggregate
    const aggregated = aggregateData(data, config.xAxis, config.yAxis, config.aggregation || "sum", config.colorBy);

    // Sort
    let sorted = aggregated;
    if (config.sortBy === "value") {
      sorted = sortData(aggregated, "value", config.sortOrder || "desc", config.colorBy ? undefined : config.yAxis);
    } else if (config.sortBy === "label") {
      sorted = sortData(aggregated, "label", config.sortOrder === "desc" ? "desc" : "asc", config.xAxis);
    }

    // Limit
    if (config.limit > 0) {
      sorted = limitData(sorted, config.limit, config.limitDirection || "top", config.colorBy ? undefined : config.yAxis);
    }

    return sorted;
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.xAxis || !config.yAxis) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.
        <br />
        Click ⚙️ to set data source and axes.
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No data available.
      </div>
    );
  }

  // Determine bar keys (for grouped/stacked)
  const isGrouped = config.colorBy && config.colorBy !== config.xAxis;
  const barKeys = isGrouped
    ? [...new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => k !== config.xAxis)))]
    : [config.yAxis];

  const isHorizontal = style.orientation === "horizontal";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey={config.xAxis} type="category" tick={{ fontSize: 11 }} width={80} />
          </>
        ) : (
          <>
            <XAxis dataKey={config.xAxis} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
          </>
        )}
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value) => Number(value).toLocaleString()}
        />
        {style.showLegend !== false && barKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {barKeys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            fill={isGrouped ? getColor(idx) : (style.barColor || "#4F46E5")}
            radius={[4, 4, 0, 0]}
            animationDuration={600}
          >
            {style.showDataLabels && (
              <LabelList dataKey={key} position="top" style={{ fontSize: 10 }} />
            )}
            {!isGrouped &&
              chartData.map((_, i) => (
                <Cell key={i} fill={style.barColor || "#4F46E5"} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
