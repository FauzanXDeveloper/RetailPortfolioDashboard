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

  // Font size mapping
  const fontSizeMap = { small: 9, medium: 11, large: 13, xlarge: 16 };
  const fontSize = fontSizeMap[style.fontSize || "medium"] || 11;
  const labelAngle = style.xAxisLabelAngle || 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
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
              tick={{ fontSize, fill: style.axisColor || "#6b7280" }}
              tickFormatter={style.showValueFormatted ? (v) => Number(v).toLocaleString() : undefined}
              label={style.showAxisTitles && style.xAxisTitle ? { value: style.xAxisTitle, position: "insideBottom", offset: -5, fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
            <YAxis
              dataKey={config.xAxis}
              type="category"
              tick={{ fontSize, fill: style.axisColor || "#6b7280" }}
              width={style.yAxisWidth || 80}
              label={style.showAxisTitles && style.yAxisTitle ? { value: style.yAxisTitle, angle: -90, position: "insideLeft", fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={config.xAxis}
              tick={{ fontSize, fill: style.axisColor || "#6b7280", angle: labelAngle, textAnchor: labelAngle ? "end" : "middle" }}
              height={labelAngle ? 60 : undefined}
              interval={style.xAxisInterval === "all" ? 0 : undefined}
              label={style.showAxisTitles && style.xAxisTitle ? { value: style.xAxisTitle, position: "insideBottom", offset: labelAngle ? -30 : -5, fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
            <YAxis
              tick={{ fontSize, fill: style.axisColor || "#6b7280" }}
              tickFormatter={style.showValueFormatted ? (v) => Number(v).toLocaleString() : undefined}
              width={style.yAxisWidth || 60}
              label={style.showAxisTitles && style.yAxisTitle ? { value: style.yAxisTitle, angle: -90, position: "insideLeft", fontSize: fontSize - 1, fill: style.axisColor || "#6b7280" } : undefined}
            />
          </>
        )}
        <Tooltip
          contentStyle={{ fontSize, borderRadius: 8, backgroundColor: style.tooltipBg || "#fff", border: "1px solid #e5e7eb" }}
          formatter={(value) => Number(value).toLocaleString()}
        />
        {style.showLegend !== false && barKeys.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: fontSize - 1 }}
            verticalAlign={style.legendPosition === "top" ? "top" : "bottom"}
            align={style.legendAlign || "center"}
          />
        )}
        {barKeys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            fill={isGrouped ? getColor(idx) : (style.barColor || "#4F46E5")}
            radius={style.barRadius != null ? [style.barRadius, style.barRadius, 0, 0] : [4, 4, 0, 0]}
            animationDuration={600}
            barSize={style.barWidth || undefined}
            stackId={style.stacking ? "stack" : undefined}
          >
            {style.showDataLabels && (
              <LabelList
                dataKey={key}
                position={style.dataLabelPosition || "top"}
                style={{
                  fontSize: style.dataLabelSize || 10,
                  fill: style.dataLabelColor || "#374151",
                  fontWeight: style.dataLabelBold ? "bold" : "normal",
                }}
                formatter={(v) => style.showValueFormatted ? Number(v).toLocaleString() : v}
              />
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
