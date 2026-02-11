/**
 * Text Box Widget — Markdown/text content area.
 */
import React from "react";

export default function TextBoxWidget({ widget }) {
  const config = widget.config || {};
  const style = config.style || {};

  const fontSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Simple markdown rendering (bold, italic, headers, line breaks)
  const renderContent = (text) => {
    if (!text) return <span className="text-gray-400">No content</span>;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mb-1">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mb-2">{line.slice(2)}</h1>;
      if (line.trim() === "") return <br key={i} />;
      // Bold and italic
      let rendered = line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div
      className={`h-full p-2 ${fontSizeClasses[style.fontSize || "medium"]} ${
        alignClasses[style.alignment || "left"]
      } ${style.showBorder ? "border border-gray-200 rounded" : ""}`}
      style={{
        backgroundColor: style.background === "transparent" ? "transparent" : style.background || "transparent",
      }}
    >
      {renderContent(config.content)}
    </div>
  );
}
