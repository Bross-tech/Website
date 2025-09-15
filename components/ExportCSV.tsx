import React from "react";

interface ExportCSVProps {
  data?: any[];
  filename?: string;
}

export function ExportCSV({ data = [], filename = "export.csv" }: ExportCSVProps) {
  const exportCSV = () => {
    if (data.length === 0) {
      alert("No data to export!");
      return;
    }

    const keys = Object.keys(data[0] || {});
    const csv =
      keys.join(",") +
      "\n" +
      data.map((row) =>
        keys.map((k) => `"${row[k] ?? ""}"`).join(",")
      ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportCSV}
      style={{
        marginTop: 12,
        padding: "8px 16px",
        background: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      Export CSV
    </button>
  );
}
