/**
 * Environment Storage — IndexedDB + sessionStorage for environment-scoped workspaces.
 * Each environment has its own dashboards and data sources.
 * Environments are identified by a unique code (e.g., "123", "team-alpha").
 */

const DB_NAME = "AnalyticsDashboardEnvDB";
const DB_VERSION = 1;
const ENV_STORE = "environments";
const SESSION_KEY = "analytics_env_id";
const LAST_ACTIVE_KEY = "analytics_last_active";
const INACTIVITY_MS = 24 * 60 * 60 * 1000; // 1 day

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(ENV_STORE)) {
        db.createObjectStore(ENV_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an environment (create or update).
 * @param {{ id: string, dashboards: Array, dataSources: Array, createdAt: string, lastModified: string }} env
 */
export async function saveEnvironment(env) {
  try {
    const db = await openDB();
    const tx = db.transaction(ENV_STORE, "readwrite");
    tx.objectStore(ENV_STORE).put(env);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to save environment:", e);
    return false;
  }
}

/**
 * Load an environment by ID.
 * @param {string} envId
 * @returns {Promise<object|null>}
 */
export async function loadEnvironment(envId) {
  try {
    const db = await openDB();
    const tx = db.transaction(ENV_STORE, "readonly");
    const request = tx.objectStore(ENV_STORE).get(envId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to load environment:", e);
    return null;
  }
}

/**
 * Delete an environment by ID.
 * @param {string} envId
 */
export async function deleteEnvironment(envId) {
  try {
    const db = await openDB();
    const tx = db.transaction(ENV_STORE, "readwrite");
    tx.objectStore(ENV_STORE).delete(envId);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to delete environment:", e);
    return false;
  }
}

/**
 * Check if an environment exists.
 * @param {string} envId
 * @returns {Promise<boolean>}
 */
export async function environmentExists(envId) {
  const env = await loadEnvironment(envId);
  return env != null;
}

// ─── Session Helpers ───

/**
 * Get current environment ID from sessionStorage.
 */
export function getSessionEnvId() {
  return sessionStorage.getItem(SESSION_KEY);
}

/**
 * Set current environment ID in sessionStorage + update last active.
 */
export function setSessionEnvId(envId) {
  if (envId) {
    sessionStorage.setItem(SESSION_KEY, envId);
    updateLastActive();
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Clear the current session environment.
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Update the last-active timestamp in localStorage (survives tab close).
 */
export function updateLastActive() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

/**
 * Check if the user has been inactive for more than 1 day.
 * If so, clear the session and return true.
 */
export function checkInactivity() {
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActive) return true; // first visit
  const elapsed = Date.now() - Number(lastActive);
  if (elapsed > INACTIVITY_MS) {
    clearSession();
    return true;
  }
  return false;
}
