import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function countFrequency(items) {
    const counts = {};
    items.forEach((item) => {
        const key = item?.trim();
        if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
}

function StatCard({ label, value, icon }) {
    return (
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#3b82f6" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>{label}</div>
        </div>
    );
}

export default function Dashboard({ results }) {
    if (!results || results.length === 0) return null;

    const done = results.filter((r) => r.status === "done" && r.data);

    // Aggregate data
    const allDiagnoses = done.flatMap((r) => r.data.clinical?.diagnosis || []);
    const allMeds = done.flatMap((r) => (r.data.medications || []).map((m) => m.name).filter(Boolean));
    const allSymptoms = done.flatMap((r) => r.data.clinical?.symptoms || []);
    const allDepts = done.map((r) => r.data.visit?.department).filter(Boolean);

    const diagnosisData = countFrequency(allDiagnoses);
    const medData = countFrequency(allMeds);
    const symptomData = countFrequency(allSymptoms);
    const deptData = countFrequency(allDepts);

    const avgAge = (() => {
        const ages = done.map((r) => parseInt(r.data.patient?.age)).filter((a) => !isNaN(a));
        return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : "N/A";
    })();

    const genderData = countFrequency(done.map((r) => r.data.patient?.gender).filter(Boolean));

    return (
        <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "#f1f5f9" }}>
                📊 Analytics Dashboard
            </h2>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                <StatCard icon="🧑‍⚕️" label="Total Patients" value={done.length} />
                <StatCard icon="🎂" label="Avg Age" value={avgAge} />
                <StatCard icon="🦠" label="Unique Diagnoses" value={new Set(allDiagnoses).size} />
                <StatCard icon="💊" label="Unique Medications" value={new Set(allMeds).size} />
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                {diagnosisData.length > 0 && (
                    <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8", marginBottom: "16px" }}>🦠 Top Diagnoses</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={diagnosisData} layout="vertical">
                                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#f1f5f9", fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9" }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {medData.length > 0 && (
                    <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8", marginBottom: "16px" }}>💊 Top Medications</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={medData} layout="vertical">
                                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#f1f5f9", fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9" }} />
                                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {genderData.length > 0 && (
                    <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8", marginBottom: "16px" }}>⚧ Gender Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {symptomData.length > 0 && (
                    <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8", marginBottom: "16px" }}>🤒 Top Symptoms</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={symptomData}>
                                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9" }} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}