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
import { getColor, formatNumber, buildTooltipStyle, buildDataLabelStyle, buildDataLabelContent } from "../../utils/chartHelpers";

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
  const fontSizeMap = { small: 9, medium: 11, large: 13, xlarge: 16 };
  const fontSize = fontSizeMap[style.fontSize || "medium"] || 11;
  const labelAngle = style.xAxisLabelAngle || 0;
  const axisFontMap = { default: "inherit", serif: "Georgia, serif", mono: "ui-monospace, monospace", condensed: "'Arial Narrow', sans-serif" };
  const axisFontFamily = axisFontMap[style.axisFontFamily || "default"] || "inherit";
  const axisFontWeight = style.axisBold ? "bold" : "normal";
  const isSparkline = style.sparkline || style.subtype === "sparkline";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: isSparkline ? 5 : 20, left: isSparkline ? 5 : 10, bottom: labelAngle !== 0 ? 40 : 5 }}>
        {style.showGridLines !== false && !isSparkline && (
          <CartesianGrid
            strokeDasharray={style.gridDashArray || "3 3"}
            stroke={style.gridColor || "#e5e7eb"}
          />
        )}
        <XAxis
          dataKey={config.xAxis}
          tick={isSparkline ? false : { fontSize, fill: style.axisColor || "#6b7280", angle: labelAngle, textAnchor: labelAngle ? "end" : "middle", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
          hide={isSparkline}
          height={labelAngle ? 60 : undefined}
          interval={style.xAxisInterval === "all" ? 0 : undefined}
          label={style.showAxisTitles && style.xAxisTitle && !isSparkline ? { value: style.xAxisTitle, position: "insideBottom", offset: -5, fontSize: fontSize - 1 } : undefined}
        />
        <YAxis
          tick={isSparkline ? false : { fontSize, fill: style.axisColor || "#6b7280", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
          hide={isSparkline}
          tickFormatter={(v) => formatNumber(v, style)}
          label={style.showAxisTitles && style.yAxisTitle && !isSparkline ? { value: style.yAxisTitle, angle: -90, position: "insideLeft", fontSize: fontSize - 1 } : undefined}
        />
        <Tooltip contentStyle={buildTooltipStyle(style)} formatter={(v) => formatNumber(v, style)} />
        {style.showLegend !== false && lineKeys.length > 1 && (
          <Legend wrapperStyle={{ fontSize: fontSize - 1 }} verticalAlign={style.legendPosition === "top" ? "top" : "bottom"} />
        )}
        {lineKeys.map((key, idx) => (
          <Line
            key={key}
            type={curveType}
            dataKey={key}
            stroke={getColor(idx)}
            strokeWidth={style.lineWidth || 2}
            dot={style.showDataPoints !== false ? { r: style.dotSize || 3, fill: getColor(idx) } : false}
            strokeDasharray={style.lineDashArray || undefined}
            animationDuration={600}
            label={style.showDataLabels ? {
              position: style.dataLabelPosition || "top",
              ...buildDataLabelStyle(style),
              formatter: (v) => buildDataLabelContent({ value: v, seriesName: key, style }),
            } : false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
