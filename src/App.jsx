import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "./components/FileUpload";
import ResultViewer from "./components/ResultViewer";
import BatchQueue from "./components/BatchQueue";
import Dashboard from "./components/Dashboard";
import ExportPanel from "./components/ExportPanel";
import { extractMedicalData } from "./services/geminiService";
import "./index.css";

export default function App() {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [singleText, setSingleText] = useState("");
  const processingRef = useRef(false);

  const handleFilesAdded = (files) => {
    const newItems = files.map((f) => ({ fileName: f.name, file: f, status: "pending", data: null }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleTextInput = (text, name) => {
    setSingleText(text);
  };

  const processQueue = async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);

    setQueue((prev) =>
      prev.map((item) => (item.status === "pending" ? { ...item, status: "pending" } : item))
    );

    const currentQueue = queue.filter((item) => item.status === "pending");

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      const globalIndex = queue.findIndex((q) => q.fileName === item.fileName && q.status === "pending");

      // mark as processing
      setQueue((prev) =>
        prev.map((q, idx) => (idx === globalIndex ? { ...q, status: "processing" } : q))
      );

      try {
        let text = "";
        if (item.file) {
          text = await item.file.text();
        }
        const data = await extractMedicalData(text);
        setQueue((prev) =>
          prev.map((q, idx) => (idx === globalIndex ? { ...q, status: "done", data } : q))
        );
        if (selectedIndex === null) setSelectedIndex(globalIndex);
      } catch (err) {
        setQueue((prev) =>
          prev.map((q, idx) => (idx === globalIndex ? { ...q, status: "error" } : q))
        );
      }
    }

    processingRef.current = false;
    setProcessing(false);
  };

  const handleSingleExtract = async () => {
    if (!singleText.trim()) return;
    const newItem = { fileName: "manual-input.txt", file: null, status: "processing", data: null };
    const newIndex = queue.length;
    setQueue((prev) => [...prev, newItem]);
    setProcessing(true);
    try {
      const data = await extractMedicalData(singleText);
      setQueue((prev) =>
        prev.map((q, i) => (i === newIndex ? { ...q, status: "done", data } : q))
      );
      setSelectedIndex(newIndex);
    } catch {
      setQueue((prev) =>
        prev.map((q, i) => (i === newIndex ? { ...q, status: "error" } : q))
      );
    }
    setProcessing(false);
  };

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const doneCount = queue.filter((q) => q.status === "done").length;
  const selectedResult = selectedIndex !== null ? queue[selectedIndex]?.data : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e" }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b", padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111827",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🧬</span>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9" }}>MediParse</h1>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>Medical Document → Structured JSON</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {doneCount > 0 && ["results", "dashboard"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "13px",
              background: activeTab === tab ? "#3b82f6" : "#1a2235",
              color: activeTab === tab ? "#fff" : "#94a3b8",
            }}>
              {tab === "results" ? "📄 Results" : "📊 Dashboard"}
            </button>
          ))}
          <span style={{
            padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
            background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid #10b981", alignSelf: "center"
          }}>
            Gemini 2.5 Flash
          </span>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "results" ? (
          <div style={{ display: "grid", gridTemplateColumns: queue.length > 0 ? "300px 1fr" : "1fr", gap: "24px", alignItems: "start" }}>
            {/* Left panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Upload */}
              <div style={{ background: "#111827", borderRadius: "16px", padding: "20px", border: "1px solid #1e293b" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  📁 Upload Files
                </h3>
                <MultiFileUpload onFilesAdded={handleFilesAdded} onTextInput={handleTextInput} isLoading={processing} />

                {singleText && queue.filter(q => q.fileName === "manual-input.txt" && q.status === "done").length === 0 && (
                  <button onClick={handleSingleExtract} disabled={processing} style={{
                    width: "100%", marginTop: "12px", padding: "10px", borderRadius: "8px", border: "none",
                    background: processing ? "#1e293b" : "#3b82f6", color: processing ? "#94a3b8" : "#fff",
                    fontWeight: 600, fontSize: "13px", cursor: processing ? "not-allowed" : "pointer",
                  }}>
                    {processing ? "Extracting..." : "Extract Text"}
                  </button>
                )}

                {pendingCount > 0 && (
                  <button onClick={processQueue} disabled={processing} style={{
                    width: "100%", marginTop: "12px", padding: "10px", borderRadius: "8px", border: "none",
                    background: processing ? "#1e293b" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                    color: processing ? "#94a3b8" : "#fff", fontWeight: 600, fontSize: "13px",
                    cursor: processing ? "not-allowed" : "pointer",
                  }}>
                    {processing ? "⏳ Processing..." : `🚀 Process ${pendingCount} File${pendingCount > 1 ? "s" : ""}`}
                  </button>
                )}
              </div>

              {queue.length > 0 && (
                <BatchQueue queue={queue} onSelectResult={setSelectedIndex} selectedIndex={selectedIndex} />
              )}

              {doneCount > 0 && (
                <ExportPanel results={queue} selectedIndex={selectedIndex} />
              )}
            </div>

            {/* Right panel */}
            <div>
              {selectedResult ? (
                <ResultViewer data={selectedResult} />
              ) : (
                <div style={{
                  background: "#111827", borderRadius: "16px", padding: "60px 40px",
                  border: "1px solid #1e293b", textAlign: "center",
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                    Upload Medical Documents
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                    Upload RTF/TXT files or paste text to extract structured JSON data
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Dashboard results={queue} />
        )}
      </div>
    </div>
  );
}

// Multi file dropzone inline
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

function MultiFileUpload({ onFilesAdded, onTextInput, isLoading }) {
  const onDrop = useCallback((acceptedFiles) => {
    onFilesAdded(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/rtf": [".rtf"], "text/plain": [".txt"] },
    multiple: true,
    disabled: isLoading,
  });

  return (
    <div>
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? "#3b82f6" : "#1e293b"}`,
        borderRadius: "12px", padding: "24px 16px", textAlign: "center",
        cursor: isLoading ? "not-allowed" : "pointer",
        background: isDragActive ? "rgba(59,130,246,0.05)" : "#0a0f1e",
      }}>
        <input {...getInputProps()} />
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📂</div>
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
          {isDragActive ? "Drop files here..." : "Drag & drop RTF/TXT files\n(multiple supported)"}
        </p>
      </div>
      <textarea
        disabled={isLoading}
        onChange={(e) => onTextInput(e.target.value, "manual-input.txt")}
        placeholder="Or paste medical text here..."
        style={{
          width: "100%", minHeight: "100px", marginTop: "12px",
          background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: "10px",
          padding: "12px", color: "#f1f5f9", fontSize: "13px", resize: "vertical",
          outline: "none", fontFamily: "inherit",
        }}
      />
    </div>
  );
}