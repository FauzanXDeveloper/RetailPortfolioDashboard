/**
 * TreemapWidget — Recharts Treemap.
 */
import React, { useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, aggregateData, applyGlobalFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

const CustomContent = ({ x, y, width, height, name, value, index }) => {
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={getColor(index)} stroke="#fff" strokeWidth={2} rx={3} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
            {name?.length > 12 ? name.slice(0, 12) + "…" : name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#ffffffcc" fontSize={9}>
            {Number(value).toLocaleString()}
          </text>
        </>
      )}
    </g>
  );
};

export default function TreemapWidget({ widget }) {
  const { dataSources, currentDashboard } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);

  const chartData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.dimension || !config.measure) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const agg = aggregateData(data, config.dimension, config.measure, config.aggregation || "sum");
    return agg
      .filter((item) => (item[config.measure] || 0) > 0)
      .map((item, idx) => ({
        name: item[config.dimension],
        size: item[config.measure],
      }));
  }, [dataSources, config, currentDashboard.globalFilters]);

  if (!config.dataSource || !config.dimension || !config.measure) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure dimension and measure fields.</div>;
  }
  if (!chartData?.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={chartData}
        dataKey="size"
        nameKey="name"
        content={<CustomContent />}
        animationDuration={600}
      >
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v) => Number(v).toLocaleString()}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
