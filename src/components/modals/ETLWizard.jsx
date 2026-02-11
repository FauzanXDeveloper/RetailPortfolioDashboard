/**
 * ETLWizard — Step-by-step data transformation pipeline.
 * Users can build a chain of transformations that run sequentially.
 */
import React, { useState, useMemo, useCallback } from "react";
import { X, Plus, Trash2, Play, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import { applyTransformations } from "../../utils/dataTransformations";

const TRANSFORM_CATEGORIES = [
  {
    label: "Text",
    items: [
      { type: "trim", name: "Trim Whitespace" },
      { type: "changeCase", name: "Change Case" },
      { type: "findReplace", name: "Find & Replace" },
    ],
  },
  {
    label: "Number",
    items: [
      { type: "removeCurrency", name: "Remove Currency Symbols" },
      { type: "round", name: "Round Numbers" },
      { type: "fillNull", name: "Fill Null Values" },
      { type: "toNumber", name: "Convert to Number" },
    ],
  },
  {
    label: "Date",
    items: [
      { type: "extractDate", name: "Extract Date Part" },
    ],
  },
  {
    label: "Rows",
    items: [
      { type: "removeDuplicates", name: "Remove Duplicates" },
      { type: "removeNulls", name: "Remove Null Rows" },
      { type: "filterRows", name: "Filter Rows" },
      { type: "sort", name: "Sort Rows" },
      { type: "limit", name: "Limit Rows" },
    ],
  },
  {
    label: "Columns",
    items: [
      { type: "rename", name: "Rename Column" },
      { type: "delete", name: "Delete Column" },
      { type: "split", name: "Split Column" },
      { type: "concat", name: "Concatenate Columns" },
      { type: "calculated", name: "Calculated Column" },
    ],
  },
];

function StepParamEditor({ step, columns, onChange }) {
  const update = (key, value) => onChange({ ...step, [key]: value });

  const colSelect = (label, field) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select className="w-full text-xs border rounded px-2 py-1.5" value={step[field] || ""} onChange={(e) => update(field, e.target.value)}>
        <option value="">Select column…</option>
        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );

  switch (step.type) {
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
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.caseType || "upper"} onChange={(e) => update("caseType", e.target.value)}>
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        </div>
      );

    case "findReplace":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Find</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.find || ""} onChange={(e) => update("find", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Replace With</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.replace || ""} onChange={(e) => update("replace", e.target.value)} />
          </div>
        </div>
      );

    case "round":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Decimal Places</label>
            <input type="number" className="w-full text-xs border rounded px-2 py-1.5" value={step.decimals ?? 2} onChange={(e) => update("decimals", parseInt(e.target.value))} min={0} max={10} />
          </div>
        </div>
      );

    case "fillNull":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fill Value</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.value || ""} onChange={(e) => update("value", e.target.value)} placeholder="Value to fill nulls" />
          </div>
        </div>
      );

    case "extractDate":
      return (
        <div className="space-y-2">
          {colSelect("Date Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Extract</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.part || "year"} onChange={(e) => update("part", e.target.value)}>
              {["year", "month", "day", "quarter", "dayOfWeek", "monthName"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Column Name</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.newCol || ""} onChange={(e) => update("newCol", e.target.value)} placeholder="e.g. order_year" />
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
                  update("columns", e.target.checked ? [...cols, c] : cols.filter((x) => x !== c));
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
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.operator || "equals"} onChange={(e) => update("operator", e.target.value)}>
              {["equals", "not_equals", "greater_than", "less_than", "contains", "starts_with", "is_null", "not_null"].map((op) => <option key={op} value={op}>{op.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          {!["is_null", "not_null"].includes(step.operator) && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              <input className="w-full text-xs border rounded px-2 py-1.5" value={step.value || ""} onChange={(e) => update("value", e.target.value)} />
            </div>
          )}
        </div>
      );

    case "sort":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direction</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.direction || "asc"} onChange={(e) => update("direction", e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      );

    case "limit":
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
            <input type="number" className="w-full text-xs border rounded px-2 py-1.5" value={step.count ?? 100} onChange={(e) => update("count", parseInt(e.target.value))} min={1} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={step.from || "top"} onChange={(e) => update("from", e.target.value)}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      );

    case "rename":
      return (
        <div className="space-y-2">
          {colSelect("Column", "oldName")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Name</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.newName || ""} onChange={(e) => update("newName", e.target.value)} />
          </div>
        </div>
      );

    case "split":
      return (
        <div className="space-y-2">
          {colSelect("Column", "column")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.separator || ","} onChange={(e) => update("separator", e.target.value)} placeholder="e.g. , or - or /" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Column Names (comma-separated)</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={(step.newCols || []).join(", ")} onChange={(e) => update("newCols", e.target.value.split(",").map((s) => s.trim()))} placeholder="col1, col2" />
          </div>
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
                    update("columns", e.target.checked ? [...cols, c] : cols.filter((x) => x !== c));
                  }} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.separator || " "} onChange={(e) => update("separator", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Column Name</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.newCol || ""} onChange={(e) => update("newCol", e.target.value)} />
          </div>
        </div>
      );

    case "calculated":
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Column Name</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.colName || ""} onChange={(e) => update("colName", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Formula</label>
            <input className="w-full text-xs border rounded px-2 py-1.5" value={step.formula || ""} onChange={(e) => update("formula", e.target.value)} placeholder="e.g. {price} * {quantity}" />
            <p className="text-[10px] text-gray-400 mt-1">Use {"{column_name}"} to reference columns. Supports +, -, *, /</p>
          </div>
        </div>
      );

    case "removeDuplicates":
    default:
      return <p className="text-xs text-gray-500">No additional parameters needed.</p>;
  }
}

