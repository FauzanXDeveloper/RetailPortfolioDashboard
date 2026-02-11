/**
 * Data Table Widget — Sortable, paginated table with CSV export.
 */
import React, { useMemo, useState } from "react";
import { Download, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import useDashboardStore from "../../store/dashboardStore";
import { filterData, applyGlobalFilters, applyCrossFilters, formatValue } from "../../utils/dataProcessing";

export default function DataTableWidget({ widget }) {
  const { dataSources, currentDashboard, widgetFilterValues } = useDashboardStore();
  const config = useMemo(() => widget.config || {}, [widget.config]);
  const style = config.style || {};

  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [colFilters, setColFilters] = useState({});

  const { tableData, columns } = useMemo(() => {
    const ds = dataSources.find((d) => d.id === config.dataSource);
    if (!ds) return { tableData: [], columns: [] };

    let data = [...ds.data];
    data = applyGlobalFilters(data, currentDashboard.globalFilters, config);
    data = applyCrossFilters(data, widget.i, currentDashboard.widgets, widgetFilterValues);
    if (config.filters?.length > 0) data = filterData(data, config.filters);

    const allCols = Object.keys(ds.data[0] || {});
    const columns = config.columns?.length > 0 ? config.columns : allCols;

    return { tableData: data, columns };
  }, [dataSources, config, currentDashboard.globalFilters, currentDashboard.widgets, widgetFilterValues, widget.i]);

  if (!config.dataSource) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        Configure this widget to see data.
      </div>
    );
  }

  // Column filtering
  let filtered = tableData;
  Object.entries(colFilters).forEach(([col, val]) => {
    if (val) {
      filtered = filtered.filter((row) =>
        String(row[col] ?? "").toLowerCase().includes(val.toLowerCase())
      );
    }
  });

  // Sorting
  let sorted = [...filtered];
  if (sortCol) {
    sorted.sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }

  // Pagination
  const rowsPerPage = config.rowsPerPage || 10;
  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const paged = config.enablePagination !== false
    ? sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    : sorted;

  const handleSort = (col) => {
    if (config.enableSorting === false) return;
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const handleExportCSV = () => {
    const header = columns.join(",");
    const rows = sorted.map((row) => columns.map((c) => JSON.stringify(row[c] ?? "")).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${widget.title || "data"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const colFormat = style.columnFormats || {};

  return (
    <div className="flex flex-col h-full">
      {/* Export button */}
      {config.enableExportCSV !== false && (
        <div className="flex justify-end mb-1">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 px-2 py-0.5"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`text-left px-2 py-1.5 bg-gray-50 font-semibold text-gray-600 border-b cursor-pointer select-none sticky top-0 ${
                    colFormat[col]?.alignment === "right" ? "text-right" : colFormat[col]?.alignment === "center" ? "text-center" : ""
                  }`}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {colFormat[col]?.displayName || col}
                    {sortCol === col ? (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    ) : (
                      <ChevronsUpDown size={10} className="text-gray-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {/* Column filters */}
            {config.enableFiltering !== false && (
              <tr>
                {columns.map((col) => (
                  <th key={`f-${col}`} className="px-1 py-0.5 bg-gray-50 border-b">
                    <input
                      className="w-full text-xs px-1 py-0.5 border border-gray-200 rounded outline-none focus:border-indigo-300 font-normal"
                      placeholder="Filter..."
                      value={colFilters[col] || ""}
                      onChange={(e) =>
                        setColFilters((prev) => ({ ...prev, [col]: e.target.value }))
                      }
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {paged.map((row, ri) => (
              <tr
                key={ri}
                className={`${style.stripedRows !== false && ri % 2 === 1 ? "bg-gray-50" : ""} ${
                  style.hoverEffect !== false ? "hover:bg-blue-50" : ""
                } ${style.compactMode ? "text-[10px]" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`px-2 py-1 border-b border-gray-100 ${
                      colFormat[col]?.alignment === "right" ? "text-right" : colFormat[col]?.alignment === "center" ? "text-center" : ""
                    }`}
                  >
                    {colFormat[col]?.format
                      ? formatValue(row[col], { type: colFormat[col].format })
                      : String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-gray-400">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {config.enablePagination !== false && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-1 border-t border-gray-100 text-xs text-gray-500">
          <span>
            {sorted.length} rows · Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-2 py-0.5 bg-gray-100 rounded disabled:opacity-40 hover:bg-gray-200"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-2 py-0.5 bg-gray-100 rounded disabled:opacity-40 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
