/**
 * LocalStorage helpers for dashboard persistence.
 */

const DASHBOARDS_KEY = "analytics_dashboards";
const DATASOURCES_KEY = "analytics_datasources";

/**
 * Save all dashboards to localStorage.
 */
export function saveDashboards(dashboards) {
  try {
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    return true;
  } catch (e) {
    console.error("Failed to save dashboards:", e);
    return false;
  }
}

/**
 * Load all dashboards from localStorage.
 */
export function loadDashboards() {
  try {
    const raw = localStorage.getItem(DASHBOARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load dashboards:", e);
    return [];
  }
}

/**
 * Save custom data sources to localStorage.
 */
export function saveDataSources(dataSources) {
  try {
    localStorage.setItem(DATASOURCES_KEY, JSON.stringify(dataSources));
    return true;
  } catch (e) {
    console.error("Failed to save data sources:", e);
    return false;
  }
}

/**
 * Load custom data sources from localStorage.
 */
export function loadDataSources() {
  try {
    const raw = localStorage.getItem(DATASOURCES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load data sources:", e);
    return [];
  }
}

/**
 * Export a dashboard as a JSON file download.
 */
export function exportDashboard(dashboard) {
  const json = JSON.stringify(dashboard, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dashboard.name || "dashboard"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a dashboard from a JSON file.
 * Returns a promise that resolves with the parsed dashboard object.
 */
export function importDashboard() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error("No file selected"));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          resolve(data);
        } catch (err) {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };
    input.click();
  });
}

/**
 * Generate a UUID v4.
 */
export function generateId() {
  return "xxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
