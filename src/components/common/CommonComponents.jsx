/**
 * Common components: ColorPicker, FieldPill, DragDropZone
 */
import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { CHART_COLORS } from "../../utils/chartHelpers";

/** Small color picker with preset colors and custom input */
export function ColorPicker({ value, onChange, label }) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div className="mb-2">
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div className="flex flex-wrap gap-1 items-center">
        {CHART_COLORS.map((c) => (
          <button
            key={c}
            className={`w-6 h-6 rounded border-2 ${value === c ? "border-gray-800 scale-110" : "border-gray-200"}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
        <button
          className="w-6 h-6 rounded border-2 border-dashed border-gray-300 text-xs flex items-center justify-center"
          onClick={() => setShowCustom(!showCustom)}
          title="Custom color"
        >
          +
        </button>
      </div>
      {showCustom && (
        <input
          type="color"
          value={value || "#4F46E5"}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full h-8 cursor-pointer"
        />
      )}
    </div>
  );
}

/** A draggable field pill (used in config panels for drag-to-assign fields) */
export function FieldPill({ field, type = "FIELD" }) {
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { field },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  const bgColor = {
    number: "bg-blue-100 text-blue-800",
    date: "bg-green-100 text-green-800",
    text: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      ref={drag}
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-grab select-none mr-1 mb-1 ${isDragging ? "opacity-40" : ""} ${bgColor[type] || "bg-gray-100 text-gray-800"}`}
    >
      {field}
    </span>
  );
}

/** A drop zone where fields can be dropped */
export function DragDropZone({ label, value, onDrop, onClear, accept = "FIELD" }) {
  const [{ isOver }, drop] = useDrop({
    accept,
    drop: (item) => onDrop(item.field),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div
        ref={drop}
        className={`border-2 border-dashed rounded-lg p-2 min-h-[36px] flex items-center transition-colors ${
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        {value ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            {value}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-1 text-blue-600 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Drop field here...</span>
        )}
      </div>
    </div>
  );
}
