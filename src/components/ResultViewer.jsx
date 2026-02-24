import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Section({ title, icon, children }) {
    const [open, setOpen] = useState(true);
    return (
        <div style={{ marginBottom: "16px", background: "#0a0f1e", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", background: "transparent", border: "none", color: "#f1f5f9",
                    cursor: "pointer", fontWeight: 600, fontSize: "14px",
                }}
            >
                <span>{icon} {title}</span>
                <span style={{ color: "#94a3b8" }}>{open ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ padding: "0 18px 16px", overflow: "hidden" }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Field({ label, value }) {
    if (!value || value === "" || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "13px" }}>
            <span style={{ color: "#94a3b8", minWidth: "140px", flexShrink: 0 }}>{label}</span>
            <span style={{ color: "#f1f5f9" }}>{Array.isArray(value) ? value.join(", ") : value}</span>
        </div>
    );
}

export default function ResultViewer({ data, rawJson }) {
    const [tab, setTab] = useState("visual");

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mediparse-output.json";
        a.click();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {["visual", "raw"].map((t) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px",
                        background: tab === t ? "#3b82f6" : "#1a2235", color: tab === t ? "#fff" : "#94a3b8",
                    }}>
                        {t === "visual" ? "🧬 Visual" : "{ } Raw JSON"}
                    </button>
                ))}
                <button onClick={downloadJson} style={{
                    marginLeft: "auto", padding: "8px 20px", borderRadius: "8px", border: "none",
                    cursor: "pointer", fontWeight: 600, fontSize: "13px", background: "#10b981", color: "#fff",
                }}>
                    ⬇ Download JSON
                </button>
            </div>

            {tab === "visual" ? (
                <div>
                    <Section title="Patient Info" icon="👤">
                        <Field label="Name" value={data.patient?.name} />
                        <Field label="Age" value={data.patient?.age} />
                        <Field label="Gender" value={data.patient?.gender} />
                        <Field label="Date of Birth" value={data.patient?.dob} />
                        <Field label="Patient ID" value={data.patient?.id} />
                    </Section>

                    <Section title="Visit Details" icon="🏥">
                        <Field label="Date" value={data.visit?.date} />
                        <Field label="Type" value={data.visit?.type} />
                        <Field label="Doctor" value={data.visit?.doctor} />
                        <Field label="Department" value={data.visit?.department} />
                        <Field label="Hospital" value={data.visit?.hospital} />
                    </Section>

                    <Section title="Clinical Info" icon="🩺">
                        <Field label="Chief Complaint" value={data.clinical?.chief_complaint} />
                        <Field label="Diagnosis" value={data.clinical?.diagnosis} />
                        <Field label="Symptoms" value={data.clinical?.symptoms} />
                    </Section>

                    {data.clinical?.vitals && (
                        <Section title="Vitals" icon="💓">
                            <Field label="Blood Pressure" value={data.clinical.vitals.blood_pressure} />
                            <Field label="Heart Rate" value={data.clinical.vitals.heart_rate} />
                            <Field label="Temperature" value={data.clinical.vitals.temperature} />
                            <Field label="SpO2" value={data.clinical.vitals.spo2} />
                            <Field label="Weight" value={data.clinical.vitals.weight} />
                            <Field label="Height" value={data.clinical.vitals.height} />
                        </Section>
                    )}

                    {data.medications?.length > 0 && (
                        <Section title="Medications" icon="💊">
                            {data.medications.map((med, i) => (
                                <div key={i} style={{ background: "#1a2235", borderRadius: "8px", padding: "10px 14px", marginBottom: "8px" }}>
                                    <p style={{ color: "#3b82f6", fontWeight: 600, fontSize: "13px" }}>{med.name}</p>
                                    <p style={{ color: "#94a3b8", fontSize: "12px" }}>{med.dosage} · {med.frequency} · {med.duration}</p>
                                </div>
                            ))}
                        </Section>
                    )}

                    {data.lab_results?.length > 0 && (
                        <Section title="Lab Results" icon="🔬">
                            {data.lab_results.map((lab, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b", fontSize: "13px" }}>
                                    <span style={{ color: "#f1f5f9" }}>{lab.test}</span>
                                    <span style={{ color: lab.flag ? "#ef4444" : "#10b981" }}>{lab.value} {lab.unit} {lab.flag ? `⚠ ${lab.flag}` : ""}</span>
                                </div>
                            ))}
                        </Section>
                    )}

                    <Section title="Other" icon="📋">
                        <Field label="Allergies" value={data.allergies} />
                        <Field label="Follow Up" value={data.follow_up} />
                        <Field label="Notes" value={data.notes} />
                    </Section>
                </div>
            ) : (
                <pre style={{
                    background: "#111827", border: "1px solid #1e293b", borderRadius: "12px",
                    padding: "20px", fontSize: "12px", color: "#06b6d4", overflowX: "auto",
                    maxHeight: "600px", overflowY: "auto",
                }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </motion.div>
    );
}