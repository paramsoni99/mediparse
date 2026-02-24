import { motion } from "framer-motion";

const statusConfig = {
    pending: { icon: "⏳", color: "#94a3b8", label: "Pending" },
    processing: { icon: "🔄", color: "#3b82f6", label: "Processing..." },
    done: { icon: "✅", color: "#10b981", label: "Done" },
    error: { icon: "❌", color: "#ef4444", label: "Error" },
};

export default function BatchQueue({ queue, onSelectResult, selectedIndex }) {
    return (
        <div style={{ background: "#111827", borderRadius: "16px", padding: "20px", border: "1px solid #1e293b" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📂 File Queue ({queue.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {queue.map((item, i) => {
                    const s = statusConfig[item.status];
                    const isSelected = selectedIndex === i;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => item.status === "done" && onSelectResult(i)}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 14px", borderRadius: "10px", cursor: item.status === "done" ? "pointer" : "default",
                                background: isSelected ? "rgba(59,130,246,0.15)" : "#0a0f1e",
                                border: `1px solid ${isSelected ? "#3b82f6" : "#1e293b"}`,
                                transition: "all 0.2s",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                                <span style={{ fontSize: "16px" }}>{s.icon}</span>
                                <span style={{ fontSize: "13px", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                                    {item.fileName}
                                </span>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: s.color, flexShrink: 0 }}>
                                {s.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress bar */}
            {queue.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                        <span>Progress</span>
                        <span>{queue.filter((q) => q.status === "done").length} / {queue.length}</span>
                    </div>
                    <div style={{ background: "#1e293b", borderRadius: "999px", height: "6px" }}>
                        <motion.div
                            animate={{ width: `${(queue.filter((q) => q.status === "done").length / queue.length) * 100}%` }}
                            style={{ background: "linear-gradient(90deg, #3b82f6, #06b6d4)", height: "6px", borderRadius: "999px" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}