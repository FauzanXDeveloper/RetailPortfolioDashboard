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
import { LogIn, Plus, X, CheckCircle } from "lucide-react";

const AUTO_SAVE_KEY = "analytics-dashboard-autosave";

export default function Dashboard() {
  const { currentDashboard, importDashboardData, environmentId, enterEnvironment, checkEnvironment, createEnvironment } = useDashboardStore();
  const isInitialLoad = useRef(true);
  const hasRestoredRef = useRef(false);
  const [landingEnvInput, setLandingEnvInput] = useState("");
  const [landingLoading, setLandingLoading] = useState(false);

  // Multi-step flow state
  // "idle" | "confirm-existing" | "not-found" | "create-name"
  const [landingStep, setLandingStep] = useState("idle");
  const [foundEnv, setFoundEnv] = useState(null); // env object when found
  const [createEnvName, setCreateEnvName] = useState(""); // display name for new env

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
    const env = await checkEnvironment(landingEnvInput.trim());
    setLandingLoading(false);
    if (env) {
      // Environment exists — ask user to confirm
      setFoundEnv(env);
      setLandingStep("confirm-existing");
    } else {
      // Environment doesn't exist — tell user and offer create
      setLandingStep("not-found");
    }
  };

  const handleConfirmEnter = async () => {
    setLandingLoading(true);
    await enterEnvironment(landingEnvInput.trim());
    setLandingEnvInput("");
    setLandingStep("idle");
    setFoundEnv(null);
    setLandingLoading(false);
  };

  const handleStartCreate = () => {
    setCreateEnvName("");
    setLandingStep("create-name");
  };

  const handleCreateEnv = async () => {
    if (!createEnvName.trim()) return;
    setLandingLoading(true);
    const success = await createEnvironment(landingEnvInput.trim(), createEnvName.trim());
    setLandingLoading(false);
    if (success) {
      setLandingEnvInput("");
      setCreateEnvName("");
      setLandingStep("idle");
    } else {
      alert("An environment with this code already exists. Please use a different code.");
    }
  };

  const handleCancelDialog = () => {
    setLandingStep("idle");
    setFoundEnv(null);
    setCreateEnvName("");
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
            Enter your environment code to access an existing environment, or create a new one.
          </p>
          <div className="flex items-center gap-2 justify-center">
            <input
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 w-48"
              placeholder="e.g. 123, team-alpha"
              value={landingEnvInput}
              onChange={(e) => setLandingEnvInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && landingStep === "idle" && handleLandingEnter()}
              autoFocus
              disabled={landingStep !== "idle"}
            />
            <button
              onClick={handleLandingEnter}
              disabled={landingLoading || !landingEnvInput.trim() || landingStep !== "idle"}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              <LogIn size={16} /> {landingLoading && landingStep === "idle" ? "Checking..." : "Enter"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Your data and analyses are stored securely in your browser.<br />
            Share the environment code with coworkers so they can view your work.
          </p>
        </div>

        {/* Popup: Environment exists — confirm */}
        {landingStep === "confirm-existing" && foundEnv && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 animate-in">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={20} className="text-green-500" />
                <h3 className="text-sm font-bold text-gray-800">Environment Found</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm font-semibold text-green-800">
                  {foundEnv.name || foundEnv.id}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Code: <span className="font-mono font-bold">{foundEnv.id}</span>
                  {foundEnv.dashboards?.length > 0 && (
                    <> · {foundEnv.dashboards.length} saved dashboard{foundEnv.dashboards.length !== 1 ? "s" : ""}</>
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-600 mb-4">Is this the correct environment you want to enter?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmEnter}
                  disabled={landingLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  <LogIn size={14} /> {landingLoading ? "Entering..." : "Yes, Enter"}
                </button>
                <button
                  onClick={handleCancelDialog}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Popup: Environment not found — offer to create */}
        {landingStep === "not-found" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 animate-in">
              <div className="flex items-center gap-2 mb-3">
                <X size={20} className="text-red-500" />
                <h3 className="text-sm font-bold text-gray-800">Environment Not Found</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                No environment with code <span className="font-mono font-bold text-indigo-600">"{landingEnvInput}"</span> exists.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Would you like to create a new environment with this code?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleStartCreate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  <Plus size={14} /> Create New
                </button>
                <button
                  onClick={handleCancelDialog}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Popup: Create new — enter display name */}
        {landingStep === "create-name" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 animate-in">
              <div className="flex items-center gap-2 mb-3">
                <Plus size={20} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-800">Create New Environment</h3>
              </div>
              <p className="text-xs text-gray-500 mb-1">
                Code: <span className="font-mono font-bold text-indigo-600">{landingEnvInput}</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Give your environment a descriptive name:
              </p>
              <input
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 mb-4"
                placeholder='e.g. "ABC Sdn Bhd Env"'
                value={createEnvName}
                onChange={(e) => setCreateEnvName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateEnv()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateEnv}
                  disabled={landingLoading || !createEnvName.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  <Plus size={14} /> {landingLoading ? "Creating..." : "Create & Enter"}
                </button>
                <button
                  onClick={handleCancelDialog}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >Cancel</button>
              </div>
            </div>
          </div>
        )}
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
