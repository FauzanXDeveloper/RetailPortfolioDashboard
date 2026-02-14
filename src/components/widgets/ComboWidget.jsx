/**
 * ComboWidget — Recharts Composed chart (Bar + Line combined).
 */
import React, { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor, formatNumber, buildTooltipStyle, buildLabelListProps, buildChartMargin, buildLegendProps } from "../../utils/chartHelpers";

export default function ComboWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.barMeasure) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    // Aggregate bar measure
    const agg = aggregateData(data, config.xAxis, config.barMeasure, config.aggregation || "sum");

    // If line measure is different, aggregate and merge
    if (config.lineMeasure && config.lineMeasure !== config.barMeasure) {
      const lineAgg = aggregateData(data, config.xAxis, config.lineMeasure, config.lineAggregation || "average");
      const lineMap = {};
      lineAgg.forEach((item) => { lineMap[item[config.xAxis]] = item[config.lineMeasure]; });
      return agg.map((item) => ({
        ...item,
        [config.lineMeasure]: lineMap[item[config.xAxis]] || 0,
      }));
    }

    return agg;
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.xAxis || !config.barMeasure) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure X-Axis and measures.</div>;
  }
  if (!chartData?.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={buildChartMargin(style, { top: 10 })}>
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke={style.gridColor || "#e5e7eb"} />}
        <XAxis dataKey={config.xAxis} tick={{ fontSize: 11, fill: style.axisColor || "#6b7280" }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: style.axisColor || "#6b7280" }} tickFormatter={(v) => formatNumber(v, style)} />
        {config.lineMeasure && config.lineMeasure !== config.barMeasure && (
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: style.axisColor || "#6b7280" }} tickFormatter={(v) => formatNumber(v, style)} />
        )}
        <Tooltip contentStyle={buildTooltipStyle(style)} formatter={(v) => formatNumber(v, style)} />
        {style.showLegend !== false && <Legend {...buildLegendProps(style)} />}
        {(() => {
          // Pre-compute percentage map for bar measure (always compute when showDataLabels is true)
          const barPercentMap = (() => {
            if (!style.showDataLabels || !chartData) return null;
            const map = {};
            const barTotal = chartData.reduce((sum, row) => sum + (Number(row[config.barMeasure]) || 0), 0);
            chartData.forEach((row) => {
              const cat = row[config.xAxis];
              map[`${config.barMeasure}::${cat}`] = barTotal > 0 ? ((Number(row[config.barMeasure]) || 0) / barTotal) * 100 : null;
            });
            return map;
          })();
          const barLabelProps = buildLabelListProps(style, config.barMeasure, { seriesName: config.barMeasure, xAxisKey: config.xAxis, percentMap: barPercentMap });
          return (
            <Bar yAxisId="left" dataKey={config.barMeasure} fill={style.barColor || getColor(0)} radius={[4, 4, 0, 0]} animationDuration={600}>
              {barLabelProps && <LabelList {...barLabelProps} />}
            </Bar>
          );
        })()}
        {config.lineMeasure && (() => {
          // Pre-compute percentage map for line measure (always compute when showDataLabels is true)
          const linePercentMap = (() => {
            if (!style.showDataLabels || !chartData) return null;
            const map = {};
            const lineTotal = chartData.reduce((sum, row) => sum + (Number(row[config.lineMeasure]) || 0), 0);
            chartData.forEach((row) => {
              const cat = row[config.xAxis];
              map[`${config.lineMeasure}::${cat}`] = lineTotal > 0 ? ((Number(row[config.lineMeasure]) || 0) / lineTotal) * 100 : null;
            });
            return map;
          })();
          const lineLabelProps = buildLabelListProps(style, config.lineMeasure, { seriesName: config.lineMeasure, xAxisKey: config.xAxis, percentMap: linePercentMap });
          return (
            <Line
              yAxisId={config.lineMeasure !== config.barMeasure ? "right" : "left"}
              type="monotone"
              dataKey={config.lineMeasure}
              stroke={style.lineColor || getColor(1)}
              strokeWidth={2}
              dot={{ r: 3 }}
              animationDuration={600}
              label={lineLabelProps || false}
            />
          );
        })()}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
