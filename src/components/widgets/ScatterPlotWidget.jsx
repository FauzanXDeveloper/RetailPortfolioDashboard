/**
 * ScatterPlotWidget — Renders a Recharts ScatterChart.
 */
import React, { useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ZAxis,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor, buildChartMargin, buildLegendProps } from "../../utils/chartHelpers";

export default function ScatterPlotWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.yAxis) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    // Group by colorBy if specified
    if (config.colorBy) {
      const groups = {};
      data.forEach((row) => {
        const key = String(row[config.colorBy] || "Other");
        if (!groups[key]) groups[key] = [];
        groups[key].push({
          x: Number(row[config.xAxis]) || 0,
          y: Number(row[config.yAxis]) || 0,
          z: config.sizeField ? Number(row[config.sizeField]) || 1 : 1,
          name: row[config.colorBy],
        });
      });
      return groups;
    }

    return {
      All: data.map((row) => ({
        x: Number(row[config.xAxis]) || 0,
        y: Number(row[config.yAxis]) || 0,
        z: config.sizeField ? Number(row[config.sizeField]) || 1 : 1,
      })),
    };
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.xAxis || !config.yAxis) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure this widget to see data.<br />Click ⚙️ to set data source and axes.</div>;
  }
  if (!chartData) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  const groups = Object.entries(chartData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={buildChartMargin(style, { top: 10 })}>
        {style.showGridLines !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis type="number" dataKey="x" name={config.xAxis} tick={{ fontSize: 11 }} />
        <YAxis type="number" dataKey="y" name={config.yAxis} tick={{ fontSize: 11 }} />
        <ZAxis type="number" dataKey="z" range={[40, 400]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        {style.showLegend !== false && groups.length > 1 && <Legend {...buildLegendProps(style)} />}
        {groups.map(([name, data], idx) => (
          <Scatter key={name} name={name} data={data} fill={getColor(idx)} fillOpacity={0.7} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
