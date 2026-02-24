import { downloadJSON, downloadMergedJSON, downloadCSV } from "../services/exportService";

export default function ExportPanel({ results, selectedIndex }) {
    const done = results.filter((r) => r.status === "done" && r.data);

    return (
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⬇ Export
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                    onClick={() => {
                        const selected = results[selectedIndex];
                        if (selected?.data) downloadJSON(selected.data, `${selected.fileName}.json`);
                    }}
                    disabled={selectedIndex === null || !results[selectedIndex]?.data}
                    style={btnStyle("#3b82f6")}
                >
                    📄 Download Selected JSON
                </button>
                <button
                    onClick={() => downloadMergedJSON(done)}
                    disabled={done.length === 0}
                    style={btnStyle("#8b5cf6")}
                >
                    📦 Download All JSON (merged)
                </button>
                <button
                    onClick={() => downloadCSV(done)}
                    disabled={done.length === 0}
                    style={btnStyle("#10b981")}
                >
                    📊 Download CSV (all patients)
                </button>
            </div>
            {done.length > 0 && (
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "12px" }}>
                    {done.length} file{done.length > 1 ? "s" : ""} ready to export
                </p>
            )}
        </div>
    );
}

function btnStyle(color) {
    return {
        padding: "10px 16px", borderRadius: "8px", border: `1px solid ${color}`,
        background: "transparent", color: color, fontSize: "13px", fontWeight: 600,
        cursor: "pointer", textAlign: "left", transition: "all 0.2s",
    };
}