export default function ETLWizard({ dataSource, onApply, onClose }) {
  const [steps, setSteps] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [previewData, setPreviewData] = useState(null);

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

  const runPreview = useCallback(() => {
    if (!dataSource?.data) return;
    try {
      const result = applyTransformations(dataSource.data, steps);
      setPreviewData(result.slice(0, 20));
    } catch (err) {
      alert("Transformation error: " + err.message);
    }
  }, [dataSource, steps]);

  const handleApply = useCallback(() => {
    if (!dataSource?.data) return;
    try {
      const result = applyTransformations(dataSource.data, steps);
      onApply(result, steps);
    } catch (err) {
      alert("Transformation error: " + err.message);
    }
  }, [dataSource, steps, onApply]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-800">ETL Pipeline</h2>
            <p className="text-xs text-gray-500">Transform "{dataSource?.name}" · {dataSource?.data?.length || 0} rows</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto flex">
          {/* Left: Steps */}
          <div className="w-1/2 border-r p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Transformation Steps</h3>
              <button onClick={() => setShowPicker(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus size={14} /> Add Step
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No steps yet. Click "Add Step" to begin.
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={step.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
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

            {/* Step Picker Dropdown */}
            {showPicker && (
              <div className="mt-3 border rounded-lg bg-white shadow-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-600">Choose Transformation</h4>
                  <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>
                {TRANSFORM_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="mb-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{cat.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item) => (
                        <button key={item.type} onClick={() => addStep(item.type, item.name)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700">
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
              <button onClick={runPreview} disabled={steps.length === 0} className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40">
                <Play size={12} /> Run Preview
              </button>
            </div>

            {previewData ? (
              <div className="overflow-auto border rounded">
                <table className="text-[10px] w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(previewData[0] || {}).map((k) => (
                        <th key={k} className="px-2 py-1 text-left font-semibold text-gray-600 whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1 whitespace-nowrap">{v == null ? <span className="text-gray-300">null</span> : String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-gray-400 p-2">Showing first {previewData.length} rows</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Click "Run Preview" to see transformed data
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
