/**
 * HeatmapWidget — ApexCharts Heatmap.
 */
import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters } from "../../utils/dataProcessing";

export default function HeatmapWidget({ widget }) {
  const { dataSources, currentDashboard } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const { series, categories } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.xAxis || !config.yAxis || !config.valueField) return { series: [], categories: [] };
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const xValues = [...new Set(data.map((r) => String(r[config.xAxis])))];
    const yValues = [...new Set(data.map((r) => String(r[config.yAxis])))];

    const matrix = {};
    data.forEach((r) => {
      const y = String(r[config.yAxis]);
      const x = String(r[config.xAxis]);
      if (!matrix[y]) matrix[y] = {};
      matrix[y][x] = (matrix[y][x] || 0) + (Number(r[config.valueField]) || 0);
    });

    const series = yValues.map((y) => ({
      name: y,
      data: xValues.map((x) => matrix[y]?.[x] || 0),
    }));

    return { series, categories: xValues };
  }, [dataSources, config, currentDashboard.globalFilters]);

  if (!config.dataSource || !config.xAxis || !config.yAxis || !config.valueField) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure X-Axis, Y-Axis, and Value fields.</div>;
  }
  if (series.length === 0) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  const options = {
    chart: { type: "heatmap", toolbar: { show: false } },
    dataLabels: { enabled: style.showDataLabels !== false, style: { fontSize: "10px" } },
    colors: [style.color || "#4F46E5"],
    xaxis: { categories, labels: { style: { fontSize: "10px" } } },
    plotOptions: { heatmap: { radius: 2, shadeIntensity: 0.5 } },
    tooltip: { style: { fontSize: "11px" } },
  };

  return (
    <div className="w-full h-full">
      <Chart options={options} series={series} type="heatmap" height="100%" />
    </div>
  );
}
