/**
 * ImportPreview — Modal for previewing imported data before confirming.
 * Comprehensive data type detection and conversion including:
 *   - Excel serial date numbers (e.g., 45202 → 2023-10-15)
 *   - Various date string formats (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, etc.)
 *   - Unix timestamps (seconds & milliseconds)
 *   - Percentage, Currency, Boolean auto-detection
 *   - Live conversion preview before import
 */
import React, { useState, useMemo, useCallback } from "react";
import { X, Check, AlertTriangle } from "lucide-react";

/* ═══════════════════════════════════════════════
   Data Types & Format Options
   ═══════════════════════════════════════════════ */

const DATA_TYPES = [
  { value: "Text",       label: "Text",        icon: "Aa" },
  { value: "Number",     label: "Number",      icon: "#" },
  { value: "Integer",    label: "Integer",     icon: "1" },
  { value: "Percentage", label: "Percentage",  icon: "%" },
  { value: "Currency",   label: "Currency",    icon: "$" },
  { value: "Date",       label: "Date",        icon: "📅" },
  { value: "DateTime",   label: "Date & Time", icon: "🕐" },
  { value: "Boolean",    label: "Boolean",     icon: "✓" },
];

const DATE_FORMATS = [
  { value: "auto",         label: "Auto-detect" },
  { value: "excel_serial", label: "Excel Serial Number (e.g. 45202)" },
  { value: "YYYY-MM-DD",   label: "YYYY-MM-DD (2023-10-15)" },
  { value: "MM/DD/YYYY",   label: "MM/DD/YYYY (10/15/2023)" },
  { value: "DD/MM/YYYY",   label: "DD/MM/YYYY (15/10/2023)" },
  { value: "DD-MMM-YYYY",  label: "DD-MMM-YYYY (15-Oct-2023)" },
  { value: "YYYYMMDD",     label: "YYYYMMDD (20231015)" },
  { value: "unix_s",       label: "Unix Timestamp (seconds)" },
  { value: "unix_ms",      label: "Unix Timestamp (milliseconds)" },
];

/* ═══════════════════════════════════════════════
   Conversion Helpers
   ═══════════════════════════════════════════════ */

/** Excel serial date → JS Date  (epoch = Jan 0 1900, with Lotus 1-2-3 bug) */
function excelSerialToDate(serial) {
  const n = Number(serial);
  if (isNaN(n) || n < 1) return null;
  // Excel: serial 1 = Jan 1 1900. Lotus bug: serial 60 = Feb 29 1900 (doesn't exist).
  const epoch = new Date(Date.UTC(1899, 11, 30)); // Dec 30 1899
  return new Date(epoch.getTime() + n * 86400000);
}

function looksLikeExcelSerial(val) {
  const n = Number(val);
  return !isNaN(n) && n >= 1 && n <= 2958465 && Number.isFinite(n);
}

