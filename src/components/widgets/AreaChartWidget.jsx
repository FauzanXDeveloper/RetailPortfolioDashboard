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
import { getColor, formatNumber, buildTooltipStyle, buildLabelListProps } from "../../utils/chartHelpers";

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
  const fontSizeMap = { small: 9, medium: 11, large: 13, xlarge: 16 };
  const fontSize = fontSizeMap[style.fontSize || "medium"] || 11;
  const labelAngle = style.xAxisLabelAngle || 0;
  const axisFontMap = { default: "inherit", serif: "Georgia, serif", mono: "ui-monospace, monospace", condensed: "'Arial Narrow', sans-serif" };
  const axisFontFamily = axisFontMap[style.axisFontFamily || "default"] || "inherit";
  const axisFontWeight = style.axisBold ? "bold" : "normal";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: labelAngle !== 0 ? 40 : 5 }}>
        {style.showGridLines !== false && (
          <CartesianGrid strokeDasharray={style.gridDashArray || "3 3"} stroke={style.gridColor || "#e5e7eb"} />
        )}
        <XAxis
          dataKey={config.xAxis}
          tick={{ fontSize, fill: style.axisColor || "#6b7280", angle: labelAngle, textAnchor: labelAngle ? "end" : "middle", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
          height={labelAngle ? 60 : undefined}
          label={style.showAxisTitles && style.xAxisTitle ? { value: style.xAxisTitle, position: "insideBottom", offset: -5, fontSize: fontSize - 1 } : undefined}
        />
        <YAxis
          tick={{ fontSize, fill: style.axisColor || "#6b7280", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
          tickFormatter={(v) => formatNumber(v, style)}
          label={style.showAxisTitles && style.yAxisTitle ? { value: style.yAxisTitle, angle: -90, position: "insideLeft", fontSize: fontSize - 1 } : undefined}
        />
        <Tooltip contentStyle={buildTooltipStyle(style)} formatter={(v) => formatNumber(v, style)} />
        {style.showLegend !== false && areaKeys.length > 1 && (
          <Legend wrapperStyle={{ fontSize: fontSize - 1 }} verticalAlign={style.legendPosition === "top" ? "top" : "bottom"} layout={style.legendLayout || "horizontal"} />
        )}
        {areaKeys.map((key, idx) => {
          const seriesColors = style.seriesColors || {};
          const areaColor = seriesColors[key] || getColor(idx);

          // Pre-compute percentage map
          const percentMap = (() => {
            if (!style.labelShowPercentage || !chartData) return null;
            const map = {};
            if (stackId) {
              chartData.forEach((row) => {
                const stackTotal = areaKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
                const cat = row[config.xAxis];
                map[`${key}::${cat}`] = stackTotal > 0 ? ((Number(row[key]) || 0) / stackTotal) * 100 : null;
              });
            } else {
              const seriesTotal = chartData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
              chartData.forEach((row) => {
                const cat = row[config.xAxis];
                map[`${key}::${cat}`] = seriesTotal > 0 ? ((Number(row[key]) || 0) / seriesTotal) * 100 : null;
              });
            }
            return map;
          })();

          const labelProps = buildLabelListProps(style, key, { seriesName: key, xAxisKey: config.xAxis, percentMap });

          return (
            <Area
              key={key}
              type={curveType}
              dataKey={key}
              stroke={areaColor}
              fill={areaColor}
              fillOpacity={style.areaOpacity ?? 0.4}
              strokeWidth={style.lineWidth || 2}
              stackId={stackId}
              dot={style.showDataPoints ? { r: style.dotSize || 3 } : false}
              animationDuration={600}
              label={labelProps || false}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
