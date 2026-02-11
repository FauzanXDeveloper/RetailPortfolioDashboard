/**
 * FunnelWidget — Recharts-based funnel chart.
 */
import React, { useMemo } from "react";
import { ResponsiveContainer, Tooltip, Funnel, FunnelChart, LabelList, Cell } from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => Number(v).toLocaleString()} />
        <Funnel dataKey="value" data={chartData} isAnimationActive animationDuration={600}>
          {style.showLabels !== false && <LabelList position="center" fill="#fff" stroke="none" style={{ fontSize: 11, fontWeight: 600 }} dataKey="name" />}
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
