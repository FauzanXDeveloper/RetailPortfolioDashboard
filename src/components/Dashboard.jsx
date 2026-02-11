/**
 * Dashboard — Main container component.
 * Assembles Header, Sidebar, Canvas, ConfigPanel, and modals.
 */
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import ConfigPanel from "./ConfigPanel";
import DataManager from "./modals/DataManager";

export default function Dashboard() {
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
