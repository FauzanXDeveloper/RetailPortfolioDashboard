/**
 * Line Chart Widget — Renders a Recharts LineChart.
 */
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

export default function LineChartWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const { chartData, lineKeys } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.yAxis) return { chartData: null, lineKeys: [] };

    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    // If groupBy is set, create one line per group value
    if (config.groupBy) {
      const grouped = aggregateData(data, config.xAxis, config.yAxis, config.aggregation || "sum", config.groupBy);
      const keys = [...new Set(grouped.flatMap((d) => Object.keys(d).filter((k) => k !== config.xAxis)))];
      return { chartData: grouped, lineKeys: keys };
    }

    // Simple or multiple lines
    const aggregated = aggregateData(data, config.xAxis, config.yAxis, config.aggregation || "sum");

    // Additional lines: merge them into the same data
    const additionalLines = config.additionalLines || [];
    if (additionalLines.length > 0) {
      const merged = aggregated.map((row) => ({ ...row }));
      additionalLines.forEach((field) => {
        const extraAgg = aggregateData(data, config.xAxis, field, config.aggregation || "sum");
        merged.forEach((row) => {
          const match = extraAgg.find((r) => r[config.xAxis] === row[config.xAxis]);
          if (match) row[field] = match[field];
        });
      });
      return { chartData: merged, lineKeys: [config.yAxis, ...additionalLines] };
    }

    return { chartData: aggregated, lineKeys: [config.yAxis] };
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.xAxis || !config.yAxis) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.<br />Click ⚙️ to set data source and axes.
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>
    );
  }

  const curveType = style.lineStyle === "straight" ? "linear" : style.lineStyle === "step" ? "stepAfter" : "monotone";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey={config.xAxis} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => Number(v).toLocaleString()} />
        {style.showLegend !== false && lineKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {lineKeys.map((key, idx) => (
          <Line
            key={key}
            type={curveType}
            dataKey={key}
            stroke={getColor(idx)}
            strokeWidth={style.lineWidth || 2}
            dot={style.showDataPoints !== false ? { r: 3 } : false}
            animationDuration={600}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