const MONTH_NAMES = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Try parsing a date value with a specific format */
function parseDateWithFormat(val, fmt) {
  if (val == null || val === "") return null;
  const s = String(val).trim();

  // Excel serial
  if (fmt === "excel_serial") {
    if (looksLikeExcelSerial(s)) return excelSerialToDate(Number(s));
    return null;
  }

  // Unix timestamps
  if (fmt === "unix_s") {
    const d = new Date(Number(s) * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  if (fmt === "unix_ms") {
    const d = new Date(Number(s));
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYYMMDD
  if (fmt === "YYYYMMDD") {
    const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return null;
  }

  // DD/MM/YYYY
  if (fmt === "DD/MM/YYYY") {
    const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return null;
  }

  // MM/DD/YYYY
  if (fmt === "MM/DD/YYYY") {
    const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
    return null;
  }

  // YYYY-MM-DD
  if (fmt === "YYYY-MM-DD") {
    const m = s.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return null;
  }

  // DD-MMM-YYYY
  if (fmt === "DD-MMM-YYYY") {
    const m = s.match(/^(\d{1,2})[/.\s-]([A-Za-z]{3})[/.\s-](\d{4})$/);
    if (m) {
      const month = MONTH_NAMES[m[2].toLowerCase().slice(0, 3)];
      if (month !== undefined) return new Date(Number(m[3]), month, Number(m[1]));
    }
    return null;
  }

  // Auto-detect: try everything
  if (fmt === "auto") {
    // Excel serial first (only for pure numbers in range)
    if (looksLikeExcelSerial(s) && /^\d+(\.\d+)?$/.test(s)) {
      return excelSerialToDate(Number(s));
    }
    // Try ISO / native parse
    const d = new Date(s);
    if (!isNaN(d.getTime()) && s.length > 4) return d;
    // YYYYMMDD
    const m1 = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m1) return new Date(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3]));
    return null;
  }

  // Final fallback
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Convert a single value to the target type */
function convertValue(val, type, dateFormat) {
  if (val == null || val === "") return val;

  switch (type) {
    case "Number": {
      const num = parseFloat(String(val).replace(/[,$%\s]/g, ""));
      return isNaN(num) ? val : num;
    }
    case "Integer": {
      const num = parseInt(String(val).replace(/[,$%\s]/g, ""), 10);
      return isNaN(num) ? val : num;
    }
    case "Percentage": {
      const s = String(val).replace(/[%\s]/g, "");
      const num = parseFloat(s);
      return isNaN(num) ? val : num / 100;
    }
    case "Currency": {
      const num = parseFloat(String(val).replace(/[$€£¥₹,\s]/g, ""));
      return isNaN(num) ? val : num;
    }
    case "Date":
    case "DateTime": {
      const d = parseDateWithFormat(val, dateFormat || "auto");
      if (!d) return val;
      return type === "Date"
        ? d.toISOString().split("T")[0]
        : d.toISOString().replace("T", " ").slice(0, 19);
    }
    case "Boolean": {
      const s = String(val).toLowerCase().trim();
      return ["true", "yes", "1", "on", "y", "t"].includes(s);
    }
    default:
      return String(val);
  }
}

/** Smart auto-detect best type for a column */
function autoDetectType(data, colName) {
  const vals = data.slice(0, 50).map((r) => r[colName]).filter((v) => v != null && v !== "");
  if (vals.length === 0) return { type: "Text", dateFormat: "auto" };

  // Boolean check
  const boolVals = ["true", "false", "yes", "no", "1", "0", "on", "off", "y", "n", "t", "f"];
  if (vals.every((v) => boolVals.includes(String(v).toLowerCase().trim()))) {
    return { type: "Boolean", dateFormat: "auto" };
  }

  // Pure numeric check
  const allNumeric = vals.every((v) => {
    const s = String(v).replace(/[,$\s]/g, "");
    return !isNaN(Number(s)) && s !== "" && typeof v !== "boolean";
  });

  if (allNumeric) {
    const numVals = vals.map((v) => Number(String(v).replace(/[,$\s]/g, "")));
    // Check if column name hints at date
    const nameHintsDate = /date|time|day|month|year|created|updated|timestamp|due|start|end|birth|expire|period/i.test(colName);
    const allInSerialRange = numVals.every((n) => n >= 30000 && n <= 50000);

    if (allInSerialRange && nameHintsDate) {
      return { type: "Date", dateFormat: "excel_serial" };
    }
    return { type: "Number", dateFormat: "auto" };
  }

  // Percentage (e.g. "45.2%")
  if (vals.every((v) => /^\s*-?\d+\.?\d*\s*%\s*$/.test(String(v)))) {
    return { type: "Percentage", dateFormat: "auto" };
  }

  // Currency (e.g. "$1,234.56")
  if (vals.every((v) => /^[$€£¥₹]\s*[\d,.]+$|^[\d,.]+\s*[$€£¥₹]$/.test(String(v).trim()))) {
    return { type: "Currency", dateFormat: "auto" };
  }

  // Date string check
  const allDates = vals.every((v) => parseDateWithFormat(v, "auto") !== null);
  if (allDates) {
    return { type: "Date", dateFormat: "auto" };
  }

  return { type: "Text", dateFormat: "auto" };
}

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export default function ImportPreview({ data, sourceName, sourceType, onConfirm, onBack, onCancel }) {
  const [name, setName] = useState(sourceName || "Imported Data");

  const columnInfo = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).map((col) => {
      const samples = data.slice(0, 5).map((row) => {
        const v = row[col];
        if (v == null) return "null";
        return String(v).length > 30 ? String(v).slice(0, 30) + "…" : String(v);
      });
      const detected = autoDetectType(data, col);
      return {
        name: col,
        originalName: col,
        detectedType: detected.type,
        overrideType: detected.type,
        dateFormat: detected.dateFormat,
        samples,
        included: true,
        rename: col,
      };
    });
  }, [data]);

  const [columns, setColumns] = useState(columnInfo);

  const updateColumn = useCallback((idx, updates) => {
    setColumns((prev) => prev.map((c, i) => (i === idx ? { ...c, ...updates } : c)));
  }, []);

  const toggleAll = (included) => setColumns((prev) => prev.map((c) => ({ ...c, included })));

  const getConvertedPreview = useCallback((col) => {
    return data.slice(0, 3).map((row) => {
      const raw = row[col.originalName];
      if (raw == null) return "null";
      const converted = convertValue(raw, col.overrideType, col.dateFormat);
      const s = String(converted);
      return s.length > 30 ? s.slice(0, 30) + "…" : s;
    });
  }, [data]);

  const handleConfirm = () => {
    const includedCols = columns.filter((c) => c.included);
    const transformedData = data.map((row) => {
      const newRow = {};
      includedCols.forEach((col) => {
        newRow[col.rename || col.originalName] = convertValue(row[col.originalName], col.overrideType, col.dateFormat);
      });
      return newRow;
    });
    onConfirm({ name, data: transformedData, type: "custom" });
  };

  const previewData = data.slice(0, 10);
  const includedCols = columns.filter((c) => c.included);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Import Preview</h2>
            <p className="text-sm text-gray-500">Set data types, rename columns, and preview conversions before importing</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Source Info */}
          <div className="bg-blue-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md" />
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
              <p className="mt-1 text-sm font-medium text-gray-700">{includedCols.length} / {columns.length}</p>
            </div>
          </div>

          {/* Column Mapping Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Column Mapping & Data Types</h3>
              <div className="flex gap-2">
                <button onClick={() => toggleAll(true)} className="text-xs text-blue-600 hover:underline">Select All</button>
                <button onClick={() => toggleAll(false)} className="text-xs text-red-600 hover:underline">Deselect All</button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-8">✓</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Column</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-32">Data Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-40">Format / Options</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Raw → Converted</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-32">Rename</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col, idx) => {
                    const converted = getConvertedPreview(col);
                    const isDateType = col.overrideType === "Date" || col.overrideType === "DateTime";
                    return (
                      <tr key={col.originalName} className={`border-t border-gray-100 ${!col.included ? "opacity-30 bg-gray-50" : ""}`}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={col.included} onChange={(e) => updateColumn(idx, { included: e.target.checked })} className="rounded border-gray-300 text-brand-600" />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                          <span className="inline-block w-5 text-center mr-1 text-xs">{DATA_TYPES.find((t) => t.value === col.overrideType)?.icon}</span>
                          {col.originalName}
                          {col.overrideType !== col.detectedType && <span className="ml-1 text-[10px] bg-amber-50 text-amber-600 px-1 rounded">overridden</span>}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={col.overrideType}
                            onChange={(e) => {
                              const nt = e.target.value;
                              const upd = { overrideType: nt };
                              if ((nt === "Date" || nt === "DateTime") && col.overrideType !== "Date" && col.overrideType !== "DateTime") {
                                const v = data.slice(0, 10).map((r) => r[col.originalName]).filter(Boolean);
                                const allNum = v.every((x) => !isNaN(Number(x)));
                                upd.dateFormat = allNum && v.some(looksLikeExcelSerial) ? "excel_serial" : "auto";
                              }
                              updateColumn(idx, upd);
                            }}
                            className="text-xs border border-gray-200 rounded px-2 py-1 w-full focus:border-brand-400 outline-none"
                          >
                            {DATA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          {isDateType ? (
                            <select value={col.dateFormat || "auto"} onChange={(e) => updateColumn(idx, { dateFormat: e.target.value })} className="text-xs border border-gray-200 rounded px-2 py-1 w-full focus:border-brand-400 outline-none">
                              {DATE_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <div className="space-y-0.5 max-w-[240px]">
                            {col.samples.slice(0, 3).map((raw, i) => {
                              const conv = converted[i];
                              const changed = conv !== raw;
                              return (
                                <div key={i} className="flex items-center gap-1 truncate">
                                  <span className="text-gray-400 truncate max-w-[100px]">{raw}</span>
                                  <span className="text-gray-300">→</span>
                                  <span className={`truncate max-w-[100px] ${changed ? "text-green-600 font-medium" : "text-gray-500"}`}>{conv}</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input value={col.rename} onChange={(e) => updateColumn(idx, { rename: e.target.value })} className="text-xs border border-gray-200 rounded px-2 py-1 w-full outline-none" placeholder={col.originalName} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Converted Data Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Converted Data Preview (first {Math.min(10, data.length)} rows)</h3>
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-400 w-8">#</th>
                    {includedCols.map((c) => (
                      <th key={c.originalName} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                        <div>{c.rename || c.originalName}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{c.overrideType}{c.dateFormat && c.dateFormat !== "auto" && (c.overrideType === "Date" || c.overrideType === "DateTime") ? ` (${c.dateFormat})` : ""}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, ri) => (
                    <tr key={ri} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-1.5 text-gray-400">{ri + 1}</td>
                      {includedCols.map((c) => {
                        const raw = row[c.originalName];
                        const conv = convertValue(raw, c.overrideType, c.dateFormat);
                        const changed = String(conv) !== String(raw);
                        return (
                          <td key={c.originalName} className={`px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate ${changed ? "text-green-700" : "text-gray-700"}`}>
                            {conv != null ? String(conv) : <span className="text-gray-300">null</span>}
                          </td>
                        );
                      })}
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
            {includedCols.length} columns · {data.length} rows
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            {onBack && <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">← Back</button>}
            <button onClick={handleConfirm} disabled={!name || includedCols.length === 0} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1">
              <Check size={14} /> Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
