/**
 * FunnelWidget — Recharts-based funnel chart.
 */
import React, { useMemo } from "react";
import { ResponsiveContainer, Tooltip, Funnel, FunnelChart, LabelList, Cell } from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor, formatNumber, buildChartMargin, buildDataLabelStyle, buildDataLabelContent, buildTooltipStyle } from "../../utils/chartHelpers";

export default function FunnelWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.dimension || !config.measure) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const agg = aggregateData(data, config.dimension, config.measure, config.aggregation || "sum");
    // Sort descending for funnel
    return agg.sort((a, b) => (b[config.measure] || 0) - (a[config.measure] || 0)).map((item, idx) => ({
      name: item[config.dimension],
      value: item[config.measure],
      fill: getColor(idx),
    }));
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.dimension || !config.measure) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure dimension and measure fields.</div>;
  }
  if (!chartData?.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  // Compute total for percentage
  const total = chartData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const labelStyle = buildDataLabelStyle(style);

  // Custom label renderer for funnel
  const renderFunnelLabel = (props) => {
    const { x, y, width, height, value, name } = props;
    const percent = total > 0 ? (value / total) * 100 : null;
    const text = buildDataLabelContent({ value, category: name, percent, seriesName: null, style });
    if (!text) return null;
    const lines = text.split("\n");
    const fontSize = labelStyle.fontSize || 11;
    const cx = x + width / 2;
    const cy = y + height / 2;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fill={labelStyle.fill || "#fff"} fontSize={fontSize}
        fontWeight={labelStyle.fontWeight || 600} fontStyle={labelStyle.fontStyle || "normal"}
        fontFamily={labelStyle.fontFamily}>
        {lines.map((line, i) => (
          <tspan key={i} x={cx} dy={i === 0 ? -(lines.length - 1) * fontSize * 0.5 : fontSize * 1.2}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart margin={buildChartMargin(style, { top: 10, right: 10, left: 10, bottom: 10 })}>
        <Tooltip contentStyle={buildTooltipStyle(style)} formatter={(v) => formatNumber(v, style)} />
        <Funnel dataKey="value" data={chartData} isAnimationActive animationDuration={600}>
          {(style.showLabels !== false || style.showDataLabels) && (
            <LabelList position="center" content={renderFunnelLabel} />
          )}
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
