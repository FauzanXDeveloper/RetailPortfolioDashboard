/**
 * IndexedDB Storage for persistent data sources.
 * Stores imported data (CSV, Excel, JSON, API) so it survives page reloads.
 * Uses IndexedDB because localStorage has a ~5MB limit which is too small for data.
 */

const DB_NAME = "AnalyticsDashboardDB";
const DB_VERSION = 1;
const STORE_NAME = "dataSources";

/**
 * Open (or create) the IndexedDB database.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save all data sources to IndexedDB.
 */
export async function saveDataSourcesIDB(dataSources) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear existing and add all
    store.clear();
    dataSources.forEach((ds) => {
      store.put(ds);
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to save data sources to IndexedDB:", e);
    return false;
  }
}

/**
 * Load all data sources from IndexedDB.
 */
export async function loadDataSourcesIDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to load data sources from IndexedDB:", e);
    return [];
  }
}

/**
 * Delete a single data source from IndexedDB.
 */
export async function deleteDataSourceIDB(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to delete data source from IndexedDB:", e);
    return false;
  }
}

/**
 * Save a single data source to IndexedDB (upsert).
 */
export async function putDataSourceIDB(dataSource) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(dataSource);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to put data source to IndexedDB:", e);
    return false;
  }
}
