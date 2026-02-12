/**
 * Data Transformation Utilities for the ETL Pipeline.
 * Comprehensive: text, number, date, type conversion, row, column,
 * statistical, and advanced transformations.
 */

/* ═══════════════════ HELPERS ═══════════════════ */

/** Excel serial date → JS Date */
function excelSerialToDate(serial) {
  const n = Number(serial);
  if (isNaN(n) || n < 1) return null;
  const epoch = new Date(Date.UTC(1899, 11, 30));
  return new Date(epoch.getTime() + n * 86400000);
}

function looksLikeExcelSerial(val) {
  const n = Number(val);
  return !isNaN(n) && n >= 1 && n <= 2958465 && Number.isFinite(n);
}

/* ═══════════════════ TEXT ═══════════════════ */

export const trimWhitespace = (data, column) =>
  data.map((row) => ({ ...row, [column]: row[column]?.toString().trim() ?? row[column] }));

export const changeCase = (data, column, caseType) =>
  data.map((row) => {
    let v = row[column];
    if (v == null) return row;
    v = v.toString();
    if (caseType === "upper") v = v.toUpperCase();
    else if (caseType === "lower") v = v.toLowerCase();
    else if (caseType === "capitalize") v = v.replace(/\b\w/g, (c) => c.toUpperCase());
    else if (caseType === "sentence") v = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    return { ...row, [column]: v };
  });

export const findReplace = (data, column, find, replace) =>
  data.map((row) => ({
    ...row,
    [column]: row[column]?.toString().replace(new RegExp(find, "g"), replace) ?? row[column],
  }));

export const extractSubstring = (data, column, start, length, newCol) =>
  data.map((row) => ({
    ...row,
    [newCol || column]: row[column]?.toString().slice(start, start + length) ?? row[column],
  }));

export const padText = (data, column, side, padChar, totalLength) =>
  data.map((row) => {
    const v = String(row[column] ?? "");
    return {
      ...row,
      [column]: side === "left" ? v.padStart(totalLength, padChar) : v.padEnd(totalLength, padChar),
    };
  });

export const regexExtract = (data, column, pattern, newCol) =>
  data.map((row) => {
    try {
      const match = String(row[column] ?? "").match(new RegExp(pattern));
      return { ...row, [newCol || `${column}_extracted`]: match ? (match[1] || match[0]) : null };
    } catch {
      return { ...row, [newCol || `${column}_extracted`]: null };
    }
  });

export const stringLength = (data, column, newCol) =>
  data.map((row) => ({
    ...row,
    [newCol || `${column}_length`]: row[column] != null ? String(row[column]).length : 0,
  }));

export const concatenateColumns = (data, newCol, cols, separator = " ") =>
  data.map((row) => ({
    ...row,
    [newCol]: cols.map((c) => row[c] ?? "").join(separator),
  }));

/* ═══════════════════ NUMBER ═══════════════════ */

export const removeCurrencySymbols = (data, column) =>
  data.map((row) => {
    const v = row[column];
    if (v == null) return row;
    const num = parseFloat(v.toString().replace(/[$€£¥₹,\s]/g, ""));
    return { ...row, [column]: isNaN(num) ? v : num };
  });

export const roundNumbers = (data, column, decimals = 2) =>
  data.map((row) => {
    const v = parseFloat(row[column]);
    return { ...row, [column]: isNaN(v) ? row[column] : parseFloat(v.toFixed(decimals)) };
  });

export const fillNullValues = (data, column, fillValue) =>
  data.map((row) => ({
    ...row,
    [column]: row[column] == null || row[column] === "" ? fillValue : row[column],
  }));

export const fillNullWithStats = (data, column, stat = "average") => {
  const nums = data.map((r) => parseFloat(r[column])).filter((v) => !isNaN(v));
  let fill = 0;
  if (stat === "average") fill = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
  else if (stat === "median") {
    const sorted = [...nums].sort((a, b) => a - b);
    fill = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  } else if (stat === "min") fill = Math.min(...nums);
  else if (stat === "max") fill = Math.max(...nums);
  return fillNullValues(data, column, parseFloat(fill.toFixed(4)));
};

export const convertToNumber = (data, column) =>
  data.map((row) => {
    const v = parseFloat(String(row[column]).replace(/[,$%\s]/g, ""));
    return { ...row, [column]: isNaN(v) ? row[column] : v };
  });

