export function ExportCSV({ data, filename }) {
  const exportCSV = () => {
    const keys = Object.keys(data[0] || {});
    const csv = keys.join(",") + "\n" +
      data.map(row => keys.map(k => `"${row[k]}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return <button onClick={exportCSV}>Export</button>;
}
