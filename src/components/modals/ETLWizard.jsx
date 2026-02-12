/**
 * ETLWizard — Step-by-step data transformation pipeline.
 * Comprehensive: text, number, date, type conversion, row, column,
 * statistical, and advanced transformations.
 */
import React, { useState, useMemo, useCallback } from "react";
import { X, Plus, Trash2, Play, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import { applyTransformations } from "../../utils/dataTransformations";

/* ═══════════════════ CATEGORIES ═══════════════════ */

const TRANSFORM_CATEGORIES = [
  {
    label: "Type Conversion",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    items: [
      { type: "changeDataType", name: "Change Data Type" },
      { type: "parseDate",      name: "Parse Date (Excel Serial / Unix)" },
    ],
  },
  {
    label: "Text",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    items: [
      { type: "trim",            name: "Trim Whitespace" },
      { type: "changeCase",      name: "Change Case" },
      { type: "findReplace",     name: "Find & Replace" },
      { type: "extractSubstring", name: "Extract Substring" },
      { type: "padText",         name: "Pad Text" },
      { type: "regexExtract",    name: "Regex Extract" },
      { type: "stringLength",    name: "String Length" },
      { type: "concat",          name: "Concatenate Columns" },
    ],
  },
  {
    label: "Number",
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    items: [
      { type: "toNumber",        name: "Convert to Number" },
      { type: "removeCurrency",  name: "Remove Currency Symbols" },
      { type: "round",           name: "Round Numbers" },
      { type: "fillNull",        name: "Fill Null with Value" },
      { type: "fillNullStats",   name: "Fill Null with Statistics" },
      { type: "mathOperation",   name: "Math Operation (+, −, ×, ÷)" },
      { type: "percentOfTotal",  name: "Percent of Total" },
      { type: "runningTotal",    name: "Running Total" },
      { type: "rank",            name: "Rank Column" },
      { type: "normalize",       name: "Normalize (0–1)" },
      { type: "binBucket",       name: "Bin / Bucket" },
    ],
  },
  {
    label: "Date",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    items: [
      { type: "extractDate",     name: "Extract Date Part" },
      { type: "dateDiff",        name: "Date Difference" },
    ],
  },
  {
    label: "Rows",
    color: "bg-red-100 text-red-700 hover:bg-red-200",
    items: [
      { type: "removeDuplicates", name: "Remove Duplicates" },
      { type: "removeNulls",     name: "Remove Null Rows" },
      { type: "filterRows",      name: "Filter Rows" },
      { type: "sort",            name: "Sort Rows" },
      { type: "limit",           name: "Limit Rows" },
      { type: "sample",          name: "Random Sample" },
      { type: "conditional",     name: "Conditional (If/Else)" },
    ],
  },
  {
    label: "Columns",
    color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
    items: [
      { type: "rename",     name: "Rename Column" },
      { type: "delete",     name: "Delete Column" },
      { type: "duplicate",  name: "Duplicate Column" },
      { type: "split",      name: "Split Column" },
      { type: "calculated", name: "Calculated Column (Formula)" },
      { type: "groupAggregate", name: "Group Aggregate" },
    ],
  },
];

/* ═══════════════════ PARAM EDITORS ═══════════════════ */

function StepParamEditor({ step, columns, onChange }) {
  const u = (key, value) => onChange({ ...step, [key]: value });

  const colSelect = (label, field) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select className="w-full text-xs border rounded px-2 py-1.5" value={step[field] || ""} onChange={(e) => u(field, e.target.value)}>
        <option value="">Select column…</option>
        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );

  const textInput = (label, field, placeholder) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input className="w-full text-xs border rounded px-2 py-1.5" value={step[field] || ""} onChange={(e) => u(field, e.target.value)} placeholder={placeholder} />
    </div>
  );

  const numInput = (label, field, defVal, min, max) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="number" className="w-full text-xs border rounded px-2 py-1.5" value={step[field] ?? defVal} onChange={(e) => u(field, Number(e.target.value))} min={min} max={max} />
    </div>
  );

  switch (step.type) {
    // ── Type Conversion ──
    case "changeDataType":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Target Type</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.targetType || "text"} onChange={(e) => u("targetType", e.target.value)}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="integer">Integer</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="datetime">Date & Time</option>
            </select>
          </div>
          {(step.targetType === "date" || step.targetType === "datetime") && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source Date Format</label>
              <select className="w-full text-xs border rounded px-2 py-1.5" value={step.dateFormat || "auto"} onChange={(e) => u("dateFormat", e.target.value)}>
                <option value="auto">Auto-detect</option>
                <option value="excel_serial">Excel Serial Number (e.g. 45202)</option>
                <option value="unix_s">Unix Timestamp (seconds)</option>
                <option value="unix_ms">Unix Timestamp (milliseconds)</option>
              </select>
            </div>
          )}
        </div>
      );

    case "parseDate":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Source Format</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.dateFormat || "excel_serial"} onChange={(e) => u("dateFormat", e.target.value)}>
              <option value="excel_serial">Excel Serial Number (45202 → 2023-10-15)</option>
              <option value="unix_s">Unix Timestamp (seconds)</option>
              <option value="unix_ms">Unix Timestamp (milliseconds)</option>
              <option value="auto">Auto-detect (string → date)</option>
            </select>
          </div>
          <p className="text-[10px] text-gray-400">Converts the column values to YYYY-MM-DD date strings</p>
        </div>
      );

    // ── Text ──
    case "trim":
    case "removeCurrency":
    case "toNumber":
    case "delete":
      return colSelect("Column", "column");

    case "changeCase":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Case</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.caseType || "upper"} onChange={(e) => u("caseType", e.target.value)}>
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
              <option value="capitalize">Capitalize Each Word</option>
              <option value="sentence">Sentence case</option>
            </select>
          </div>
        </div>
      );

    case "findReplace":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("Find", "find", "text to find")}
          {textInput("Replace With", "replace", "replacement text")}
        </div>
      );

    case "extractSubstring":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {numInput("Start Position", "start", 0, 0, 9999)}
          {numInput("Length", "length", 10, 1, 9999)}
          {textInput("New Column Name", "newCol", "extracted")}
        </div>
      );

    case "padText":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Side</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.side || "left"} onChange={(e) => u("side", e.target.value)}>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          {textInput("Pad Character", "padChar", "0")}
          {numInput("Total Length", "totalLength", 10, 1, 100)}
        </div>
      );

    case "regexExtract":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("Regex Pattern", "pattern", "e.g. (\\d{4})")}
          {textInput("New Column Name", "newCol", "extracted")}
          <p className="text-[10px] text-gray-400">Uses first capture group if available, otherwise full match</p>
        </div>
      );

    case "stringLength":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("New Column Name", "newCol", "column_length")}
        </div>
      );

    case "concat":
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Columns to Concatenate</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {columns.map((c) => (
                <label key={c} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <input type="checkbox" checked={(step.columns || []).includes(c)} onChange={(e) => {
                    const cols = step.columns || [];
                    u("columns", e.target.checked ? [...cols, c] : cols.filter((x) => x !== c));
                  }} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          {textInput("Separator", "separator", "e.g. , or -")}
          {textInput("New Column Name", "newCol", "concatenated")}
        </div>
      );

    // ── Number ──
    case "round":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {numInput("Decimal Places", "decimals", 2, 0, 10)}
        </div>
      );

    case "fillNull":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("Fill Value", "value", "Value to fill nulls")}
        </div>
      );

    case "fillNullStats":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Statistic</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.stat || "average"} onChange={(e) => u("stat", e.target.value)}>
              <option value="average">Average (Mean)</option>
              <option value="median">Median</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>
        </div>
      );

    case "mathOperation":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Operation</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.operation || "add"} onChange={(e) => u("operation", e.target.value)}>
              <option value="add">Add (+)</option>
              <option value="subtract">Subtract (−)</option>
              <option value="multiply">Multiply (×)</option>
              <option value="divide">Divide (÷)</option>
              <option value="power">Power (^)</option>
              <option value="modulo">Modulo (%)</option>
              <option value="abs">Absolute Value</option>
              <option value="sqrt">Square Root</option>
              <option value="log">Natural Log</option>
              <option value="ceil">Round Up (Ceil)</option>
              <option value="floor">Round Down (Floor)</option>
            </select>
          </div>
          {!["abs", "sqrt", "log", "ceil", "floor"].includes(step.operation) && numInput("Operand", "operand", 0)}
          {textInput("New Column (optional)", "newCol", "leave blank to overwrite")}
        </div>
      );

    case "percentOfTotal":
    case "runningTotal":
    case "normalize":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("New Column Name", "newCol", `${step.column || "col"}_${step.type === "percentOfTotal" ? "pct" : step.type === "runningTotal" ? "running" : "norm"}`)}
        </div>
      );

    case "rank":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direction</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.direction || "desc"} onChange={(e) => u("direction", e.target.value)}>
              <option value="desc">Highest = Rank 1</option>
              <option value="asc">Lowest = Rank 1</option>
            </select>
          </div>
          {textInput("New Column Name", "newCol", "rank")}
        </div>
      );

    case "binBucket":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {numInput("Number of Bins", "bins", 5, 2, 50)}
          {textInput("New Column Name", "newCol", "bin")}
        </div>
      );

    // ── Date ──
    case "extractDate":
      return (
        <div className="space-y-2">
          {colSelect("Date Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Extract</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.part || "year"} onChange={(e) => u("part", e.target.value)}>
              {["year", "month", "monthName", "day", "quarter", "dayOfWeek", "weekNumber", "hour", "minute"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {textInput("New Column Name", "newCol", "e.g. order_year")}
        </div>
      );

    case "dateDiff":
      return (
        <div className="space-y-2">
          {colSelect("Start Date Column", "column")}
          {colSelect("End Date Column", "column2")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.unit || "days"} onChange={(e) => u("unit", e.target.value)}>
              <option value="days">Days</option>
              <option value="hours">Hours</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
          {textInput("New Column Name", "newCol", "date_diff")}
        </div>
      );

    // ── Rows ──
    case "removeDuplicates":
      return (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deduplicate by Columns (empty = all)</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {columns.map((c) => (
              <label key={c} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                <input type="checkbox" checked={(step.columns || []).includes(c)} onChange={(e) => {
                  const cols = step.columns || [];
                  u("columns", e.target.checked ? [...cols, c] : cols.filter((x) => x !== c));
                }} />
                {c}
              </label>
            ))}
          </div>
        </div>
      );

    case "removeNulls":
      return (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Columns (must all be non-null)</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {columns.map((c) => (
              <label key={c} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                <input type="checkbox" checked={(step.columns || []).includes(c)} onChange={(e) => {
                  const cols = step.columns || [];
                  u("columns", e.target.checked ? [...cols, c] : cols.filter((x) => x !== c));
                }} />
                {c}
              </label>
            ))}
          </div>
        </div>
      );

    case "filterRows":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.operator || "equals"} onChange={(e) => u("operator", e.target.value)}>
              {["equals", "not_equals", "greater_than", "less_than", "greater_equal", "less_equal", "contains", "not_contains", "starts_with", "ends_with", "regex_match", "is_null", "not_null", "between"].map((op) => <option key={op} value={op}>{op.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          {!["is_null", "not_null"].includes(step.operator) && textInput("Value", "value", step.operator === "between" ? "min, max" : "value")}
        </div>
      );

    case "sort":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direction</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.direction || "asc"} onChange={(e) => u("direction", e.target.value)}>
              <option value="asc">Ascending ↑</option>
              <option value="desc">Descending ↓</option>
            </select>
          </div>
        </div>
      );

    case "limit":
      return (
        <div className="space-y-2">
          {numInput("Count", "count", 100, 1)}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.from || "top"} onChange={(e) => u("from", e.target.value)}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      );

    case "sample":
      return numInput("Sample Size", "count", 100, 1);

    case "conditional":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.operator || "equals"} onChange={(e) => u("operator", e.target.value)}>
              {["equals", "not_equals", "greater_than", "less_than", "contains", "is_null", "not_null"].map((op) => <option key={op} value={op}>{op.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          {!["is_null", "not_null"].includes(step.operator) && textInput("Compare Value", "compareValue", "")}
          {textInput("If True →", "trueValue", "value when condition is true")}
          {textInput("If False →", "falseValue", "value when condition is false")}
          {textInput("New Column Name", "newCol", "result")}
        </div>
      );

    // ── Columns ──
    case "rename":
      return (
        <div className="space-y-2">
          {colSelect("Column", "oldName")}
          {textInput("New Name", "newName", "")}
        </div>
      );

    case "duplicate":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("New Column Name", "newCol", "column_copy")}
        </div>
      );

    case "split":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          {textInput("Separator", "separator", "e.g. , or - or /")}
          {textInput("New Column Names (comma-separated)", "newColsStr", "col1, col2")}
          <p className="text-[10px] text-gray-400">Comma-separated names for each split part</p>
        </div>
      );

    case "calculated":
      return (
        <div className="space-y-2">
          {textInput("New Column Name", "colName", "")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Formula</label>
            <input className="w-full text-xs border rounded px-2 py-1.5 font-mono" value={step.formula || ""} onChange={(e) => u("formula", e.target.value)} placeholder="e.g. {price} * {quantity}" />
            <p className="text-[10px] text-gray-400 mt-1">Use {"{column_name}"} to reference columns. Supports +, −, ×, ÷, %, ()</p>
          </div>
        </div>
      );

    case "groupAggregate":
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Group By Columns</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {columns.map((c) => (
                <label key={c} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <input type="checkbox" checked={(step.groupColumns || []).includes(c)} onChange={(e) => {
                    const cols = step.groupColumns || [];
                    u("groupColumns", e.target.checked ? [...cols, c] : cols.filter((x) => x !== c));
                  }} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          {colSelect("Value Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.aggType || "sum"} onChange={(e) => u("aggType", e.target.value)}>
              <option value="sum">Sum</option>
              <option value="average">Average</option>
              <option value="count">Count</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>
          </div>
          {textInput("New Column Name", "newCol", "agg_result")}
        </div>
      );

    default:
      return <p className="text-xs text-gray-500">No additional parameters needed.</p>;
  }
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function ETLWizard({ dataSource, onApply, onClose }) {
  const [steps, setSteps] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  const columns = useMemo(() => {
    if (!dataSource?.data?.length) return [];
    return Object.keys(dataSource.data[0]);
  }, [dataSource]);

  const addStep = useCallback((type, name) => {
    setSteps((prev) => [...prev, { id: Date.now(), type, name }]);
    setShowPicker(false);
  }, []);

  const updateStep = useCallback((idx, step) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? step : s)));
  }, []);

  const removeStep = useCallback((idx) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const moveStep = useCallback((idx, dir) => {
    setSteps((prev) => {
      const next = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  // Preprocess steps: convert "split" newColsStr to newCols array
  const processedSteps = useMemo(() => {
    return steps.map((s) => {
      if (s.type === "split" && s.newColsStr) {
        return { ...s, newCols: s.newColsStr.split(",").map((x) => x.trim()).filter(Boolean) };
      }
      return s;
    });
  }, [steps]);

  const runPreview = useCallback(() => {
    if (!dataSource?.data) return;
    setError(null);
    try {
      const result = applyTransformations(dataSource.data, processedSteps);
      setPreviewData(result.slice(0, 20));
    } catch (err) {
      setError(err.message);
    }
  }, [dataSource, processedSteps]);

  const handleApply = useCallback(() => {
    if (!dataSource?.data) return;
    setError(null);
    try {
      const result = applyTransformations(dataSource.data, processedSteps);
      onApply(result, processedSteps);
    } catch (err) {
      setError(err.message);
    }
  }, [dataSource, processedSteps, onApply]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-800">ETL Pipeline</h2>
            <p className="text-xs text-gray-500">Transform "{dataSource?.name}" · {dataSource?.data?.length || 0} rows · {columns.length} columns</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            ⚠️ {error}
          </div>
        )}

        <div className="flex-1 overflow-auto flex">
          {/* Left: Steps */}
          <div className="w-1/2 border-r p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Transformation Steps</h3>
              <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                <Plus size={14} /> Add Step
              </button>
            </div>

            {steps.length === 0 && !showPicker ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No steps yet. Click "Add Step" to begin.
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={step.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                        <span className="text-xs font-medium text-gray-700">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDown size={12} /></button>
                        <button onClick={() => removeStep(idx)} className="p-0.5 hover:bg-red-100 rounded"><Trash2 size={12} className="text-red-400" /></button>
                      </div>
                    </div>
                    <StepParamEditor step={step} columns={columns} onChange={(s) => updateStep(idx, s)} />
                  </div>
                ))}
              </div>
            )}

            {/* Step Picker */}
            {showPicker && (
              <div className="mt-3 border rounded-lg bg-white shadow-lg p-3 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-600">Choose Transformation</h4>
                  <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>
                {TRANSFORM_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{cat.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item) => (
                        <button key={item.type} onClick={() => addStep(item.type, item.name)} className={`text-xs px-2 py-1 rounded font-medium transition-colors ${cat.color}`}>
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="w-1/2 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
              <button onClick={runPreview} disabled={steps.length === 0} className="flex items-center gap-1 text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 disabled:opacity-40">
                <Play size={12} /> Run Preview
              </button>
            </div>

            {previewData ? (
              <div className="overflow-auto border rounded">
                <table className="text-[10px] w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left font-semibold text-gray-500 whitespace-nowrap">#</th>
                      {Object.keys(previewData[0] || {}).map((k) => (
                        <th key={k} className="px-2 py-1 text-left font-semibold text-gray-600 whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-2 py-1 text-gray-400">{i + 1}</td>
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1 whitespace-nowrap max-w-[150px] truncate">{v == null ? <span className="text-gray-300">null</span> : String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-gray-400 p-2">Showing first {previewData.length} rows · {Object.keys(previewData[0] || {}).length} columns</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Click "Run Preview" to see results
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500">{steps.length} step{steps.length !== 1 ? "s" : ""} configured</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-xs border rounded-lg hover:bg-gray-100">Cancel</button>
            <button onClick={handleApply} disabled={steps.length === 0} className="flex items-center gap-1 px-4 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40">
              <CheckCircle size={14} /> Apply to Data Source
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
