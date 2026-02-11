/**
 * Canvas — Main grid layout area with drag-and-drop support.
 */
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { GridLayout } from "react-grid-layout";
import useDashboardStore from "../store/dashboardStore";
import WidgetContainer from "./widgets/WidgetContainer";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export default function Canvas() {
  const {
    currentDashboard,
    addWidget,
    updateLayout,
  } = useDashboardStore();

  const widgets = currentDashboard.widgets || [];
  const containerRef = useRef(null);
  const [width, setWidth] = useState(1200);

  // Measure container width for GridLayout
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width - 32); // minus padding
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Drop target for dragging widgets from sidebar
  const [{ isOver }, drop] = useDrop({
    accept: "WIDGET",
    drop: (item) => {
      addWidget(item.widgetType);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Build layout array from widgets
  const layout = widgets.map((w) => ({
    i: w.i,
    x: w.x || 0,
    y: w.y || 0,
    w: w.w || 4,
    h: w.h || 3,
    minW: 2,
    minH: 1,
  }));

  const handleLayoutChange = useCallback(
    (newLayout) => {
      updateLayout(newLayout);
    },
    [updateLayout]
  );

  return (
    <div
      id="dashboard-canvas"
      ref={(el) => {
        drop(el);
        containerRef.current = el;
      }}
      className={`flex-1 overflow-auto p-4 transition-colors ${
        isOver ? "bg-blue-50" : "bg-gray-50"
      }`}
    >
      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2">Your dashboard is empty</h2>
          <p className="text-sm">Drag widgets from the left sidebar to get started</p>
          <p className="text-xs mt-1 text-gray-300">
            or click New Dashboard to start fresh
          </p>
        </div>
      ) : (
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={width}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          resizeHandles={["se"]}
          compactType="vertical"
          preventCollision={false}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          {widgets.map((widget) => (
            <div key={widget.i}>
              <WidgetContainer widget={widget} />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
}