export const mathOperation = (data, column, operation, operand, newCol) =>
  data.map((row) => {
    const v = Number(row[column]);
    if (isNaN(v)) return { ...row, [newCol || column]: row[column] };
    let result;
    switch (operation) {
      case "add": result = v + operand; break;
      case "subtract": result = v - operand; break;
      case "multiply": result = v * operand; break;
      case "divide": result = operand !== 0 ? v / operand : 0; break;
      case "power": result = Math.pow(v, operand); break;
      case "modulo": result = operand !== 0 ? v % operand : 0; break;
      case "abs": result = Math.abs(v); break;
      case "sqrt": result = Math.sqrt(v); break;
      case "log": result = v > 0 ? Math.log(v) : null; break;
      case "ceil": result = Math.ceil(v); break;
      case "floor": result = Math.floor(v); break;
      default: result = v;
    }
    return { ...row, [newCol || column]: result };
  });

export const percentOfTotal = (data, column, newCol) => {
  const total = data.reduce((sum, r) => sum + (Number(r[column]) || 0), 0);
  return data.map((row) => ({
    ...row,
    [newCol || `${column}_pct`]: total ? ((Number(row[column]) || 0) / total) * 100 : 0,
  }));
};

export const runningTotal = (data, column, newCol) => {
  let cumulative = 0;
  return data.map((row) => {
    cumulative += Number(row[column]) || 0;
    return { ...row, [newCol || `${column}_running`]: cumulative };
  });
};

export const rankColumn = (data, column, newCol, direction = "desc") => {
  const sorted = [...data].map((r, i) => ({ ...r, _origIdx: i }));
  sorted.sort((a, b) => direction === "desc"
    ? (Number(b[column]) || 0) - (Number(a[column]) || 0)
    : (Number(a[column]) || 0) - (Number(b[column]) || 0)
  );
  sorted.forEach((r, i) => { r[newCol || `${column}_rank`] = i + 1; });
  const result = new Array(data.length);
  sorted.forEach((r) => {
    const idx = r._origIdx;
    delete r._origIdx;
    result[idx] = r;
  });
  return result;
};

export const normalize = (data, column, newCol) => {
  const vals = data.map((r) => Number(r[column])).filter((v) => !isNaN(v));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return data.map((row) => ({
    ...row,
    [newCol || `${column}_norm`]: isNaN(Number(row[column])) ? null : (Number(row[column]) - min) / range,
  }));
};

export const binBucket = (data, column, bins, newCol) => {
  const vals = data.map((r) => Number(r[column])).filter((v) => !isNaN(v));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const binSize = (max - min) / bins;
  return data.map((row) => {
    const v = Number(row[column]);
    if (isNaN(v)) return { ...row, [newCol || `${column}_bin`]: null };
    const binIdx = Math.min(Math.floor((v - min) / binSize), bins - 1);
    const lo = (min + binIdx * binSize).toFixed(1);
    const hi = (min + (binIdx + 1) * binSize).toFixed(1);
    return { ...row, [newCol || `${column}_bin`]: `${lo}–${hi}` };
  });
};

/* ═══════════════════ DATE ═══════════════════ */

export const parseDate = (data, column, format) =>
  data.map((row) => {
    const v = row[column];
    if (v == null || v === "") return row;
    let d = null;
    if (format === "excel_serial" && looksLikeExcelSerial(v)) {
      d = excelSerialToDate(Number(v));
    } else if (format === "unix_s") {
      d = new Date(Number(v) * 1000);
    } else if (format === "unix_ms") {
      d = new Date(Number(v));
    } else {
      d = new Date(v);
    }
    if (d && !isNaN(d.getTime())) {
      return { ...row, [column]: d.toISOString().split("T")[0] };
    }
    return row;
  });

export const extractDatePart = (data, column, part, newCol) =>
  data.map((row) => {
    let d = new Date(row[column]);
    // Try Excel serial if normal parse fails
    if (isNaN(d.getTime()) && looksLikeExcelSerial(row[column])) {
      d = excelSerialToDate(Number(row[column]));
    }
    if (!d || isNaN(d.getTime())) return { ...row, [newCol || `${column}_${part}`]: null };
    let value;
    switch (part) {
      case "year": value = d.getFullYear(); break;
      case "month": value = d.getMonth() + 1; break;
      case "monthName": value = d.toLocaleDateString("en", { month: "long" }); break;
      case "day": value = d.getDate(); break;
      case "dayOfWeek": value = d.toLocaleDateString("en", { weekday: "long" }); break;
      case "quarter": value = Math.ceil((d.getMonth() + 1) / 3); break;
      case "weekNumber": {
        const oneJan = new Date(d.getFullYear(), 0, 1);
        value = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
        break;
      }
      case "hour": value = d.getHours(); break;
      case "minute": value = d.getMinutes(); break;
      default: value = null;
    }
    return { ...row, [newCol || `${column}_${part}`]: value };
  });

