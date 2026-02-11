/**
 * Pie / Donut Chart Widget — Recharts PieChart.
 */
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

const RADIAN = Math.PI / 180;

/** Custom label renderer showing name + percentage + value */
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, showPercentages, showLabels, showValues, labelFontSize }) {
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const parts = [];
  if (showLabels) parts.push(name);
  if (showValues) parts.push(Number(value).toLocaleString());
  if (showPercentages) parts.push(`${(percent * 100).toFixed(1)}%`);

  return (
    <text x={x} y={y} fill="#374151" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={labelFontSize || 11}>
      {parts.join(" · ")}
    </text>
  );
}

/** Inside label renderer */
function renderInsideLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, showPercentages, showValues, labelFontSize }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const parts = [];
  if (showValues) parts.push(Number(value).toLocaleString());
  if (showPercentages) parts.push(`${(percent * 100).toFixed(0)}%`);

  if (percent < 0.05) return null; // Don't show label for tiny slices

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={labelFontSize || 11} fontWeight="bold">
      {parts.join(" ")}
    </text>
  );
}

export default function PieChartWidget({ widget }) {
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

    let aggregated = aggregateData(data, config.dimension, config.measure, config.aggregation || "sum");

    // Sort descending by measure value
    aggregated.sort((a, b) => (b[config.measure] || 0) - (a[config.measure] || 0));

    // Limit slices
    if (config.limitSlices && aggregated.length > config.limitSlices) {
      const top = aggregated.slice(0, config.limitSlices);
      if (config.combineOthers) {
        const otherSum = aggregated.slice(config.limitSlices).reduce((sum, r) => sum + (r[config.measure] || 0), 0);
        top.push({ [config.dimension]: "Others", [config.measure]: otherSum });
      }
      aggregated = top;
    }

    return aggregated.map((row) => ({
      name: row[config.dimension],
      value: row[config.measure] || 0,
    }));
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.dimension || !config.measure) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.
      </div>
    );
  }
  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;
  }

  const isDonut = style.chartType === "donut";
  const innerRadius = isDonut ? (style.donutThickness || 60) : 0;
  const labelFontSize = { small: 9, medium: 11, large: 13, xlarge: 16 }[style.labelFontSize || "medium"] || 11;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={isDonut ? `${innerRadius}%` : 0}
          outerRadius="75%"
          paddingAngle={style.paddingAngle ?? 2}
          dataKey="value"
          nameKey="name"
          animationDuration={600}
          startAngle={style.startAngle ?? 0}
          endAngle={style.endAngle ?? 360}
          label={
            style.labelPosition === "inside"
              ? (style.showValues || style.showPercentages)
                ? (props) => renderInsideLabel({ ...props, showValues: style.showValues, showPercentages: style.showPercentages, labelFontSize })
                : undefined
              : (style.showLabels || style.showPercentages || style.showValues)
                ? (props) => renderCustomLabel({ ...props, showLabels: style.showLabels, showPercentages: style.showPercentages, showValues: style.showValues, labelFontSize })
                : undefined
          }
          labelLine={style.labelPosition !== "inside" && (style.showLabels || style.showPercentages || style.showValues)}
        >
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={getColor(idx, style.colorScheme)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => Number(value).toLocaleString()}
          contentStyle={{ fontSize: labelFontSize, borderRadius: 8 }}
        />
        {style.showLegend !== false && (
          <Legend
            wrapperStyle={{ fontSize: labelFontSize - 1 }}
            verticalAlign={style.legendPosition === "top" ? "top" : "bottom"}
            layout={style.legendLayout || "horizontal"}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
