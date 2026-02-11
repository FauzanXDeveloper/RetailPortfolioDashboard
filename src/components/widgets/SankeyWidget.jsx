/**
 * SankeyWidget — D3-based Sankey diagram rendered in SVG.
 */
import React, { useMemo, useRef, useEffect, useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters } from "../../utils/dataProcessing";
import { getColor } from "../../utils/chartHelpers";

export default function SankeyWidget({ widget }) {
  const { dataSources, currentDashboard } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 300, h: 200 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const sankeyData = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds || !config.sourceField || !config.targetField || !config.valueField) return null;
    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    // Aggregate flows
    const flowMap = {};
    data.forEach((r) => {
      const s = String(r[config.sourceField]);
      const t = String(r[config.targetField]);
      const v = Number(r[config.valueField]) || 0;
      const key = `${s}→${t}`;
      flowMap[key] = (flowMap[key] || 0) + v;
    });

    // Build nodes
    const nodeSet = new Set();
    const links = Object.entries(flowMap).map(([key, value]) => {
      const [source, target] = key.split("→");
      nodeSet.add(source);
      nodeSet.add(target);
      return { source, target, value };
    });
    const nodes = [...nodeSet].map((name) => ({ name }));
    const nodeIndex = {};
    nodes.forEach((n, i) => (nodeIndex[n.name] = i));

    return { nodes, links: links.map((l) => ({ ...l, sourceIdx: nodeIndex[l.source], targetIdx: nodeIndex[l.target] })) };
  }, [dataSources, config, currentDashboard.globalFilters]);

  if (!config.dataSource || !config.sourceField || !config.targetField || !config.valueField) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">Configure source, target, and value fields.</div>;
  }
  if (!sankeyData?.links.length) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available.</div>;

  // Simple manual Sankey layout
  const { nodes, links } = sankeyData;
  const padding = 20;
  const nodeWidth = 16;
  const w = dims.w - padding * 2;
  const h = dims.h - padding * 2;

  // Determine columns (sources on left, targets on right)
  const sourceNames = new Set(links.map((l) => l.source));
  const targetNames = new Set(links.map((l) => l.target));
  const pureTargets = [...targetNames].filter((n) => !sourceNames.has(n));
  const pureSources = [...sourceNames].filter((n) => !targetNames.has(n));
  const middle = nodes.filter((n) => !pureSources.includes(n.name) && !pureTargets.includes(n.name)).map((n) => n.name);

  const columns = [pureSources, middle.length ? middle : [], pureTargets].filter((c) => c.length > 0);
  const colCount = columns.length;

  // Calculate node positions
  const nodePositions = {};
  columns.forEach((col, colIdx) => {
    const totalValue = col.reduce((sum, name) => {
      const val = links
        .filter((l) => l.source === name || l.target === name)
        .reduce((s, l) => s + l.value, 0);
      return sum + val;
    }, 0);

    let yOffset = 0;
    col.forEach((name) => {
      const val = links
        .filter((l) => l.source === name || l.target === name)
        .reduce((s, l) => s + l.value, 0);
      const nodeHeight = Math.max(10, (val / (totalValue || 1)) * (h - (col.length - 1) * 4));
      nodePositions[name] = {
        x: padding + (colIdx / Math.max(colCount - 1, 1)) * (w - nodeWidth),
        y: padding + yOffset,
        height: nodeHeight,
        value: val,
      };
      yOffset += nodeHeight + 4;
    });
  });

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width={dims.w} height={dims.h}>
        {/* Links */}
        {links.map((link, idx) => {
          const s = nodePositions[link.source];
          const t = nodePositions[link.target];
          if (!s || !t) return null;
          const thickness = Math.max(2, (link.value / (s.value || 1)) * s.height);
          const sy = s.y + s.height / 2;
          const ty = t.y + t.height / 2;
          const sx = s.x + nodeWidth;
          const tx = t.x;
          return (
            <path
              key={idx}
              d={`M${sx},${sy} C${(sx + tx) / 2},${sy} ${(sx + tx) / 2},${ty} ${tx},${ty}`}
              fill="none"
              stroke={getColor(idx)}
              strokeWidth={thickness}
              strokeOpacity={0.3}
            >
              <title>{`${link.source} → ${link.target}: ${link.value.toLocaleString()}`}</title>
            </path>
          );
        })}
        {/* Nodes */}
        {Object.entries(nodePositions).map(([name, pos], idx) => (
          <g key={name}>
            <rect x={pos.x} y={pos.y} width={nodeWidth} height={pos.height} fill={getColor(idx)} rx={3}>
              <title>{`${name}: ${pos.value.toLocaleString()}`}</title>
            </rect>
            <text
              x={pos.x < dims.w / 2 ? pos.x + nodeWidth + 4 : pos.x - 4}
              y={pos.y + pos.height / 2}
              textAnchor={pos.x < dims.w / 2 ? "start" : "end"}
              dominantBaseline="central"
              fontSize={10}
              fill="#374151"
            >
              {name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