export const dateDiff = (data, col1, col2, unit, newCol) =>
  data.map((row) => {
    const d1 = new Date(row[col1]);
    const d2 = new Date(row[col2]);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return { ...row, [newCol || "date_diff"]: null };
    const diffMs = d2 - d1;
    let value;
    switch (unit) {
      case "days": value = Math.round(diffMs / 86400000); break;
      case "hours": value = Math.round(diffMs / 3600000); break;
      case "months": value = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()); break;
      case "years": value = d2.getFullYear() - d1.getFullYear(); break;
      default: value = Math.round(diffMs / 86400000);
    }
    return { ...row, [newCol || "date_diff"]: value };
  });

/* ═══════════════════ TYPE CONVERSION ═══════════════════ */

export const changeDataType = (data, column, targetType, dateFormat) =>
  data.map((row) => {
    const v = row[column];
    if (v == null || v === "") return row;
    let converted = v;
    switch (targetType) {
      case "number": {
        const n = parseFloat(String(v).replace(/[,$%\s]/g, ""));
        converted = isNaN(n) ? v : n;
        break;
      }
      case "integer": {
        const n = parseInt(String(v).replace(/[,$%\s]/g, ""), 10);
        converted = isNaN(n) ? v : n;
        break;
      }
      case "text":
        converted = String(v);
        break;
      case "boolean": {
        const s = String(v).toLowerCase().trim();
        converted = ["true", "yes", "1", "on", "y", "t"].includes(s);
        break;
      }
      case "date": {
        let d = null;
        if (dateFormat === "excel_serial" && looksLikeExcelSerial(v)) d = excelSerialToDate(Number(v));
        else if (dateFormat === "unix_s") d = new Date(Number(v) * 1000);
        else if (dateFormat === "unix_ms") d = new Date(Number(v));
        else d = new Date(v);
        converted = d && !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : v;
        break;
      }
      case "datetime": {
        let d = null;
        if (dateFormat === "excel_serial" && looksLikeExcelSerial(v)) d = excelSerialToDate(Number(v));
        else if (dateFormat === "unix_s") d = new Date(Number(v) * 1000);
        else if (dateFormat === "unix_ms") d = new Date(Number(v));
        else d = new Date(v);
        converted = d && !isNaN(d.getTime()) ? d.toISOString().replace("T", " ").slice(0, 19) : v;
        break;
      }
      default:
        break;
    }
    return { ...row, [column]: converted };
  });

/* ═══════════════════ ROW OPERATIONS ═══════════════════ */

