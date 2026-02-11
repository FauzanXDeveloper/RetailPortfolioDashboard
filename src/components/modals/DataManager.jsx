/**
 * DataManager — Modal for managing data sources.
 * Lists existing data sources, allows CSV upload, manual data entry, edit/delete.
 */
import React, { useState, useRef } from "react";
import { X, Upload, Plus, Trash2, Edit3, FileSpreadsheet, FileJson, Table2, Globe, Wand2 } from "lucide-react";
import Papa from "papaparse";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import ImportPreview from "./ImportPreview";
import ETLWizard from "./ETLWizard";

export default function DataManager() {
  const {
    dataManagerOpen,
    setDataManagerOpen,
    dataSources,
    addDataSource,
    updateDataSource,
    deleteDataSource,
  } = useDashboardStore();

  const [view, setView] = useState("list"); // list | upload | preview | edit | importPreview | api
  const [uploadData, setUploadData] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("CSV");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualCols, setManualCols] = useState("name,value");
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [excelSheets, setExcelSheets] = useState(null);
  const [excelWorkbook, setExcelWorkbook] = useState(null);
  const [apiConfig, setApiConfig] = useState({ url: "", method: "GET", headers: "", authType: "none", authValue: "" });
  const [etlDataSource, setEtlDataSource] = useState(null);
  const fileRef = useRef(null);
  const excelRef = useRef(null);
  const jsonRef = useRef(null);

  if (!dataManagerOpen) return null;

  const handleClose = () => {
    setDataManagerOpen(false);
    setView("list");
    setUploadData(null);
    setEditingId(null);
    setEditData(null);
  };

  // CSV Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadName(file.name.replace(/\.csv$/i, ""));
    setUploadType("CSV");
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setUploadData(results.data);
        setView("importPreview");
      },
      error: (err) => {
        alert("Failed to parse CSV: " + err.message);
      },
    });
    e.target.value = "";
  };

  // Excel Upload handler
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadName(file.name.replace(/\.(xlsx?|xls)$/i, ""));
    setUploadType("Excel");
    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheets = workbook.SheetNames;
        if (sheets.length > 1) {
          setExcelWorkbook(workbook);
          setExcelSheets(sheets);
          setView("sheetSelect");
        } else {
          const ws = workbook.Sheets[sheets[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });
          setUploadData(jsonData);
          setView("importPreview");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert("Failed to read Excel file: " + err.message);
    }
    e.target.value = "";
  };

  const handleSelectSheet = async (sheetName) => {
    const XLSX = await import("xlsx");
    const ws = excelWorkbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });
    setUploadData(jsonData);
    setUploadType(`Excel (${sheetName})`);
    setExcelSheets(null);
    setExcelWorkbook(null);
    setView("importPreview");
  };

  // JSON Upload handler
  const handleJSONUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadName(file.name.replace(/\.json$/i, ""));
    setUploadType("JSON");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let json = JSON.parse(ev.target.result);
        // If it's an object with an array, find the array
        if (!Array.isArray(json)) {
          const keys = Object.keys(json);
          const arrayKey = keys.find((k) => Array.isArray(json[k]));
          if (arrayKey) json = json[arrayKey];
          else json = [json]; // wrap single object in array
        }
        if (json.length === 0) {
          alert("JSON file contains no data.");
          return;
        }
        // Flatten nested objects
        const flat = json.map((row) => flattenObject(row));
        setUploadData(flat);
        setView("importPreview");
      } catch (err) {
        alert("Failed to parse JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // API fetch handler
  const handleAPIFetch = async () => {
    try {
      const headers = {};
      if (apiConfig.headers) {
        apiConfig.headers.split("\n").forEach((line) => {
          const [key, ...val] = line.split(":");
          if (key && val.length) headers[key.trim()] = val.join(":").trim();
        });
      }
      if (apiConfig.authType === "bearer") headers["Authorization"] = `Bearer ${apiConfig.authValue}`;
      if (apiConfig.authType === "apikey") headers["X-API-Key"] = apiConfig.authValue;

      const res = await fetch(apiConfig.url, { method: apiConfig.method, headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      let json = await res.json();

      if (!Array.isArray(json)) {
        const keys = Object.keys(json);
        const arrayKey = keys.find((k) => Array.isArray(json[k]));
        if (arrayKey) json = json[arrayKey];
        else json = [json];
      }
      const flat = json.map((row) => flattenObject(row));
      setUploadName("API Data");
      setUploadType("API");
      setUploadData(flat);
      setView("importPreview");
    } catch (err) {
      alert("API request failed: " + err.message);
    }
  };

  // Flatten nested objects
  const flattenObject = (obj, prefix = "") => {
    const result = {};
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], fullKey));
      } else {
        result[fullKey] = obj[key];
      }
    }
    return result;
  };

  // Import preview confirm handler
  const handleImportConfirm = (dataSource) => {
    addDataSource(dataSource);
    setView("list");
    setUploadData(null);
    setUploadName("");
  };

  const handleUploadConfirm = () => {
    if (!uploadData || !uploadName) return;
    addDataSource({
      name: uploadName,
      type: "custom",
      data: uploadData,
    });
    setView("list");
    setUploadData(null);
    setUploadName("");
  };

  // Manual data creation
  const handleCreateManual = () => {
    if (!manualName) return;
    const cols = manualCols.split(",").map((c) => c.trim()).filter(Boolean);
    const emptyRow = {};
    cols.forEach((c) => (emptyRow[c] = ""));
    addDataSource({
      name: manualName,
      type: "custom",
      data: [emptyRow],
    });
    setManualName("");
    setManualCols("name,value");
  };

  // Edit data source
  const startEdit = (dsId) => {
    const ds = dataSources.find((d) => d.id === dsId);
    if (!ds) return;
    setEditingId(dsId);
    setEditData(JSON.parse(JSON.stringify(ds.data)));
    setView("edit");
  };

  const handleEditCell = (rowIdx, col, value) => {
    const newData = [...editData];
    newData[rowIdx] = { ...newData[rowIdx], [col]: value };
    setEditData(newData);
  };

  const handleAddRow = () => {
    const cols = Object.keys(editData[0] || {});
    const emptyRow = {};
    cols.forEach((c) => (emptyRow[c] = ""));
    setEditData([...editData, emptyRow]);
  };

  const handleRemoveRow = (idx) => {
    setEditData(editData.filter((_, i) => i !== idx));
  };

  const handleSaveEdit = () => {
    if (editingId && editData) {
      // Auto-detect and convert number types
      const processed = editData.map((row) => {
        const newRow = {};
        Object.entries(row).forEach(([k, v]) => {
          if (v !== "" && !isNaN(Number(v))) {
            newRow[k] = Number(v);
          } else {
            newRow[k] = v;
          }
        });
        return newRow;
      });
      updateDataSource(editingId, { data: processed });
    }
    setView("list");
    setEditingId(null);
    setEditData(null);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-x-20 md:inset-y-10 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-indigo-500" />
            <h2 className="text-lg font-semibold">Data Manager</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* LIST VIEW */}
          {view === "list" && (
            <div>
              {/* Actions */}
              <div className="flex gap-2 mb-4 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowImportDropdown(!showImportDropdown)}
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                  >
                    <Upload size={14} /> Import Data ▼
                  </button>
                  {showImportDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button onClick={() => { fileRef.current?.click(); setShowImportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                        <FileSpreadsheet size={16} className="text-green-600" /> Upload CSV
                      </button>
                      <button onClick={() => { excelRef.current?.click(); setShowImportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                        <Table2 size={16} className="text-blue-600" /> Upload Excel
                      </button>
                      <button onClick={() => { jsonRef.current?.click(); setShowImportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                        <FileJson size={16} className="text-yellow-600" /> Upload JSON
                      </button>
                      <button onClick={() => { setView("api"); setShowImportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Globe size={16} className="text-purple-600" /> API Endpoint
                      </button>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                <input ref={excelRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleJSONUpload} />
              </div>

              {/* Manual data creation */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add Manual Data Source</h3>
                <div className="flex gap-2">
                  <input
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 outline-none"
                    placeholder="Data source name"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                  <input
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 outline-none"
                    placeholder="Columns (comma-separated)"
                    value={manualCols}
                    onChange={(e) => setManualCols(e.target.value)}
                  />
                  <button
                    onClick={handleCreateManual}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    disabled={!manualName}
                  >
                    <Plus size={14} /> Create
                  </button>
                </div>
              </div>

              {/* Data source list */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Name</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Type</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Rows</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Columns</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataSources.map((ds) => (
                    <tr key={ds.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium">{ds.name}</td>
                      <td className="py-2 px-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ds.type === "builtin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {ds.type}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">{ds.data?.length || 0}</td>
                      <td className="py-2 px-2 text-right">{Object.keys(ds.data?.[0] || {}).length}</td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEtlDataSource(ds)}
                            className="p-1 hover:bg-purple-100 rounded text-purple-600"
                            title="Transform (ETL)"
                          >
                            <Wand2 size={14} />
                          </button>
                          <button
                            onClick={() => startEdit(ds.id)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            title="Edit data"
                          >
                            <Edit3 size={14} />
                          </button>
                          {ds.type !== "builtin" && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete "${ds.name}"?`))
                                  deleteDataSource(ds.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* UPLOAD PREVIEW VIEW */}
          {view === "upload" && uploadData && (
            <div>
              <button
                onClick={() => setView("list")}
                className="text-sm text-indigo-600 hover:text-indigo-800 mb-3"
              >
                ← Back to list
              </button>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Data Source Name</label>
                <input
                  className="w-64 text-sm border border-gray-200 rounded px-2 py-1.5 outline-none"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Preview: {uploadData.length} rows · {Object.keys(uploadData[0] || {}).length} columns
              </p>

              {/* Column types detected */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {Object.entries(detectColumnTypes(uploadData)).map(([col, type]) => (
                  <span key={col} className={`text-xs px-2 py-0.5 rounded-full ${type === "number" ? "bg-blue-100 text-blue-800" : type === "date" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {col}: {type}
                  </span>
                ))}
              </div>

              {/* Preview table (first 10 rows) */}
              <div className="overflow-auto max-h-[300px] border border-gray-200 rounded">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {Object.keys(uploadData[0] || {}).map((col) => (
                        <th key={col} className="bg-gray-50 px-2 py-1 text-left font-semibold sticky top-0">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1">{String(v ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUploadConfirm}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                  Add Data Source
                </button>
                <button
                  onClick={() => { setView("list"); setUploadData(null); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EDIT VIEW */}
          {view === "edit" && editData && (
            <div>
              <button
                onClick={() => setView("list")}
                className="text-sm text-indigo-600 hover:text-indigo-800 mb-3"
              >
                ← Back to list
              </button>
              <p className="text-sm text-gray-500 mb-2">
                Editing: {editData.length} rows
              </p>

              <div className="overflow-auto max-h-[400px] border border-gray-200 rounded mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 px-1 py-1 text-center font-semibold w-8 sticky top-0">#</th>
                      {Object.keys(editData[0] || {}).map((col) => (
                        <th key={col} className="bg-gray-50 px-2 py-1 text-left font-semibold sticky top-0">{col}</th>
                      ))}
                      <th className="bg-gray-50 px-1 py-1 w-8 sticky top-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editData.map((row, ri) => (
                      <tr key={ri} className="border-t border-gray-100">
                        <td className="px-1 py-0.5 text-center text-gray-400">{ri + 1}</td>
                        {Object.keys(row).map((col) => (
                          <td key={col} className="px-1 py-0.5">
                            <input
                              className="w-full text-xs border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-indigo-300"
                              value={row[col] ?? ""}
                              onChange={(e) => handleEditCell(ri, col, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="px-1 py-0.5">
                          <button
                            onClick={() => handleRemoveRow(ri)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <Plus size={14} /> Add Row
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => { setView("list"); setEditingId(null); setEditData(null); }}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EXCEL SHEET SELECTOR */}
          {view === "sheetSelect" && excelSheets && (
            <div>
              <button onClick={() => { setView("list"); setExcelSheets(null); }}
                className="text-sm text-indigo-600 hover:text-indigo-800 mb-3">← Back to list</button>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select a sheet to import:</h3>
              <div className="space-y-2">
                {excelSheets.map((sheet) => (
                  <button key={sheet} onClick={() => handleSelectSheet(sheet)}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex items-center gap-2">
                    <Table2 size={16} className="text-indigo-500" />
                    <span className="font-medium">{sheet}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API CONNECTOR VIEW */}
          {view === "api" && (
            <div>
              <button onClick={() => setView("list")} className="text-sm text-indigo-600 hover:text-indigo-800 mb-3">← Back to list</button>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Connect to API Endpoint</h3>
              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">API URL</label>
                  <input value={apiConfig.url} onChange={(e) => setApiConfig({...apiConfig, url: e.target.value})}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" placeholder="https://api.example.com/data" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
                  <select value={apiConfig.method} onChange={(e) => setApiConfig({...apiConfig, method: e.target.value})}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Authentication</label>
                  <select value={apiConfig.authType} onChange={(e) => setApiConfig({...apiConfig, authType: e.target.value})}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2">
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="apikey">API Key</option>
                  </select>
                  {apiConfig.authType !== "none" && (
                    <input value={apiConfig.authValue} onChange={(e) => setApiConfig({...apiConfig, authValue: e.target.value})}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                      placeholder={apiConfig.authType === "bearer" ? "Token value" : "API Key value"} type="password" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Headers (one per line: Key: Value)</label>
                  <textarea value={apiConfig.headers} onChange={(e) => setApiConfig({...apiConfig, headers: e.target.value})}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 h-20" placeholder="Content-Type: application/json" />
                </div>
                <button onClick={handleAPIFetch} disabled={!apiConfig.url}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  Fetch Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Preview (rendered outside modal for proper layering) */}
      {view === "importPreview" && uploadData && (
        <ImportPreview
          data={uploadData}
          sourceName={uploadName}
          sourceType={uploadType}
          onConfirm={handleImportConfirm}
          onBack={() => setView("list")}
          onCancel={() => { setView("list"); setUploadData(null); }}
        />
      )}

      {/* ETL Wizard */}
      {etlDataSource && (
        <ETLWizard
          dataSource={etlDataSource}
          onApply={(transformedData) => {
            updateDataSource(etlDataSource.id, { data: transformedData });
            setEtlDataSource(null);
          }}
          onClose={() => setEtlDataSource(null)}
        />
      )}
    </>
  );
}
