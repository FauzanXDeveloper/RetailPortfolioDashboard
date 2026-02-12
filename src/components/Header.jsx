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
  X,
  ChevronDown,
  FileJson,
  Image as ImageIcon,
  FileText,
  Filter,
  LogOut,
  Trash2,
  Share2,
} from "lucide-react";
import useDashboardStore from "../store/dashboardStore";
import { importDashboard } from "../utils/storage";
import { exportAsJSON, exportAsImage, exportAsPDF } from "../utils/exportUtils";
import GlobalFilterManager from "./modals/GlobalFilterManager";

export default function Header() {
  const {
    currentDashboard,
    dashboards,
    setDashboardName,
    newDashboard,
    saveDashboard,
    loadDashboard,
    deleteDashboard,
    importDashboardData,
    setGlobalFilter,
    clearGlobalFilters,
    setDataManagerOpen,
    environmentId,
    environmentName,
    leaveEnvironment,
    deleteCurrentEnvironment,
  } = useDashboardStore();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteEnvConfirm, setShowDeleteEnvConfirm] = useState(false);

  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showFilterManager, setShowFilterManager] = useState(false);
  const titleRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const _ = titleRef; // keep ref for future use

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

  /** Export current environment as a shareable JSON file */
  const handleShareEnv = () => {
    const state = useDashboardStore.getState();
    const envData = {
      _type: "analytics-env-share",
      id: state.environmentId,
      name: state.environmentName || state.environmentId,
      dashboards: state.dashboards,
      dataSources: state.dataSources.filter((d) => d.type !== "builtin"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(envData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `env_${state.environmentId}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gf = currentDashboard.globalFilters || {};
  const dynamicFilters = gf.dynamic || [];

  return (
    <header className="bg-brand-700 shadow-sm border-b border-brand-800 px-4 py-2 flex flex-col gap-2 z-20 relative">
      {/* Environment Bar */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-white/10 text-white px-2 py-1 rounded-lg border border-white/20" title={`Code: ${environmentId}`}>
          <span className="font-bold">🌐 {environmentName || environmentId}</span>
          <span className="text-[10px] text-white/60 font-mono">({environmentId})</span>
        </div>
        <button
          onClick={leaveEnvironment}
          className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
          title="Leave environment"
        >
          <LogOut size={12} /> Leave
        </button>
        <button
          onClick={() => setShowDeleteEnvConfirm(true)}
          className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-200 transition-colors"
          title="Delete environment"
        >
          <Trash2 size={12} /> Delete Env
        </button>
        <button
          onClick={handleShareEnv}
          className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
          title="Share environment (export as file for other devices)"
        >
          <Share2 size={12} /> Share
        </button>
      </div>

      {/* Delete Environment Confirmation Modal */}
      {showDeleteEnvConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80">
            <h3 className="text-sm font-bold text-red-700 mb-2">Delete Environment</h3>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to delete environment <strong>"{environmentName || environmentId}"</strong>? This will permanently remove all dashboards and data within it.
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={async () => {
                  await deleteCurrentEnvironment();
                  setShowDeleteEnvConfirm(false);
                }}
              >Yes, Delete</button>
              <button
                className="flex-1 px-3 py-1.5 text-xs bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setShowDeleteEnvConfirm(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Row: Title + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Dashboard Title */}
        <div className="flex items-center gap-2">
          <img
            src={`${process.env.PUBLIC_URL}/alrajhi_logo.png`}
            alt="Logo"
            className="h-7 w-auto brightness-0 invert"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {editingTitle ? (
            <input
              ref={titleRef}
              autoFocus
              className="text-lg font-semibold border-b-2 border-white/50 outline-none bg-transparent px-1 text-white"
              value={currentDashboard.name}
              onChange={(e) => setDashboardName(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h1
              className="text-lg font-semibold cursor-pointer hover:text-white/80 transition-colors text-white"
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
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-white"
          >
            <Plus size={14} /> New
          </button>
          <button
            onClick={saveDashboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={14} /> Save
          </button>

          {/* Load Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLoadDropdown(!showLoadDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-white"
            >
              <FolderOpen size={14} /> Load <ChevronDown size={12} />
            </button>
            {showLoadDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {dashboards.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No saved dashboards
                  </div>
                ) : (
                  dashboards.map((d) => (
                    <div key={d.id} className="border-b border-gray-100 last:border-0">
                      {confirmDeleteId === d.id ? (
                        <div className="px-3 py-2 bg-red-50">
                          <p className="text-xs text-red-700 font-medium mb-2">Delete "{d.name}"?</p>
                          <div className="flex gap-2">
                            <button
                              className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDashboard(d.id);
                                setConfirmDeleteId(null);
                              }}
                            >Yes, Delete</button>
                            <button
                              className="flex-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center hover:bg-gray-50">
                          <button
                            className="flex-1 text-left px-3 py-2 text-sm"
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
                          <button
                            className="p-1.5 mr-2 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(d.id);
                            }}
                            title="Delete dashboard"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-white"
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
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors text-white"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => setDataManagerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Database size={14} /> Manage Data
          </button>
          <button
            onClick={() => setShowFilterManager(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Filter size={14} /> Manage Filters
          </button>
        </div>
      </div>

      {/* Bottom Row: Global Filters */}
      <div className="flex items-center gap-3 flex-wrap text-sm">
        <span className="text-white/70 font-medium flex items-center gap-1">
          <Filter size={14} /> Filters:
        </span>

        {/* Search */}
        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
          <Search size={13} className="text-white/50" />
          <input
            className="bg-transparent text-xs outline-none w-32 text-white placeholder-white/40"
            placeholder="Search data..."
            value={gf.search || ""}
            onChange={(e) => setGlobalFilter("search", e.target.value)}
          />
        </div>

        {/* Dynamic global filters — ALL filters appear here */}
        {dynamicFilters.map((df) => {
          const hasValues = df.values?.length > 0;
          return (
            <DynamicFilterDropdown
              key={df.id || df.field}
              filter={df}
              hasValues={hasValues}
              gf={gf}
              setGlobalFilter={setGlobalFilter}
            />
          );
        })}

        {/* Clear All */}
        {(gf.search || dynamicFilters.some((df) => df.values?.length > 0)) && (
          <button
            onClick={clearGlobalFilters}
            className="flex items-center gap-1 text-xs text-red-300 hover:text-red-100"
          >
            <X size={12} /> Clear All
          </button>
        )}

        {dynamicFilters.length === 0 && !gf.search && (
          <span className="text-xs text-white/40 italic">
            No filters — click "Manage Filters" to add
          </span>
        )}
      </div>

      {/* Global Filter Manager Modal */}
      <GlobalFilterManager open={showFilterManager} onClose={() => setShowFilterManager(false)} />
    </header>
  );
}

/**
 * Inline dropdown for each dynamic global filter in the header bar.
 */
function DynamicFilterDropdown({ filter, hasValues, gf, setGlobalFilter }) {
  const [open, setOpen] = useState(false);
  const { dataSources } = useDashboardStore();
  const df = filter;

  const uniqueValues = React.useMemo(() => {
    const values = new Set();
    dataSources.forEach((ds) => {
      if (ds.data) {
        ds.data.forEach((row) => {
          if (row[df.field] != null && row[df.field] !== "") {
            values.add(String(row[df.field]));
          }
        });
      }
    });
    return [...values].sort();
  }, [dataSources, df.field]);

  const toggleValue = (val) => {
    const current = df.values || [];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    const updated = (gf.dynamic || []).map((d) =>
      d.id === df.id ? { ...d, values: next } : d
    );
    setGlobalFilter("dynamic", updated);
  };

  const clearFilter = (e) => {
    e.stopPropagation();
    const updated = (gf.dynamic || []).map((d) =>
      d.id === df.id ? { ...d, values: [] } : d
    );
    setGlobalFilter("dynamic", updated);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
          hasValues
            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Filter size={12} />
        <span className="font-medium">{df.label || df.field}</span>
        {hasValues && (
          <>
            <span className="bg-purple-200 text-purple-800 px-1 py-0.5 rounded-full text-[10px] font-bold">
              {df.values.length}
            </span>
            <button onClick={clearFilter} className="hover:text-red-500 ml-0.5">
              <X size={10} />
            </button>
          </>
        )}
        <ChevronDown size={10} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            <div className="sticky top-0 bg-white px-2 py-1.5 border-b border-gray-100">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={df.values?.length === uniqueValues.length && uniqueValues.length > 0}
                  onChange={(e) => {
                    const newValues = e.target.checked ? [...uniqueValues] : [];
                    const updated = (gf.dynamic || []).map((d) =>
                      d.id === df.id ? { ...d, values: newValues } : d
                    );
                    setGlobalFilter("dynamic", updated);
                  }}
                  className="rounded"
                />
                <span className="font-medium text-gray-500">Select All</span>
              </label>
            </div>
            <div className="p-1">
              {uniqueValues.map((v) => (
                <label
                  key={v}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(df.values || []).includes(v)}
                    onChange={() => toggleValue(v)}
                    className="rounded"
                  />
                  <span className="truncate">{v}</span>
                </label>
              ))}
              {uniqueValues.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">No data imported yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
