/**
 * RadarWidget — Recharts Radar chart.
 */
import React, { useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

export default function RadarWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const { chartData, seriesKeys } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.dimension || !config.measures?.length) return { chartData: null, seriesKeys: [] };
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    // Multi-measure: aggregate each measure by dimension
    const dimensions = [...new Set(data.map((r) => String(r[config.dimension])))];
    const result = dimensions.map((dim) => {
      const row = { subject: dim };
      const dimRows = data.filter((r) => String(r[config.dimension]) === dim);
      config.measures.forEach((m) => {
        const vals = dimRows.map((r) => Number(r[m]) || 0);
        row[m] = vals.length ? vals.reduce((a, b) => a + b, 0) / (config.aggregation === "average" ? vals.length : 1) : 0;
      });
      return row;
    });

    return { chartData: result, seriesKeys: config.measures };
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.dimension || !config.measures?.length) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure dimension and measures.</div>;
  }
  if (!chartData?.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis tick={{ fontSize: 9 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        {style.showLegend !== false && seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {seriesKeys.map((key, idx) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={getColor(idx)}
            fill={getColor(idx)}
            fillOpacity={style.fillOpacity ?? 0.3}
            animationDuration={600}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
