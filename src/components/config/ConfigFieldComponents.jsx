/**
 * ConfigFieldComponents — Shared professional UI components for config panels.
 * Provides consistent, polished field layouts across all chart/widget configs.
 */
import React from "react";

/**
 * Section group with a label and optional icon.
 */
export function ConfigSection({ label, icon, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        className={`w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-gray-700 bg-gray-50 ${collapsible ? "cursor-pointer hover:bg-gray-100" : "cursor-default"}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        {icon && <span className="text-brand-600">{icon}</span>}
        <span className="uppercase tracking-wider">{label}</span>
        {collapsible && (
          <svg className={`ml-auto w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </button>
      {(!collapsible || open) && (
        <div className="px-3 py-2.5 space-y-2.5">{children}</div>
      )}
    </div>
  );
}

/**
 * A select dropdown with a label and optional field type badge.
 */
export function ConfigSelect({ label, value, onChange, options, placeholder, badge, className = "" }) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 mb-1">
        {label}
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
            badge === "dimension" ? "bg-blue-100 text-blue-700" :
            badge === "measure" ? "bg-emerald-100 text-emerald-700" :
            badge === "optional" ? "bg-gray-100 text-gray-500" :
            "bg-purple-100 text-purple-700"
          }`}>
            {badge}
          </span>
        )}
      </label>
      <select
        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 bg-white transition-colors"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
            {typeof opt === "string" ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * A number input with a label.
 */
export function ConfigNumber({ label, value, onChange, min, max, step, placeholder, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 bg-white transition-colors"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
}

/**
 * A checkbox toggle with label.
 */
export function ConfigToggle({ label, checked, onChange, description }) {
  return (
    <label className="flex items-start gap-2 text-xs cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-400"
      />
      <div>
        <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
        {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

/**
 * Aggregation selector with visual pills.
 */
export function AggregationPills({ value, onChange }) {
  const options = ["sum", "average", "count", "min", "max"];
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Aggregation</label>
      <div className="flex flex-wrap gap-1">
        {options.map((a) => (
          <button
            key={a}
            type="button"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              (value || "sum") === a
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            onClick={() => onChange(a)}
          >
            {a === "average" ? "Avg" : a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Field type indicator (text/number/date).
 */
export function FieldTypeIndicator({ type }) {
  const config = {
    number: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "#" },
    text: { bg: "bg-blue-100", text: "text-blue-700", icon: "Aa" },
    date: { bg: "bg-purple-100", text: "text-purple-700", icon: "📅" },
  };
  const c = config[type] || config.text;
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold ${c.bg} ${c.text}`}>
      {c.icon}
    </span>
  );
}

/**
 * Data source quick info bar.
 */
export function DataSourceInfo({ ds, rowCount }) {
  if (!ds) return null;
  const count = rowCount || ds.data?.length || 0;
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-brand-50 rounded-lg border border-brand-200 text-[10px]">
      <span className="font-semibold text-brand-700">📊 {ds.name}</span>
      <span className="text-brand-500">{count.toLocaleString()} rows</span>
      <span className="text-brand-400">•</span>
      <span className="text-brand-500">{Object.keys(ds.data?.[0] || {}).length} fields</span>
    </div>
  );
}
