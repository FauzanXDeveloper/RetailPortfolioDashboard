/**
 * DataManager — Modal for managing data sources.
 * Lists existing data sources, allows CSV upload, manual data entry, edit/delete.
 */
import React, { useState, useRef } from "react";
import { X, Upload, Plus, Trash2, Edit3, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";

export default function DataManager() {
  const {
    dataManagerOpen,
    setDataManagerOpen,
    dataSources,
    addDataSource,
    updateDataSource,
    deleteDataSource,
  } = useDashboardStore();

  const [view, setView] = useState("list"); // list | upload | preview | edit
  const [uploadData, setUploadData] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [manualName, setManualName] = useState("");
  const [manualCols, setManualCols] = useState("name,value");
  const fileRef = useRef(null);

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
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setUploadData(results.data);
        setView("upload");
      },
      error: (err) => {
        alert("Failed to parse CSV: " + err.message);
      },
    });
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
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                  <Upload size={14} /> Upload CSV
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
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
        </div>
      </div>
    </>
  );
}
