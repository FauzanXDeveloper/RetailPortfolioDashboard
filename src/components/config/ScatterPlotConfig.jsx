/**
 * ScatterPlotConfig — Config form for scatter plot widgets.
 */
import React, { useState } from "react";
import useDashboardStore from "../../store/dashboardStore";
import { detectColumnTypes } from "../../utils/dataProcessing";
import FilterConfig from "./FilterConfig";
import WidgetStyleConfig from "./WidgetStyleConfig";
import { ConfigSection, ConfigSelect, DataSourceInfo } from "./ConfigFieldComponents";

export default function ScatterPlotConfig({ widget }) {
  const { dataSources, updateWidgetConfig } = useDashboardStore();
  const config = widget.config || {};
  const style = config.style || {};
  const [tab, setTab] = useState("data");

  const ds = dataSources.find((d) => d.id === config.dataSource);
  const colTypes = ds ? detectColumnTypes(ds.data) : {};
  const allFields = Object.keys(colTypes).sort((a, b) => a.localeCompare(b));
  const numericFields = allFields.filter((f) => colTypes[f] === "number");

  const update = (key, value) => updateWidgetConfig(widget.i, { [key]: value });
  const updateStyle = (key, value) => updateWidgetConfig(widget.i, { style: { ...style, [key]: value } });
  const updateStyleBatch = (updates) => updateWidgetConfig(widget.i, { style: { ...style, ...updates } });

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-3">
        {["data", "filters", "style"].map((t) => (
          <button key={t} className={`px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setTab(t)}>
            {t === "data" ? "📊 Data" : t === "filters" ? "🔍 Filters" : "🎨 Style"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-3">
          <ConfigSection label="Data Source" icon="📊">
            <ConfigSelect label="Source" value={config.dataSource} onChange={(v) => update("dataSource", v)} options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))} placeholder="Select data source..." />
            {ds && <DataSourceInfo ds={ds} />}
          </ConfigSection>
          {ds && (
            <ConfigSection label="Fields" icon="📐">
              <ConfigSelect label="X-Axis" badge="measure" value={config.xAxis} onChange={(v) => update("xAxis", v)} options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))} placeholder="Select field..." />
              <ConfigSelect label="Y-Axis" badge="measure" value={config.yAxis} onChange={(v) => update("yAxis", v)} options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))} placeholder="Select field..." />
              <ConfigSelect label="Size Field" badge="optional" value={config.sizeField} onChange={(v) => update("sizeField", v)} options={allFields.map((f) => ({ value: f, label: `${f} (${colTypes[f]})` }))} placeholder="None" />
              <ConfigSelect label="Color By (Group)" badge="optional" value={config.colorBy} onChange={(v) => update("colorBy", v)} options={allFields.map((f) => ({ value: f, label: f }))} placeholder="None" />
            </ConfigSection>
          )}
        </div>
      )}

      {tab === "filters" && <FilterConfig widget={widget} fields={allFields} colTypes={colTypes} dataSource={ds} />}

      {tab === "style" && (
        <div className="space-y-3">
          <WidgetStyleConfig style={style} updateStyle={updateStyle} updateStyleBatch={updateStyleBatch} />
        </div>
      )}
    </div>
  );
}
