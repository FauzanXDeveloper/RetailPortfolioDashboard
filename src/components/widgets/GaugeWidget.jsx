/**
 * GaugeWidget — ApexCharts Radial Bar used as a gauge.
 */
import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters, applyCrossFilters } from "../../utils/dataProcessing";

export default function GaugeWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const value = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.metric) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const values = data.map((r) => Number(r[config.metric])).filter((v) => !isNaN(v));
    if (values.length === 0) return null;
    const agg = config.aggregation || "sum";
    if (agg === "sum") return values.reduce((a, b) => a + b, 0);
    if (agg === "average") return values.reduce((a, b) => a + b, 0) / values.length;
    if (agg === "min") return Math.min(...values);
    if (agg === "max") return Math.max(...values);
    if (agg === "count") return values.length;
    return values.reduce((a, b) => a + b, 0);
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.metric) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure data source and metric.</div>;
  }
  if (value === null) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data.</div>;

  const maxVal = config.maxValue || 100;
  const pct = Math.min(100, Math.max(0, (value / maxVal) * 100));

  const getColor = (p) => {
    if (p >= 75) return style.highColor || "#10B981";
    if (p >= 50) return style.midColor || "#F59E0B";
    return style.lowColor || "#EF4444";
  };

  const options = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "60%" },
        track: { background: "#e5e7eb", strokeWidth: "100%" },
        dataLabels: {
          name: { fontSize: "12px", color: "#6b7280", offsetY: -10 },
          value: {
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
            formatter: () => Number(value).toLocaleString(),
          },
        },
      },
    },
    labels: [config.metric],
    colors: [getColor(pct)],
    stroke: { lineCap: "round" },
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Chart options={options} series={[pct]} type="radialBar" height="100%" width="100%" />
    </div>
  );
}
