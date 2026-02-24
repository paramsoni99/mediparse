import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Building2, Stethoscope, HeartPulse, Pill,
    FlaskConical, FileText, Download, ChevronUp, ChevronDown,
    Eye, Code2
} from "lucide-react";

const sectionIcons = {
    patient: User,
    visit: Building2,
    clinical: Stethoscope,
    vitals: HeartPulse,
    medications: Pill,
    lab: FlaskConical,
    other: FileText,
};

function Section({ title, iconKey, children }) {
    const [open, setOpen] = useState(true);
    const Icon = sectionIcons[iconKey] || FileText;

    return (
        <div className="glass-card" style={{ marginBottom: "12px", overflow: "hidden" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", background: "transparent", border: "none", color: "var(--text-primary)",
                    cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "var(--font-sans)",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon size={16} color="var(--accent-primary)" strokeWidth={1.8} />
                    {title}
                </span>
                {open
                    ? <ChevronUp size={16} color="var(--text-muted)" />
                    : <ChevronDown size={16} color="var(--text-muted)" />
                }
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{ padding: "0 18px 16px" }}>
                            {children}
                        </div>
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
            <span style={{ color: "var(--text-muted)", minWidth: "130px", flexShrink: 0, fontWeight: 500 }}>
                {label}
            </span>
            <span style={{ color: "var(--text-primary)" }}>
                {Array.isArray(value) ? value.join(", ") : value}
            </span>
        </div>
    );
}

export default function ResultViewer({ data }) {
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

            {/* Tab Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
                <button
                    className={`tab-pill ${tab === "visual" ? "active" : ""}`}
                    onClick={() => setTab("visual")}
                >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Eye size={14} /> Visual
                    </span>
                </button>
                <button
                    className={`tab-pill ${tab === "raw" ? "active" : ""}`}
                    onClick={() => setTab("raw")}
                >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Code2 size={14} /> Raw JSON
                    </span>
                </button>

                <button
                    className="btn-ghost"
                    onClick={downloadJson}
                    style={{ marginLeft: "auto", width: "auto", padding: "7px 14px" }}
                >
                    <Download size={14} /> Download
                </button>
            </div>

            {tab === "visual" ? (
                <div>
                    <Section title="Patient Info" iconKey="patient">
                        <Field label="Name" value={data.patient?.name} />
                        <Field label="Age" value={data.patient?.age} />
                        <Field label="Gender" value={data.patient?.gender} />
                        <Field label="Date of Birth" value={data.patient?.dob} />
                        <Field label="Patient ID" value={data.patient?.id} />
                    </Section>

                    <Section title="Visit Details" iconKey="visit">
                        <Field label="Date" value={data.visit?.date} />
                        <Field label="Type" value={data.visit?.type} />
                        <Field label="Doctor" value={data.visit?.doctor} />
                        <Field label="Department" value={data.visit?.department} />
                        <Field label="Hospital" value={data.visit?.hospital} />
                    </Section>

                    <Section title="Clinical Info" iconKey="clinical">
                        <Field label="Chief Complaint" value={data.clinical?.chief_complaint} />
                        <Field label="Diagnosis" value={data.clinical?.diagnosis} />
                        <Field label="Symptoms" value={data.clinical?.symptoms} />
                    </Section>

                    {data.clinical?.vitals && (
                        <Section title="Vitals" iconKey="vitals">
                            <Field label="Blood Pressure" value={data.clinical.vitals.blood_pressure} />
                            <Field label="Heart Rate" value={data.clinical.vitals.heart_rate} />
                            <Field label="Temperature" value={data.clinical.vitals.temperature} />
                            <Field label="SpO2" value={data.clinical.vitals.spo2} />
                            <Field label="Weight" value={data.clinical.vitals.weight} />
                            <Field label="Height" value={data.clinical.vitals.height} />
                        </Section>
                    )}

                    {data.medications?.length > 0 && (
                        <Section title="Medications" iconKey="medications">
                            {data.medications.map((med, i) => (
                                <div key={i} style={{
                                    background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)",
                                    padding: "10px 14px", marginBottom: "8px",
                                    border: "1px solid var(--glass-border)",
                                }}>
                                    <p style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "13px" }}>{med.name}</p>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px" }}>
                                        {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                            ))}
                        </Section>
                    )}

                    {data.lab_results?.length > 0 && (
                        <Section title="Lab Results" iconKey="lab">
                            {data.lab_results.map((lab, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "8px 0", borderBottom: "1px solid var(--glass-border)", fontSize: "13px",
                                }}>
                                    <span style={{ color: "var(--text-primary)" }}>{lab.test}</span>
                                    <span style={{ color: lab.flag ? "var(--accent-red)" : "var(--accent-green)", fontWeight: 500 }}>
                                        {lab.value} {lab.unit} {lab.flag ? `· ${lab.flag}` : ""}
                                    </span>
                                </div>
                            ))}
                        </Section>
                    )}

                    <Section title="Other" iconKey="other">
                        <Field label="Allergies" value={data.allergies} />
                        <Field label="Follow Up" value={data.follow_up} />
                        <Field label="Notes" value={data.notes} />
                    </Section>
                </div>
            ) : (
                <pre className="code-block">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </motion.div>
    );
}