import { downloadJSON, downloadMergedJSON, downloadCSV } from "../services/exportService";
import { FileJson, Package, FileSpreadsheet, Download } from "lucide-react";

export default function ExportPanel({ results, selectedIndex }) {
    const done = results.filter((r) => r.status === "done" && r.data);

    return (
        <div className="glass-card" style={{ padding: "20px" }}>
            <div className="section-label">
                <Download size={13} /> Export
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                    className="btn-ghost"
                    onClick={() => {
                        const selected = results[selectedIndex];
                        if (selected?.data) downloadJSON(selected.data, `${selected.fileName}.json`);
                    }}
                    disabled={selectedIndex === null || !results[selectedIndex]?.data}
                >
                    <FileJson size={15} color="var(--accent-primary)" /> Download Selected JSON
                </button>

                <button
                    className="btn-ghost"
                    onClick={() => downloadMergedJSON(done)}
                    disabled={done.length === 0}
                >
                    <Package size={15} color="var(--accent-purple)" /> Download All JSON (merged)
                </button>

                <button
                    className="btn-ghost"
                    onClick={() => downloadCSV(done)}
                    disabled={done.length === 0}
                >
                    <FileSpreadsheet size={15} color="var(--accent-green)" /> Download CSV (all patients)
                </button>
            </div>

            {done.length > 0 && (
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>
                    {done.length} file{done.length > 1 ? "s" : ""} ready to export
                </p>
            )}
        </div>
    );
}