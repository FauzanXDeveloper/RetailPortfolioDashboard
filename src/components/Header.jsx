/**
 * Header component with dashboard title, actions, and global filters.
 */
import React, { useState, useRef } from "react";
import {
  Plus,
  Save,
  FolderOpen,
  Download,
  Upload,
  Database,
  Search,
  Calendar,
  Tag,
  MapPin,
  X,
  ChevronDown,
  FileJson,
  Image as ImageIcon,
  FileText,
  Filter,
} from "lucide-react";
import useDashboardStore from "../store/dashboardStore";
import { importDashboard } from "../utils/storage";
import { getUniqueValues } from "../utils/dataProcessing";
import { exportAsJSON, exportAsImage, exportAsPDF } from "../utils/exportUtils";
import GlobalFilterManager from "./modals/GlobalFilterManager";

export default function Header() {
  const {
    currentDashboard,
    dashboards,
    dataSources,
    setDashboardName,
    newDashboard,
    saveDashboard,
    loadDashboard,
    importDashboardData,
    setGlobalFilter,
    clearGlobalFilters,
    setDataManagerOpen,
  } = useDashboardStore();

  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showFilterManager, setShowFilterManager] = useState(false);
  const titleRef = useRef(null);

  // Get all categories and regions from all data sources for global filter dropdowns
  const allCategories = new Set();
  const allRegions = new Set();
  dataSources.forEach((ds) => {
    getUniqueValues(ds.data, "category").forEach((v) => allCategories.add(v));
    getUniqueValues(ds.data, "region").forEach((v) => allRegions.add(v));
  });

  const handleExportJSON = () => {
    exportAsJSON(currentDashboard);
    setShowExportDropdown(false);
  };

  const handleExportPNG = async () => {
    await exportAsImage('dashboard-canvas', {
      format: 'png',
      includeLogo: true,
      dashboardTitle: currentDashboard.name,
    });
    setShowExportDropdown(false);
  };

  const handleExportJPG = async () => {
    await exportAsImage('dashboard-canvas', {
      format: 'jpg',
      quality: 0.9,
      includeLogo: true,
      dashboardTitle: currentDashboard.name,
    });
    setShowExportDropdown(false);
  };

  const handleExportPDF = async () => {
    await exportAsPDF('dashboard-canvas', {
      orientation: 'landscape',
      includeLogo: true,
      dashboardTitle: currentDashboard.name,
    });
    setShowExportDropdown(false);
  };

  const handleImport = async () => {
    try {
      const data = await importDashboard();
      importDashboardData(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditingTitle(false);
    }
  };

  const gf = currentDashboard.globalFilters || {};

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2 flex flex-col gap-2 z-20 relative">
      {/* Top Row: Title + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Dashboard Title */}
        <div className="flex items-center gap-2">
          <img src="/alrajhi_logo.png" alt="Logo" className="h-7 w-auto" />
          {editingTitle ? (
            <input
              ref={titleRef}
              autoFocus
              className="text-lg font-semibold border-b-2 border-indigo-400 outline-none bg-transparent px-1"
              value={currentDashboard.name}
              onChange={(e) => setDashboardName(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h1
              className="text-lg font-semibold cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => setEditingTitle(true)}
              title="Click to edit"
            >
              {currentDashboard.name}
            </h1>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={newDashboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} /> New
          </button>
          <button
            onClick={saveDashboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={14} /> Save
          </button>

          {/* Load Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLoadDropdown(!showLoadDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <FolderOpen size={14} /> Load <ChevronDown size={12} />
            </button>
            {showLoadDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {dashboards.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No saved dashboards
                  </div>
                ) : (
                  dashboards.map((d) => (
                    <button
                      key={d.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => {
                        loadDashboard(d.id);
                        setShowLoadDropdown(false);
                      }}
                    >
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-400">
                        {d.widgets?.length || 0} widgets
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={14} /> Export <ChevronDown size={12} />
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                >
                  <FileJson size={16} className="text-blue-500" />
                  <div>
                    <div className="font-medium">Dashboard as JSON</div>
                    <div className="text-xs text-gray-400">Configuration & data</div>
                  </div>
                </button>
                <button
                  onClick={handleExportPNG}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                >
                  <ImageIcon size={16} className="text-green-500" />
                  <div>
                    <div className="font-medium">Dashboard as PNG</div>
                    <div className="text-xs text-gray-400">High quality image</div>
                  </div>
                </button>
                <button
                  onClick={handleExportJPG}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                >
                  <ImageIcon size={16} className="text-yellow-500" />
                  <div>
                    <div className="font-medium">Dashboard as JPG</div>
                    <div className="text-xs text-gray-400">Compressed image</div>
                  </div>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-red-500" />
                  <div>
                    <div className="font-medium">Dashboard as PDF</div>
                    <div className="text-xs text-gray-400">Multi-page document</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleImport}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => setDataManagerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Database size={14} /> Manage Data
          </button>
          <button
            onClick={() => setShowFilterManager(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Filter size={14} /> Manage Filters
          </button>
        </div>
      </div>

      {/* Bottom Row: Global Filters */}
      <div className="flex items-center gap-3 flex-wrap text-sm">
        <span className="text-gray-500 font-medium flex items-center gap-1">
          <Search size={14} /> Filters:
        </span>

        {/* Date Range */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
          <Calendar size={13} className="text-gray-400" />
          <input
            type="date"
            className="bg-transparent text-xs outline-none w-28"
            value={gf.dateRange?.start || ""}
            onChange={(e) =>
              setGlobalFilter("dateRange", {
                ...gf.dateRange,
                start: e.target.value,
              })
            }
          />
          <span className="text-gray-400 text-xs">—</span>
          <input
            type="date"
            className="bg-transparent text-xs outline-none w-28"
            value={gf.dateRange?.end || ""}
            onChange={(e) =>
              setGlobalFilter("dateRange", {
                ...gf.dateRange,
                end: e.target.value,
              })
            }
          />
        </div>

        {/* Category Multi-select */}
        {[...allCategories].length > 0 && (
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
            <Tag size={13} className="text-gray-400" />
            <select
              multiple
              className="bg-transparent text-xs outline-none min-w-[100px] max-h-6"
              value={gf.categories || []}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (o) => o.value
                );
                setGlobalFilter("categories", selected);
              }}
            >
              {[...allCategories].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {(gf.categories?.length > 0) && (
              <span className="text-xs text-indigo-600">({gf.categories.length})</span>
            )}
          </div>
        )}

        {/* Region Multi-select */}
        {[...allRegions].length > 0 && (
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
            <MapPin size={13} className="text-gray-400" />
            <select
              multiple
              className="bg-transparent text-xs outline-none min-w-[80px] max-h-6"
              value={gf.regions || []}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (o) => o.value
                );
                setGlobalFilter("regions", selected);
              }}
            >
              {[...allRegions].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {(gf.regions?.length > 0) && (
              <span className="text-xs text-indigo-600">({gf.regions.length})</span>
            )}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
          <Search size={13} className="text-gray-400" />
          <input
            className="bg-transparent text-xs outline-none w-32"
            placeholder="Search data..."
            value={gf.search || ""}
            onChange={(e) => setGlobalFilter("search", e.target.value)}
          />
        </div>

        {/* Dynamic global filters */}
        {(gf.dynamic || []).filter((df) => df.values?.length > 0).map((df) => (
          <div key={df.id || df.field} className="flex items-center gap-1 bg-purple-50 rounded-lg px-2 py-1">
            <Filter size={13} className="text-purple-400" />
            <span className="text-xs text-purple-700 font-medium">{df.label || df.field}:</span>
            <span className="text-xs text-purple-600">
              {df.values.length <= 2 ? df.values.join(", ") : `${df.values.length} selected`}
            </span>
            <button
              onClick={() => {
                const updated = (gf.dynamic || []).map((d) =>
                  d.id === df.id ? { ...d, values: [] } : d
                );
                setGlobalFilter("dynamic", updated);
              }}
              className="text-purple-400 hover:text-purple-600"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Clear All */}
        <button
          onClick={clearGlobalFilters}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
        >
          <X size={12} /> Clear All
        </button>
      </div>

      {/* Global Filter Manager Modal */}
      <GlobalFilterManager open={showFilterManager} onClose={() => setShowFilterManager(false)} />
    </header>
  );
}