export const removeDuplicateRows = (data, columns) => {
  if (!columns || columns.length === 0) {
    const seen = new Set();
    return data.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const seen = new Set();
  return data.filter((row) => {
    const key = columns.map((c) => String(row[c] ?? "")).join("||");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const removeNullRows = (data, columns) =>
  data.filter((row) => columns.every((col) => row[col] != null && row[col] !== ""));

export const filterRows = (data, column, operator, value) =>
  data.filter((row) => {
    const v = row[column];
    switch (operator) {
      case "equals": return String(v) === String(value);
      case "not_equals": return String(v) !== String(value);
      case "greater_than": return parseFloat(v) > parseFloat(value);
      case "less_than": return parseFloat(v) < parseFloat(value);
      case "greater_equal": return parseFloat(v) >= parseFloat(value);
      case "less_equal": return parseFloat(v) <= parseFloat(value);
      case "contains": return String(v).toLowerCase().includes(String(value).toLowerCase());
      case "not_contains": return !String(v).toLowerCase().includes(String(value).toLowerCase());
      case "starts_with": return String(v).toLowerCase().startsWith(String(value).toLowerCase());
      case "ends_with": return String(v).toLowerCase().endsWith(String(value).toLowerCase());
      case "regex_match": try { return new RegExp(value).test(String(v)); } catch { return true; }
      case "is_null": return v == null || v === "";
      case "not_null": return v != null && v !== "";
      case "between": {
        const parts = String(value).split(",").map((s) => parseFloat(s.trim()));
        return parts.length === 2 && parseFloat(v) >= parts[0] && parseFloat(v) <= parts[1];
      }
      default: return true;
    }
  });

export const sortRows = (data, column, direction = "asc") =>
  [...data].sort((a, b) => {
    const av = a[column], bv = b[column];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
    return direction === "asc" ? cmp : -cmp;
  });

export const limitRows = (data, count, from = "top") =>
  from === "top" ? data.slice(0, count) : data.slice(-count);

export const sampleRows = (data, count) => {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const conditionalValue = (data, column, operator, compareValue, trueValue, falseValue, newCol) =>
  data.map((row) => {
    const v = row[column];
    let cond = false;
    switch (operator) {
      case "equals": cond = String(v) === String(compareValue); break;
      case "not_equals": cond = String(v) !== String(compareValue); break;
      case "greater_than": cond = Number(v) > Number(compareValue); break;
      case "less_than": cond = Number(v) < Number(compareValue); break;
      case "contains": cond = String(v).toLowerCase().includes(String(compareValue).toLowerCase()); break;
      case "is_null": cond = v == null || v === ""; break;
      case "not_null": cond = v != null && v !== ""; break;
      default: break;
    }
    return { ...row, [newCol || `${column}_result`]: cond ? trueValue : falseValue };
  });

/* ═══════════════════ COLUMN OPERATIONS ═══════════════════ */

export const renameColumn = (data, oldName, newName) =>
  data.map((row) => {
    const newRow = {};
    Object.entries(row).forEach(([k, v]) => { newRow[k === oldName ? newName : k] = v; });
    return newRow;
  });

export const deleteColumn = (data, column) =>
  data.map((row) => {
    const newRow = { ...row };
    delete newRow[column];
    return newRow;
  });

export const duplicateColumn = (data, column, newCol) =>
  data.map((row) => ({ ...row, [newCol || `${column}_copy`]: row[column] }));

export const splitColumn = (data, column, separator, newCols) =>
  data.map((row) => {
    const parts = String(row[column] || "").split(separator);
    const extra = {};
    newCols.forEach((name, i) => { extra[name] = parts[i]?.trim() || ""; });
    return { ...row, ...extra };
  });

export const reorderColumns = (data, columnOrder) =>
  data.map((row) => {
    const newRow = {};
    columnOrder.forEach((col) => { if (col in row) newRow[col] = row[col]; });
    // Add any remaining columns not in the order
    Object.keys(row).forEach((k) => { if (!(k in newRow)) newRow[k] = row[k]; });
    return newRow;
  });

/* ═══════════════════ CALCULATED / FORMULA ═══════════════════ */

export const addCalculatedColumn = (data, colName, formula) =>
  data.map((row) => {
    try {
      let expr = formula;
      Object.entries(row).forEach(([key, val]) => {
        const numVal = typeof val === "number" ? val : parseFloat(val);
        const replacement = isNaN(numVal) ? 0 : numVal;
        expr = expr.replace(new RegExp(`\\{${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\}`, "g"), replacement);
      });
      const result = safeEval(expr);
      return { ...row, [colName]: result };
    } catch {
      return { ...row, [colName]: null };
    }
  });

function safeEval(expr) {
  expr = expr.replace(/\s/g, "");
  return parseExpression(expr, { pos: 0 });
}

function parseExpression(expr, ctx) {
  let result = parseTerm(expr, ctx);
  while (ctx.pos < expr.length) {
    if (expr[ctx.pos] === "+") { ctx.pos++; result += parseTerm(expr, ctx); }
    else if (expr[ctx.pos] === "-") { ctx.pos++; result -= parseTerm(expr, ctx); }
    else break;
  }
  return result;
}

function parseTerm(expr, ctx) {
  let result = parseFactor(expr, ctx);
  while (ctx.pos < expr.length) {
    if (expr[ctx.pos] === "*") { ctx.pos++; result *= parseFactor(expr, ctx); }
    else if (expr[ctx.pos] === "/") { ctx.pos++; const d = parseFactor(expr, ctx); result = d !== 0 ? result / d : 0; }
    else if (expr[ctx.pos] === "%") { ctx.pos++; const d = parseFactor(expr, ctx); result = d !== 0 ? result % d : 0; }
    else break;
  }
  return result;
}

function parseFactor(expr, ctx) {
  if (expr[ctx.pos] === "(") {
    ctx.pos++;
    const result = parseExpression(expr, ctx);
    if (expr[ctx.pos] === ")") ctx.pos++;
    return result;
  }
  if (expr[ctx.pos] === "-") {
    ctx.pos++;
    return -parseFactor(expr, ctx);
  }
  let num = "";
  while (ctx.pos < expr.length && ((expr[ctx.pos] >= "0" && expr[ctx.pos] <= "9") || expr[ctx.pos] === ".")) {
    num += expr[ctx.pos++];
  }
  return parseFloat(num) || 0;
}

/* ═══════════════════ AGGREGATE / GROUP ═══════════════════ */

export const groupAggregate = (data, groupCols, valueCol, aggType, newCol) => {
  const groups = {};
  data.forEach((row) => {
    const key = groupCols.map((c) => String(row[c] ?? "")).join("||");
    if (!groups[key]) groups[key] = [];
    groups[key].push(Number(row[valueCol]) || 0);
  });

  const aggMap = {};
  Object.entries(groups).forEach(([key, vals]) => {
    let result;
    switch (aggType) {
      case "sum": result = vals.reduce((a, b) => a + b, 0); break;
      case "average": result = vals.reduce((a, b) => a + b, 0) / vals.length; break;
      case "count": result = vals.length; break;
      case "min": result = Math.min(...vals); break;
      case "max": result = Math.max(...vals); break;
      default: result = vals.reduce((a, b) => a + b, 0);
    }
    aggMap[key] = result;
  });

  return data.map((row) => {
    const key = groupCols.map((c) => String(row[c] ?? "")).join("||");
    return { ...row, [newCol || `${valueCol}_${aggType}`]: aggMap[key] };
  });
};

/* ═══════════════════ APPLY PIPELINE ═══════════════════ */

export const applyTransformations = (data, steps) => {
  let result = [...data];
  for (const step of steps) {
    switch (step.type) {
      // Text
      case "trim": result = trimWhitespace(result, step.column); break;
      case "changeCase": result = changeCase(result, step.column, step.caseType); break;
      case "findReplace": result = findReplace(result, step.column, step.find, step.replace); break;
      case "extractSubstring": result = extractSubstring(result, step.column, step.start || 0, step.length || 10, step.newCol); break;
      case "padText": result = padText(result, step.column, step.side || "left", step.padChar || "0", step.totalLength || 10); break;
      case "regexExtract": result = regexExtract(result, step.column, step.pattern, step.newCol); break;
      case "stringLength": result = stringLength(result, step.column, step.newCol); break;
      case "concat": result = concatenateColumns(result, step.newCol, step.columns, step.separator); break;

      // Number
      case "removeCurrency": result = removeCurrencySymbols(result, step.column); break;
      case "round": result = roundNumbers(result, step.column, step.decimals); break;
      case "fillNull": result = fillNullValues(result, step.column, step.value); break;
      case "fillNullStats": result = fillNullWithStats(result, step.column, step.stat); break;
      case "toNumber": result = convertToNumber(result, step.column); break;
      case "mathOperation": result = mathOperation(result, step.column, step.operation, Number(step.operand) || 0, step.newCol); break;
      case "percentOfTotal": result = percentOfTotal(result, step.column, step.newCol); break;
      case "runningTotal": result = runningTotal(result, step.column, step.newCol); break;
      case "rank": result = rankColumn(result, step.column, step.newCol, step.direction); break;
      case "normalize": result = normalize(result, step.column, step.newCol); break;
      case "binBucket": result = binBucket(result, step.column, step.bins || 5, step.newCol); break;

      // Date
      case "parseDate": result = parseDate(result, step.column, step.dateFormat); break;
      case "extractDate": result = extractDatePart(result, step.column, step.part, step.newCol); break;
      case "dateDiff": result = dateDiff(result, step.column, step.column2, step.unit, step.newCol); break;

      // Type Conversion
      case "changeDataType": result = changeDataType(result, step.column, step.targetType, step.dateFormat); break;

      // Rows
      case "removeDuplicates": result = removeDuplicateRows(result, step.columns); break;
      case "removeNulls": result = removeNullRows(result, step.columns); break;
      case "filterRows": result = filterRows(result, step.column, step.operator, step.value); break;
      case "sort": result = sortRows(result, step.column, step.direction); break;
      case "limit": result = limitRows(result, step.count, step.from); break;
      case "sample": result = sampleRows(result, step.count || 100); break;
      case "conditional": result = conditionalValue(result, step.column, step.operator, step.compareValue, step.trueValue, step.falseValue, step.newCol); break;

      // Columns
      case "rename": result = renameColumn(result, step.oldName, step.newName); break;
      case "delete": result = deleteColumn(result, step.column); break;
      case "duplicate": result = duplicateColumn(result, step.column, step.newCol); break;
      case "split": result = splitColumn(result, step.column, step.separator, step.newCols); break;
      case "calculated": result = addCalculatedColumn(result, step.colName, step.formula); break;

      // Aggregate
      case "groupAggregate": result = groupAggregate(result, step.groupColumns || [], step.column, step.aggType || "sum", step.newCol); break;

      default: break;
    }
  }
  return result;
};
