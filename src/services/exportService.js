export function downloadJSON(data, filename = "mediparse-output.json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadMergedJSON(results) {
    downloadJSON(results.map((r) => r.data), "mediparse-all-patients.json");
}

export function downloadCSV(results) {
    const rows = results.map((r) => {
        const d = r.data;
        return {
            file: r.fileName,
            patient_name: d.patient?.name || "",
            age: d.patient?.age || "",
            gender: d.patient?.gender || "",
            dob: d.patient?.dob || "",
            patient_id: d.patient?.id || "",
            visit_date: d.visit?.date || "",
            visit_type: d.visit?.type || "",
            doctor: d.visit?.doctor || "",
            hospital: d.visit?.hospital || "",
            department: d.visit?.department || "",
            chief_complaint: d.clinical?.chief_complaint || "",
            diagnosis: Array.isArray(d.clinical?.diagnosis) ? d.clinical.diagnosis.join("; ") : d.clinical?.diagnosis || "",
            symptoms: Array.isArray(d.clinical?.symptoms) ? d.clinical.symptoms.join("; ") : "",
            blood_pressure: d.clinical?.vitals?.blood_pressure || "",
            heart_rate: d.clinical?.vitals?.heart_rate || "",
            temperature: d.clinical?.vitals?.temperature || "",
            spo2: d.clinical?.vitals?.spo2 || "",
            weight: d.clinical?.vitals?.weight || "",
            height: d.clinical?.vitals?.height || "",
            medications: Array.isArray(d.medications) ? d.medications.map((m) => `${m.name} ${m.dosage}`).join("; ") : "",
            allergies: Array.isArray(d.allergies) ? d.allergies.join("; ") : "",
            follow_up: d.follow_up || "",
            notes: d.notes || "",
        };
    });

    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(","),
        ...rows.map((row) =>
            headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mediparse-patients.csv";
    a.click();
    URL.revokeObjectURL(url);
}