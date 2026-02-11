/**
 * Data Transformation Utilities for the ETL Pipeline.
 * Provides text, number, date, row, and column transformations.
 */

// ─── Text Transformations ───

export const trimWhitespace = (data, column) =>
  data.map((row) => ({ ...row, [column]: row[column]?.toString().trim() ?? row[column] }));

export const changeCase = (data, column, caseType) =>
  data.map((row) => {
    let v = row[column];
    if (v == null) return row;
    v = v.toString();
    if (caseType === "upper") v = v.toUpperCase();
    else if (caseType === "lower") v = v.toLowerCase();
    else if (caseType === "capitalize") v = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    return { ...row, [column]: v };
  });

export const findReplace = (data, column, find, replace) =>
  data.map((row) => ({
    ...row,
    [column]: row[column]?.toString().replace(new RegExp(find, "g"), replace) ?? row[column],
  }));

export const extractSubstring = (data, column, start, end) =>
  data.map((row) => ({
    ...row,
    [column]: row[column]?.toString().slice(start, end) ?? row[column],
  }));

export const concatenateColumns = (data, newCol, cols, separator = " ") =>
  data.map((row) => ({
    ...row,
    [newCol]: cols.map((c) => row[c] ?? "").join(separator),
  }));

// ─── Number Transformations ───

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
  return fillNullValues(data, column, fill);
};

export const convertToNumber = (data, column) =>
  data.map((row) => {
    const v = parseFloat(row[column]);
    return { ...row, [column]: isNaN(v) ? row[column] : v };
  });

// ─── Date Transformations ───

export const extractDatePart = (data, column, part, newCol) =>
  data.map((row) => {
    const d = new Date(row[column]);
    if (isNaN(d.getTime())) return { ...row, [newCol || `${column}_${part}`]: null };
    let value;
    switch (part) {
      case "year": value = d.getFullYear(); break;
      case "month": value = d.getMonth() + 1; break;
      case "day": value = d.getDate(); break;
      case "quarter": value = Math.ceil((d.getMonth() + 1) / 3); break;
      case "dayOfWeek": value = d.toLocaleDateString("en", { weekday: "long" }); break;
      case "monthName": value = d.toLocaleDateString("en", { month: "long" }); break;
      default: value = null;
    }
    return { ...row, [newCol || `${column}_${part}`]: value };
  });

// ─── Row Operations ───

export const removeDuplicateRows = (data) => {
  const seen = new Set();
  return data.filter((row) => {
    const key = JSON.stringify(row);
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
      case "equals": return v === value;
      case "not_equals": return v !== value;
      case "greater_than": return parseFloat(v) > parseFloat(value);
      case "less_than": return parseFloat(v) < parseFloat(value);
      case "contains": return String(v).toLowerCase().includes(String(value).toLowerCase());
      case "starts_with": return String(v).toLowerCase().startsWith(String(value).toLowerCase());
      case "is_null": return v == null || v === "";
      case "not_null": return v != null && v !== "";
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

// ─── Column Operations ───

export const renameColumn = (data, oldName, newName) =>
  data.map((row) => {
    const newRow = {};
    Object.entries(row).forEach(([k, v]) => {
      newRow[k === oldName ? newName : k] = v;
    });
    return newRow;
  });

export const deleteColumn = (data, column) =>
  data.map((row) => {
    const newRow = { ...row };
    delete newRow[column];
    return newRow;
  });

export const splitColumn = (data, column, separator, newCols) =>
  data.map((row) => {
    const parts = String(row[column] || "").split(separator);
    const extra = {};
    newCols.forEach((name, i) => {
      extra[name] = parts[i]?.trim() || "";
    });
    return { ...row, ...extra };
  });

// ─── Calculated Columns ───

/**
 * Safely evaluate a formula with column references.
 * Supports: +, -, *, /, %, and basic functions.
 */
export const addCalculatedColumn = (data, colName, formula) =>
  data.map((row) => {
    try {
      let expr = formula;
      // Replace column references (wrapped in {}) with actual values
      Object.entries(row).forEach(([key, val]) => {
        const numVal = typeof val === "number" ? val : parseFloat(val);
        const replacement = isNaN(numVal) ? 0 : numVal;
        expr = expr.replace(new RegExp(`\\{${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\}`, "g"), replacement);
      });
      // Evaluate basic math expression
      const result = safeEval(expr);
      return { ...row, [colName]: result };
    } catch {
      return { ...row, [colName]: null };
    }
  });

/**
 * Simple safe math expression evaluator (no eval()).
 * Supports: numbers, +, -, *, /, parentheses.
 */
function safeEval(expr) {
  // Remove whitespace
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

// ─── Apply a list of transformations ───

export const applyTransformations = (data, steps) => {
  let result = [...data];
  for (const step of steps) {
    switch (step.type) {
      case "trim": result = trimWhitespace(result, step.column); break;
      case "changeCase": result = changeCase(result, step.column, step.caseType); break;
      case "findReplace": result = findReplace(result, step.column, step.find, step.replace); break;
      case "removeCurrency": result = removeCurrencySymbols(result, step.column); break;
      case "round": result = roundNumbers(result, step.column, step.decimals); break;
      case "fillNull": result = fillNullValues(result, step.column, step.value); break;
      case "toNumber": result = convertToNumber(result, step.column); break;
      case "removeDuplicates": result = removeDuplicateRows(result); break;
      case "removeNulls": result = removeNullRows(result, step.columns); break;
      case "filterRows": result = filterRows(result, step.column, step.operator, step.value); break;
      case "sort": result = sortRows(result, step.column, step.direction); break;
      case "limit": result = limitRows(result, step.count, step.from); break;
      case "rename": result = renameColumn(result, step.oldName, step.newName); break;
      case "delete": result = deleteColumn(result, step.column); break;
      case "split": result = splitColumn(result, step.column, step.separator, step.newCols); break;
      case "calculated": result = addCalculatedColumn(result, step.colName, step.formula); break;
      case "extractDate": result = extractDatePart(result, step.column, step.part, step.newCol); break;
      case "concat": result = concatenateColumns(result, step.newCol, step.columns, step.separator); break;
      default: break;
    }
  }
  return result;
};
