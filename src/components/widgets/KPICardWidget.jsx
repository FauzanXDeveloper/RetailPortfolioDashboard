/**
 * KPI Card Widget — Displays a single metric with trend indicator.
 */
import React, { useMemo } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, computeMetric, applyGlobalFilters, applyCrossFilters, formatValue } from "../../utils/dataProcessing";

export default function KPICardWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};
  const format = config.format || {};

  const { value, change, changeLabel } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.metric) return { value: null, change: null, changeLabel: "" };

    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const metricValue = computeMetric(data, config.metric, config.aggregation || "sum");

    let change = null;
    let changeLabel = "";
    if (config.comparison?.enabled) {
      if (config.comparison.type === "target" && config.comparison.targetValue) {
        const target = Number(config.comparison.targetValue);
        if (target !== 0) {
          change = ((metricValue - target) / target) * 100;
          changeLabel = "vs target";
        }
      }
    }

    return { value: metricValue, change, changeLabel };
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource || !config.metric) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.
      </div>
    );
  }

  const sizeClasses = {
    compact: "text-xl",
    normal: "text-3xl",
    large: "text-5xl",
    xlarge: "text-6xl",
  };

  const alignClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const labelSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <div
      className={`flex flex-col ${alignClasses[style.alignment || "center"]} justify-center h-full p-3 rounded-lg`}
      style={{
        backgroundColor: style.backgroundColor || "#ffffff",
        color: style.textColor || "#111827",
        borderLeft: style.accentBorder ? `4px solid ${style.accentColor || "#4F46E5"}` : undefined,
      }}
    >
      {/* Title/Label */}
      {style.showLabel !== false && config.metric && (
        <div className={`${labelSizeClasses[style.labelSize || "small"]} text-gray-500 mb-0.5 font-medium`} style={{ color: style.labelColor || "#6b7280" }}>
          {style.customLabel || config.metric}
        </div>
      )}
      {/* Icon */}
      {style.showIcon !== false && style.icon && (
        <div className="mb-1" style={{ fontSize: style.iconSize === "large" ? 32 : style.iconSize === "small" ? 16 : 24 }}>
          {style.icon}
        </div>
      )}
      {/* Value */}
      <div
        className={`font-bold ${sizeClasses[style.size || "normal"]} tabular-nums`}
        style={{ color: style.valueColor || style.textColor || "#111827" }}
      >
        {value != null ? formatValue(value, format) : "—"}
      </div>
      {/* Trend Indicator */}
      {change != null && style.showTrendIndicator !== false && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className="text-sm font-semibold"
            style={{
              color: change >= 0 ? (style.positiveColor || "#16a34a") : (style.negativeColor || "#dc2626"),
            }}
          >
            {change >= 0 ? "↑" : "↓"}{" "}
            {style.showPercentageChange !== false && `${Math.abs(change).toFixed(1)}%`}
          </span>
          {style.showComparisonLabel !== false && (
            <span className="text-xs text-gray-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
