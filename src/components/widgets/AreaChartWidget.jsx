/**
 * Area Chart Widget — Recharts AreaChart with stacking support.
 */
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
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

export default function AreaChartWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const { chartData, areaKeys } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.yAxis) return { chartData: null, areaKeys: [] };

    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    if (config.groupBy) {
      const grouped = aggregateData(data, config.xAxis, config.yAxis, config.aggregation || "sum", config.groupBy);
      const keys = [...new Set(grouped.flatMap((d) => Object.keys(d).filter((k) => k !== config.xAxis)))];
      return { chartData: grouped, areaKeys: keys };
    }

    const aggregated = aggregateData(data, config.xAxis, config.yAxis, config.aggregation || "sum");
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
      return { chartData: merged, areaKeys: [config.yAxis, ...additionalLines] };
    }

    return { chartData: aggregated, areaKeys: [config.yAxis] };
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.xAxis || !config.yAxis) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.
      </div>
    );
  }
  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;
  }

  const stackId = style.stacking === "normal" || style.stacking === "percentage" ? "stack" : undefined;
  const curveType = style.lineStyle === "straight" ? "linear" : style.lineStyle === "step" ? "stepAfter" : "monotone";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey={config.xAxis} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => Number(v).toLocaleString()} />
        {style.showLegend !== false && areaKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {areaKeys.map((key, idx) => (
          <Area
            key={key}
            type={curveType}
            dataKey={key}
            stroke={getColor(idx)}
            fill={getColor(idx)}
            fillOpacity={style.areaOpacity ?? 0.4}
            strokeWidth={style.lineWidth || 2}
            stackId={stackId}
            dot={style.showDataPoints ? { r: 3 } : false}
            animationDuration={600}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
