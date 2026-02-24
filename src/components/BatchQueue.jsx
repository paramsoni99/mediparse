import { motion } from "framer-motion";
import { Clock, Loader2, CheckCircle2, XCircle, FolderOpen } from "lucide-react";

const statusConfig = {
    pending: { Icon: Clock, color: "var(--text-muted)", label: "Pending" },
    processing: { Icon: Loader2, color: "var(--accent-primary)", label: "Processing...", spin: true },
    done: { Icon: CheckCircle2, color: "var(--accent-green)", label: "Done" },
    error: { Icon: XCircle, color: "var(--accent-red)", label: "Error" },
};

export default function BatchQueue({ queue, onSelectResult, selectedIndex }) {
    return (
        <div className="glass-card" style={{ padding: "20px" }}>
            <div className="section-label">
                <FolderOpen size={13} /> File Queue ({queue.length})
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {queue.map((item, i) => {
                    const s = statusConfig[item.status];
                    const isSelected = selectedIndex === i;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => item.status === "done" && onSelectResult(i)}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 12px", borderRadius: "var(--radius-sm)",
                                cursor: item.status === "done" ? "pointer" : "default",
                                background: isSelected ? "rgba(var(--accent-primary-rgb), 0.1)" : "rgba(11, 15, 25, 0.5)",
                                border: `1px solid ${isSelected ? "rgba(var(--accent-primary-rgb), 0.25)" : "var(--glass-border)"}`,
                                transition: "all var(--transition-fast)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                <s.Icon
                                    size={14}
                                    color={s.color}
                                    className={s.spin ? "animate-spin" : ""}
                                    strokeWidth={2}
                                />
                                <span style={{
                                    fontSize: "12px", color: "var(--text-primary)",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    maxWidth: "180px",
                                }}>
                                    {item.fileName}
                                </span>
                            </div>
                            <span style={{ fontSize: "10px", fontWeight: 600, color: s.color, flexShrink: 0 }}>
                                {s.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress bar */}
            {queue.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
                        <span>Progress</span>
                        <span>{queue.filter((q) => q.status === "done").length} / {queue.length}</span>
                    </div>
                    <div className="progress-track">
                        <motion.div
                            className="progress-fill"
                            animate={{ width: `${(queue.filter((q) => q.status === "done").length / queue.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}