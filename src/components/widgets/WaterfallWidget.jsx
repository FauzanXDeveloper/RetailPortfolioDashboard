/**
 * WaterfallWidget — Custom waterfall chart using Recharts BarChart.
 */
import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters } from "../../utils/dataProcessing";

export default function WaterfallWidget({ widget }) {
  const { dataSources, currentDashboard } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.dimension || !config.measure) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const agg = aggregateData(data, config.dimension, config.measure, config.aggregation || "sum");

    // Build waterfall data with invisible base bars
    let cumulative = 0;
    const result = agg.map((item) => {
      const val = item[config.measure] || 0;
      const base = cumulative;
      cumulative += val;
      return {
        name: item[config.dimension],
        value: val,
        base: val >= 0 ? base : cumulative,
        display: Math.abs(val),
        isPositive: val >= 0,
      };
    });

    // Add total bar
    if (config.showTotal !== false) {
      result.push({
        name: "Total",
        value: cumulative,
        base: 0,
        display: Math.abs(cumulative),
        isPositive: cumulative >= 0,
        isTotal: true,
      });
    }

    return result;
  }, [dataSources, config, currentDashboard.globalFilters]);

  if (!config.dataSource || !config.dimension || !config.measure) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure dimension and measure fields.</div>;
  }
  if (!chartData?.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, name) => {
            if (name === "base") return null;
            return [Number(value).toLocaleString(), "Value"];
          }}
        />
        <ReferenceLine y={0} stroke="#9ca3af" />
        {/* Invisible base bar */}
        <Bar dataKey="base" stackId="waterfall" fill="transparent" />
        {/* Visible value bar */}
        <Bar dataKey="display" stackId="waterfall" radius={[3, 3, 0, 0]} animationDuration={600}>
          {chartData.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.isTotal ? (style.totalColor || "#6366F1") : entry.isPositive ? (style.positiveColor || "#10B981") : (style.negativeColor || "#EF4444")}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
