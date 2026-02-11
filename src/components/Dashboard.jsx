/**
 * Dashboard — Main container component.
 * Assembles Header, Sidebar, Canvas, ConfigPanel, and modals.
 * Handles auto-save and refresh protection.
 */
import React, { useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import ConfigPanel from "./ConfigPanel";
import DataManager from "./modals/DataManager";
import useDashboardStore from "../store/dashboardStore";

const AUTO_SAVE_KEY = "analytics-dashboard-autosave";

export default function Dashboard() {
  const { currentDashboard, importDashboardData } = useDashboardStore();
  const isInitialLoad = useRef(true);
  const hasRestoredRef = useRef(false);

  // Restore auto-saved dashboard on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.widgets && parsed.widgets.length > 0) {
          importDashboardData(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to restore auto-saved dashboard:", e);
    }
  }, [importDashboardData]);

  // Auto-save on every dashboard change (debounced)
  useEffect(() => {
    // Skip the initial render to avoid overwriting with empty state
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(currentDashboard));
      } catch (e) {
        console.warn("Auto-save failed:", e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentDashboard]);

  // Warn before closing/refreshing if there are widgets
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentDashboard.widgets?.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentDashboard.widgets?.length]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar - Widget Library */}
          <Sidebar />

          {/* Canvas */}
          <Canvas />

          {/* Right Config Panel (conditionally rendered) */}
          <ConfigPanel />
        </div>

        {/* Modals */}
        <DataManager />
      </div>
    </DndProvider>
  );
}
