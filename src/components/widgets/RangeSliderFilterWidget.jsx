/**
 * RangeSliderFilterWidget — A numeric range slider filter.
 */
import React, { useMemo, useState, useEffect } from "react";
import useDashboardStore from "../../store/dashboardStore";

export default function RangeSliderFilterWidget({ widget }) {
  const { dataSources, setWidgetFilterValue, widgetFilterValues } = useDashboardStore();
  const config = widget.config || {};

  const { min, max } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.filterField) return { min: 0, max: 100 };
    const nums = ds.data.map((r) => Number(r[config.filterField])).filter((v) => !isNaN(v));
    return { min: nums.length ? Math.min(...nums) : 0, max: nums.length ? Math.max(...nums) : 100 };
  }, [dataSources, config.dataSource, config.filterField]);

  const current = widgetFilterValues[widget.i] || { min, max };
  const [localMin, setLocalMin] = useState(current.min);
  const [localMax, setLocalMax] = useState(current.max);

  useEffect(() => {
    setLocalMin(current.min ?? min);
    setLocalMax(current.max ?? max);
  }, [current.min, current.max, min, max]);

  if (!config.dataSource || !config.filterField) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-xs">Configure filter</div>;
  }

  const handleCommit = () => {
    setWidgetFilterValue(widget.i, { min: localMin, max: localMax });
  };

  const step = (max - min) > 100 ? Math.round((max - min) / 100) : (max - min) > 10 ? 1 : 0.1;

  return (
    <div className="flex flex-col h-full px-2 py-1 justify-center">
      <span className="text-xs font-medium text-gray-600 mb-1">{config.filterName || config.filterField}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-16 text-xs border rounded px-1 py-0.5 text-center"
          value={localMin}
          onChange={(e) => setLocalMin(Number(e.target.value))}
          onBlur={handleCommit}
          step={step}
        />
        <div className="flex-1 relative">
          <input
            type="range"
            className="w-full accent-indigo-500"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v <= localMax) setLocalMin(v);
            }}
            onMouseUp={handleCommit}
          />
          <input
            type="range"
            className="w-full accent-indigo-500 -mt-3"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= localMin) setLocalMax(v);
            }}
            onMouseUp={handleCommit}
          />
        </div>
        <input
          type="number"
          className="w-16 text-xs border rounded px-1 py-0.5 text-center"
          value={localMax}
          onChange={(e) => setLocalMax(Number(e.target.value))}
          onBlur={handleCommit}
          step={step}
        />
      </div>
    </div>
  );
}
