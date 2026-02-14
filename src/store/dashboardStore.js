/**
 * Zustand store for dashboard state management.
 * Manages widgets, data sources, UI state, filters, environments, and persistence.
 */
import { create } from "zustand";
import {
  saveDashboards,
  loadDashboards,
  saveDataSources,
  loadDataSources,
  generateId,
} from "../utils/storage";
import { saveDataSourcesIDB, loadDataSourcesIDB, deleteDataSourceIDB } from "../utils/indexedDB";
import {
  saveEnvironment,
  loadEnvironment,
  deleteEnvironment as deleteEnvFromDB,
  getSessionEnvId,
  setSessionEnvId,
  clearSession,
  checkInactivity,
  updateLastActive,
} from "../utils/environmentDB";
import { getDefaultWidgetConfig, getDefaultWidgetSize } from "../utils/chartHelpers";

// Load data sources from IndexedDB on startup
let _idbInitialized = false;
async function initDataSourcesFromIDB(set) {
  if (_idbInitialized) return;
  _idbInitialized = true;
  try {
    const idbSources = await loadDataSourcesIDB();
    if (idbSources && idbSources.length > 0) {
      set({ dataSources: idbSources });
    }
  } catch (e) {
    console.warn("Failed to load from IndexedDB, falling back to localStorage", e);
  }
}

// Check inactivity on startup — if > 1 day, clear session
const _sessionExpired = checkInactivity();
const _initialEnvId = _sessionExpired ? null : getSessionEnvId();

