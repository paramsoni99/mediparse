import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "./components/FileUpload";
import ResultViewer from "./components/ResultViewer";
import { extractMedicalData } from "./services/geminiService";
import "./index.css";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleTextExtracted = (extractedText, name) => {
    setText(extractedText);
    setFileName(name);
    setResult(null);
    setError(null);
  };

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await extractMedicalData(text);
      setResult(data);
    } catch (err) {
      setError("Failed to extract data. Check your API key or try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e" }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b", padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#111827",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🧬</span>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9" }}>MediParse</h1>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>Medical Document → Structured JSON</p>
          </div>
        </div>
        <span style={{
          padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
          background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid #10b981"
        }}>
          Powered by Gemini AI
        </span>
      </div>

      {/* Main */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
            Extract Structured Data from Medical Records
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
            Upload an RTF/TXT medical document or paste text. AI extracts patient info, diagnoses, medications, lab results & more into analysis-ready JSON.
          </p>

          <div style={{ background: "#111827", borderRadius: "16px", padding: "28px", marginBottom: "24px", border: "1px solid #1e293b" }}>
            <FileUpload onTextExtracted={handleTextExtracted} isLoading={loading} />
          </div>

          {text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={handleExtract}
                disabled={loading}
                style={{
                  width: "100%", padding: "16px", borderRadius: "12px", border: "none",
                  background: loading ? "#1e293b" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  color: loading ? "#94a3b8" : "#fff", fontSize: "16px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer", marginBottom: "32px",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "⏳ Extracting medical data..." : "🚀 Extract Structured JSON"}
              </button>
            </motion.div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#ef4444" }}>
              ⚠ {error}
            </div>
          )}

          <AnimatePresence>
            {result && <ResultViewer data={result} />}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}