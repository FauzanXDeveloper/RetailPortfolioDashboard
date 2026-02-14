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
  LabelList,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, sortData, applyGlobalFilters, limitData, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor, formatNumber, buildTooltipStyle, buildLabelListProps } from "../../utils/chartHelpers";

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

    // Merge additional measures
    if (config.additionalMeasures?.length > 0 && !config.colorBy) {
      config.additionalMeasures.forEach((measure) => {
        const extra = aggregateData(data, config.xAxis, measure, config.aggregation || "sum");
        aggregated.forEach((row) => {
          const match = extra.find((r) => r[config.xAxis] === row[config.xAxis]);
          if (match) row[measure] = match[measure];
        });
      });
    }

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

  // Determine bar keys (for grouped/stacked)
  const isGrouped = config.colorBy && config.colorBy !== config.xAxis;
  const barKeys = useMemo(() => {
    if (!chartData) return [config.yAxis];
    return isGrouped
      ? [...new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => k !== config.xAxis)))]
      : [config.yAxis, ...(config.additionalMeasures || [])].filter(Boolean);
  }, [chartData, isGrouped, config.xAxis, config.yAxis, config.additionalMeasures]);

  // 100% stacked: normalize data to percentages
  const displayData = useMemo(() => {
    if (!chartData || !style.stackPercent || barKeys.length <= 1) return chartData;
    return chartData.map((row) => {
      const total = barKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
      if (!total) return row;
      const nr = { ...row };
      barKeys.forEach((k) => { nr[k] = ((Number(row[k]) || 0) / total) * 100; });
      return nr;
    });
  }, [chartData, style.stackPercent, barKeys]);

  if (!config.dataSource || !config.xAxis || !config.yAxis) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.
        <br />
        Click ⚙️ to set data source and axes.
      </div>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No data available.
      </div>
    );
  }

  const isHorizontal = style.orientation === "horizontal";

  // Font size mapping
  const fontSizeMap = { small: 9, medium: 11, large: 13, xlarge: 16 };
  const fontSize = fontSizeMap[style.fontSize || "medium"] || 11;
  const labelAngle = style.xAxisLabelAngle || 0;
  const axisFontMap = { default: "inherit", serif: "Georgia, serif", mono: "ui-monospace, monospace", condensed: "'Arial Narrow', sans-serif" };
  const axisFontFamily = axisFontMap[style.axisFontFamily || "default"] || "inherit";
  const axisFontWeight = style.axisBold ? "bold" : "normal";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={displayData}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{
          top: style.marginTop ?? 5,
          right: style.marginRight ?? 20,
          left: style.marginLeft ?? 10,
          bottom: labelAngle !== 0 ? 40 : (style.marginBottom ?? 5),
        }}
      >
        {style.showGridLines !== false && (
          <CartesianGrid
            strokeDasharray={style.gridDashArray || "3 3"}
            stroke={style.gridColor || "#e5e7eb"}
            horizontal={style.gridHorizontal !== false}
            vertical={style.gridVertical !== false}
          />
        )}
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize, fill: style.axisColor || "#6b7280", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
              tickFormatter={(v) => formatNumber(v, style)}
              label={style.showAxisTitles && style.xAxisTitle ? { value: style.xAxisTitle, position: "insideBottom", offset: -5, fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
            <YAxis
              dataKey={config.xAxis}
              type="category"
              tick={{ fontSize, fill: style.axisColor || "#6b7280", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
              width={style.yAxisWidth || 80}
              label={style.showAxisTitles && style.yAxisTitle ? { value: style.yAxisTitle, angle: -90, position: "insideLeft", fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={config.xAxis}
              tick={{ fontSize, fill: style.axisColor || "#6b7280", angle: labelAngle, textAnchor: labelAngle ? "end" : "middle", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
              height={labelAngle ? 60 : undefined}
              interval={style.xAxisInterval === "all" ? 0 : undefined}
              label={style.showAxisTitles && style.xAxisTitle ? { value: style.xAxisTitle, position: "insideBottom", offset: labelAngle ? -30 : -5, fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
            <YAxis
              tick={{ fontSize, fill: style.axisColor || "#6b7280", fontFamily: axisFontFamily, fontWeight: axisFontWeight }}
              tickFormatter={(v) => formatNumber(v, style)}
              width={style.yAxisWidth || 60}
              label={style.showAxisTitles && style.yAxisTitle ? { value: style.yAxisTitle, angle: -90, position: "insideLeft", fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
          </>
        )}
        <Tooltip
          contentStyle={buildTooltipStyle(style)}
          formatter={(value) => style.stackPercent ? `${Number(value).toFixed(1)}%` : formatNumber(value, style)}
        />
        {style.showLegend !== false && barKeys.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: fontSize - 1 }}
            verticalAlign={style.legendPosition === "top" ? "top" : "bottom"}
            align={style.legendAlign || "center"}
            layout={style.legendLayout || "horizontal"}
          />
        )}
        {barKeys.map((key, idx) => {
          // Use per-series custom color, else palette color, else single barColor for 1-series
          const seriesColors = style.seriesColors || {};
          const seriesColor = seriesColors[key] || (barKeys.length > 1 ? getColor(idx) : (style.barColor || "#1a3ab5"));

          // Pre-compute percentage map for this series
          const percentMap = (() => {
            if (!style.labelShowPercentage || !displayData) return null;
            const map = {};
            if (style.stacking) {
              displayData.forEach((row) => {
                const stackTotal = barKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
                const cat = row[config.xAxis];
                map[`${key}::${cat}`] = stackTotal > 0 ? ((Number(row[key]) || 0) / stackTotal) * 100 : null;
              });
            } else {
              const seriesTotal = displayData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
              displayData.forEach((row) => {
                const cat = row[config.xAxis];
                map[`${key}::${cat}`] = seriesTotal > 0 ? ((Number(row[key]) || 0) / seriesTotal) * 100 : null;
              });
            }
            return map;
          })();

          const labelProps = buildLabelListProps(style, key, { seriesName: key, xAxisKey: config.xAxis, percentMap });

          return (
            <Bar
              key={key}
              dataKey={key}
              fill={seriesColor}
              radius={style.barRadius != null ? [style.barRadius, style.barRadius, 0, 0] : [4, 4, 0, 0]}
              animationDuration={600}
              barSize={style.barWidth || undefined}
              stackId={style.stacking ? "stack" : undefined}
            >
              {labelProps && <LabelList {...labelProps} />}
            </Bar>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}
