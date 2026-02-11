/**
 * ComboWidget — Recharts Composed chart (Bar + Line combined).
 */
import React, { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

export default function ComboWidget({ widget }) {
  const { dataSources, currentDashboard } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.barMeasure) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
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
  }, [dataSources, config, currentDashboard.globalFilters]);

  if (!config.dataSource || !config.xAxis || !config.barMeasure) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure X-Axis and measures.</div>;
  }
  if (!chartData?.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey={config.xAxis} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
        {config.lineMeasure && config.lineMeasure !== config.barMeasure && (
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
        )}
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => Number(v).toLocaleString()} />
        {style.showLegend !== false && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Bar yAxisId="left" dataKey={config.barMeasure} fill={style.barColor || getColor(0)} radius={[4, 4, 0, 0]} animationDuration={600} />
        {config.lineMeasure && (
          <Line
            yAxisId={config.lineMeasure !== config.barMeasure ? "right" : "left"}
            type="monotone"
            dataKey={config.lineMeasure}
            stroke={style.lineColor || getColor(1)}
            strokeWidth={2}
            dot={{ r: 3 }}
            animationDuration={600}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
