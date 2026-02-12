/**
 * Dashboard — Main container component.
 * Assembles Header, Sidebar, Canvas, ConfigPanel, and modals.
 * Handles auto-save and refresh protection.
 * Shows landing screen when no environment is active.
 */
import React, { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import ConfigPanel from "./ConfigPanel";
import DataManager from "./modals/DataManager";
import useDashboardStore from "../store/dashboardStore";
import { LogIn } from "lucide-react";

const AUTO_SAVE_KEY = "analytics-dashboard-autosave";

export default function Dashboard() {
  const { currentDashboard, importDashboardData, environmentId, enterEnvironment } = useDashboardStore();
  const isInitialLoad = useRef(true);
  const hasRestoredRef = useRef(false);
  const [landingEnvInput, setLandingEnvInput] = useState("");
  const [landingLoading, setLandingLoading] = useState(false);

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

  const handleLandingEnter = async () => {
    if (!landingEnvInput.trim()) return;
    setLandingLoading(true);
    await enterEnvironment(landingEnvInput.trim());
    setLandingEnvInput("");
    setLandingLoading(false);
  };

  // If no environment is active, show landing screen
  if (!environmentId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <img
            src={`${process.env.PUBLIC_URL}/alrajhi_logo.png`}
            alt="Logo"
            className="h-12 w-auto mx-auto mb-4"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your environment name or code to get started. Create a new one or access an existing environment shared by your team.
          </p>
          <div className="flex items-center gap-2 justify-center">
            <input
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 w-48"
              placeholder="e.g. 123, team-alpha"
              value={landingEnvInput}
              onChange={(e) => setLandingEnvInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLandingEnter()}
              autoFocus
            />
            <button
              onClick={handleLandingEnter}
              disabled={landingLoading || !landingEnvInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              <LogIn size={16} /> {landingLoading ? "Loading..." : "Enter"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Your data and analyses are stored securely in your browser.<br />
            Share the environment code with coworkers so they can view your work.
          </p>
        </div>
      </div>
    );
  }

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
