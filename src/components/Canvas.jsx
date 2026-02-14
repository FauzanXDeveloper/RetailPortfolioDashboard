/**
 * Canvas — Main grid layout area with drag-and-drop support.
 */
import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
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
  const theme = useMemo(() => currentDashboard.theme || {}, [currentDashboard.theme]);
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
    static: !!w.pinned,
    isDraggable: !w.pinned,
    isResizable: !w.pinned,
  }));

  const handleLayoutChange = useCallback(
    (newLayout) => {
      updateLayout(newLayout);
    },
    [updateLayout]
  );

  // Auto-scroll when dragging near edges
  const handleDrag = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    const container = containerRef.current;
    if (!container || !e) return;
    const rect = container.getBoundingClientRect();
    const scrollSpeed = 15;
    const edgeThreshold = 80;
    const mouseY = e.clientY;
    
    // Scroll up when near top edge
    if (mouseY - rect.top < edgeThreshold) {
      container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
    }
    // Scroll down when near bottom edge
    if (rect.bottom - mouseY < edgeThreshold) {
      container.scrollTop += scrollSpeed;
    }
  }, []);

  // Build background style from dashboard theme
  const bgStyle = React.useMemo(() => {
    if (!theme.bgType || theme.bgType === "default") return {};
    if (theme.bgType === "solid") return { background: theme.bgColor || "#f9fafb" };
    if (theme.bgType === "gradient") {
      const dir = theme.gradientDirection || "to bottom";
      const c1 = theme.gradientStart || "#667eea";
      const c2 = theme.gradientEnd || "#764ba2";
      return { background: `linear-gradient(${dir}, ${c1}, ${c2})` };
    }
    if (theme.bgType === "image" && theme.bgImage) {
      return {
        backgroundImage: `url(${theme.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return {};
  }, [theme]);

  return (
    <div
      id="dashboard-canvas"
      ref={(el) => {
        drop(el);
        containerRef.current = el;
      }}
      className={`flex-1 overflow-auto p-4 transition-colors ${
        isOver ? "ring-2 ring-blue-400 ring-inset" : ""
      } ${(!theme.bgType || theme.bgType === "default") ? "bg-gray-50" : ""}`}
      style={bgStyle}
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
          onDrag={handleDrag}
          draggableHandle=".drag-handle"
          resizeHandles={["se"]}
          compactType={null}
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