const useDashboardStore = create((set, get) => {
  // Trigger async IDB load after store creation
  // Trigger async: load environment data if env is set, else IDB fallback
  setTimeout(async () => {
    if (_initialEnvId) {
      try {
        const env = await loadEnvironment(_initialEnvId);
        if (env) {
          set({
            environmentId: _initialEnvId,
            environmentName: env.name || _initialEnvId,
            dataSources: env.dataSources || [],
            dashboards: env.dashboards || [],
          });
          updateLastActive();
          return;
        }
      } catch (e) {
        console.warn("Failed to load environment:", e);
      }
    }
    // No environment — load from IDB as fallback
    initDataSourcesFromIDB(set);
  }, 0);

  return {
  // ─── Environment ───
  environmentId: _initialEnvId,
  environmentName: null, // display name loaded from IDB

  // ─── Data Sources ───
  dataSources: (() => {
    const custom = loadDataSources();
    return custom.length > 0 ? custom : [];
  })(),

  // ─── Saved Dashboards ───
  dashboards: _initialEnvId ? [] : loadDashboards(),

  // ─── Current Dashboard ───
  currentDashboard: {
    id: null,
    name: "Untitled Dashboard",
    widgets: [],
    globalFilters: {
      search: "",
      dynamic: [],
    },
  },

  // ─── UI State ───
  sidebarOpen: true,
  configPanelOpen: false,
  selectedWidgetId: null,
  dataManagerOpen: false,

  // ─── Widget filter values (for filter widgets pushing values) ───
  widgetFilterValues: {},

  // ────────────────────────────────────────────
  // Environment Actions
  // ────────────────────────────────────────────

  /** Check if an environment exists (returns env object or null) */
  checkEnvironment: async (envId) => {
    const trimmed = envId.trim();
    if (!trimmed) return null;
    try {
      const env = await loadEnvironment(trimmed);
      return env || null;
    } catch (e) {
      console.error("Failed to check environment:", e);
      return null;
    }
  },

  /** Enter an existing environment by ID */
  enterEnvironment: async (envId) => {
    const trimmed = envId.trim();
    if (!trimmed) return false;
    try {
      const env = await loadEnvironment(trimmed);
      if (!env) return false;
      setSessionEnvId(trimmed);
      updateLastActive();
      set({
        environmentId: trimmed,
        environmentName: env.name || trimmed,
        dataSources: env.dataSources || [],
        dashboards: env.dashboards || [],
        currentDashboard: {
          id: null,
          name: "Untitled Dashboard",
          widgets: [],
          globalFilters: { search: "", dynamic: [] },
        },
        configPanelOpen: false,
        selectedWidgetId: null,
      });
      return true;
    } catch (e) {
      console.error("Failed to enter environment:", e);
      return false;
    }
  },

  /** Create a new environment with a display name */
  createEnvironment: async (envId, displayName) => {
    const trimmed = envId.trim();
    if (!trimmed) return false;
    try {
      // Check if already exists
      const existing = await loadEnvironment(trimmed);
      if (existing) return false; // cannot create duplicate
      const env = {
        id: trimmed,
        name: displayName || trimmed,
        dashboards: [],
        dataSources: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      await saveEnvironment(env);
      setSessionEnvId(trimmed);
      updateLastActive();
      set({
        environmentId: trimmed,
        environmentName: displayName || trimmed,
        dataSources: [],
        dashboards: [],
        currentDashboard: {
          id: null,
          name: "Untitled Dashboard",
          widgets: [],
          globalFilters: { search: "", dynamic: [] },
        },
        configPanelOpen: false,
        selectedWidgetId: null,
      });
      return true;
    } catch (e) {
      console.error("Failed to create environment:", e);
      return false;
    }
  },

  /** Leave current environment */
  leaveEnvironment: () => {
    clearSession();
    set({
      environmentId: null,
      environmentName: null,
      dataSources: [],
      dashboards: [],
      currentDashboard: {
        id: null,
        name: "Untitled Dashboard",
        widgets: [],
        globalFilters: { search: "", dynamic: [] },
      },
      configPanelOpen: false,
      selectedWidgetId: null,
    });
  },

  /** Delete current environment and leave */
  deleteCurrentEnvironment: async () => {
    const envId = get().environmentId;
    if (!envId) return false;
    try {
      await deleteEnvFromDB(envId);
      clearSession();
      set({
        environmentId: null,
        environmentName: null,
        dataSources: [],
        dashboards: [],
        currentDashboard: {
          id: null,
          name: "Untitled Dashboard",
          widgets: [],
          globalFilters: { search: "", dynamic: [] },
        },
        configPanelOpen: false,
        selectedWidgetId: null,
      });
      return true;
    } catch (e) {
      console.error("Failed to delete environment:", e);
      return false;
    }
  },

  /** Persist current state to environment (called after save/data changes) */
  _persistToEnvironment: async () => {
    const state = get();
    if (!state.environmentId) return;
    try {
      const env = {
        id: state.environmentId,
        name: state.environmentName || state.environmentId,
        dashboards: state.dashboards,
        dataSources: state.dataSources.filter((d) => d.type !== "builtin"),
        lastModified: new Date().toISOString(),
      };
      // Preserve createdAt from existing
      const existing = await loadEnvironment(state.environmentId);
      if (existing) env.createdAt = existing.createdAt;
      else env.createdAt = new Date().toISOString();
      await saveEnvironment(env);
      updateLastActive();
    } catch (e) {
      console.error("Failed to persist to environment:", e);
    }
  },

  // ────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────

  /** Toggle left sidebar */
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  /** Open / close data manager */
  setDataManagerOpen: (open) => set({ dataManagerOpen: open }),

  /** Select a widget and open config panel */
  selectWidget: (id) =>
    set({ selectedWidgetId: id, configPanelOpen: id != null }),

  /** Close config panel */
  closeConfigPanel: () =>
    set({ configPanelOpen: false, selectedWidgetId: null }),

  /** Update dashboard name */
  setDashboardName: (name) =>
    set((s) => ({
      currentDashboard: { ...s.currentDashboard, name },
    })),

  /** Update dashboard theme (background, gradient, etc.) */
  setDashboardTheme: (themeUpdates) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        theme: { ...(s.currentDashboard.theme || {}), ...themeUpdates },
      },
    })),

  /** Set global filter value */
  setGlobalFilter: (key, value) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        globalFilters: {
          ...s.currentDashboard.globalFilters,
          [key]: value,
        },
      },
    })),

  /** Clear all global filters */
  clearGlobalFilters: () =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        globalFilters: {
          search: "",
          dynamic: (s.currentDashboard.globalFilters?.dynamic || []).map((df) => ({
            ...df,
            values: [],
          })),
        },
      },
    })),

  // ─── Widget CRUD ───

  /**
   * Add a new widget to the canvas.
   * @param {string} type - Widget type (bar, line, pie, kpi, table, etc.)
   * @param {object} [position] - Optional { x, y } grid position
   */
  addWidget: (type, position = null) => {
    const id = `widget-${generateId()}`;
    const size = getDefaultWidgetSize(type);
    const config = getDefaultWidgetConfig(type);

    // Find the lowest available y position
    const state = get();
    const widgets = state.currentDashboard.widgets;
    let y = 0;
    if (widgets.length > 0) {
      y = Math.max(...widgets.map((w) => (w.y || 0) + (w.h || 2)));
    }

    const widget = {
      i: id,
      x: position?.x ?? 0,
      y: position?.y ?? y,
      w: size.w,
      h: size.h,
      type,
      title: getWidgetDefaultTitle(type),
      config,
    };

    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: [...s.currentDashboard.widgets, widget],
      },
      selectedWidgetId: id,
      configPanelOpen: true,
    }));

    return id;
  },

  /** Remove a widget by id */
  removeWidget: (id) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: s.currentDashboard.widgets.filter((w) => w.i !== id),
      },
      selectedWidgetId:
        s.selectedWidgetId === id ? null : s.selectedWidgetId,
      configPanelOpen: s.selectedWidgetId === id ? false : s.configPanelOpen,
    })),

  /** Duplicate a widget (deep copy with new id, placed below original) */
  duplicateWidget: (id) => {
    const state = get();
    const original = state.currentDashboard.widgets.find((w) => w.i === id);
    if (!original) return null;
    const newId = `widget-${generateId()}`;
    const clone = JSON.parse(JSON.stringify(original));
    clone.i = newId;
    clone.y = (original.y || 0) + (original.h || 3); // place below original
    clone.title = `${original.title} (Copy)`;
    clone.pinned = false;
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: [...s.currentDashboard.widgets, clone],
      },
    }));
    return newId;
  },

  /** Update a widget's config */
  updateWidgetConfig: (id, config) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: s.currentDashboard.widgets.map((w) =>
          w.i === id ? { ...w, config: { ...w.config, ...config } } : w
        ),
      },
    })),

  /** Update a widget's title */
  updateWidgetTitle: (id, title) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: s.currentDashboard.widgets.map((w) =>
          w.i === id ? { ...w, title } : w
        ),
      },
    })),

  /** Toggle pin/unpin a widget (prevent moving/resizing) */
  toggleWidgetPin: (id) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: s.currentDashboard.widgets.map((w) =>
          w.i === id ? { ...w, pinned: !w.pinned } : w
        ),
      },
    })),

  /** Update layout positions (called by react-grid-layout) */
  updateLayout: (layout) =>
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: s.currentDashboard.widgets.map((w) => {
          const l = layout.find((item) => item.i === w.i);
          if (l) return { ...w, x: l.x, y: l.y, w: l.w, h: l.h };
          return w;
        }),
      },
    })),

  /** Set a widget filter value (for filter widgets broadcasting) */
  setWidgetFilterValue: (widgetId, value) =>
    set((s) => ({
      widgetFilterValues: { ...s.widgetFilterValues, [widgetId]: value },
    })),

  // ─── Dashboard Persistence ───

  /** Save current dashboard to localStorage and environment */
  saveDashboard: () => {
    const state = get();
    const dashboard = {
      ...state.currentDashboard,
      id: state.currentDashboard.id || generateId(),
      lastModified: new Date().toISOString(),
      createdAt:
        state.currentDashboard.createdAt || new Date().toISOString(),
    };

    const existing = state.dashboards;
    const idx = existing.findIndex((d) => d.id === dashboard.id);
    let updated;
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = dashboard;
    } else {
      updated = [...existing, dashboard];
    }
    saveDashboards(updated);
    set({
      dashboards: updated,
      currentDashboard: dashboard,
    });
    // Persist to environment
    setTimeout(() => get()._persistToEnvironment(), 0);
  },

  /** Load a dashboard by id */
  loadDashboard: (id) => {
    const state = get();
    const dashboard = state.dashboards.find((d) => d.id === id);
    if (dashboard) {
      set({
        currentDashboard: { ...dashboard },
        configPanelOpen: false,
        selectedWidgetId: null,
      });
    }
  },

  /** Delete a saved dashboard */
  deleteDashboard: (id) => {
    const state = get();
    const updated = state.dashboards.filter((d) => d.id !== id);
    saveDashboards(updated);
    set({ dashboards: updated });
    setTimeout(() => get()._persistToEnvironment(), 0);
  },

  /** Create new empty dashboard */
  newDashboard: () =>
    set({
      currentDashboard: {
        id: null,
        name: "Untitled Dashboard",
        widgets: [],
        globalFilters: {
          search: "",
          dynamic: [],
        },
      },
      configPanelOpen: false,
      selectedWidgetId: null,
    }),

  /** Import a dashboard from a JSON object */
  importDashboardData: (data) => {
    if (!data || !data.widgets) return false;
    const dashboard = {
      ...data,
      id: data.id || generateId(),
      lastModified: new Date().toISOString(),
    };
    set({ currentDashboard: dashboard });
    return true;
  },

  // ─── Data Source Management ───

  /** Add a new data source */
  addDataSource: (dataSource) => {
    const ds = {
      ...dataSource,
      id: dataSource.id || generateId(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    set((s) => {
      const updated = [...s.dataSources, ds];
      const custom = updated.filter((d) => d.type !== "builtin");
      saveDataSources(custom);
      saveDataSourcesIDB(custom).catch(console.error);
      return { dataSources: updated };
    });
    setTimeout(() => get()._persistToEnvironment(), 0);
  },

  /** Update a data source */
  updateDataSource: (id, updates) => {
    set((s) => {
      const updated = s.dataSources.map((ds) =>
        ds.id === id
          ? { ...ds, ...updates, lastModified: new Date().toISOString() }
          : ds
      );
      const custom = updated.filter((d) => d.type !== "builtin");
      saveDataSources(custom);
      saveDataSourcesIDB(custom).catch(console.error);
      return { dataSources: updated };
    });
    setTimeout(() => get()._persistToEnvironment(), 0);
  },

  /** Delete a data source */
  deleteDataSource: (id) => {
    set((s) => {
      const updated = s.dataSources.filter((ds) => ds.id !== id);
      const custom = updated.filter((d) => d.type !== "builtin");
      saveDataSources(custom);
      deleteDataSourceIDB(id).catch(console.error);
      saveDataSourcesIDB(custom).catch(console.error);
      return { dataSources: updated };
    });
    setTimeout(() => get()._persistToEnvironment(), 0);
  },

  /** Get data source by id */
  getDataSource: (id) => {
    return get().dataSources.find((ds) => ds.id === id);
  },

  /** Remap all widgets from one data source to another */
  remapDataSource: (oldDsId, newDsId) => {
    set((s) => ({
      currentDashboard: {
        ...s.currentDashboard,
        widgets: s.currentDashboard.widgets.map((w) => {
          if (w.config?.dataSource === oldDsId) {
            return { ...w, config: { ...w.config, dataSource: newDsId } };
          }
          return w;
        }),
      },
    }));
  },
}});

/** Get a default human-readable title for a widget type */
function getWidgetDefaultTitle(type) {
  const titles = {
    bar: "Bar Chart",
    line: "Line Chart",
    area: "Area Chart",
    pie: "Pie Chart",
    kpi: "KPI Card",
    table: "Data Table",
    "dropdown-filter": "Filter",
    "date-range-filter": "Date Range",
    text: "Text",
    // Advanced Charts
    scatter: "Scatter Plot",
    heatmap: "Heatmap",
    gauge: "Gauge",
    funnel: "Funnel Chart",
    waterfall: "Waterfall Chart",
    radar: "Radar Chart",
    treemap: "Treemap",
    combo: "Combo Chart",
    boxplot: "Box Plot",
    sankey: "Sankey Diagram",
    // Enhanced Filters
    "multiselect-filter": "Multi-Select Filter",
    "range-slider-filter": "Range Slider",
    "search-filter": "Search Filter",
    "checkbox-group-filter": "Checkbox Filter",
    "toggle-filter": "Toggle Filter",
  };
  return titles[type] || "Widget";
}

export default useDashboardStore;
