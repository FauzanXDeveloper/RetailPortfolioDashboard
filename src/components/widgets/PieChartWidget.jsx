/**
 * Pie / Donut Chart Widget — Recharts PieChart.
 * Reads label/legend/display settings from unified WidgetStyleConfig keys.
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
import { getColor, formatNumber, buildTooltipStyle, buildDataLabelStyle } from "../../utils/chartHelpers";

const RADIAN = Math.PI / 180;

const SEPARATOR_MAP = {
  newline: "\n",
  comma: ", ",
  space: " ",
  dash: " — ",
  pipe: " | ",
  semicolon: "; ",
};

/**
 * Custom label renderer that supports newline separator via <tspan>.
 * Reads from unified WidgetStyleConfig keys.
 */
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, style: _s, ...extra }) {
  const s = extra.widgetStyle || {};
  const labelStyle = extra.labelStyle || {};
  const isInside = extra.isInside;

  // Determine which parts to show from unified keys
  const showCategory = s.labelShowCategory ?? (s.showLabels ?? true);    // fallback for legacy
  const showValue    = s.labelShowValue    ?? (s.showValues ?? false);
  const showPct      = s.labelShowPercentage ?? (s.showPercentages ?? false);

  const parts = [];
  if (showCategory && !isInside) parts.push(name);
  if (showValue) parts.push(formatNumber(value, s));
  if (showPct) parts.push(`${(percent * 100).toFixed(1)}%`);

  if (parts.length === 0) return null;

  const sep = SEPARATOR_MAP[s.labelSeparator || "newline"] || "\n";
  const text = parts.join(sep);

  const radius = isInside
    ? innerRadius + (outerRadius - innerRadius) * 0.5
    : outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Don't show labels on tiny slices when inside
  if (isInside && percent < 0.05) return null;

  const fontSize  = labelStyle.fontSize || 11;
  const fill      = isInside ? (labelStyle.fill || "#ffffff") : (labelStyle.fill || "#374151");
  const fontWeight= isInside ? (labelStyle.fontWeight || "bold") : (labelStyle.fontWeight || "normal");
  const anchor    = isInside ? "middle" : (x > cx ? "start" : "end");

  // If separator is newline, render multiple <tspan>s
  if (sep === "\n" && parts.length > 1) {
    return (
      <text x={x} y={y} fill={fill} textAnchor={anchor} dominantBaseline="central"
        fontSize={fontSize} fontWeight={fontWeight}
        fontStyle={labelStyle.fontStyle || "normal"}
        fontFamily={labelStyle.fontFamily || undefined}>
        {parts.map((line, i) => (
          <tspan key={i} x={x} dy={i === 0 ? -(parts.length - 1) * fontSize * 0.5 : fontSize * 1.15}>
            {line}
          </tspan>
        ))}
      </text>
    );
  }

  return (
    <text x={x} y={y} fill={fill} textAnchor={anchor} dominantBaseline="central"
      fontSize={fontSize} fontWeight={fontWeight}
      fontStyle={labelStyle.fontStyle || "normal"}
      fontFamily={labelStyle.fontFamily || undefined}>
      {text}
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
  const isRose = style.roseMode;
  const innerRadius = isDonut ? (style.donutThickness || 60) : (isRose ? 30 : 0);
  const paddingAngle = isRose ? 4 : (style.paddingAngle ?? 2);
  const pieLabelStyle = buildDataLabelStyle(style);

  // Unified display keys from WidgetStyleConfig
  const showCategory = style.labelShowCategory ?? (style.showLabels ?? true);
  const showValue    = style.labelShowValue    ?? (style.showValues ?? false);
  const showPct      = style.labelShowPercentage ?? (style.showPercentages ?? false);
  const hasAnyLabel  = showCategory || showValue || showPct || style.showDataLabels;
  const isInside     = (style.dataLabelPosition || style.labelPosition || "outside") === "inside";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={isDonut ? `${innerRadius}%` : (isRose ? `${innerRadius}%` : 0)}
          outerRadius="75%"
          paddingAngle={paddingAngle}
          dataKey="value"
          nameKey="name"
          animationDuration={600}
          startAngle={style.startAngle ?? 0}
          endAngle={style.endAngle ?? 360}
          label={hasAnyLabel
            ? (props) => renderPieLabel({ ...props, widgetStyle: style, labelStyle: pieLabelStyle, isInside })
            : undefined
          }
          labelLine={style.showLeaderLines !== false && !isInside && hasAnyLabel}
        >
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={getColor(idx, style.colorScheme)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatNumber(value, style)}
          contentStyle={buildTooltipStyle(style)}
        />
        {style.showLegend !== false && (
          <Legend
            wrapperStyle={{ fontSize: (pieLabelStyle.fontSize || 11) - 1 }}
            verticalAlign={style.legendPosition === "top" ? "top" : "bottom"}
            align={style.legendPosition === "left" ? "left" : style.legendPosition === "right" ? "right" : "center"}
            layout={style.legendLayout || "horizontal"}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
