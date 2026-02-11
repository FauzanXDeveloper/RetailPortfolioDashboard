/**
 * BoxPlotWidget — ApexCharts BoxPlot (candlestick-style).
 */
import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters } from "../../utils/dataProcessing";

function quartiles(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  const q = (p) => {
    const pos = (n - 1) * p;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  };
  return {
    min: sorted[0],
    q1: q(0.25),
    median: q(0.5),
    q3: q(0.75),
    max: sorted[n - 1],
  };
}

export default function BoxPlotWidget({ widget }) {
  const { dataSources, currentDashboard } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const { series } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.dimension || !config.measure) return { series: [], categories: [] };
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const groups = {};
    data.forEach((r) => {
      const key = String(r[config.dimension]);
      if (!groups[key]) groups[key] = [];
      const v = Number(r[config.measure]);
      if (!isNaN(v)) groups[key].push(v);
    });

    const cats = Object.keys(groups);
    const boxData = cats.map((cat) => {
      const q = quartiles(groups[cat]);
      return { x: cat, y: [q.min, q.q1, q.median, q.q3, q.max] };
    });

    return {
      series: [{ name: config.measure, data: boxData }],
      categories: cats,
    };
  }, [dataSources, config, currentDashboard.globalFilters]);

  if (!config.dataSource || !config.dimension || !config.measure) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure dimension and measure fields.</div>;
  }
  if (series.length === 0 || series[0].data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;
  }

  const options = {
    chart: { type: "boxPlot", toolbar: { show: false } },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: style.upperColor || "#4F46E5",
          lower: style.lowerColor || "#10B981",
        },
      },
    },
    xaxis: { labels: { style: { fontSize: "10px" } } },
    yaxis: { labels: { style: { fontSize: "10px" } } },
    tooltip: { style: { fontSize: "11px" } },
  };

  return (
    <div className="w-full h-full">
      <Chart options={options} series={series} type="boxPlot" height="100%" />
    </div>
  );
}
