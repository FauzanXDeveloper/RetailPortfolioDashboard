/**
 * ImportPreview — Modal for previewing imported data before confirming.
 * Shows column mapping, data type detection, sample values, and data preview.
 */
import React, { useState, useMemo } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import { detectColumnTypes } from "../../utils/dataProcessing";

const DATA_TYPES = ["Text", "Number", "Date", "Boolean"];
const TYPE_ICONS = { Text: "Aa", Number: "#", Date: "📅", Boolean: "✓✗" };

export default function ImportPreview({ data, sourceName, sourceType, onConfirm, onBack, onCancel }) {
  const [name, setName] = useState(sourceName || "Imported Data");

  // Detect column info
  const columnInfo = useMemo(() => {
    if (!data || data.length === 0) return [];
    const cols = Object.keys(data[0]);
    const types = detectColumnTypes(data);

    return cols.map((col) => {
      const samples = data.slice(0, 3).map((row) => {
        const v = row[col];
        if (v == null) return "null";
        return String(v).length > 30 ? String(v).slice(0, 30) + "..." : String(v);
      });

      let detectedType = "Text";
      if (types[col] === "number") detectedType = "Number";
      else if (types[col] === "date") detectedType = "Date";
      else if (types[col] === "boolean") detectedType = "Boolean";

      return {
        name: col,
        originalName: col,
        detectedType,
        overrideType: detectedType,
        samples,
        included: true,
        rename: col,
      };
    });
  }, [data]);

  const [columns, setColumns] = useState(columnInfo);

  const updateColumn = (idx, updates) => {
    setColumns((prev) => prev.map((c, i) => (i === idx ? { ...c, ...updates } : c)));
  };

  const toggleAll = (included) => {
    setColumns((prev) => prev.map((c) => ({ ...c, included })));
  };

  const handleConfirm = () => {
    // Build filtered and renamed data
    const includedCols = columns.filter((c) => c.included);
    const transformedData = data.map((row) => {
      const newRow = {};
      includedCols.forEach((col) => {
        let value = row[col.originalName];
        // Type conversion
        if (col.overrideType === "Number" && value != null) {
          const num = parseFloat(String(value).replace(/[,$%]/g, ""));
          value = isNaN(num) ? value : num;
        } else if (col.overrideType === "Boolean" && value != null) {
          value = ["true", "yes", "1", "on"].includes(String(value).toLowerCase());
        }
        newRow[col.rename || col.originalName] = value;
      });
      return newRow;
    });

    onConfirm({
      name,
      data: transformedData,
      type: "custom",
    });
  };

  const previewData = data.slice(0, 10);
  const includedCount = columns.filter((c) => c.included).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Import Preview</h2>
            <p className="text-sm text-gray-500">Review and configure your data before importing</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Data Source Info */}
          <div className="bg-blue-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Source Type</label>
              <p className="mt-1 text-sm font-medium text-gray-700">{sourceType || "File Upload"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Rows</label>
              <p className="mt-1 text-sm font-medium text-gray-700">{data.length.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Columns</label>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {includedCount} / {columns.length} selected
              </p>
            </div>
          </div>

          {/* Column Mapping */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Column Mapping</h3>
              <div className="flex gap-2">
                <button onClick={() => toggleAll(true)} className="text-xs text-blue-600 hover:underline">Select All</button>
                <button onClick={() => toggleAll(false)} className="text-xs text-red-600 hover:underline">Deselect All</button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-8">✓</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Column Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-32">Data Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sample Values</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-40">Rename (Optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col, idx) => (
                    <tr key={col.originalName} className={`border-t border-gray-100 ${!col.included ? "opacity-40" : ""}`}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={col.included}
                          onChange={(e) => updateColumn(idx, { included: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-600"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-800">
                        <span className="inline-block w-5 text-center mr-1 text-xs text-gray-400">
                          {TYPE_ICONS[col.overrideType]}
                        </span>
                        {col.originalName}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={col.overrideType}
                          onChange={(e) => updateColumn(idx, { overrideType: e.target.value })}
                          className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
                        >
                          {DATA_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate">
                        {col.samples.join(" · ")}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={col.rename}
                          onChange={(e) => updateColumn(idx, { rename: e.target.value })}
                          className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
                          placeholder={col.originalName}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Data Preview (first {Math.min(10, data.length)} rows)
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {columns.filter((c) => c.included).map((col) => (
                      <th key={col.originalName} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                        {col.rename || col.originalName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-t border-gray-100 hover:bg-gray-50">
                      {columns.filter((c) => c.included).map((col) => (
                        <td key={col.originalName} className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate text-gray-700">
                          {row[col.originalName] != null ? String(row[col.originalName]) : <span className="text-gray-300">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <AlertTriangle size={12} className="inline mr-1" />
            {includedCount} columns selected · {data.length} rows will be imported
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            {onBack && (
              <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">← Back</button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!name || includedCount === 0}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check size={14} /> Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
