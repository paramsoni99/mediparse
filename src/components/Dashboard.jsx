import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Calendar, Activity, Pill } from "lucide-react";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const tooltipStyle = {
    background: "rgba(15, 23, 42, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "12px",
};

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

function StatCard({ label, value, Icon, color }) {
    return (
        <div className="glass-card glass-card-glow" style={{ padding: "24px 20px", textAlign: "center" }}>
            <div style={{
                width: 40, height: 40, borderRadius: "var(--radius-sm)",
                background: `rgba(${color}, 0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
            }}>
                <Icon size={20} color={`rgb(${color})`} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", fontWeight: 500 }}>{label}</div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "18px" }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

export default function Dashboard({ results }) {
    if (!results || results.length === 0) return null;

    const done = results.filter((r) => r.status === "done" && r.data);

    const allDiagnoses = done.flatMap((r) => r.data.clinical?.diagnosis || []);
    const allMeds = done.flatMap((r) => (r.data.medications || []).map((m) => m.name).filter(Boolean));
    const allSymptoms = done.flatMap((r) => r.data.clinical?.symptoms || []);

    const diagnosisData = countFrequency(allDiagnoses);
    const medData = countFrequency(allMeds);
    const symptomData = countFrequency(allSymptoms);

    const avgAge = (() => {
        const ages = done.map((r) => parseInt(r.data.patient?.age)).filter((a) => !isNaN(a));
        return ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : "N/A";
    })();

    const genderData = countFrequency(done.map((r) => r.data.patient?.gender).filter(Boolean));

    return (
        <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "var(--text-primary)" }}>
                Analytics Dashboard
            </h2>

            {/* Stat Cards */}
            <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                <StatCard Icon={Users} label="Total Patients" value={done.length} color="59, 130, 246" />
                <StatCard Icon={Calendar} label="Avg Age" value={avgAge} color="6, 182, 212" />
                <StatCard Icon={Activity} label="Unique Diagnoses" value={new Set(allDiagnoses).size} color="16, 185, 129" />
                <StatCard Icon={Pill} label="Unique Medications" value={new Set(allMeds).size} color="139, 92, 246" />
            </div>

            {/* Charts Row 1 */}
            <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                {diagnosisData.length > 0 && (
                    <ChartCard title="Top Diagnoses">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={diagnosisData} layout="vertical">
                                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#f1f5f9", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {medData.length > 0 && (
                    <ChartCard title="Top Medications">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={medData} layout="vertical">
                                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#f1f5f9", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(6, 182, 212, 0.05)" }} />
                                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>

            {/* Charts Row 2 */}
            <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {genderData.length > 0 && (
                    <ChartCard title="Gender Distribution">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: "#64748b" }}
                                >
                                    {genderData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {symptomData.length > 0 && (
                    <ChartCard title="Top Symptoms">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={symptomData}>
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(16, 185, 129, 0.05)" }} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>
        </div>
    );
}